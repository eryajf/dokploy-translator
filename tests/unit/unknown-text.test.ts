import { describe, expect, it } from "vitest";
import { isSafeUnknownText, sanitizeUnknownTextEntry, sanitizeUnknownTextEntries } from "../../src/translation/unknown-text";

const entry = { text: "Future safe dashboard action", url: "https://panel.example.com/dashboard?token=private#details", tagName: "SPAN", seenAt: 123 };

describe("unknown text privacy boundary", () => {
  it("retains short UI prose and removes URL query and fragment", () => {
    expect(isSafeUnknownText(entry.text)).toBe(true);
    expect(sanitizeUnknownTextEntry({ ...entry, extra: "not retained" })).toEqual({ ...entry, url: "https://panel.example.com/dashboard" });
  });
  it.each([
    "Contact alice@example.com", "Bearer secret-token", "pass" + "word=secret-value", "API token: private-value",
    "-----BEGIN PRIVATE KEY-----", "docker build .", "npm run build", "curl https://example.com",
    "Visit https://example.com?token=private-value", "ssh user@host", "export TOKEN=value",
    "", "x".repeat(501), "Unsafe\u0000value",
  ])("rejects unsuitable reporting content %j", (text) => {
    expect(isSafeUnknownText(text)).toBe(false);
    expect(sanitizeUnknownTextEntry({ ...entry, text })).toBeUndefined();
  });
  it.each([
    null, [], {}, { ...entry, text: 5 }, { ...entry, url: "javascript:alert(1)" },
    { ...entry, url: "https://user:password@example.com" }, { ...entry, url: "not a URL" },
    { ...entry, seenAt: NaN }, { ...entry, seenAt: Infinity }, { ...entry, seenAt: -1 },
    { ...entry, tagName: "<script>" }, { ...entry, tagName: "" },
  ])("rejects malformed records", (value) => expect(sanitizeUnknownTextEntry(value)).toBeUndefined());
  it("sanitizes and deduplicates legacy records with a bounded size", () => {
    const values = [entry, { ...entry, url: "https://panel.example.com/dashboard#other" }, { ...entry, text: "Contact alice@example.com" }];
    expect(sanitizeUnknownTextEntries(values)).toHaveLength(1);
    expect(sanitizeUnknownTextEntries(undefined)).toEqual([]);
    expect(sanitizeUnknownTextEntries(Array.from({ length: 510 }, (_, i) => ({ ...entry, text: `Future action number ${i}` })))).toHaveLength(500);
  });
});
