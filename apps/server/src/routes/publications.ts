import type { FastifyInstance } from "fastify";
import type { PubMedClient } from "../pubmed/client.js";

export function publicationRoutes(app: FastifyInstance, client: PubMedClient): void {
  app.get<{ Params: { pmid: string } }>(
    "/api/publications/:pmid",
    {
      schema: {
        params: {
          type: "object",
          required: ["pmid"],
          properties: { pmid: { type: "string", pattern: "^\\d+$" } },
        },
      },
    },
    async (req, reply) => {
      const pub = await client.getPublication(req.params.pmid);
      if (!pub) return reply.code(404).send({ error: "not found" });
      return { publication: pub };
    },
  );
}
