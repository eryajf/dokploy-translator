import { describe, expect, it } from "vitest";
import { normalizeOrigin, originPattern } from "../../src/storage/site";
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
});
