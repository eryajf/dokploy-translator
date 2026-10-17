import { describe, expect, it } from "vitest";
import { contextualTranslations, translateContextualParts } from "../../src/translation/contextual-translations";

describe("complete contextual text grammars", () => {
  it("executes every registered witness without changing part count or numeric nodes", () => {
    for (const rule of contextualTranslations) {
      expect(rule.witnesses.length).toBeGreaterThan(0);
      for (const witness of rule.witnesses) {
        const output = translateContextualParts(rule, witness.parts);
        expect(output?.join("")).toBe(witness.output);
        expect(output).toHaveLength(witness.parts.length);
        witness.parts.forEach((part, index) => {
          if (/^\d+$/.test(part)) expect(output?.[index]).toBe(part);
        });
      }
    }
  });

  it("requires the whole continuous text grammar, never a numeric prefix or isolated noun", () => {
    for (const rule of contextualTranslations) {
      for (const parts of [["services"], ["secret"], ["2 services other"], ["prefix 2 services"], ["Import 2 secrets later"], ["2 services\nsecret"]]) {
        expect(translateContextualParts(rule, parts)).toBeUndefined();
      }
    }
  });
});
