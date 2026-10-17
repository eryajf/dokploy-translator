import { dictionary, exactDictionary } from "./dictionary";
import type { TranslationRule } from "./dictionary";
import { templateTranslations } from "./template-dictionary";
import { reviewedTechnicalValues } from "./reviewed-technical-values";
import { normalizeExactKey } from "./normalize";
import { runtimeCases } from "./template-runtime-cases";
import type { TemplateRuntimeCase } from "./template-runtime-cases";
import { contextualTranslations, translateContextualParts } from "./contextual-translations";
import type { ContextualTranslation } from "./contextual-translations";

export type CoverageOccurrence = { file: string; line: number; kind: string };
export type TemplateOccurrence = CoverageOccurrence & { source: string };

export type CoverageCandidate = {
  source: string;
  file: string;
  line?: number;
  risk: string;
  kind?: string;
  placeholders?: readonly string[];
  template?: string;
  templates?: readonly string[];
  occurrences?: readonly CoverageOccurrence[];
  templateOccurrences?: readonly TemplateOccurrence[];
};

export type EnglishReview = { source: string; reason: string; file?: string };

// Whole values only: mentioning a brand in a sentence is not an exemption.
export const reviewedEnglish: readonly EnglishReview[] = [
  ...reviewedTechnicalValues,
  ...["Dokploy", "Docker", "Docker Compose", "Compose", "Docker Swarm", "Swarm", "Traefik",
    "PostgreSQL", "MariaDB", "MongoDB", "Redis", ".NET"].map((source) => ({
    source, reason: "Product/technology name retained in its official spelling.",
  })),
  ...["CPU", "RAM", "MB", "GB", "USD", "SAML", "OIDC", "SCIM", "ED25519"].map((source) => ({
    source, reason: "Standard technical abbreviation or unit, not a UI sentence.",
  })),
  ...["Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml",
    "package.json"].map((source) => ({
    source, reason: "Literal conventional filename; translating it would change the value.",
  })),
];

function normalizedFile(file: string): string {
  return file.replace(/\\/g, "/");
}

function valueReview(source: string): string | undefined {
  // Validate the entire URL, never prose containing a URL or a domain name.
  if (/^https?:\/\/\S+$/u.test(source)) {
    try {
      const url = new URL(source);
      if (url.hostname) return "Complete HTTP(S) URL.";
    } catch { /* Invalid URL remains missing. */ }
  }
  // Explicit filesystem roots or relative-path markers, not arbitrary slash-prefixed UI.
  if (/^(?:\/(?:etc|var|usr|bin|home|root|opt|tmp|run|srv|app|data)\/|\.\.?\/|~\/)[A-Za-z0-9_@.+/-]+$/u.test(source)
    && !source.replace(/^(?:\.\.\/)+/u, "").split("/").includes("..") && !source.includes("//")) {
    return "Filesystem path with an explicit root or relative-path marker.";
  }
  if (/^\d+(?:\.\d+)?%?$/u.test(source)) return "Standalone numeric value.";
  const octets = source.split(".");
  if (octets.length === 4 && octets.every((part) => /^(?:0|[1-9]\d{0,2})$/u.test(part) && Number(part) <= 255)) {
    return "Validated IPv4 address.";
  }
  return undefined;
}

function reviewEnglishAtLocation(
  candidate: CoverageCandidate,
  reviews: readonly EnglishReview[],
): string | undefined {
  const source = normalizeExactKey(candidate.source);
  const file = normalizedFile(candidate.file);
  const review = reviews.find((entry) => (entry.file === undefined
    ? entry.source === source
    : entry.source === candidate.source && entry.file === candidate.file) && entry.reason.trim());
  if (review) return review.reason;

  // These are source locations, not patterns to run against candidate.source.
  if (/(?:^|\/)(?:__test__|__tests__)(?:\/)/u.test(file)) {
    return "Test fixture source, not shipped UI.";
  }
  if (file === "lib/bundled-icons.ts") return "Bundled icon catalog: official product names.";
  if (file === "components/dashboard/application/schedules/timezones.ts") {
    return "Timezone catalog: geographic labels retained as supplied by the catalog.";
  }
  return valueReview(source);
}

export function reviewEnglish(
  candidate: CoverageCandidate,
  reviews: readonly EnglishReview[] = reviewedEnglish,
): string | undefined {
  // Legacy candidates expose only the representative file. New deduplicated
  // candidates must be exempt at every real occurrence, not only the first one.
  const locations = candidate.occurrences?.length ? candidate.occurrences : [candidate];
  const reasons = locations.map((location) => reviewEnglishAtLocation({ ...candidate, ...location }, reviews));
  return reasons.every((reason) => Boolean(reason)) ? [...new Set(reasons)].join("; ") : undefined;
}

