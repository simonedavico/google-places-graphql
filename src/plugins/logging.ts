import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from "apollo-server-plugin-base";
import { customAlphabet } from "nanoid";
import { Logger } from "pino";

const nanoid = customAlphabet("1234567890abcdef", 6);
const ignoredOps = ["IntrospectionQuery"];

export interface LogOptions {
  events: { [name: string]: boolean };
}

const defaults: LogOptions = {
  events: {
    didEncounterErrors: true,
    didResolveOperation: false,
    executionDidStart: false,
    parsingDidStart: false,
    responseForOperation: false,
    validationDidStart: false,
    willSendResponse: true,
  },
} as const;

/**
 * A simple Apollo Server plugin for logging. Which operations
 * get logged can be configured by providing options.
 * A unique id is created for each request, to trace all related logs.
 *
 * @param log a logger instance
 * @param options an optional set of log options
 * @returns an Apollo Server plugin instance that logs requests
 *
 * Disclaimer: inspired by https://github.com/shellscape/apollo-log
 * except I'm quite sure that one has a bug
 */
const ApolloLogPlugin = (
  log: Logger,
  options: Partial<LogOptions> = {}
): ApolloServerPlugin => {
  const logOptions = { ...defaults, ...options };

  return {
    requestDidStart(context) {
      const operationId = nanoid();
      const ignore = ignoredOps.includes(context.request.operationName ?? "");

      if (!ignore) {
        const query = context.request.query?.replace(/\n/g, "");
        const variables = Object.keys(context.request.variables || {});
        log.info({
          operationId,
          event: "request",
          operationName: context.operationName,
          query,
          variables,
        });

        const { events } = logOptions;
        const handlers: GraphQLRequestListener = {
          didEncounterErrors({ errors }) {
            events.didEncounterErrors &&
              log.error({ operationId, event: "errors", errors });
          },
          didResolveOperation({ metrics, operationName }) {
            events.didResolveOperation &&
              log.info({
                operationId,
                event: "didResolveOperation",
                metrics,
                operationName,
              });
          },
          executionDidStart({ metrics }) {
            events.executionDidStart &&
              log.info({
                operationId,
                event: "executionDidStart",
                metrics,
              });
          },
          parsingDidStart({ metrics }) {
            events.parsingDidStart &&
              log.info({
                operationId,
                event: "parsingDidStart",
                metrics,
              });
          },
          responseForOperation({ metrics, operationName }) {
            events.responseForOperation &&
              log.info({
                operationId,
                event: "responseForOperation",
                metrics,
                operationName,
              });
            return null;
          },
          validationDidStart({ metrics }) {
            events.validationDidStart &&
              log.info({
                event: "validationDidStart",
                metrics,
              });
          },
          willSendResponse({ metrics }) {
            events.willSendResponse &&
              log.info({
                operationId,
                event: "willSendResponse",
                metrics,
              });
          },
        };
        return handlers;
      }

      return {};
    },
  };
};

export default ApolloLogPlugin;
