import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parsePublications } from "../src/pubmed/parse.js";

const xml = readFileSync(
  fileURLToPath(new URL("./fixtures/efetch-sample.xml", import.meta.url)),
  "utf8",
);

describe("parsePublications", () => {
  const pubs = parsePublications(xml);

  it("parses every article", () => {
    expect(pubs.length).toBe(2);
  });

  it("extracts pmid, title, journal and a pubmed url", () => {
    const p = pubs[0]!;
    expect(p.pmid).toMatch(/^\d+$/);
    expect(p.title.length).toBeGreaterThan(0);
    expect(p.journal.length).toBeGreaterThan(0);
    expect(p.pubmedUrl).toBe(`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`);
  });

  it("extracts an author list with names", () => {
    const p = pubs[0]!;
    expect(p.authors.length).toBeGreaterThan(0);
    expect(p.authors[0]!.name.length).toBeGreaterThan(0);
  });
});
