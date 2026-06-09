import type { GraphNode } from "@skein/shared";
import styles from "./Breadcrumbs.module.scss";

interface Props {
  path: string[];
  nodes: GraphNode[];
  onNavigate: (id: string) => void;
}

export function Breadcrumbs({ path, nodes, onNavigate }: Props) {
  if (path.length <= 1) return null;

  const nameOf = (id: string) =>
    nodes.find((n) => n.id === id)?.author.name ?? id;

  return (
    <nav className={styles.trail} aria-label="Path from seed">
      {path.map((id, i) => (
        <span key={id} className={styles.segment}>
          {i > 0 && <span className={styles.sep}>→</span>}
          <button
            className={`${styles.crumb} ${i === path.length - 1 ? styles.active : ""}`}
            onClick={() => onNavigate(id)}
          >
            {nameOf(id)}
          </button>
        </span>
      ))}
    </nav>
  );
}
