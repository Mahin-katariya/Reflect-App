import { describe, it, expect } from "vitest";
import { normalizeUrl, dedupeResources } from "./resources.js";

describe("normalizeUrl", () => {
  it("lowercases scheme + host", () => {
    expect(normalizeUrl("HTTPS://Example.COM/Docs")).toBe("https://example.com/docs");
  });

  it("strips a trailing slash", () => {
    expect(normalizeUrl("https://example.com/docs/")).toBe("https://example.com/docs");
  });

  it("strips the query string and hash", () => {
    expect(normalizeUrl("https://example.com/docs?utm_source=x#section")).toBe(
      "https://example.com/docs",
    );
  });

  it("treats case/slash/query variants of the same URL as equal", () => {
    const a = normalizeUrl("https://React.dev/learn/");
    const b = normalizeUrl("https://react.dev/LEARN?ref=twitter");
    expect(a).toBe(b);
  });

  it("keeps genuinely different URLs distinct", () => {
    expect(normalizeUrl("https://react.dev/learn")).not.toBe(
      normalizeUrl("https://react.dev/reference"),
    );
  });

  it("distinguishes different hosts", () => {
    expect(normalizeUrl("https://a.com/x")).not.toBe(normalizeUrl("https://b.com/x"));
  });
});

describe("dedupeResources", () => {
  it("collapses same-normalized URLs into one, keeping the first title", () => {
    const out = dedupeResources([
      { url: "https://react.dev/learn", title: "React docs" },
      { url: "https://React.dev/learn/?utm=1", title: "same link, later title" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.title).toBe("React docs");
  });

  it("keeps genuinely different URLs as separate entries", () => {
    const out = dedupeResources([
      { url: "https://react.dev/learn", title: "Learn" },
      { url: "https://react.dev/reference", title: "Reference" },
    ]);
    expect(out).toHaveLength(2);
  });

  it("does not dedupe two different URLs that share a title", () => {
    const out = dedupeResources([
      { url: "https://a.com/x", title: "Guide" },
      { url: "https://b.com/y", title: "Guide" },
    ]);
    expect(out).toHaveLength(2);
  });
});