export type TemplateTranslation = { source: string; pattern: RegExp; target: string };

export type CoverageOptions = {
  exact?: ReadonlyMap<string, string>;
  patterns?: readonly TranslationRule[];
  reviews?: readonly EnglishReview[];
  templateRules?: readonly TemplateTranslation[];
  runtimeCases?: readonly TemplateRuntimeCase[];
  contextRules?: readonly ContextualTranslation[];
};

export type TemplateReview = {
  source: string;
  candidates: CoverageCandidate[];
  status: "translated" | "missing";
  matchingRuleCount: number;
  reason: string;
};

type UIResult = {
  candidate: CoverageCandidate;
  dynamic: boolean;
  status: "translated" | "reviewed" | "missing";
  reason: string;
  translation?: string;
  method?: "exact" | "pattern" | "context";
};

function completePatternTarget(
  target: string, candidate: CoverageCandidate, reviews: readonly EnglishReview[],
): boolean {
  if (!/\p{Script=Han}/u.test(target)) return false;
  // Extraction keeps literal segments separately from expressions. Only declared
  // placeholders may remain untranslated; UI nouns such as "deployments" may not.
  for (const placeholder of candidate.placeholders ?? []) target = target.split(placeholder).join("");
  return target.split(/\p{Script=Han}+/u).every((part) => {
    const value = part.trim().replace(/^[：，。！？、]+|[：，。！？、]+$/gu, "").trim();
    return !value || /^[\d\s\p{P}\p{S}]+$/u.test(value)
      || Boolean(reviewEnglish({ source: value, file: "", risk: "ui" }, reviews));
  });
}

function contextualWitness(candidate: CoverageCandidate, rules: readonly ContextualTranslation[]): string | undefined {
  for (const rule of rules) {
    if (!rule.selector.trim() || !rule.occurrences.some((location) => location.source === candidate.source
      && location.file === candidate.file && location.line === candidate.line && location.kind === candidate.kind)) continue;
    if (!rule.witnesses.length || !rule.witnesses.every((witness) => {
      const output = translateContextualParts(rule, witness.parts);
      return output?.join("") === witness.output && /\p{Script=Han}/u.test(witness.output)
        && witness.parts.every((part, index) => !/^\d+$/u.test(part) || output[index] === part);
    })) continue;
    // The claimed literal must actually occur in a successfully executed witness.
    if (rule.witnesses.some((witness) => witness.parts.join("").includes(candidate.source))) return rule.id;
  }
  return undefined;
}

export function assessCandidate(candidate: CoverageCandidate, options: CoverageOptions = {}): UIResult {
  const locations = candidate.occurrences?.length ? candidate.occurrences : [candidate];
  const results = locations.map((location) => assessCandidateAtLocation({ ...candidate, ...location, occurrences: undefined }, options));
  const missing = results.find((result) => result.status === "missing");
  if (missing) return { ...missing, candidate };
  const translated = results.filter((result) => result.status === "translated");
  if (!translated.length) return { ...results[0], candidate, reason: [...new Set(results.map((result) => result.reason))].join("; ") };
  const context = translated.find((result) => result.method === "context");
  return { ...(context ?? translated[0]), candidate, reason: [...new Set(results.map((result) => result.reason))].join("; ") };
}

function assessCandidateAtLocation(candidate: CoverageCandidate, options: CoverageOptions): UIResult {
  const key = normalizeExactKey(candidate.source);
  const dynamic = candidate.kind === "template" && Boolean(candidate.placeholders?.length);
  const base = { candidate, dynamic };
  const reviews = options.reviews ?? reviewedEnglish;
  const reason = reviewEnglish(candidate, reviews);
  if (reason) return { ...base, status: "reviewed", reason };
  const context = contextualWitness(candidate, options.contextRules ?? contextualTranslations);
  if (context) return { ...base, status: "translated", method: "context", reason: `Complete contextual grammar ${context}, validated by executable runtime witnesses at this occurrence.` };
  const exact = (options.exact ?? exactDictionary).get(key);
  if (exact?.trim() && normalizeExactKey(exact) !== key) {
    return { ...base, status: "translated", reason: "Exact dictionary entry.", translation: exact, method: "exact" };
  }
  // Fixed copy needs an exact entry: "View deployments" -> "查看 deployments"
  // is not a completed translation. Never call translateText's word fallback.
  if (!dynamic) return { ...base, status: "missing", reason: "Fixed UI copy requires an exact dictionary entry or explicit English review." };
  for (const rule of options.patterns ?? dictionary) {
    if (rule.kind !== "pattern" || (rule.areas && !rule.areas.includes("text"))) continue;
    const match = candidate.source.trim().match(new RegExp(rule.pattern));
    if (!match) continue;
    const target = rule.target.replace(/\$(\d+)/g, (_, index) => match[Number(index)] ?? "");
    if (completePatternTarget(target, candidate, reviews)) {
      return { ...base, status: "translated", reason: "Dynamic pattern with no unreviewed English remainder.", translation: target, method: "pattern" };
    }
    return { ...base, status: "missing", reason: "Pattern output still contains unreviewed English or has no Chinese translation.", translation: target };
  }
  return { ...base, status: "missing", reason: "Dynamic UI template has no complete exact/pattern translation." };
}

