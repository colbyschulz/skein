import { useCallback, useState } from "react";
import { type Author, type GraphState } from "@skein/shared";
import { initGraph, addCoAuthors } from "./graphReducer.js";

const EMPTY: GraphState = { nodes: [], links: [], seedId: "" };

export function useGraphState() {
  const [graph, setGraph] = useState<GraphState>(EMPTY);

  const seed = useCallback((author: Author) => setGraph(initGraph(author)), []);

  const expand = useCallback(
    (fromId: string, coAuthors: Author[], viaPmid: string) =>
      setGraph((g) => addCoAuthors(g, fromId, coAuthors, viaPmid)),
    [],
  );

  const reset = useCallback(() => setGraph(EMPTY), []);

  return { graph, seed, expand, reset, setGraph };
}
