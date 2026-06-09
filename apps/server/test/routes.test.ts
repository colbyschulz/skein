import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildApp } from "../src/app.js";
import { PubMedClient } from "../src/pubmed/client.js";

const xml = readFileSync(
  fileURLToPath(new URL("./fixtures/efetch-sample.xml", import.meta.url)),
  "utf8",
);

function clientWith(pmids: string[]) {
  const fetchFn = vi.fn(async (url: string) =>
    url.includes("esearch")
      ? new Response(JSON.stringify({ esearchresult: { idlist: pmids } }), { status: 200 })
      : new Response(xml, { status: 200 }),
  );
  return new PubMedClient({ fetchFn });
}

describe("routes", () => {
  it("GET /api/authors/search returns candidates", async () => {
    const app = buildApp({ client: clientWith(["30049270", "29939134"]) });
    const res = await app.inject({ method: "GET", url: "/api/authors/search?name=Smith%20J" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body.candidates)).toBe(true);
  });

  it("GET /api/authors/search 400s without a name", async () => {
    const app = buildApp({ client: clientWith([]) });
    const res = await app.inject({ method: "GET", url: "/api/authors/search" });
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/publications/:pmid returns one publication", async () => {
    const app = buildApp({ client: clientWith(["30049270"]) });
    const res = await app.inject({ method: "GET", url: "/api/publications/30049270" });
    expect(res.statusCode).toBe(200);
    expect(res.json().publication.pmid).toMatch(/^\d+$/);
  });
});
