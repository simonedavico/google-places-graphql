import * as t from "io-ts";

const PlaceApiErrorCodes = t.union([
  t.literal("UNKNOWN_ERROR"),
  t.literal("ZERO_RESULTS"),
  t.literal("OVER_QUERY_LIMIT"),
  t.literal("REQUEST_DENIED"),
  t.literal("INVALID_REQUEST"),
  t.literal("NOT_FOUND"),
]);

const PlaceDetailsOpeningHours = t.partial({
  open_now: t.boolean,
  weekday_text: t.array(t.string),
});

const PlaceDetailsReview = t.type({
  author_name: t.string,
  rating: t.number,
  text: t.string,
});

const PlaceDetailsResult = t.partial({
  formatted_address: t.string,
  name: t.string,
  place_id: t.string,
  rating: t.number,
  opening_hours: PlaceDetailsOpeningHours,
  geometry: t.type({
    location: t.type({
      lat: t.number,
      lng: t.number,
    }),
  }),
  reviews: t.array(PlaceDetailsReview),
  website: t.string,
});

const PlaceApiErrorCodec = t.partial({
  html_attributions: t.array(t.unknown),
  status: PlaceApiErrorCodes,
});

const PlaceDetailsSuccessCodec = t.type({
  html_attributions: t.array(t.unknown),
  status: t.literal("OK"),
  result: PlaceDetailsResult,
});

const NearbySearchSuccessCodec = t.type({
  html_attributions: t.array(t.unknown),
  status: t.literal("OK"),
  results: t.array(PlaceDetailsResult),
});

export const PlaceDetailsCodec = t.union([
  PlaceApiErrorCodec,
  PlaceDetailsSuccessCodec,
]);

export const NearbySearchCodec = t.union([
  PlaceApiErrorCodec,
  NearbySearchSuccessCodec,
]);

export type PlaceDetails = t.TypeOf<typeof PlaceDetailsResult>;
