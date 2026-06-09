import type { FastifyInstance } from "fastify";
import type { PubMedClient } from "../pubmed/client.js";
import { buildCandidates } from "../pubmed/candidates.js";

// Disambiguation only needs a handful of recent papers to identify distinct affiliations.
// Publications panel benefits from a larger set for usefulness.
const DISAMBIG_RETMAX = 10;
const PUBS_RETMAX = 50;

export function authorRoutes(app: FastifyInstance, client: PubMedClient): void {
  app.get<{ Querystring: { name?: string } }>(
    "/api/authors/search",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "string", minLength: 1 } },
        },
      },
    },
    async (req) => {
      const name = req.query.name!;
      const pubs = await client.searchAuthorPublications(name, DISAMBIG_RETMAX);
      return { candidates: buildCandidates(pubs, name) };
    },
  );

  app.get<{ Querystring: { name?: string; affiliation?: string } }>(
    "/api/authors/publications",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1 },
            affiliation: { type: "string" },
          },
        },
      },
    },
    async (req) => {
      const { name, affiliation } = req.query;
      const pubs = await client.searchAuthorPublications(name!, PUBS_RETMAX);
      const filtered = affiliation
        ? pubs.filter((p) =>
            p.authors.some(
              (a) =>
                a.name.toLowerCase().includes(name!.split(/\s+/)[0]!.toLowerCase()) &&
                (a.affiliation ?? "").trim() === affiliation,
            ),
          )
        : pubs;
      return { publications: filtered };
    },
  );
}
