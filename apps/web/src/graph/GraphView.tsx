import { useMemo, useRef } from "react";
// @ts-expect-error
import ForceGraph2D from "react-force-graph-2d";
import type { GraphState } from "@skein/shared";
import styles from "./GraphView.module.scss";

interface Props {
  graph: GraphState;
  selectedId: string | null;
  pathIds: string[];
  onSelectNode: (id: string) => void;
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function linkId(v: unknown): string {
  return v != null && typeof v === "object" ? String((v as any).id) : String(v);
}

const LABEL_MAX = 32;

function truncate(s: string): string {
  return s.length > LABEL_MAX ? s.slice(0, LABEL_MAX - 1) + "…" : s;
}

export function GraphView({ graph, selectedId, pathIds, onSelectNode }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Build a Set of path edges keyed "source->target" for O(1) lookup.
  const pathEdgeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (let i = 0; i < pathIds.length - 1; i++) {
      keys.add(`${pathIds[i]}->${pathIds[i + 1]}`);
      keys.add(`${pathIds[i + 1]}->${pathIds[i]}`);
    }
    return keys;
  }, [pathIds]);

  const pathSet = useMemo(() => new Set(pathIds), [pathIds]);

  // Nodes that have at least one child (have been expanded).
  const expandedSet = useMemo(() => {
    const s = new Set<string>();
    for (const n of graph.nodes) {
      if (n.parentId) s.add(n.parentId);
    }
    return s;
  }, [graph.nodes]);

  const data = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({ id: n.id, name: n.author.name })),
      links: graph.links.map((l) => ({
        source: l.source,
        target: l.target,
        viaPmid: l.viaPmid,
        viaTitle: l.viaTitle ?? "",
      })),
    }),
    [graph],
  );

  const C = useMemo(
    () => ({
      seed: cssVar("--color-node-seed") || "#ffb347",
      selected: "#ffffff",
      path: "#a78bfa",          // violet: nodes in the active path (not tip)
      expanded: "#38bdf8",      // sky-blue: expanded but not in path
      node: cssVar("--color-node") || "#4aa3ff",
      edgePath: "#c4b5fd",      // bright violet for path edges
      edgeSibling: "#566878",   // muted gray for other edges
      label: cssVar("--color-text") || "#e6edf3",
      labelMuted: "#94a3b8",
    }),
    [],
  );

  return (
    <div ref={ref} className={styles.wrap}>
      <ForceGraph2D
        graphData={data}
        // ── Links ──────────────────────────────────────────────────────────
        linkColor={(link: any) => {
          const s = linkId(link.source);
          const t = linkId(link.target);
          return pathEdgeKeys.has(`${s}->${t}`) ? C.edgePath : C.edgeSibling;
        }}
        linkWidth={(link: any) => {
          const s = linkId(link.source);
          const t = linkId(link.target);
          return pathEdgeKeys.has(`${s}->${t}`) ? 2.5 : 1;
        }}
        linkLabel={(link: any) => link.viaTitle || ""}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, scale: number) => {
          const s = link.source;
          const t = link.target;
          if (!s?.x || !t?.x) return;
          const sId = linkId(s);
          const tId = linkId(t);
          const isPath = pathEdgeKeys.has(`${sId}->${tId}`);
          const title = link.viaTitle;
          if (!title) return;

          const mx = (s.x + t.x) / 2;
          const my = (s.y + t.y) / 2;
          const fontSize = Math.max(10 / scale, 2.5);
          ctx.save();
          ctx.font = `${isPath ? "600 " : ""}${fontSize}px system-ui, sans-serif`;
          ctx.fillStyle = isPath ? C.edgePath : C.labelMuted;
          ctx.globalAlpha = isPath ? 0.95 : 0.55;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // tiny pill background for path labels so they're always readable
          if (isPath) {
            const text = truncate(title);
            const w = ctx.measureText(text).width + 6 / scale;
            const h = fontSize + 4 / scale;
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = "#1b232c";
            ctx.beginPath();
            ctx.roundRect(mx - w / 2, my - h / 2, w, h, 3 / scale);
            ctx.fill();
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = C.edgePath;
          }

          ctx.fillText(truncate(title), mx, my);
          ctx.restore();
        }}
        // ── Nodes ──────────────────────────────────────────────────────────
        nodeColor={(n: any) => {
          if (n.id === graph.seedId && n.id === selectedId) return C.selected;
          if (n.id === graph.seedId) return C.seed;
          if (n.id === selectedId) return C.selected;
          if (pathSet.has(n.id)) return C.path;
          if (expandedSet.has(n.id)) return C.expanded;
          return C.node;
        }}
        nodeVal={(n: any) => {
          if (n.id === selectedId) return 5;
          if (pathSet.has(n.id)) return 3.5;
          if (n.id === graph.seedId) return 4;
          return 2;
        }}
        nodeLabel={() => ""}
        onNodeClick={(n: any) => onSelectNode(String(n.id))}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(n: any, ctx: CanvasRenderingContext2D, scale: number) => {
          const isSelected = n.id === selectedId;
          const isPath = pathSet.has(n.id);
          const fontSize = Math.max((isSelected ? 13 : 11) / scale, 2);
          const label = String(n.name);

          ctx.save();
          ctx.font = `${isSelected || isPath ? "700 " : ""}${fontSize}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          // Drop shadow for legibility
          ctx.shadowColor = "#0f1419";
          ctx.shadowBlur = 4 / scale;

          ctx.fillStyle = isSelected ? C.selected : isPath ? C.path : C.label;
          ctx.fillText(label, n.x, n.y + (isSelected ? 10 : 8) / scale);
          ctx.restore();
        }}
      />
    </div>
  );
}
