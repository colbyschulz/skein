import type { YearRange } from "../graph/applyFilters.js";
import styles from "./Filters.module.scss";

interface Props {
  range: YearRange;
  cap: number;
  onRangeChange: (range: YearRange) => void;
  onCapChange: (cap: number) => void;
}

export function Filters({ range, cap, onRangeChange, onCapChange }: Props) {
  return (
    <div className={styles.filters}>
      <label className={styles.field}>
        From
        <input
          type="number" className={styles.num} value={range.from ?? ""}
          onChange={(e) => onRangeChange({ ...range, from: e.target.value ? Number(e.target.value) : undefined })}
        />
      </label>
      <label className={styles.field}>
        To
        <input
          type="number" className={styles.num} value={range.to ?? ""}
          onChange={(e) => onRangeChange({ ...range, to: e.target.value ? Number(e.target.value) : undefined })}
        />
      </label>
      <label className={styles.field}>
        Max co-authors/paper
        <input
          type="number" min={1} className={styles.num} value={cap}
          onChange={(e) => onCapChange(Number(e.target.value) || 0)}
        />
      </label>
    </div>
  );
}