// The extractor may attach several complete shells to one deduplicated literal
// segment. Merge both metadata forms, then deduplicate globally by the *original*
// shell: whitespace, expression names and action branches must not be normalized.
export function aggregateTemplates(candidates: readonly CoverageCandidate[]): Map<string, CoverageCandidate[]> {
  const templates = new Map<string, CoverageCandidate[]>();
  for (const candidate of candidates) {
    if (candidate.risk !== "ui") continue;
    const sources = new Set([
      ...(candidate.templates ?? []), ...(candidate.template === undefined ? [] : [candidate.template]),
      ...(candidate.templateOccurrences ?? []).map((location) => location.source),
    ]);
    for (const source of sources) {
      const locations = templates.get(source) ?? [];
      // New metadata carries the shell's own expression location, not every
      // location of a shared literal segment. Retain old behavior without it.
      const occurrences = candidate.templateOccurrences?.filter((location) => location.source === source);
      if (occurrences === undefined) locations.push(candidate);
      else for (const { source: _, ...location } of occurrences) {
        if (!locations.some((entry) => entry.file === location.file && entry.line === location.line && entry.kind === location.kind)) {
          locations.push({ ...candidate, ...location, occurrences: [location], template: source, templates: [source],
            templateOccurrences: [{ source, ...location }] });
        }
      }
      templates.set(source, locations);
    }
  }
  return templates;
}

export function assessTemplate(
  source: string,
  candidates: CoverageCandidate[],
  rules: readonly TemplateTranslation[] = templateTranslations,
  samples: readonly TemplateRuntimeCase[] = runtimeCases,
): TemplateReview {
  // A pattern that happens to match some text is not evidence of review for an
  // unknown shell. Only the dictionary's explicit original source is authority.
  const matching = rules.filter((rule) => rule.source === source);
  const base = { source, candidates, matchingRuleCount: matching.length };
  if (!source.trim() || !matching.length) {
    return { ...base, status: "missing", reason: "Complete template shell has no explicitly reviewed template rule." };
  }
  // Structural safety plus concrete runtime assertions, not a proof of regex
  // language or exhaustive branch coverage. Do not synthesize values from shells.
  if (matching.some((rule) => !(rule.pattern instanceof RegExp)
    || rule.pattern.global || rule.pattern.sticky
    || !rule.pattern.source.startsWith("^") || !rule.pattern.source.endsWith("$")
    || !rule.target.trim() || !/\p{Script=Han}/u.test(rule.target))) {
    return { ...base, status: "missing", reason: "At least one registered template branch lacks an anchored non-stateful pattern or nonempty Chinese target." };
  }
  const examples = samples.filter((sample) => sample.source === source);
  for (const rule of matching) {
    const own = examples.filter((sample) => rule.pattern.test(sample.input.trim()));
    if (!own.some((sample) => sample.input.trim().replace(rule.pattern, rule.target) === sample.output)) {
      return { ...base, status: "missing", reason: "At least one registered template rule has no source-associated successful runtime witness." };
    }
  }
  for (const sample of examples) {
    const input = sample.input.trim();
    // Match against the entire ordered table, not only rules for this shell.
    // Invalid/stateful rules cannot be silently skipped if they shadow a sample.
    const first = rules.find((rule) => {
      if (!(rule.pattern instanceof RegExp)) return false;
      const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
      return pattern.test(input);
    });
    if (!first || first.pattern.global || first.pattern.sticky || input.replace(first.pattern, first.target) !== sample.output) {
      return { ...base, status: "missing", reason: "A source-associated runtime sample fails the expected global first-match translation." };
    }
  }
  return { ...base, status: "translated", reason: "Sample-validated complete template: each registered rule has a successful source-associated witness and all curated examples pass global first-match translation; not an exhaustive regex-language proof." };
}

