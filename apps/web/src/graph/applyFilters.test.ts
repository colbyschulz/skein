import { describe, it, expect } from "vitest";
import { filterPublications, capCoAuthors } from "./applyFilters.js";
import type { Author, Publication } from "@skein/shared";

const mk = (pmid: string, year: number): Publication => ({
  pmid, title: pmid, journal: "J", year, authors: [], pubmedUrl: "u",
});

describe("filters", () => {
  it("filterPublications keeps only papers in the year range", () => {
    const pubs = [mk("1", 2000), mk("2", 2015), mk("3", 2023)];
    expect(filterPublications(pubs, { from: 2010, to: 2020 }).map((p) => p.pmid)).toEqual(["2"]);
  });

  it("capCoAuthors limits the number of co-authors returned", () => {
    const authors: Author[] = [{ name: "a" }, { name: "b" }, { name: "c" }];
    expect(capCoAuthors(authors, 2).length).toBe(2);
  });
});
