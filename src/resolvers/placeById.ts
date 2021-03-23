import { QueryResolvers } from "../schema/types";
import graphqlFields from "graphql-fields";
import { QueryFields } from "../datasources/places/types";

const placeById: QueryResolvers["placeById"] = async (
  _parent,
  { id },
  // FIXME: this is not well typed, improve
  context,
  info
) => {
  // bad, but can't do much better in a short time
  const queryFields = Object.keys(graphqlFields(info)) as QueryFields[];
  return context.dataSources.placesAPI.placeById(id, queryFields);
};

export default placeById;
