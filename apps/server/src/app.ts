import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { PubMedClient } from "./pubmed/client.js";
import { authorRoutes } from "./routes/authors.js";
import { publicationRoutes } from "./routes/publications.js";

interface BuildOptions {
  client?: PubMedClient;
  staticDir?: string;
}

export function buildApp(opts: BuildOptions = {}): FastifyInstance {
  const app = Fastify({ logger: true });
  const client = opts.client ?? new PubMedClient();

  app.register(cors, { origin: true });
  authorRoutes(app, client);
  publicationRoutes(app, client);

  if (opts.staticDir) {
    app.register(fastifyStatic, { root: opts.staticDir, wildcard: false });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith("/api/")) {
        return reply.code(404).send({ error: "not found" });
      }
      return reply.sendFile("index.html");
    });
  }

  return app;
}
