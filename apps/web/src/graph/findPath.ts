import type { GraphNode } from "@skein/shared";

/** Follow parentId links from targetId back to seedId. Returns ordered [seed, ..., target] or null. */
export function findPath(nodes: GraphNode[], seedId: string, targetId: string): string[] | null {
  if (targetId === seedId) return [seedId];

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const path: string[] = [];
  let cur: string | null | undefined = targetId;

  while (cur != null && cur !== seedId) {
    path.unshift(cur);
    cur = byId.get(cur)?.parentId;
  }

  if (cur === seedId) {
    path.unshift(seedId);
    return path;
  }

  return null;
}
