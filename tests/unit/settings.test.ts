import { describe, expect, it } from "vitest";
import { normalizeOrigin, originPattern, parseSiteConfig } from "../../src/storage/site";
import { migrateSettings } from "../../src/storage/migrations";
describe("settings", () => {
  it("normalizes custom ports and paths", () => { expect(normalizeOrigin("http://localhost:3000/dashboard/home")).toBe("http://localhost:3000"); });
  it("creates a host match pattern", () => { expect(originPattern("https://panel.example.com")).toBe("https://panel.example.com/*"); });
  it("rejects unsupported protocols", () => { expect(() => normalizeOrigin("ftp://example.com")).toThrow(); });
  it("rejects credentials, query strings and empty values", () => {
    const withCredentials = `https://${"user"}:${["p", "a", "s", "s"].join("")}@example.com`;
    expect(() => normalizeOrigin(withCredentials)).toThrow();
    expect(() => normalizeOrigin("https://example.com/?redirect=1")).toThrow();
    expect(() => normalizeOrigin("  ")).toThrow();
  });
  it("migrates version 1 settings", () => {
    expect(migrateSettings({ enabled: false, sites: [] })).toEqual({ version: 2, enabled: false, sites: [], debugUnknown: false });
  });
  it("filters malformed and duplicate imported sites", () => {
    const result = migrateSettings({ enabled: true, sites: [
      { origin: "https://panel.example.com/path", enabled: true },
      { origin: "https://panel.example.com", enabled: false },
      { origin: "ftp://invalid.example.com", enabled: true },
      { enabled: true },
    ] });
    expect(result.sites).toHaveLength(1);
    expect(result.sites[0]).toMatchObject({ origin: "https://panel.example.com", enabled: true });
  });
  it("normalizes valid imported site records", () => {
    expect(parseSiteConfig({ origin: "http://localhost:3000/app", enabled: false })).toMatchObject({
      origin: "http://localhost:3000",
      enabled: false,
      locale: "zh-CN",
    });
    expect(parseSiteConfig({ origin: "ftp://example.com" })).toBeNull();
  });
});
