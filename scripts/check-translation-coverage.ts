import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { auditCoverage, reverseAuditCoverage } from "../src/translation/coverage-review";
import type { CoverageCandidate } from "../src/translation/coverage-review";
import { scanUiShapedDirectory } from "./extract-dokploy-strings";

function main(args: string[]): void {
  let limit = 100;
  let showReviewed = false;
  let reverse = true;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      console.log("Usage: pnpm check:translation-coverage [--limit N | --all] [--show-reviewed] [--no-reverse]");
      console.log("Checks existing JSON candidates without extracting or changing dictionaries.");
      console.log("--no-reverse skips the independent source scan that detects extractor blind spots.");
      return;
    }
    if (arg === "--show-reviewed") showReviewed = true;
    else if (arg === "--no-reverse") reverse = false;
    else if (arg === "--all") limit = Infinity;
    else if (arg === "--limit" && /^\d+$/.test(args[index + 1] ?? "")) {
      limit = Number(args[++index]);
      if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("--limit must be a positive integer.");
    } else throw new Error(`Unknown or invalid argument: ${arg}. Use --help for usage.`);
  }

  const generated: unknown = JSON.parse(readFileSync(new URL("../src/translation/dictionary.generated.json", import.meta.url), "utf8"));
  if (!generated || typeof generated !== "object" || !("candidates" in generated) || !Array.isArray(generated.candidates)) {
    throw new Error("Candidate JSON must contain a candidates array.");
  }
  const candidates: CoverageCandidate[] = generated.candidates.map((value: unknown, index) => {
    if (!value || typeof value !== "object" || !("source" in value) || typeof value.source !== "string"
      || !("file" in value) || typeof value.file !== "string" || !("risk" in value) || typeof value.risk !== "string") {
      throw new Error(`Invalid candidate at index ${index}: expected source, file and risk strings.`);
    }
    const validOccurrence = (part: unknown, template = false): boolean => Boolean(part && typeof part === "object"
      && "file" in part && typeof part.file === "string"
      && "line" in part && typeof part.line === "number" && Number.isSafeInteger(part.line) && part.line > 0
      && "kind" in part && typeof part.kind === "string"
      && (!template || ("source" in part && typeof part.source === "string")));
    if (("line" in value && (typeof value.line !== "number" || !Number.isSafeInteger(value.line) || value.line < 1))
      || ("occurrences" in value && (!Array.isArray(value.occurrences) || !value.occurrences.every((part: unknown) => validOccurrence(part))))
      || ("templateOccurrences" in value && (!Array.isArray(value.templateOccurrences) || !value.templateOccurrences.every((part: unknown) => validOccurrence(part, true))))
      || ("kind" in value && typeof value.kind !== "string")
      || ("placeholders" in value && (!Array.isArray(value.placeholders) || !value.placeholders.every((part: unknown) => typeof part === "string")))
      || ("template" in value && typeof value.template !== "string")
      || ("templates" in value && (!Array.isArray(value.templates) || !value.templates.every((part: unknown) => typeof part === "string")))) {
      throw new Error(`Invalid candidate metadata at index ${index}.`);
    }
    return value as CoverageCandidate;
  });
  const audit = auditCoverage(candidates);
  console.log(`All candidates: ${audit.total}`);
  console.log(`All UI candidates (static/literal-segment layer): ${audit.ui.length}`);
  for (const [label, dynamic] of [["Fixed UI candidates", false], ["Dynamic literal segments (not full shells)", true]] as const) {
    const items = audit.ui.filter((item) => item.dynamic === dynamic);
    console.log(`${label}: ${items.length} (translated ${items.filter((item) => item.status === "translated").length}, reviewed ${items.filter((item) => item.status === "reviewed").length}, missing ${items.filter((item) => item.status === "missing").length})`);
  }
  console.log(`Translated (exact/validated pattern/context): ${audit.translated.length}`);
  console.log(`Reviewed English/technical values: ${audit.reviewed.length}`);
  console.log(`Untranslated UI: ${audit.missing.length}`);
  console.log(`Static candidate coverage (translated + reviewed): ${audit.coverage === null ? "N/A (no UI candidates)" : `${(audit.coverage * 100).toFixed(1)}%`}`);
  console.log(`Unique complete UI templates: ${audit.templates.length}`);
  console.log(`Sample-validated complete template translations: ${audit.translatedTemplates.length}`);
  console.log("Template validation checks curated examples and each rule's witness under global first-match order, not exhaustive regex-language coverage.");
  console.log(`Missing complete template translations: ${audit.missingTemplates.length}`);
  console.log(`Sample-validated complete template coverage (independent of fragments): ${audit.templateCoverage === null ? "N/A (no complete template metadata)" : `${(audit.templateCoverage * 100).toFixed(1)}%`}`);
  const risks = new Map<string, number>();
  for (const candidate of audit.nonUI) risks.set(candidate.risk, (risks.get(candidate.risk) ?? 0) + 1);
  console.log(`Non-UI risks (not counted as translated or reviewed): ${audit.nonUI.length}${risks.size ? ` (${[...risks].map(([risk, count]) => `${risk}: ${count}`).join(", ")})` : ""}`);
  if (showReviewed) {
    console.log("Reviewed exemptions and reasons:");
    for (const { candidate, reason } of audit.reviewed.slice(0, limit)) {
      console.log(`${JSON.stringify(candidate.source)}\t${candidate.file}:${candidate.line ?? "?"}\t${reason}`);
    }
    if (audit.reviewed.length > limit) console.log(`Showing ${limit}/${audit.reviewed.length}; use --all to list every review.`);
  }
  if (audit.ui.length === 0) throw new Error("No UI candidates found; coverage cannot pass on an empty UI dataset. Check the existing candidate JSON.");
  if (audit.missing.length) {
    for (const { candidate, reason, translation } of audit.missing.slice(0, limit)) {
      console.error(`${JSON.stringify(candidate.source)}\t${candidate.file}:${candidate.line ?? "?"}\t${reason}${translation ? ` Output: ${JSON.stringify(translation)}` : ""}`);
    }
    if (audit.missing.length > limit) console.error(`Showing ${limit}/${audit.missing.length}; use --all to list every missing candidate.`);
  }
  if (audit.missingTemplates.length) {
    console.error("Missing complete UI templates (literal translations do not cover these):");
    for (const { source, candidates: locations, reason } of audit.missingTemplates.slice(0, limit)) {
      console.error(`${JSON.stringify(source)}\t${locations.map((candidate) => `${candidate.file}:${candidate.line ?? "?"}`).filter((location, index, all) => all.indexOf(location) === index).join(", ")}\t${reason}`);
    }
    if (audit.missingTemplates.length > limit) console.error(`Showing ${limit}/${audit.missingTemplates.length}; use --all to list every missing template.`);
  }
  if (!audit.passed) {
    throw new Error(`${audit.missing.length} UI candidates and ${audit.missingTemplates.length} complete UI templates are missing translation/review.`);
  }

  // The ratio above is only as trustworthy as the candidate list it divides by.
  // Re-scan the sources so a classifier that drops real UI copy is reported
  // instead of silently shrinking the denominator to a passing 100%.
  if (reverse) {
    const root = join(process.cwd(), "dokploy", "apps", "dokploy");
    if (!existsSync(root)) {
      console.log("Reverse audit: skipped (Dokploy sources not found; run git submodule update --init).");
      return;
    }
    const reverseAudit = reverseAuditCoverage(candidates, scanUiShapedDirectory(root));
    console.log(`Reverse audit scanned UI-shaped literals: ${reverseAudit.scanned}`);
    console.log(`Reverse audit unaccounted UI text: ${reverseAudit.findings.length}`);
    if (reverseAudit.findings.length) {
      console.error("UI-shaped source text missing from the candidate list (possible extractor blind spot):");
      for (const finding of reverseAudit.findings.slice(0, limit)) {
        console.error(`${JSON.stringify(finding.source)}\t${finding.file}:${finding.line}\t${finding.reason}`);
      }
      if (reverseAudit.findings.length > limit) {
        console.error(`Showing ${limit}/${reverseAudit.findings.length}; use --all to list every finding.`);
      }
      throw new Error(`${reverseAudit.findings.length} UI-shaped strings were not emitted as candidates; coverage may be overstated.`);
    }
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
