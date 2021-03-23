import setupServer from "./setupServer";

setupServer().then(async (server) => {
  const { url } = await server.listen();
  console.log(`🚀  Server ready at ${url}`);
});
