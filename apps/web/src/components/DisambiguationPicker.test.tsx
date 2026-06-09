import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DisambiguationPicker } from "./DisambiguationPicker.js";
import type { AuthorCandidate } from "@skein/shared";

const candidates: AuthorCandidate[] = [
  { name: "Smith J", affiliation: "MIT", paperCount: 12, samplePublications: [] },
  { name: "Smith J", affiliation: "Stanford", paperCount: 3, samplePublications: [] },
];

describe("DisambiguationPicker", () => {
  it("lists candidates and reports the chosen one", async () => {
    const onPick = vi.fn();
    render(<DisambiguationPicker candidates={candidates} onPick={onPick} />);
    expect(screen.getByText("MIT")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /MIT/ }));
    expect(onPick).toHaveBeenCalledWith(candidates[0]);
  });
});
