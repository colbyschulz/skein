import { describe, it, expect, vi, afterEach } from "vitest";
import { searchAuthors, getPublication } from "./client.js";

afterEach(() => vi.restoreAllMocks());

describe("api client", () => {
  it("searchAuthors calls the search endpoint and returns candidates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ candidates: [{ name: "Smith J" }] }), { status: 200 })),
    );
    const result = await searchAuthors("Smith J");
    expect(result[0]!.name).toBe("Smith J");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/authors/search?name=Smith"));
  });

  it("getPublication throws on non-200", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    await expect(getPublication("1")).rejects.toThrow();
  });
});
