import { authorId, type Author, type GraphState } from "@skein/shared";

export function initGraph(seed: Author): GraphState {
  const id = authorId(seed);
  return { nodes: [{ id, author: seed, parentId: null }], links: [], seedId: id };
}

export function addCoAuthors(
  state: GraphState,
  fromId: string,
  coAuthors: Author[],
  viaPmid: string,
  viaTitle?: string,
): GraphState {
  const nodeIds = new Set(state.nodes.map((n) => n.id));
  const linkKeys = new Set(state.links.map((l) => `${l.source}->${l.target}:${l.viaPmid}`));

  const nodes = [...state.nodes];
  const links = [...state.links];

  for (const author of coAuthors) {
    const id = authorId(author);
    if (id === fromId) continue;
    if (!nodeIds.has(id)) {
      nodes.push({ id, author, parentId: fromId });
      nodeIds.add(id);
    }
    const key = `${fromId}->${id}:${viaPmid}`;
    if (!linkKeys.has(key)) {
      links.push({ source: fromId, target: id, viaPmid, viaTitle });
      linkKeys.add(key);
    }
  }

  return { ...state, nodes, links };
}

/** Remove all descendants of nodeId (the node itself is kept). Pure + idempotent. */
export function collapseChildren(state: GraphState, nodeId: string): GraphState {
  const descendants = new Set<string>();

  const collect = (id: string) => {
    for (const n of state.nodes) {
      if (n.parentId === id && !descendants.has(n.id)) {
        descendants.add(n.id);
        collect(n.id);
      }
    }
  };
  collect(nodeId);

  if (descendants.size === 0) return state;

  const nodes = state.nodes.filter((n) => !descendants.has(n.id));
  const links = state.links.filter(
    (l) => !descendants.has(l.source) && !descendants.has(l.target),
  );
  return { ...state, nodes, links };
}
