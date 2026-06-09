import { useMemo, useState } from "react";
import type { Author, AuthorCandidate, Publication } from "@skein/shared";
import { authorId } from "@skein/shared";
import { SearchBar } from "./components/SearchBar.js";
import { DisambiguationPicker } from "./components/DisambiguationPicker.js";
import { SidePanel } from "./components/SidePanel.js";
import { Filters } from "./components/Filters.js";
import { GraphView } from "./graph/GraphView.js";
import { useGraphState } from "./graph/useGraphState.js";
import { useAuthorSearch, useAuthorPublications } from "./api/hooks.js";
import { filterPublications, capCoAuthors, type YearRange } from "./graph/applyFilters.js";
import { findPath } from "./graph/findPath.js";
import { useLocalStorageSync } from "./share/useLocalStorageSync.js";
import { useUrlGraphSync, copyShareLink } from "./share/useUrlGraphState.js";
import styles from "./App.module.scss";

export function App() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<AuthorCandidate | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [range, setRange] = useState<YearRange>({});
  const [cap, setCap] = useState(20);

  const { graph, seed, expand, collapse } = useGraphState();
  useLocalStorageSync(graph);
  useUrlGraphSync(graph);

  const search = useAuthorSearch(query);

  // The selected node's author (pure derivation, no effect).
  const selectedAuthor: Author | null = useMemo(
    () => graph.nodes.find((n) => n.id === selectedId)?.author ?? null,
    [graph.nodes, selectedId],
  );

  const pubs = useAuthorPublications(
    selectedAuthor?.name ?? null,
    selectedAuthor?.affiliation,
  );

  const visiblePubs = useMemo(
    () => (pubs.data ? filterPublications(pubs.data, range) : []),
    [pubs.data, range],
  );

  // Path from seed to selected node.
  const selectedPath = useMemo(
    () =>
      selectedId && graph.seedId
        ? findPath(graph.nodes, graph.seedId, selectedId) ?? []
        : [],
    [graph.nodes, graph.seedId, selectedId],
  );

  function onPick(candidate: AuthorCandidate) {
    const author: Author = { name: candidate.name, affiliation: candidate.affiliation };
    setPicked(candidate);
    seed(author);
    setSelectedId(authorId(author));
  }

  function onExpand(publication: Publication) {
    if (!selectedId) return;
    expand(
      selectedId,
      capCoAuthors(publication.authors, cap),
      publication.pmid,
      publication.title,
    );
  }

  function onSelectNode(id: string) {
    if (id === selectedId) {
      // Clicking the active node collapses its children and deselects.
      collapse(id);
      // Move selection to the parent (if any), so the panel doesn't just vanish.
      const parent = graph.nodes.find((n) => n.id === id)?.parentId ?? null;
      setSelectedId(parent ?? null);
    } else {
      setSelectedId(id);
    }
  }

  const showPicker = !picked && (search.data?.length ?? 0) > 0;

  return (
    <div className={styles.app}>
      <div className={styles.sidebar}>
        <SearchBar onSearch={(name) => { setPicked(null); setQuery(name); }} />
        {search.isLoading && <p className={styles.status}>Searching…</p>}
        {search.isError && <p className={styles.error}>Search failed — NCBI may be busy. Try again.</p>}
        {showPicker && search.data?.length === 0 && !search.isLoading && (
          <p className={styles.status}>No results found.</p>
        )}
        {showPicker && <DisambiguationPicker candidates={search.data!} onPick={onPick} />}
        {picked && (
          <>
            <Filters range={range} cap={cap} onRangeChange={setRange} onCapChange={setCap} />
            <button className={styles.share} onClick={() => copyShareLink(graph)}>
              Copy share link
            </button>
          </>
        )}
      </div>

      <main className={styles.canvas}>
        <GraphView
          graph={graph}
          selectedId={selectedId}
          pathIds={selectedPath}
          onSelectNode={onSelectNode}
        />
      </main>

      <SidePanel
        author={selectedAuthor}
        publications={visiblePubs}
        loading={pubs.isLoading}
        path={selectedPath}
        nodes={graph.nodes}
        onExpand={onExpand}
        onNavigate={setSelectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
