import type { Author, Publication } from "@skein/shared";

export interface YearRange {
  from?: number;
  to?: number;
}

export function filterPublications(pubs: Publication[], range: YearRange): Publication[] {
  return pubs.filter((p) => {
    if (p.year === undefined) return range.from === undefined && range.to === undefined ? true : false;
    if (range.from !== undefined && p.year < range.from) return false;
    if (range.to !== undefined && p.year > range.to) return false;
    return true;
  });
}

export function capCoAuthors(authors: Author[], max: number): Author[] {
  return max > 0 ? authors.slice(0, max) : authors;
}
