import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { PubMedClient } from "./pubmed/client.js";
import { authorRoutes } from "./routes/authors.js";
import { publicationRoutes } from "./routes/publications.js";

interface BuildOptions {
  client?: PubMedClient;
}

export function buildApp(opts: BuildOptions = {}): FastifyInstance {
  const app = Fastify({ logger: false });
  const client = opts.client ?? new PubMedClient();
  app.register(cors, { origin: true });
  authorRoutes(app, client);
  publicationRoutes(app, client);
  return app;
}
