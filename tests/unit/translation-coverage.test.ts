import { describe, expect, it } from "vitest";
import generated from "../../src/translation/dictionary.generated.json";
import { dictionary, exactDictionary, translateText } from "../../src/translation/dictionary";
import { reviewedTechnicalValues } from "../../src/translation/reviewed-technical-values";
import { aggregateTemplates, assessCandidate, assessTemplate, auditCoverage, reviewEnglish, reverseAuditCoverage } from "../../src/translation/coverage-review";
import type { CoverageCandidate, CoverageOptions } from "../../src/translation/coverage-review";

const candidate = (source: string, extra: Partial<CoverageCandidate> = {}): CoverageCandidate => ({
  source, file: "components/dashboard/example.tsx", risk: "ui", ...extra,
});
const noEntries: CoverageOptions = { exact: new Map() };

describe("translation coverage review", () => {
  it("uses the same single-pass exact normalization as runtime", () => {
    const exact = new Map([["Alpha & Beta", "甲和乙"], ["Alpha Beta", "甲乙"]]);
    expect(assessCandidate(candidate("Alpha &amp; Beta"), { exact }).status).toBe("translated");
    expect(assessCandidate(candidate("Alpha&nbsp;  Beta"), { exact }).status).toBe("translated");
    expect(assessCandidate(candidate("Alpha &amp;amp; Beta"), { exact }).status).toBe("missing");
  });

  it("requires file-scoped review for every deduplicated occurrence", () => {
    const value = candidate("Catalog value", { file: "lib/bundled-icons.ts", occurrences: [
      { file: "lib/bundled-icons.ts", line: 2, kind: "string-literal" },
      { file: "components/live-ui.tsx", line: 8, kind: "jsx-text" },
    ] } as Partial<CoverageCandidate>);
    expect(reviewEnglish(value)).toBeUndefined();
    expect(assessCandidate(value, noEntries).status).toBe("missing");
    expect(reviewEnglish(value, [{ source: "Catalog value", file: "components/live-ui.tsx", reason: "Reviewed label." }])).toBeTruthy();
  });

  it.each([
    "Across", "Destinations", "CPU limit", "SSH", "active", "ADMIN", "my-label",
    "Restart Docker now", "Configure Compose services", "Join Swarm now", "CPU usage is high",
    "Wait an hour", "1 hour", "100 lines", "1. Add A Record", "20% off",
    "and other services", "from", "with", "your", "to", "Done for", ", Availability:",
    "— Applications in Dokploy deploy to Swarm by default. Docker Compose projects need to use",
    "/ Month USD", "/ Limit:", "Open https://example.com", "https://example.com is available",
    "example.com instructions", "--color-", ".Aliases", "e.g. something",
    "lib/bundled-icons.ts", "__test__/Save", "timezones/Save", "[skip ci] deploy now",
  ])("keeps unreviewed labels, sentences and JSX fragments missing: %s", (source) => {
    expect(assessCandidate(candidate(source), noEntries).status).toBe("missing");
  });

  it.each([
    "Docker", "Docker Compose", "Docker Swarm", "CPU", "PostgreSQL", "Dockerfile", "compose.yaml",
    "https://example.com/path?token=value#section", "/var/log/app.log", "/etc/dokploy/config.yml",
    "./config.json", "../config.json", "~/config.json", "127.0.0.1", "3000", "99.5%",
  ])("reviews only whole technical values with reasons: %s", (source) => {
    const result = assessCandidate(candidate(source), noEntries);
    expect(result.status).toBe("reviewed");
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it.each(["https://", "https:// example.com", "999.0.0.1", "/Save", "/var/log and save", "/var//log", "/var/../Save"])("does not treat malformed or ambiguous values as reviewed: %s", (source) => {
    expect(reviewEnglish(candidate(source))).toBeUndefined();
  });

  it("matches source-location rules against candidate.file, not candidate.source", () => {
    for (const file of ["lib/bundled-icons.ts", "components/dashboard/application/schedules/timezones.ts", "lib/__test__/fixture.ts", "lib/__tests__/fixture.ts"]) {
      expect(reviewEnglish(candidate("Untranslated catalog value", { file }))).toBeTruthy();
      expect(reviewEnglish(candidate(file))).toBeUndefined();
    }
    expect(reviewEnglish(candidate("Catalog", { file: "lib\\bundled-icons.ts" }))).toBeTruthy();
    expect(reviewEnglish(candidate("Catalog", { file: "lib/bundled-icons.tsx" }))).toBeUndefined();
    expect(reviewEnglish(candidate("Catalog", { file: "components/timezones/settings.tsx" }))).toBeUndefined();
    expect(reviewEnglish(candidate("Catalog", { file: "lib/__test__-ui.tsx" }))).toBeUndefined();
  });

  it("requires an exact allowlist match and a nonempty reason, optionally scoped to a file", () => {
    const reviews = [{ source: "SSH", file: "components/dashboard/example.tsx", reason: "Protocol label retained after review." }];
    expect(reviewEnglish(candidate("SSH"), reviews)).toBe(reviews[0].reason);
    expect(reviewEnglish(candidate("SSH settings"), reviews)).toBeUndefined();
    expect(reviewEnglish(candidate("SSH", { file: "other.tsx" }), reviews)).toBeUndefined();
    expect(reviewEnglish(candidate("SSH"), [{ source: "SSH", reason: " " }])).toBeUndefined();
    const untrustedReviewFlag = { ...candidate("Unknown"), reviewed: true };
    expect(assessCandidate(untrustedReviewFlag, noEntries).status).toBe("missing");
  });

  it("uses individually reviewed technical values only for their exact source and file", () => {
    const entry = reviewedTechnicalValues.find((item) => item.source === "*.sslip.io");
    expect(entry).toBeDefined();
    const value = candidate(entry!.source, { file: entry!.file });
    expect(reviewEnglish(value)).toBe(entry!.reason);
    expect(reviewEnglish({ ...value, source: ` ${value.source}` })).toBeUndefined();
    expect(reviewEnglish({ ...value, file: "components/another-form.tsx" })).toBeUndefined();
    expect(reviewEnglish({ ...value, file: value.file.replace(/\//g, "\\\\") })).toBeUndefined();
    expect(reviewEnglish({ ...value, source: `Configure ${value.source}` })).toBeUndefined();
  });

  it("accepts normalized exact translations but not untranslated identity entries", () => {
    const options = { exact: new Map([["Unreviewed label", "待审核标签"], ["Unknown", "Unknown"], ["Blank", " "]]) };
    expect(assessCandidate(candidate("  Unreviewed  label  "), options)).toMatchObject({ status: "translated", method: "exact" });
    expect(assessCandidate(candidate("Unknown"), options).status).toBe("missing");
    expect(assessCandidate(candidate("Blank"), options).status).toBe("missing");
    expect(assessCandidate(candidate("Home"))).toMatchObject({ status: "translated", translation: "首页" });
    expect(assessCandidate(candidate("Docker"))).toMatchObject({ status: "reviewed" });
  });

  it("does not count translateText's word fallback as a complete translation", () => {
    const source = "Please select your server";
    expect(exactDictionary.has(source)).toBe(false);
    expect(translateText(source)).toBeTruthy();
    expect(assessCandidate(candidate(source)).status).toBe("missing");
  });

  it.each(["View deployments", "Delete services", "No environments found."])("requires exact entries for fixed copy even when a pattern matches: %s", (source) => {
    expect(translateText(source)).toBeTruthy();
    expect(assessCandidate(candidate(source), noEntries).status).toBe("missing");
  });

  it("uses existing patterns for declared dynamic placeholders, never word fallback", () => {
    const result = assessCandidate(candidate("Logs for ${name}", { kind: "template", placeholders: ["${name}"] }), noEntries);
    expect(result).toMatchObject({ status: "translated", method: "pattern", dynamic: true, translation: "${name} 的日志" });
    expect(assessCandidate(candidate("Logs for ${name}", { kind: "template", placeholders: ["${other}"] }), noEntries).status).toBe("missing");
    expect(assessCandidate(candidate("Logs for ${name}", { kind: "string-literal", placeholders: ["${name}"] }), noEntries).status).toBe("missing");
    expect(assessCandidate(candidate("Add a new server", { kind: "template", placeholders: ["${name}"] }), noEntries).status).toBe("missing");
  });

  it("exposes untranslated nouns left by patterns for dynamic copy too", () => {
    for (const source of ["View deployments", "Delete services", "No environments found."]) {
      const result = assessCandidate(candidate(source, { kind: "template", placeholders: ["${name}"] }), noEntries);
      expect(result.status).toBe("missing");
      expect(result.translation).toMatch(/[A-Za-z]/);
    }
    expect(assessCandidate(candidate("Logs for Docker", { kind: "template", placeholders: ["${name}"] }), noEntries).status).toBe("translated");
  });

  it("honors pattern area restrictions and rejects identity-only pattern outputs", () => {
    const value = candidate("View ${name}", { kind: "template", placeholders: ["${name}"] });
    expect(assessCandidate(value, { ...noEntries, patterns: [{ kind: "pattern", pattern: "^View (.+)$", target: "查看 $1", areas: ["title"] }] }).status).toBe("missing");
    expect(assessCandidate(value, { ...noEntries, patterns: [{ kind: "pattern", pattern: "^(.+)$", target: "$1" }] }).status).toBe("missing");
    expect(dictionary.some((rule) => rule.kind === "pattern")).toBe(true);
  });
});

describe("complete dynamic template review", () => {
  const shell = "Role ${name} created";
  const shellRule = { source: shell, pattern: /^Role (.+) created$/, target: "角色 $1 已创建" };
  const shellCases = [{ source: shell, input: "Role release-admin created", output: "角色 release-admin 已创建" }];
  const fragment = (source: string, extra: Partial<CoverageCandidate> = {}) => candidate(source, {
    kind: "template", placeholders: ["${name}"], template: shell, ...extra,
  });

  it("does not mistake exact translations of every fragment for runtime template coverage", () => {
    const candidates = [fragment("Role"), fragment("created")];
    const result = auditCoverage(candidates, {
      exact: new Map([["Role", "角色"], ["created", "已创建"]]), templateRules: [],
    });
    expect(result.coverage).toBe(1);
    expect(result.missing).toHaveLength(0);
    expect(result.templates).toHaveLength(1);
    expect(result.missingTemplates).toHaveLength(1);
    expect(result.templateCoverage).toBe(0);
    expect(result.passed).toBe(false);
  });

  it("associates each complete shell with its own occurrence locations", () => {
    const otherShell = "Role ${name} deleted";
    const values = [fragment("Role", {
      templates: [shell, otherShell],
      templateOccurrences: [
        { source: shell, file: "created.tsx", line: 5, kind: "template" },
        { source: otherShell, file: "deleted.tsx", line: 20, kind: "template" },
      ],
    } as Partial<CoverageCandidate>)];
    const result = aggregateTemplates(values);
    expect(result.get(shell)?.map(({ file, line }) => ({ file, line }))).toEqual([{ file: "created.tsx", line: 5 }]);
    expect(result.get(otherShell)?.map(({ file, line }) => ({ file, line }))).toEqual([{ file: "deleted.tsx", line: 20 }]);
  });

  it("does not count unexercised patterns as reviewed template coverage", () => {
    expect(assessTemplate(shell, [], [{ ...shellRule, pattern: /^never matches$/u }]).status).toBe("missing");
  });

  it("requires source-associated successful witnesses, not matching or Chinese targets alone", () => {
    expect(assessTemplate(shell, [], [shellRule], []).status).toBe("missing");
    expect(assessTemplate(shell, [], [shellRule], [{ ...shellCases[0], source: "Role ${other} created" }]).status).toBe("missing");
    expect(assessTemplate(shell, [], [{ ...shellRule, target: "错误 $1" }], shellCases).status).toBe("missing");
    const badBranch = { ...shellRule, pattern: /^Role (.+) deleted$/, target: "错误 $1" };
    expect(assessTemplate(shell, [], [shellRule, badBranch], shellCases).status).toBe("missing");
    const stateful = { ...shellRule, pattern: /^Role (.+) created$/g };
    expect(assessTemplate(shell, [], [stateful], shellCases).status).toBe("missing");
  });

  it("validates every example and global first-match precedence, including rules from other sources", () => {
    const shadow = { source: "Unrelated ${name}", pattern: /^Role (.+) created$/, target: "错误 $1" };
    expect(assessTemplate(shell, [], [shadow, shellRule], shellCases).status).toBe("missing");
    expect(assessTemplate(shell, [], [{ ...shadow, pattern: /^Role (.+) created$/g }, shellRule], shellCases).status).toBe("missing");
    const examples = [...shellCases, { source: shell, input: "Role second created", output: "错误 second" }];
    expect(assessTemplate(shell, [], [shellRule], examples).status).toBe("missing");
    const alias = { ...shellRule, source: "Role ${alias} created" };
    const result = assessTemplate(alias.source, [], [shellRule, alias], [{ ...shellCases[0], source: alias.source }]);
    expect(result.status).toBe("translated");
    expect(result.reason).toContain("Sample-validated");
  });

  it("deduplicates original complete shells across candidates and merges both metadata fields", () => {
    const otherShell = "Role ${name} deleted";
    const candidates = [
      fragment("Role", { templates: [shell, otherShell, otherShell] }),
      fragment("created", { file: "other.tsx", templates: [shell] }),
      candidate("Home", { templates: [shell], risk: "code" }),
    ];
    const aggregated = aggregateTemplates(candidates);
    expect([...aggregated.keys()]).toEqual([shell, otherShell]);
    expect(aggregated.get(shell)).toEqual(candidates.slice(0, 2));
    expect(aggregated.get(otherShell)).toEqual([candidates[0]]);
    const result = auditCoverage(candidates, { ...noEntries, templateRules: [shellRule], runtimeCases: shellCases });
    expect(result.templates).toHaveLength(2);
    expect(result.translatedTemplates).toHaveLength(1);
    expect(result.missingTemplates.map((item) => item.source)).toEqual([otherShell]);
    expect(result.templateCoverage).toBe(0.5);
  });

  it("requires exact original source identity even if a broad pattern would match", () => {
    const rules = [{ ...shellRule, pattern: /^Role (.+) created$/ }];
    for (const unknown of ["Unknown ${name}", "Role ${other} created", "Role  ${name} created", " Role ${name} created"]) {
      expect(assessTemplate(unknown, [], rules).status).toBe("missing");
    }
    expect(assessTemplate(shell, [], rules, shellCases).status).toBe("translated");
  });

  it.each(["", "   ", "Role $1 created", "$1"])("rejects empty or non-Chinese reviewed targets: %j", (target) => {
    expect(assessTemplate(shell, [], [{ ...shellRule, target }]).status).toBe("missing");
  });

  it("accepts multiple finite action rules with the same original source, not one template per branch", () => {
    const source = "${action} ${name} successfully";
    const rules = [
      { source, pattern: /^Started (.+) successfully$/, target: "已启动 $1" },
      { source, pattern: /^Stopped (.+) successfully$/, target: "已停止 $1" },
    ];
    const samples = [
      { source, input: "Started web successfully", output: "已启动 web" },
      { source, input: "Stopped web successfully", output: "已停止 web" },
    ];
    expect(assessTemplate(source, [], rules, samples)).toMatchObject({ status: "translated", matchingRuleCount: 2 });
    expect(assessTemplate(source, [], [...rules, { source, pattern: /^Restarted (.+) successfully$/, target: "" }], samples).status).toBe("missing");
    const result = auditCoverage([candidate("Home", { templates: [source, source] })], { templateRules: rules, runtimeCases: samples });
    expect(result.templates).toHaveLength(1);
    expect(result.translatedTemplates).toHaveLength(1);
    expect(result.passed).toBe(true);
  });

  it("uses reviewed source/target metadata, not regex source text, to judge Chinese quality", () => {
    const source = "Delete ${name}";
    expect(assessTemplate(source, [], [{ source, pattern: /^Delete (.+)$/, target: "删除 $1" }],
      [{ source, input: "Delete my-web", output: "删除 my-web" }]).status).toBe("translated");
    expect(assessTemplate(source, [], [{ source, pattern: /^删除 (.+)$/, target: "Delete $1" }]).status).toBe("missing");
  });

  it("does not consult literal allowlists, brand/path rules, exact or old patterns for unknown shells", () => {
    for (const source of ["Docker", "https://example.com/${name}", "Logs for ${name}"]) {
      const result = auditCoverage([candidate("Home", { template: source })], {
        exact: new Map([["Home", "首页"], [source, "审定静态词条"]]),
        reviews: [{ source, reason: "Static English review only." }], templateRules: [],
      });
      expect(result.missing).toHaveLength(0);
      expect(result.missingTemplates).toHaveLength(1);
      expect(result.passed).toBe(false);
    }
  });

  it("keeps missing fragments visible even with an approved complete template", () => {
    const result = auditCoverage([fragment("Unreviewed fragment")], { ...noEntries, templateRules: [shellRule], runtimeCases: shellCases });
    expect(result.translatedTemplates).toHaveLength(1);
    expect(result.missingTemplates).toHaveLength(0);
    expect(result.missing).toHaveLength(1);
    expect(result.passed).toBe(false);
  });

  it("passes only when both the candidate layer and template layer are covered", () => {
    const result = auditCoverage([fragment("Home")], { templateRules: [shellRule], runtimeCases: shellCases });
    expect(result.missing).toHaveLength(0);
    expect(result.missingTemplates).toHaveLength(0);
    expect(result.coverage).toBe(1);
    expect(result.templateCoverage).toBe(1);
    expect(result.passed).toBe(true);
  });

  it("preserves compatibility for old candidates without template metadata", () => {
    const result = auditCoverage([candidate("Home")], { templateRules: [] });
    expect(result.templates).toEqual([]);
    expect(result.missingTemplates).toEqual([]);
    expect(result.templateCoverage).toBeNull();
    expect(result.passed).toBe(true);
    expect(auditCoverage([], { templateRules: [] }).passed).toBe(false);
  });
});

describe("coverage statistics", () => {
  it("separates non-UI risks without counting them as translated or reviewed", () => {
    const nonUI = ["url", "dynamic", "code", "secret", "future-risk"].map((risk) => candidate("[REDACTED]", { risk }));
    const result = auditCoverage([candidate("Home"), candidate("Docker"), candidate("Never reviewed coverage label"), ...nonUI]);
    expect(result.total).toBe(8);
    expect(result.ui).toHaveLength(3);
    expect(result.nonUI).toEqual(nonUI);
    expect(result.translated).toHaveLength(1);
    expect(result.reviewed).toHaveLength(1);
    expect(result.missing).toHaveLength(1);
    expect(result.coverage).toBeCloseTo(2 / 3);
    expect(result.passed).toBe(false);
  });

  it("fails empty UI datasets instead of reporting success", () => {
    for (const candidates of [[], [candidate("[REDACTED]", { risk: "secret" })]]) {
      expect(auditCoverage(candidates)).toMatchObject({ coverage: null, passed: false });
    }
  });

  it("passes only when nonempty UI is fully translated/reviewed", () => {
    expect(auditCoverage([candidate("Home"), candidate("Docker")])).toMatchObject({ coverage: 1, passed: true });
  });

  it("audits existing JSON only and keeps known real omissions visible without dictionaries", () => {
    const values = generated.candidates as CoverageCandidate[];
    const result = auditCoverage(values, noEntries);
    expect(result.total).toBe(values.length);
    expect(result.ui.length + result.nonUI.length).toBe(values.length);
    expect(result.translated.length + result.reviewed.length + result.missing.length).toBe(result.ui.length);
    const completeShells = new Set(values.filter((value) => value.risk === "ui")
      .flatMap((value) => [...(value.templates ?? []), ...(value.template === undefined ? [] : [value.template])]));
    expect(result.templates.map((item) => item.source)).toEqual([...completeShells]);
    expect(result.translatedTemplates.length + result.missingTemplates.length).toBe(completeShells.size);
    for (const source of ["Across", "1 hour", "/ Month USD", ", Availability:"]) {
      expect(values.some((value) => value.source === source && value.risk === "ui")).toBe(true);
      expect(result.missing.some((item) => item.candidate.source === source)).toBe(true);
    }
    expect(result.passed).toBe(false);
  });

  describe("reverse extractor audit", () => {
    const scan = (text: string, extra: Partial<{ file: string; line: number; kind: string; explicitUi: boolean }> = {}) => ({
      file: "components/dashboard/example.tsx", line: 1, kind: "jsx-text", text, explicitUi: true, ...extra,
    });

    it("reports UI-shaped source text that never became a candidate", () => {
      const result = reverseAuditCoverage([candidate("Home")], [scan("Home"), scan("Memory hard limit in bytes. Example: 1GB = 1073741824 bytes.")]);
      expect(result.scanned).toBe(2);
      expect(result.findings.map((finding) => finding.source)).toEqual(["Memory hard limit in bytes. Example: 1GB = 1073741824 bytes."]);
      expect(result.passed).toBe(false);
    });

    it("accepts text already present as a complete template shell", () => {
      const shell = "Schedule ${…} successfully";
      const result = reverseAuditCoverage([candidate("successfully", { templates: [shell] })], [scan(shell)]);
      expect(result.findings).toEqual([]);
      expect(result.passed).toBe(true);
    });

    it("ignores console output, throw messages, values and non-UI files", () => {
      const values = [
        scan("Deployment logs error:", { explicitUi: false }),
        scan("https://example.com/webhook"),
        scan("/etc/dokploy/traefik"),
        scan("docker compose up -d"),
        scan("README"),
        scan("Some English sentence", { file: "pages/api/deploy/[refreshToken].ts" }),
        scan("Another English sentence", { file: "components/dashboard/application/schedules/timezones.ts" }),
      ];
      expect(reverseAuditCoverage([], values).findings).toEqual([]);
    });

    it("normalizes entities and whitespace before comparing with candidates", () => {
      expect(reverseAuditCoverage([candidate("Containers &amp; services")], [scan("Containers   &  services")]).findings).toEqual([]);
    });
  });
});
