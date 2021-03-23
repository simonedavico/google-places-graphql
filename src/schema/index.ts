import { join } from "path";
import { loadSchema } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

const loadAppSchema = () => {
  return loadSchema(join(__dirname, "./schema.graphql"), {
    loaders: [new GraphQLFileLoader()],
  });
};

export default loadAppSchema;
