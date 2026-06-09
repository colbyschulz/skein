import type { AuthorCandidate } from "@skein/shared";
import styles from "./DisambiguationPicker.module.scss";

interface Props {
  candidates: AuthorCandidate[];
  onPick: (candidate: AuthorCandidate) => void;
}

export function DisambiguationPicker({ candidates, onPick }: Props) {
  return (
    <ul className={styles.list}>
      {candidates.map((c) => (
        <li key={`${c.name}|${c.affiliation}`}>
          <button className={styles.item} onClick={() => onPick(c)}>
            <span className={styles.aff}>{c.affiliation}</span>
            <span className={styles.count}>{c.paperCount} papers</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
