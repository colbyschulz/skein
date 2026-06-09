import { useState, type FormEvent } from "react";
import styles from "./SearchBar.module.scss";

interface Props {
  onSearch: (name: string) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (name) onSearch(name);
  }

  return (
    <form className={styles.bar} onSubmit={submit}>
      <input
        className={styles.input}
        placeholder="Search an author, e.g. Smith J"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Author name"
      />
      <button className={styles.button} type="submit">Search</button>
    </form>
  );
}
