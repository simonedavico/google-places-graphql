# GraphQL API MVP

An implementation of a GraphQL API to search for ATMs, currency exchange and money transfer places. It relies on the Google Places API.

## Setting up development enviroment

### Prerequisites

- Node.js >= 14.x (LTS)

### Setup environment variables

The project allows setting the following environment variables:

- `API_KEY`: an API key to access Google Places API (required)
- `REDIS_HOST`: host for a Redis instance which will be eventually used as LRU cache. The server will fallback to in-memory caching if not provided (optional). You can setup a redis for local development with docker, by running

```
docker run --name my-redis --rm -p 6379:6379 -d redis
```

and passing `REDIS_HOST=localhost` to the start script.

Variables can be passed to the `npm` scripts, or set in an `.env` file in the project root folder.

### Run the project

- `npm run start:dev`: run the project with hot reload
- `npm start`: run the project normally
- `npm start:debug`: run the project for debugging

The server emits structured logs in JSON format. In dev, you can have human readable logs by piping the server output to `pino-pretty`:

```
npm run start:dev | npx pino-pretty
```

### Running tests

- `npm test` will run unit and integration tests

### Project structure

```
.
├── ...configuration files...
├── src
│   ├── datasources
│   ├── plugins
│   ├── resolvers
│   ├── schema
│   └── setupServer.ts
```

- `datasources`: include the implementation of services to fetch data from;
- `plugins`: includes plugins for Apollo Server;
- `resolvers`: includes resolvers;
- `schema`: includes the GraphQL schema and schema loading code;
- `setupServer.ts`: sets up a configured Apollo Server

## About the implementation

Details about the implementation are included in [SOLUTION.md](./SOLUTION.md)
