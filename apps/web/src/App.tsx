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
import { useLocalStorageSync } from "./share/useLocalStorageSync.js";
import { useUrlGraphSync, copyShareLink } from "./share/useUrlGraphState.js";
import styles from "./App.module.scss";

export function App() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<AuthorCandidate | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [range, setRange] = useState<YearRange>({});
  const [cap, setCap] = useState(20);

  const { graph, seed, expand } = useGraphState();
  useLocalStorageSync(graph);
  useUrlGraphSync(graph);

  const search = useAuthorSearch(query);

  const selectedAuthor: Author | null = useMemo(
    () => graph.nodes.find((n) => n.id === selectedId)?.author ?? null,
    [graph, selectedId],
  );

  const pubs = useAuthorPublications(
    selectedAuthor?.name ?? null,
    selectedAuthor?.affiliation,
  );

  const visiblePubs = useMemo(
    () => (pubs.data ? filterPublications(pubs.data, range) : []),
    [pubs.data, range],
  );

  function onPick(candidate: AuthorCandidate) {
    const author: Author = { name: candidate.name, affiliation: candidate.affiliation };
    setPicked(candidate);
    seed(author);
    setSelectedId(authorId(author));
  }

  function onExpand(publication: Publication) {
    if (!selectedId) return;
    expand(selectedId, capCoAuthors(publication.authors, cap), publication.pmid);
  }

  const showPicker = !picked && (search.data?.length ?? 0) > 0;

  return (
    <div className={styles.app}>
      <div className={styles.sidebar}>
        <SearchBar onSearch={(name) => { setPicked(null); setQuery(name); }} />
        {search.isLoading && <p className={styles.status}>Searching…</p>}
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
        <GraphView graph={graph} selectedId={selectedId} onSelectNode={setSelectedId} />
      </main>

      <SidePanel
        author={selectedAuthor}
        publications={visiblePubs}
        loading={pubs.isLoading}
        onExpand={onExpand}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
