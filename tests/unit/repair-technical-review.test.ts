import { describe, expect, it } from "vitest";
import generated from "../../src/translation/dictionary.generated.json";
import { assessCandidate, reviewEnglish } from "../../src/translation/coverage-review";
import type { CoverageCandidate } from "../../src/translation/coverage-review";
import { reviewedTechnicalValues } from "../../src/translation/reviewed-technical-values";

const candidates: readonly CoverageCandidate[] = generated.candidates;
const candidateFor = (source: string): CoverageCandidate => {
  const candidate = candidates.find((entry) => entry.source === source);
  expect(candidate, source).toBeDefined();
  return candidate!;
};
const noTranslations = { exact: new Map<string, string>(), patterns: [], contextRules: [] };

const technicalSources = [
  "AAAA", "AI", "API URL", "Bash", "Bitbucket", "bridge", "CAA", "CI/CD", "CNAME",
  "configs", "created", "dead", "Doe", "done", "email@dokploy.com", "error", "exited",
  "false", "Ghost", "Git", "Gitea", "Gitea URL", "Github", "GitHub URL", "GitLab",
  "HTTP", "HTTPS", "IP:", "John", "Let's Encrypt", "MSA/SLA", "MX", "MySQL", "networks",
  "NS", "overlay", "paused", "PTR", "removing", "restarting", "root", "sctp", "secrets",
  "SRV", "tcp", "TXT", "udp", "Uptime Kuma", "URL:", "Vandelay Industries", "volumes", "WordPress",
];

describe("technical review repair with all-occurrence provenance", () => {
  it.each(technicalSources)("reviews every actual occurrence of %s without relying on translations", (source) => {
    const candidate = candidateFor(source);
    expect(assessCandidate(candidate, noTranslations).status).toBe("reviewed");
    expect(candidate.occurrences?.length).toBeGreaterThan(0);
    for (const occurrence of candidate.occurrences ?? []) {
      const entries = reviewedTechnicalValues.filter((entry) => entry.source === source && entry.file === occurrence.file);
      expect(entries, `${source} at ${occurrence.file}:${occurrence.line}`).toHaveLength(1);
      expect(entries[0].reason.trim().length).toBeGreaterThan(0);
    }
  });

  it.each([["John", 3], ["Doe", 3], ["Vandelay Industries", 9]] as const)(
    "checks all %s sample-name files and rejects a newly introduced unreviewed occurrence",
    (source, count) => {
      const candidate = candidateFor(source);
      expect(new Set(candidate.occurrences?.map((entry) => entry.file)).size).toBe(count);
      const unknown = { file: "components/unreviewed-form.tsx", line: 1, kind: "attribute" };
      expect(reviewEnglish({ ...candidate, occurrences: [...candidate.occurrences!, unknown] })).toBeUndefined();
      expect(assessCandidate({ ...candidate, occurrences: [unknown] }, noTranslations).status).toBe("missing");
    },
  );

  it.each([
    ["services", "components/shared/code-editor.tsx"],
    ["secret", "components/dashboard/settings/vault/handle-vault-provider.tsx"],
  ])("does not let a technical %s occurrence exempt its natural-language occurrences", (source, technicalFile) => {
    const candidate = candidateFor(source);
    const locations = candidate.occurrences ?? [];
    const technical = locations.filter((entry) => entry.file === technicalFile);
    const prose = locations.filter((entry) => entry.file !== technicalFile
      && entry.file !== "components/dashboard/compose/general/randomize-compose.tsx");
    expect(technical.length).toBeGreaterThan(0);
    expect(prose.length).toBeGreaterThan(0);
    expect(reviewEnglish({ ...candidate, occurrences: technical })).toBeTruthy();
    expect(reviewEnglish({ ...candidate, occurrences: prose })).toBeUndefined();
    expect(reviewEnglish(candidate)).toBeUndefined();
    expect(assessCandidate(candidate, noTranslations).status).toBe("missing");
  });

  it.each([
    ["Basic RBAC + 2FA", "components/dashboard/onboarding/steps/plan-step.tsx"],
    ["SSO / SAML (Azure, OKTA, etc)", "components/dashboard/settings/billing/show-billing.tsx"],
    ["Community Support (Discord)", "components/dashboard/settings/billing/show-billing.tsx"],
    ["Dokploy integration", "components/dashboard/settings/billing/show-billing.tsx"],
    ["Sendgrid service opensource analogue", "components/dashboard/project/ai/step-one.tsx"],
    ["Use \"root\" or a non-root user with passwordless sudo access.", "components/dashboard/settings/servers/handle-servers.tsx"],
  ])("keeps prose containing technical words out of the English allowlist: %s", (source, file) => {
    expect(assessCandidate({ source, file, risk: "ui" }, noTranslations).status).toBe("missing");
  });

  it("does not paper over true Traefik YAML code with a UI review", () => {
    const source = "http: routers: router-name: rule: Host('domain.com') service: container-name entryPoints: - web tls: false middlewares: []";
    expect(reviewedTechnicalValues.some((entry) => entry.source === source)).toBe(false);
    // A regression in extractor classification must not silently become reviewed UI.
    for (const file of [
      "components/dashboard/application/advanced/traefik/update-traefik-config.tsx",
      "components/dashboard/file-system/show-traefik-file.tsx",
    ]) {
      expect(assessCandidate({ source, file, risk: "ui" }, noTranslations).status).toBe("missing");
    }
  });

  it("keeps technical reviews unique, file-scoped and explained", () => {
    const keys = reviewedTechnicalValues.map((entry) => JSON.stringify([entry.source, entry.file]));
    expect(new Set(keys).size).toBe(keys.length);
    for (const entry of reviewedTechnicalValues) {
      expect(entry.file.trim()).toBeTruthy();
      expect(entry.reason.trim()).toBeTruthy();
    }
  });
});