export function auditCoverage(candidates: readonly CoverageCandidate[], options: CoverageOptions = {}) {
  const ui = candidates.filter((candidate) => candidate.risk === "ui").map((candidate) => assessCandidate(candidate, options));
  const nonUI = candidates.filter((candidate) => candidate.risk !== "ui");
  const translated = ui.filter((item) => item.status === "translated");
  const reviewed = ui.filter((item) => item.status === "reviewed");
  const missing = ui.filter((item) => item.status === "missing");
  const templates = [...aggregateTemplates(candidates)].map(([source, locations]) =>
    assessTemplate(source, locations, options.templateRules ?? templateTranslations, options.runtimeCases ?? runtimeCases));
  const translatedTemplates = templates.filter((item) => item.status === "translated");
  const missingTemplates = templates.filter((item) => item.status === "missing");
  return {
    total: candidates.length, ui, nonUI, translated, reviewed, missing,
    coverage: ui.length ? (translated.length + reviewed.length) / ui.length : null,
    templates, translatedTemplates, missingTemplates,
    templateCoverage: templates.length ? translatedTemplates.length / templates.length : null,
    passed: ui.length > 0 && missing.length === 0 && missingTemplates.length === 0,
  };
}

// Coverage is measured against the extractor's own candidate list, so a string
// the classifier silently drops never enters the denominator and the ratio can
// read 100% while real UI copy is untranslated. This reverse audit re-scans the
// upstream sources for UI-shaped literals the extractor did not emit and reports
// them separately, so a shrinking denominator is visible instead of invisible.
export type ReverseAuditFinding = {
  source: string;
  file: string;
  line: number;
  kind: string;
  reason: string;
};

export type ReverseAuditInput = {
  file: string;
  line: number;
  kind: string;
  text: string;
  explicitUi: boolean;
};

const UI_ATTRIBUTES = new Set(["placeholder", "title", "description", "label", "message", "aria-label", "aria-description", "alt", "docDescription", "dropMessage", "heading"]);
const UI_PROPERTIES = new Set(["title", "description", "label", "message", "placeholder", "heading", "docDescription", "dropMessage"]);
const NON_UI_FILE = /^(?:pages\/api\/|server\/|scripts\/|drizzle\/)|(?:^|\/)(?:__tests?__|server|scripts|drizzle)(?:\/|$)|\.(?:test|spec)\.[jt]sx?$|timezones\.ts$|bundled-icons|wait-for/i;

function isValueLike(text: string): boolean {
  if (/^(?:[a-z][a-z\d+.-]*:\/\/|www\.)/i.test(text)) return true;
  if (/^(?:\/|~\/|\.\.?\/)/.test(text)) return true;
  if (/^[\w.+-]+@[\w.-]+$/.test(text)) return true;
  if (/^(?:[a-z\d-]+\.)+(?:com|org|net|io|dev|app|sh|cn|me)(?:\/.*)?$/i.test(text)) return true;
  if (!/\s/.test(text.trim())) return true;
  if (/^[A-Z_][A-Z\d_]*=/.test(text)) return true;
  if (/BEGIN [A-Z ]*PRIVATE KEY|^ssh-rsa|^#[\da-f]{6}$|^\d{8,}:AA/.test(text)) return true;
  if (/^(?:curl|docker|npm|pnpm|git|sh|bash)\s/.test(text)) return true;
  if (/^v=spf1/.test(text)) return true;
  return false;
}

/**
 * Report UI-shaped strings present in the sources but absent from the candidate
 * list. Findings are advisory: they explain a denominator that shrank, and the
 * caller decides whether each is genuine UI copy or a reviewed technical value.
 */
export function auditExtractorCoverage(
  candidates: readonly CoverageCandidate[],
  scanned: readonly ReverseAuditInput[],
): ReverseAuditFinding[] {
  const known = new Set<string>();
  for (const candidate of candidates) {
    known.add(normalizeExactKey(candidate.source));
    for (const shell of [...(candidate.templates ?? []), ...(candidate.template === undefined ? [] : [candidate.template])]) {
      known.add(normalizeExactKey(shell));
    }
  }
  const findings = new Map<string, ReverseAuditFinding>();
  for (const item of scanned) {
    if (!item.explicitUi) continue;
    if (NON_UI_FILE.test(item.file)) continue;
    const text = normalizeExactKey(item.text);
    if (!text || known.has(text) || isValueLike(text)) continue;
    if ((text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length < 2) continue;
    const key = `${text}\u0000${item.file}`;
    if (findings.has(key)) continue;
    findings.set(key, {
      source: text, file: item.file, line: item.line, kind: item.kind,
      reason: "UI-shaped source text is absent from the candidate list; verify the extractor classification.",
    });
  }
  return [...findings.values()];
}

export function reverseAuditCoverage(
  candidates: readonly CoverageCandidate[],
  scanned: readonly ReverseAuditInput[],
) {
  const findings = auditExtractorCoverage(candidates, scanned);
  return {
    scanned: scanned.length,
    findings,
    passed: findings.length === 0,
  };
}
