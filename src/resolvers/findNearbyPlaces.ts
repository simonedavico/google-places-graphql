import { QueryResolvers } from "../schema/types";
import graphqlFields from "graphql-fields";
import { QueryFields } from "../datasources/places/types";

const findNearbyPlaces: QueryResolvers["findNearbyPlaces"] = async (
  _parent,
  { location, maxDistance, serviceTypes },
  context,
  info
) => {
  // bad, but can't do much better in a short time
  const queryFields = Object.keys(graphqlFields(info)) as QueryFields[];
  return context.dataSources.placesAPI.findNearbyPlaces(
    location,
    maxDistance,
    serviceTypes,
    queryFields
  );
};

export default findNearbyPlaces;
