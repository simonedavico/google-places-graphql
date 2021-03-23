import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { ApolloError } from "apollo-server-errors";
import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/pipeable";
import { identity } from "fp-ts/lib/function";
import * as tPromise from "io-ts-promise";
import { LocationInput, Place, ServiceType } from "../../schema/types";
import { PlaceDetailsCodec, NearbySearchCodec, PlaceDetails } from "./codecs";
import mapQueryFieldsToApiFields from "./helpers/mapQueryFieldsToApiFields";
import { QueryFields } from "./types";

class PlacesAPI extends RESTDataSource {
  // specifying these fields in a search query requires a call to the Place Details API to fill the missing info
  static readonly SEARCH_EXTRA_QUERY_FIELDS: QueryFields[] = [
    "address",
    "reviews",
    "website",
    "openingHours",
  ];

  #apiKey: string;

  constructor(apiKey: string) {
    super();
    this.#apiKey = apiKey;
    this.baseURL = "https://maps.googleapis.com/maps/api/place";
  }

  willSendRequest(request: RequestOptions) {
    request.params.set("key", this.#apiKey);
  }

  async findNearbyPlaces(
    location: LocationInput,
    radius: number,
    serviceTypes: ServiceType[],
    queryFields: QueryFields[]
  ): Promise<Place[]> {
    const callApisForAllServiceTypes = pipe(
      serviceTypes,
      A.map((st) => this.#findNearbyPlacesForServiceType(st, location, radius)),
      A.map((placesFromSearch) => {
        return pipe(
          placesFromSearch,
          TE.chain((places) => {
            let placeTasks = A.array.traverse(T.task)(
              places,
              this.#getMissingInfoForPlace(queryFields)
            );
            return TE.fromTask(placeTasks);
          }),
          TE.map((maybePlaces) => pipe(maybePlaces, A.filterMap(O.fromEither)))
        );
      }),
      A.sequence(T.task)
    );

    const apiCalls = await callApisForAllServiceTypes();

    if (apiCalls.every(E.isLeft)) {
      throw new ApolloError("All API calls errored");
    }

    return pipe(
      apiCalls,
      A.map((errorOrPlaces) => {
        return E.fold<ApolloError, Place[], Place[]>(
          (_e) => [],
          identity
        )(errorOrPlaces);
      }),
      A.flatten
    );
  }

  async placeById(id: string, queryFields: QueryFields[]): Promise<Place> {
    const fields = mapQueryFieldsToApiFields(queryFields);

    const response = await this.get("/details/json", {
      place_id: id,
      fields: fields.join(","),
    });

    // FIXME: handle decode error
    const placeDetails = await tPromise.decode(PlaceDetailsCodec, response);

    if (placeDetails.status !== "OK") {
      // TODO: error message should be improved, some errors should be hidden behind internal server error
      throw new ApolloError("Something went wrong", placeDetails.status);
    }

    const { result } = placeDetails;
    return this.#resultToPlace(result);
  }

  /**
   * Search nearby places for a given service type
   */
  #findNearbyPlacesForServiceType = (
    serviceType: ServiceType,
    location: LocationInput,
    radius: number
  ): TE.TaskEither<ApolloError, Place[]> => {
    return pipe(
      TE.tryCatch(
        () => {
          return this.get("/nearbysearch/json", {
            location: `${location.lat},${location.lng}`,
            radius,
            ...this.#getQueryParamForServiceType(serviceType),
          });
        },
        (e) => e as ApolloError
      ),
      TE.chain((res) =>
        pipe(
          TE.fromEither(NearbySearchCodec.decode(res)),
          TE.mapLeft(() => new ApolloError("Internal server error"))
        )
      ),
      TE.chain((search) => {
        let res =
          search.status === "OK"
            ? E.right(search.results.map(this.#resultToPlace))
            : // TODO: this error mapping could be improved with a more meaningful message
              E.left(new ApolloError("Something went wrong", search.status));

        return TE.fromEither(res);
      })
    );
  };

  /**
   * If there are fields missing from the query, we fetch just the data we need
   * with a call to the details API. Otherwise, we just return what we have
   */
  #getMissingInfoForPlace = (
    queryFields: QueryFields[]
  ): ((place: Place) => TE.TaskEither<ApolloError, Place>) => (
    place: Place
  ): TE.TaskEither<ApolloError, Place> => {
    return TE.tryCatch(
      () => {
        const extraFields = diff(
          PlacesAPI.SEARCH_EXTRA_QUERY_FIELDS,
          queryFields
        );

        return extraFields.length
          ? this.placeById(place.id!, extraFields).then((p2) => ({
              ...place,
              ...withoutNulls(p2),
            }))
          : Promise.resolve(place);
      },
      (e) => e as ApolloError
    );
  };

  #getQueryParamForServiceType = (serviceType: ServiceType) => {
    return {
      [ServiceType.Atm]: { type: "atm" as const },
      [ServiceType.CurrencyExchange]: {
        keyword: "Currency exchange" as const,
      },
      [ServiceType.MoneyTransfer]: { keyword: "Money transfer" as const },
    }[serviceType];
  };

  #resultToPlace = (placeDetails: PlaceDetails): Place => {
    return {
      id: placeDetails.place_id,
      name: placeDetails.name,
      location: placeDetails.geometry?.location,
      address: placeDetails.formatted_address,
      website: placeDetails.website,
      openingHours: placeDetails.opening_hours?.weekday_text,
      isOpen: placeDetails.opening_hours?.open_now,
      rating: placeDetails.rating,
      reviews: (placeDetails.reviews ?? []).map((review) => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
      })),
    };
  };
}

// small helper to compute the intersection of two lists
const diff = <T>(a: T[], b: T[]): T[] => {
  return a.filter((x) => b.includes(x));
};

// small helper to remove nulls from an object
function withoutNulls<T>(obj: T): T {
  const acc: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) acc[key] = obj[key];
  }
  return acc as T;
}

export default PlacesAPI;
