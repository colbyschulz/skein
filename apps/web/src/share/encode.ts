import type { GraphState } from "@skein/shared";

export function encodeGraph(state: GraphState): string {
  const json = JSON.stringify(state);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeGraph(hash: string): GraphState | null {
  try {
    const json = decodeURIComponent(escape(atob(hash)));
    const parsed = JSON.parse(json) as GraphState;
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) return null;
    return parsed;
  } catch {
    return null;
  }
}
