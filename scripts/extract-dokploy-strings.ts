import ts from "typescript";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

type CandidateKind = "jsx-text" | "attribute" | "toast" | "string-literal";
type CandidateRisk = "ui" | "dynamic" | "code" | "secret" | "url";
type Candidate = {
  source: string;
  file: string;
  line: number;
  kind: CandidateKind;
  risk: CandidateRisk;
  reviewed: false;
};

const root = process.argv[2] ?? join(process.cwd(), "dokploy", "apps", "dokploy");
const translationDir = join(process.cwd(), "src", "translation");
const generatedPath = join(translationDir, "dictionary.generated.json");
const reportPath = join(translationDir, "dictionary.report.json");
const sensitivePath = join(translationDir, "dictionary.sensitive.json");
const attributes = new Set(["placeholder", "title", "aria-label", "aria-description", "alt"]);
const candidates = new Map<string, Candidate>();

function files(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [path] : [];
  });
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").replace(/&apos;|&#39;/g, "'").replace(/&quot;|&#34;/g, '"').replace(/&mdash;/g, "—").replace(/&nbsp;/g, " ").trim();
}

function riskOf(value: string): CandidateRisk {
  if (/https?:\/\/|^\/?(?:etc|var|usr|home)\//i.test(value)) return "url";
  if (/BEGIN [A-Z ]+(?:KEY|CERTIFICATE)|(?:api[_ -]?key|access[_ -]?token|bearer)\b|\b[A-Z_]+=[^ ]+/i.test(value)) return "secret";
  if (/[{}<>`=]|\b(?:curl|docker|npm|ssh|kubectl|DATABASE_URL|API_URL)\b/i.test(value)) return "code";
  if (/\$\{|\b(?:name|id|url|path|domain|token|secret)\b/i.test(value) || /\d{5,}/.test(value)) return "dynamic";
  return "ui";
}

function add(value: string, sourceFile: string, node: ts.Node, kind: CandidateKind): void {
  const source = normalize(value);
  if (source.length < 2 || !/[A-Za-z]{2}/.test(source) || source.length > 500) return;
  const line = sourceFileNode.getLineAndCharacterOfPosition(node.getStart(sourceFileNode)).line + 1;
  const key = source;
  const risk = riskOf(source);
  if (!candidates.has(key)) {
    candidates.set(key, { source: risk === "ui" ? source : `[REDACTED ${risk.toUpperCase()}]`, file: relative(root, sourceFile), line, kind, risk, reviewed: false });
  }
}

let sourceFileNode: ts.SourceFile;
mkdirSync(translationDir, { recursive: true });
for (const file of files(root)) {
  sourceFileNode = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) add(node.getText(sourceFileNode), file, node, "jsx-text");
    if (ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent) && ts.isIdentifier(node.parent.name) && attributes.has(node.parent.name.text)) add(node.text, file, node, "attribute");
    if (ts.isStringLiteral(node) && ts.isCallExpression(node.parent) && ts.isIdentifier(node.parent.expression) && /toast|notify/i.test(node.parent.expression.text)) add(node.text, file, node, "toast");
    if (ts.isStringLiteral(node) && ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name) && /title|description|label|placeholder|message/i.test(node.parent.name.text)) add(node.text, file, node, "string-literal");
    ts.forEachChild(node, visit);
  };
  visit(sourceFileNode);
}

const all = [...candidates.values()].sort((a, b) => a.source.localeCompare(b.source));
const counts = all.reduce<Record<string, number>>((result, item) => { result[item.risk] = (result[item.risk] ?? 0) + 1; return result; }, {});
writeFileSync(generatedPath, `${JSON.stringify({ schemaVersion: 2, source: relative(process.cwd(), root), generatedAt: new Date().toISOString(), candidates: all }, null, 2)}\n`);
writeFileSync(reportPath, `${JSON.stringify({ schemaVersion: 1, source: relative(process.cwd(), root), generatedAt: new Date().toISOString(), total: all.length, counts }, null, 2)}\n`);
writeFileSync(sensitivePath, `${JSON.stringify(all.filter((item) => item.risk !== "ui"), null, 2)}\n`);
console.log(`Extracted ${all.length} candidates: ${JSON.stringify(counts)}`);
