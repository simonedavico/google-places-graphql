# Solution explanation

The solution implements an Apollo Server with TypeScript.
In this document I am covering some technical choices I made and pointing out some limitations of the solution.

### Data fetching

Data fetching from the Google Places API is implemented by extending Apollo's `RESTDataSource`, for two main reasons:

1. It is the idiomatic/advised solution for data fetching in the docs;
2. It provides LRU caching and request deduping out of the box;
3. It support external cache providers; in this case, I optionally support a Redis instance.

Finally, `RESTDataSource` sets the cache TTL according to the response `Cache` headers, which is desirable since according to the Google [Places API terms of service](https://cloud.google.com/maps-platform/terms/maps-service-terms#5.-places-api) no data (except `place_id`, `lat` and `lng`) can be cached.

I validate the format of the response from the Google APIs by using `io-ts`, a runtime validation library for TypeScript. This allows to ensure that we get a well-typed API response.

I modelled the complex async flow of the `findNearbyPlaces` by using `fp-ts`, a well-established functional programming library for TypeScript. It allowed me to composed the API calls without incurring into `Promise` typing problems (e.g. ending up with `Promise<Promise<...>>`).

Using `fp-ts` here is also meant as a way to show that I know some functional programming and I can adopt complex patterns when/if needed.

As for cost optimization, the business logic of the data source ensures that we only send the minimal required set of fields to the Google API, by introspecting the fields requested to the GraphQL API. Likewise, when we search nearby places, we only issue an extra Place Details request if we need some information not returned by the search API (e.g., the website).

### API

The API provides two queries, according to the requirements.
Some limitations:

- Pagination is not supported
- Some scalars could have better types (e.g. `maxDistance` should only allow positive numbers)

### TypeScript

I tried to make sure variables/functions are as well typed as possible, by also integrating code generation of type definitions from the GraphQL schema.

### Logging

I implemented a basic mechanism for logging via a custom Apollo Plugin that integrates the `pino` logging library, outputting well-structured JSON logs.

I did not add debug logging around the application code, but it is something I would consider in a real-life implementation.

### Testing

I added some unit tests and integration tests, but they are not super exhaustive.

### Error handling

I implemented error handling in the data fetching logic, but in a real life project I would need to put some additional effort in the error reporting part.

The call to the `findNearbyPlaces` query will fail only if all calls for each given service type fail, otherwise we just ignore the failed ones and return partial results.

The call to the `placeById` query will fail if the Google API returns a `status` which is not `OK`, or if runtime validation of the response fails.

# Other limitations

Some parts of the code could be improved. I left TODO comments whenever I felt it was appropriate.
