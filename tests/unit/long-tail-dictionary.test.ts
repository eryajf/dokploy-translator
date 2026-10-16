import { describe, expect, it } from "vitest";
import { translateText } from "../../src/translation/dictionary";
import { longTailTranslations } from "../../src/translation/long-tail-dictionary";

const modules = {
  "高级部署": [
    "Configure health check settings",
    "Configure restart policy",
    "Configure update strategy",
    "Enable Isolated Deployment",
    "Sync networks",
  ],
  "服务器与 Git": [
    "Setup Server",
    "Server diagnostics",
    "Generate ED25519 SSH Key",
    "Configure Bitbucket",
    "Select a repository",
  ],
  "DNS 与备份": [
    "Add Provider",
    "Validate DNS",
    "Volume Backups",
    "Run Manual Volume Backup",
    "Keep Latest Backups",
  ],
  "日志与数据库": [
    "Analyze logs with AI",
    "Download logs as text file",
    "Select a container to view logs",
    "Start PostgreSQL",
    "Stop Mariadb",
  ],
  "账户与引导": [
    "Accept Invitation",
    "No sessions found",
    "Custom AI Providers",
    "Let's get your first app",
    "Start 7-day free trial",
  ],
} as const;

describe("long-tail dictionary", () => {
  for (const [module, sources] of Object.entries(modules)) {
    it(`covers ${module}`, () => {
      for (const source of sources) {
        expect(translateText(source)).toBe(longTailTranslations[source]);
      }
    });
  }

  it("keeps the reviewed entries reachable through the combined dictionary", () => {
    const entries = Object.entries(longTailTranslations);
    expect(entries.length).toBeGreaterThan(500);
    for (const [source, target] of entries) expect(translateText(source)).toBe(target);
  });

  it("does not translate operational values that look like user data", () => {
    expect(translateText("production-api-server")).toBeUndefined();
    expect(translateText("America/Los_Angeles")).toBeUndefined();
    expect(translateText("docker compose up -d")).toBeUndefined();
  });
});
