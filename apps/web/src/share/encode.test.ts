import { describe, it, expect } from "vitest";
import { encodeGraph, decodeGraph } from "./encode.js";
import type { GraphState } from "@skein/shared";

const state: GraphState = {
  seedId: "smith j|mit",
  nodes: [
    { id: "smith j|mit", author: { name: "Smith J", affiliation: "MIT" } },
    { id: "doe a", author: { name: "Doe A" } },
  ],
  links: [{ source: "smith j|mit", target: "doe a", viaPmid: "999" }],
};

describe("graph encode/decode", () => {
  it("round-trips a graph through a hash string", () => {
    const hash = encodeGraph(state);
    expect(typeof hash).toBe("string");
    expect(decodeGraph(hash)).toEqual(state);
  });

  it("returns null for malformed input", () => {
    expect(decodeGraph("not-valid")).toBeNull();
  });
});
