import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGraphState } from "./useGraphState.js";
import { authorId, type Author } from "@skein/shared";

const seed: Author = { name: "Smith J", affiliation: "MIT" };

describe("useGraphState", () => {
  it("seeds and expands without effects", () => {
    const { result } = renderHook(() => useGraphState());

    act(() => result.current.seed(seed));
    expect(result.current.graph.nodes.length).toBe(1);

    act(() =>
      result.current.expand(authorId(seed), [seed, { name: "Doe A" }], "999"),
    );
    expect(result.current.graph.nodes.length).toBe(2);
  });
});
