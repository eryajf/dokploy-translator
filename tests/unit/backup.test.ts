import { describe, expect, it } from "vitest";
import { createConfigBackup, importUnknownTexts } from "../../src/storage/backup";

describe("configuration backup privacy", () => {
  it("never includes unknown-text debug records in a default backup", () => {
    const settings = { version: 2 as const, enabled: true, debugUnknown: true, sites: [] };
    const result = createConfigBackup(settings, { Home: "首页" });
    expect(result).toMatchObject({ schemaVersion: 1, settings, customTranslations: { Home: "首页" }, unknownTexts: [] });
    expect(JSON.parse(JSON.stringify(result)).unknownTexts).toEqual([]);
  });
  it("sanitizes old backup records on import", () => {
    const base = { text: "Future dashboard action", url: "https://panel.example.com/path?private=1", tagName: "SPAN", seenAt: 1 };
    expect(importUnknownTexts([base, { ...base, text: "Contact alice@example.com" }, { text: "Invalid" }])).toEqual([{ ...base, url: "https://panel.example.com/path" }]);
  });
});
