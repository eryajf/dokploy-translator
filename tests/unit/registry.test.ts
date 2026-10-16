import { describe, expect, it } from "vitest";
import { desiredScriptIds, staleScriptIds } from "../../src/runtime/registry";
import type { SiteConfig } from "../../src/storage/settings";

const site = (origin: string, enabled = true): SiteConfig => ({ id: origin, origin, enabled, locale: "zh-CN", createdAt: 0, updatedAt: 0 });

describe("dynamic content-script registry", () => {
  it("keeps only enabled sites with granted origins", () => {
    const ids = desiredScriptIds([site("http://localhost:3000"), site("https://panel.example.com", false)], true, new Set(["http://localhost:3000"]));
    expect(ids.size).toBe(1);
  });

  it("finds deleted Dokploy scripts without touching unrelated scripts", () => {
    const desired = desiredScriptIds([site("http://localhost:3000")], true, new Set(["http://localhost:3000"]));
    expect(staleScriptIds(["dokploy-deleted", "other-extension-script", ...desired], desired)).toEqual(["dokploy-deleted"]);
  });
});
