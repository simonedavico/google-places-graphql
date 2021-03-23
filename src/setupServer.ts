import { addResolversToSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server";
import { RedisCache } from "apollo-server-cache-redis";
import { PositiveIntResolver, URLResolver } from "graphql-scalars";
import dotenv from "dotenv";
import loadAppSchema from "./schema";
import placeById from "./resolvers/placeById";
import findNearbyPlaces from "./resolvers/findNearbyPlaces";
import PlacesAPI from "./datasources/places";
import ApolloLogPlugin from "./plugins/logging";
import pino from "pino";

const resolvers = {
  URL: URLResolver,
  PositiveInt: PositiveIntResolver,
  Query: {
    placeById,
    findNearbyPlaces,
  },
};

const setupServer = async () => {
  dotenv.config();
  const log = pino();
  const cache = process.env.REDIS_HOST
    ? new RedisCache({ host: process.env.REDIS_HOST })
    : undefined;

  if (cache) {
    log.info(
      "REDIS_HOST env variable detected, setting up Apollo to use Redis"
    );
  }

  const typeDefs = await loadAppSchema();
  const server = new ApolloServer({
    schema: addResolversToSchema(typeDefs, resolvers),
    dataSources: () => ({
      // TODO: fail fast at startup if API_KEY is not defined
      placesAPI: new PlacesAPI(process.env.API_KEY ?? ""),
    }),
    plugins: [ApolloLogPlugin(log)],
    cache,
  });

  return server;
};

export default setupServer;
