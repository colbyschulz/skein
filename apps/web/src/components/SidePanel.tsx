import type { Author, GraphNode, Publication } from "@skein/shared";
import { Breadcrumbs } from "./Breadcrumbs.js";
import { PublicationList } from "./PublicationList.js";
import styles from "./SidePanel.module.scss";

interface Props {
  author: Author | null;
  publications: Publication[];
  loading: boolean;
  path: string[];
  nodes: GraphNode[];
  onExpand: (publication: Publication) => void;
  onNavigate: (id: string) => void;
  onClose: () => void;
}

export function SidePanel({ author, publications, loading, path, nodes, onExpand, onNavigate, onClose }: Props) {
  if (!author) return null;
  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.name}>{author.name}</h2>
          {author.affiliation && <p className={styles.aff}>{author.affiliation}</p>}
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
      </header>
      <Breadcrumbs path={path} nodes={nodes} onNavigate={onNavigate} />
      {loading ? (
        <p className={styles.loading}>Loading publications…</p>
      ) : (
        <PublicationList publications={publications} onExpand={onExpand} />
      )}
    </aside>
  );
}
