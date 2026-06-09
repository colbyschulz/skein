import { useCallback, useState } from "react";
import { type Author, type GraphState } from "@skein/shared";
import { initGraph, addCoAuthors, collapseChildren } from "./graphReducer.js";

const EMPTY: GraphState = { nodes: [], links: [], seedId: "" };

export function useGraphState() {
  const [graph, setGraph] = useState<GraphState>(EMPTY);

  const seed = useCallback((author: Author) => setGraph(initGraph(author)), []);

  const expand = useCallback(
    (fromId: string, coAuthors: Author[], viaPmid: string, viaTitle?: string) =>
      setGraph((g) => addCoAuthors(g, fromId, coAuthors, viaPmid, viaTitle)),
    [],
  );

  const collapse = useCallback(
    (nodeId: string) => setGraph((g) => collapseChildren(g, nodeId)),
    [],
  );

  const reset = useCallback(() => setGraph(EMPTY), []);

  return { graph, seed, expand, collapse, reset, setGraph };
}
