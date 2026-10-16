import { describe, expect, it } from "vitest";
import generated from "../../src/translation/dictionary.generated.json";
import { assessCandidate } from "../../src/translation/coverage-review";
import type { CoverageCandidate, CoverageOptions } from "../../src/translation/coverage-review";
import { contextualTranslations } from "../../src/translation/contextual-translations";

const noEntries: CoverageOptions = { exact: new Map(), patterns: [], contextRules: [] };
const candidate = (source: string, extra: Partial<CoverageCandidate> = {}): CoverageCandidate => ({
  source, file: "unknown.tsx", risk: "ui", ...extra,
});

describe("occurrence-specific contextual coverage", () => {
  it("executes witnesses for each of the four registered UI locations", () => {
    expect(contextualTranslations).toHaveLength(4);
    for (const rule of contextualTranslations) {
      for (const occurrence of rule.occurrences) {
        const value = candidate(occurrence.source, occurrence);
        expect(assessCandidate(value, { ...noEntries, contextRules: contextualTranslations })).toMatchObject({ status: "translated", method: "context" });
        expect(assessCandidate(value, noEntries).status).toBe("missing");
      }
    }
  });

  it("merges technical reviews and contextual UI coverage per actual occurrence", () => {
    for (const source of ["secret", "services"]) {
      const value = (generated.candidates as CoverageCandidate[]).find((entry) => entry.source === source)!;
      expect(value.occurrences!.length).toBeGreaterThan(1);
      expect(assessCandidate(value)).toMatchObject({ status: "translated", method: "context" });
      expect(assessCandidate(value, { contextRules: [] }).status).toBe("missing");
      const unknown = { file: "components/unreviewed-counter.tsx", line: 10, kind: "jsx-text" };
      expect(assessCandidate({ ...value, occurrences: [...value.occurrences!, unknown] }).status).toBe("missing");
    }
    const technical = [
      candidate("secret", { file: "components/dashboard/settings/vault/handle-vault-provider.tsx", kind: "attribute", line: 677 }),
      candidate("services", { file: "components/dashboard/compose/general/randomize-compose.tsx", kind: "jsx-text", line: 116 }),
      candidate("services", { file: "components/shared/code-editor.tsx", kind: "string-literal", line: 27 }),
    ];
    for (const value of technical) expect(assessCandidate(value).status).toBe("reviewed");
  });

  it("does not treat an unexecuted or incorrect registration as coverage", () => {
    for (const rule of contextualTranslations) {
      const value = candidate(rule.occurrences[0].source, rule.occurrences[0]);
      for (const invalid of [
        { ...rule, witnesses: [] },
        { ...rule, witnesses: rule.witnesses.map((witness) => ({ ...witness, output: "错误翻译" })) },
        { ...rule, grammar: /^never matches$/u },
        { ...rule, grammar: /services/u },
      ]) {
        expect(assessCandidate(value, { ...noEntries, contextRules: [invalid] }).status).toBe("missing");
      }
      expect(assessCandidate({ ...value, line: value.line! + 1 }, { ...noEntries, contextRules: [rule] }).status).toBe("missing");
      expect(assessCandidate({ ...value, kind: "attribute" }, { ...noEntries, contextRules: [rule] }).status).toBe("missing");
      expect(assessCandidate({ ...value, file: "unknown.tsx" }, { ...noEntries, contextRules: [rule] }).status).toBe("missing");
    }
  });
});
