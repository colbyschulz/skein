import { useQuery } from "@tanstack/react-query";
import { searchAuthors, getAuthorPublications, getPublication } from "./client.js";

export const queryKeys = {
  authorSearch: (name: string) => ["authorSearch", name] as const,
  authorPublications: (name: string, affiliation?: string) =>
    ["authorPublications", name, affiliation ?? ""] as const,
  publication: (pmid: string) => ["publication", pmid] as const,
};

export function useAuthorSearch(name: string) {
  return useQuery({
    queryKey: queryKeys.authorSearch(name),
    queryFn: () => searchAuthors(name),
    enabled: name.trim().length > 0,
  });
}

export function useAuthorPublications(name: string | null, affiliation?: string) {
  return useQuery({
    queryKey: queryKeys.authorPublications(name ?? "", affiliation),
    queryFn: () => getAuthorPublications(name!, affiliation),
    enabled: !!name,
  });
}

export function usePublication(pmid: string | null) {
  return useQuery({
    queryKey: queryKeys.publication(pmid ?? ""),
    queryFn: () => getPublication(pmid!),
    enabled: !!pmid,
  });
}
