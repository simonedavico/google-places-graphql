import { QueryFields } from "../types";

const mapQueryFieldToApiField = (queryField: QueryFields) => {
  const fieldsMapping: Record<QueryFields, string[]> = {
    name: ["name"],
    location: ["geometry/location"],
    id: ["place_id"],
    address: ["formatted_address"],
    website: ["website"],
    rating: ["rating"],
    openingHours: ["opening_hours/weekday_text"],
    isOpen: ["opening_hours/open_now"],
    reviews: ["review/author_name", "review/rating", "review/text"],
  };

  return fieldsMapping[queryField];
};

/**
 * Helper to compute the fields to send to the places details API. Ensures we do not request
 * unnecessary fields to the API, incurring in billing costs higher than necessary
 */
const mapQueryFieldsToApiFields = (queryFields: QueryFields[]): string[] => {
  return queryFields.flatMap(mapQueryFieldToApiField);
};

export default mapQueryFieldsToApiFields;
