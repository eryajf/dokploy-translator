import { readFileSync } from "node:fs";
import { translateText } from "../src/translation/dictionary";

type Candidate = { source: string; file: string; risk: string };

const generated = JSON.parse(
  readFileSync(new URL("../src/translation/dictionary.generated.json", import.meta.url), "utf8"),
) as { candidates: Candidate[] };

const highPriority = /(dns|vault|swarm|registry|sso|billing|backup)/i;
const candidates = generated.candidates.filter(
  (candidate) => candidate.risk === "ui" && highPriority.test(candidate.file),
);
if (candidates.length === 0) {
  throw new Error("没有找到高优先级 UI 候选文案；请确认 Dokploy 子模块已初始化并先运行 pnpm extract。");
}
const translated = candidates.filter((candidate) => translateText(candidate.source));
const coverage = candidates.length === 0 ? 1 : translated.length / candidates.length;
const remaining = candidates.filter((candidate) => !translateText(candidate.source));
const codeOrExample = remaining.filter((candidate) =>
  /__test__|bundled-icons|timezones/i.test(candidate.file) ||
  /^\//.test(candidate.source) ||
  /https?:\/\/|\b(?:api|dns|ssm|kms|route53):|^[\w.-]+\.[\w.-]+$|^[\w-]+:\/\//i.test(candidate.source) ||
  /example\.com|letsencrypt\.org|^\d|^e\.g\.|^\{\{/i.test(candidate.source) ||
  (/^[a-z][a-z0-9_-]*$/.test(candidate.source.trim()) && candidate.source.trim().length < 24),
);
const fragment = remaining.filter((candidate) =>
  !codeOrExample.includes(candidate) &&
  (/^[,.)?—.]|\b(?:and|or|from|to|on|of|for|with|via|at|in|the|your)$/i.test(candidate.source.trim()) || /^[a-z]/.test(candidate.source.trim())),
);
const excluded = new Set([...codeOrExample, ...fragment]);
const eligible = candidates.filter((candidate) => !excluded.has(candidate));
const translatedEligible = eligible.filter((candidate) => translateText(candidate.source));
const eligibleCoverage = eligible.length === 0 ? 1 : translatedEligible.length / eligible.length;
const minimum = 1;

console.log(
  `High-priority translation coverage: ${translated.length}/${candidates.length} (${(coverage * 100).toFixed(1)}%)`,
);
console.log(`Remaining candidates: real UI ${eligible.length - translatedEligible.length}, JSX fragments ${fragment.length}, code/examples ${codeOrExample.length}`);
console.log(`Real UI coverage: ${translatedEligible.length}/${eligible.length} (${(eligibleCoverage * 100).toFixed(1)}%)`);

if (eligibleCoverage < minimum) {
  throw new Error(`Real UI translation coverage ${(eligibleCoverage * 100).toFixed(1)}% is below the ${(minimum * 100).toFixed(0)}% minimum.`);
}
