import ts from "typescript";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { normalizeExactKey } from "../src/translation/normalize";

type CandidateKind = "jsx-text" | "attribute" | "toast" | "string-literal" | "template";
type CandidateRisk = "ui" | "dynamic" | "code" | "secret" | "url";
type Occurrence = { file: string; line: number; kind: CandidateKind };
type Candidate = {
  source: string;
  file: string;
  line: number;
  kind: CandidateKind;
  risk: CandidateRisk;
  reviewed: false;
  placeholders?: string[];
  template?: string;
  templates?: string[];
  occurrences?: Occurrence[];
  templateOccurrences?: (Occurrence & { source: string })[];
  exemption?: string;
};

const attributes = new Set(["placeholder", "title", "description", "label", "message", "aria-label", "aria-description", "alt", "docDescription", "dropMessage", "heading"]);
const uiProperties = new Set(["title", "description", "label", "placeholder", "message", "docDescription", "dropMessage", "heading"]);
const toastMethods = new Set(["success", "error", "info", "warning"]);

function files(directory: string): string[] {
  if (!existsSync(directory) || isNonUiFile(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [path] : [];
  });
}

function isNonUiFile(file: string): boolean {
  const normalized = file.replaceAll("\\", "/");
  return /(?:^|\/)(?:__tests?__|server|scripts|drizzle)(?:\/|$)|\.(?:test|spec)\.[jt]sx?$/i.test(normalized) ||
    /(?:^|\/)pages\/api(?:\/|$)|(?:^|\/)lib\/bundled-icons(?:\/|\.[jt]sx?$|$)|(?:^|\/)timezones(?:\/|\.[jt]sx?$|$)|(?:^|\/)wait-for(?:[-.]|$)/i.test(normalized);
}

function normalizeTemplate(value: string): string {
  // Shell identity is whitespace-only; never entity-decode expression captures.
  return value.replace(/\s+/g, " ").trim();
}

function isMultilineConfig(value: string): boolean {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line !== "---" && line !== "...");
  if (lines.length < 2) return false;
  const mapping = /^[a-z_][\w.-]*:(?:\s|$)/;
  // Require several machine-shaped mapping lines plus a structural/scalar
  // value. Headings, bullet lists, and explanatory paragraphs are not YAML.
  return lines.filter((line) => mapping.test(line)).length >= 2 &&
    lines.every((line) => mapping.test(line) || /^-\s+\S/.test(line)) &&
    lines.some((line) => mapping.test(line) && /:(?:\s*$|\s*(?:true|false|null|~|\d+(?:\.\d+)?|\[.*\]|\{.*\}|["'].*["'])\s*$)/.test(line));
}

function riskOf(value: string, explicitUi: boolean, rawValue = value): CandidateRisk {
  // Protect standalone operational values, not prose containing an example URL,
  // path or numeric limit (e.g. "Enter full path ... /app/config.json").
  if (/^(?:[a-z][a-z\d+.-]*:\/\/|www\.|~?\/|\.\.?\/|[A-Z]:\\)\S*$/i.test(value) ||
    /^(?:[a-z\d-]+\.)+(?:com|org|net|io|dev|app)(?:[/:?#]\S*)?$/i.test(value)) return "url";
  if (/BEGIN [A-Z ]*(?:KEY|CERTIFICATE)|\bbearer\s+[\w.+/=-]+|\b(?:api[_ -]?key|access[_ -]?token|password|p[a]ssword|secret)\s*[:=]\s*\S+|\b(?:gh[pousr]_|github_pat_|sk[-_])[\w-]+|\bAKIA[A-Z\d]{16}\b|\beyJ[\w-]+\.[\w-]+\.[\w-]+|\bssh-(?:rsa|ed25519)\s+\S+|\b(?=[A-Za-z\d+/]{32,}\b)(?=[A-Za-z\d+/]*\d)[A-Za-z\d+/]+={0,2}/i.test(value)) return "secret";
  // Environment assignments are case-sensitive. A case-insensitive match here
  // incorrectly treats node.id==xyz and com.example.foo=bar as credentials.
  if (/\b[A-Z_][A-Z\d_]*=(?!=)[^ ]+/.test(value)) return "secret";
  // Only tiny, parenthetical non-secret examples inside explanatory sentences
  // may contain '='. Keep classifying the original text for credentials above,
  // and never relax standalone expressions, config blocks or command examples.
  const syntaxValue = explicitUi && /(?:\b[A-Za-z]+\b[\s,.]+){4}/.test(value)
    ? value.replace(/\((?:e\.g\.,\s*)?(?:[a-z][\w-]*(?:\.[a-z][\w-]*)+\s*={1,2}\s*[a-z][a-z\d-]{0,23}|\d+\s*=\s*\d+(?:\.\d+)?\s+(?:nanoseconds|microseconds|milliseconds|seconds|minutes|hours))\)/g,
      (example) => /(?:token|key|secret|credential|p[a]ssword)/i.test(example) ? example : "(example)")
    : value;
  if (isMultilineConfig(rawValue) ||
    // Script comments must not conceal a subsequent executable line.
    /^\s*#.*\n/m.test(rawValue) && /^\s*(?:echo|printf|export|set|exec|sudo|docker|git|npm|pnpm|curl|wget|bash|sh)\s+\S/m.test(rawValue)) return "code";
  if (/\$\{|\{[A-Za-z_$][\w.$]*\}|%[A-Za-z]|(?:^|\s):[A-Za-z][\w-]*|^\d{5,}$/.test(value)) return "dynamic";
  if (/[{}<>`=]|\b[A-Z][A-Z_]+_[A-Z_]+\b/.test(syntaxValue) ||
    // Executable values start with the command (or a shell prompt). Mentions
    // such as "requires sudo access" and quoted "docker build" are UI prose.
    /^(?:[$#]\s*)?(?:git|npm|pnpm|yarn|bun|npx|curl|wget|ssh|kubectl|sudo|bash|sh)\s+(?:[a-z][\w-]*|--?[\w-]+)/.test(value) ||
    /^(?:[$#]\s*)?docker\s+(?:build|run|compose|config|exec|pull|push|login|swarm|service|network|volume|ps|info|stats|events|--?[\w-]+)\b/.test(value) ||
    /[;|&]\s*(?:sudo|docker|git|npm|pnpm|curl|wget|bash|sh)\s+/.test(value) ||
    /:\s*(?:sudo|docker|git|npm|pnpm|curl|wget|bash|sh)\s+\S/.test(value)) return "code";
  if (/^[a-z][a-z\d]*[A-Z][\w]*$|^[a-z][\w]*[-_.][\w.-]+$/.test(value)) return "dynamic";
  // Labels such as Docker File, Generate API Key and Host Path are UI copy,
  // not evidence of an executable command, credential or user-supplied path.
  if (!explicitUi) {
    if (/(?:api[_ -]?key|access[_ -]?token|bearer)\b/i.test(value)) return "secret";
    if (/\b(?:docker|npm|ssh|kubectl|DATABASE_URL|API_URL)\b/i.test(value)) return "code";
    if (/\b(?:name|id|url|path|domain|token|secret)\b/i.test(value)) return "dynamic";
  }
  return "ui";
}

function placeholdersOf(value: string): string[] {
  return [...new Set(value.match(/\$\{[A-Za-z_$][\w.$]*\}|\{[A-Za-z_$][\w.$]*\}|%[A-Za-z]|(?:^|\s):[A-Za-z][\w-]*/g)?.map((placeholder) => placeholder.trim()) ?? [])];
}

function propertyName(node: ts.PropertyName): string | undefined {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : undefined;
}

function isNotificationCall(node: ts.Expression): boolean {
  if (ts.isIdentifier(node)) return node.text === "toast" || node.text === "notify";
  return ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) &&
    (node.expression.text === "notify" || (node.expression.text === "toast" && toastMethods.has(node.name.text)));
}

const technicalAttributes = new Set(["className", "class", "style", "href", "src", "value", "defaultValue", "id", "key"]);
const validationOptions = new Set(["message", "error", "required_error", "invalid_type_error"]);
const validationWithArgument = new Set([
  "min", "max", "length", "size", "gt", "gte", "lt", "lte", "multipleOf", "step",
  "regex", "startsWith", "endsWith", "includes", "refine", "custom",
]);
const validationWithoutArgument = new Set([
  "string", "number", "boolean", "date", "email", "url", "uuid", "cuid", "cuid2", "ulid",
  "int", "positive", "negative", "nonnegative", "nonpositive", "finite", "safe",
  "nonempty", "trim", "datetime", "ip", "ipv4", "ipv6",
]);

// Only validation-message slots of a z/zod chain count, never constraints,
// enum values, regex patterns, defaults or arbitrary methods named min/refine.
function isZodChain(node: ts.Expression, roots: Set<string>): boolean {
  if (ts.isIdentifier(node)) return roots.has(node.text);
  if (ts.isPropertyAccessExpression(node)) return isZodChain(node.expression, roots);
  if (ts.isCallExpression(node)) return isZodChain(node.expression, roots);
  return false;
}

function isValidationMessage(call: ts.CallExpression, argument: ts.Node, roots: Set<string>): boolean {
  if (!ts.isPropertyAccessExpression(call.expression) || !isZodChain(call.expression.expression, roots)) return false;
  const method = call.expression.name.text;
  const index = validationWithArgument.has(method) ? 1 : validationWithoutArgument.has(method) ? 0 : -1;
  return index >= 0 && call.arguments[index] === argument;
}

function uiKind(node: ts.Node, zodRoots: Set<string>): CandidateKind | undefined {
  // A named property inside a technical JSX attribute (e.g. style's label)
  // must not accidentally opt its containing CSS/configuration back into UI.
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ts.isJsxAttribute(ancestor) && technicalAttributes.has(ancestor.name.getText())) return undefined;
  }
  let current = node;
  while (current.parent) {
    const parent = current.parent;
    if (ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent) ||
      ts.isTypeAssertionExpression(parent) || ts.isNonNullExpression(parent) || ts.isSatisfiesExpression(parent)) {
      current = parent;
      continue;
    }
    // Propagate only values which can be rendered/passed as the message, not
    // ternary tests, && guards, comparisons, callback bodies or function args.
    if (ts.isConditionalExpression(parent) && parent.condition !== current) {
      current = parent;
      continue;
    }
    if (ts.isBinaryExpression(parent) && (
      parent.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
      (parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && parent.right === current)
    )) {
      current = parent;
      continue;
    }
    if (ts.isJsxAttribute(parent) && attributes.has(parent.name.getText())) return "attribute";
    if (ts.isJsxExpression(parent) && !parent.dotDotDotToken) {
      if (ts.isJsxAttribute(parent.parent) && attributes.has(parent.parent.name.getText())) return "attribute";
      if (ts.isJsxElement(parent.parent) || ts.isJsxFragment(parent.parent)) return "jsx-text";
    }
    if (ts.isCallExpression(parent)) {
      if (parent.arguments[0] === current && isNotificationCall(parent.expression)) return "toast";
      if (isValidationMessage(parent, current, zodRoots)) return "string-literal";
    }
    if (ts.isPropertyAssignment(parent) && parent.initializer === current) {
      const name = propertyName(parent.name) ?? "";
      if (uiProperties.has(name)) return "string-literal";
      const options = parent.parent;
      if (validationOptions.has(name) && ts.isObjectLiteralExpression(options) &&
        ts.isCallExpression(options.parent) && isValidationMessage(options.parent, options, zodRoots)) return "string-literal";
    }
    return undefined;
  }
  return undefined;
}

function mergeTemplates(candidate: Candidate, templates: (string | undefined)[]): void {
  if (candidate.risk !== "ui") return;
  const all = [...new Set([candidate.template, ...(candidate.templates ?? []), ...templates]
    .filter((template): template is string => template !== undefined))];
  if (all.length) {
    candidate.template = all[0];
    candidate.templates = all;
  }
}

// Share CLI deduplication with tests without reading files or running extraction.
export function mergeCandidates(input: Iterable<Candidate>): Candidate[] {
  const candidates = new Map<string, Candidate>();
  for (const candidate of input) {
    // Sensitive records stay per-file/per-line, never merged by redacted text.
    const key = candidate.risk === "ui" ? candidate.source : `${candidate.file}:${candidate.line}:${candidate.source}`;
    const previous = candidates.get(key);
    if (!previous) {
      const copy = {
        ...candidate,
        placeholders: candidate.placeholders ? [...candidate.placeholders] : undefined,
        templates: candidate.templates ? [...candidate.templates] : undefined,
        occurrences: (candidate.occurrences ?? [{ file: candidate.file, line: candidate.line, kind: candidate.kind }]).map((item) => ({ ...item })),
        templateOccurrences: candidate.templateOccurrences?.map((item) => ({ ...item })),
      };
      mergeTemplates(copy, []);
      candidates.set(key, copy);
    } else {
      previous.occurrences!.push(...(candidate.occurrences ?? [{ file: candidate.file, line: candidate.line, kind: candidate.kind }]).map((item) => ({ ...item })));
      if (candidate.risk === "ui") {
        previous.placeholders = [...new Set([...(previous.placeholders ?? []), ...(candidate.placeholders ?? [])])];
        mergeTemplates(previous, [candidate.template, ...(candidate.templates ?? [])]);
        if (candidate.templateOccurrences) {
          (previous.templateOccurrences ??= []).push(...candidate.templateOccurrences.map((item) => ({ ...item })));
        }
      }
    }
  }
  return [...candidates.values()];
}

// Pure collection lets unit tests inspect AST behavior without running extraction
// or writing generated dictionaries. The CLI below is the only filesystem writer.
export function collectCandidates(text: string, file: string): Candidate[] {
  if (isNonUiFile(file)) return [];
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const zodRoots = new Set(["z", "zod"]);
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) ||
      !/^zod(?:\/|$)/.test(statement.moduleSpecifier.text)) continue;
    const clause = statement.importClause;
    if (clause?.name) zodRoots.add(clause.name.text);
    const bindings = clause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) zodRoots.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) {
      for (const binding of bindings.elements) {
        if (["z", "zod"].includes(binding.propertyName?.text ?? binding.name.text)) zodRoots.add(binding.name.text);
      }
    }
  }
  const candidates = new Map<string, Candidate>();
  const add = (value: string, node: ts.Node, kind: CandidateKind, explicitUi: boolean, placeholders: string[] = [], templateRisk?: CandidateRisk, template?: string, templateNode: ts.Node = node) => {
    const source = normalizeExactKey(value);
    if (source.length < 2 || !/[A-Za-z]{2}/.test(source) || source.length > 500) return;
    const risk = templateRisk ?? riskOf(source, explicitUi, value);
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    const occurrence = { file, line, kind };
    const key = risk === "ui" ? source : `${risk}:${line}:${source}`;
    const previous = candidates.get(key);
    if (!previous) {
      candidates.set(key, {
        source: risk === "ui" ? source : `[REDACTED ${risk.toUpperCase()}]`,
        ...occurrence,
        risk, reviewed: false,
        occurrences: [occurrence],
        placeholders: [...new Set([...placeholdersOf(source), ...placeholders])],
        template: risk === "ui" ? template : undefined,
        exemption: risk === "ui" ? undefined : risk,
      });
    } else {
      previous.occurrences!.push(occurrence);
      previous.placeholders = [...new Set([...(previous.placeholders ?? []), ...placeholdersOf(source), ...placeholders])];
    }
    if (risk === "ui") {
      const candidate = candidates.get(key)!;
      mergeTemplates(candidate, [template]);
      if (template) (candidate.templateOccurrences ??= []).push({
        source: template, file, kind,
        line: sourceFile.getLineAndCharacterOfPosition(templateNode.getStart(sourceFile)).line + 1,
      });
    }
  };
  // Bind only this already-parsed file: no filesystem reads, import graph,
  // execution, or general constant evaluation. The checker supplies lexical
  // identity so shadowed declarations and callback parameters cannot cross-talk.
  const host = ts.createCompilerHost({ noLib: true, noResolve: true });
  host.getSourceFile = (name) => name === file ? sourceFile : undefined;
  host.fileExists = (name) => name === file;
  host.readFile = () => undefined;
  const checker = ts.createProgram([file], { noLib: true, noResolve: true }, host).getTypeChecker();
  const unwrap = (expression: ts.Expression): ts.Expression => {
    while (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression) ||
      ts.isTypeAssertionExpression(expression) || ts.isNonNullExpression(expression) || ts.isSatisfiesExpression(expression)) expression = expression.expression;
    return expression;
  };
  const maxDepth = 24;
  const maxNodes = 4000;
  let remaining = maxNodes;
  const resolveStatic = (expression: ts.Expression, depth = 0, path = new Set<ts.Node>()): ts.Expression[] => {
    expression = unwrap(expression);
    if (depth > maxDepth || remaining-- <= 0 || path.has(expression)) return [];
    const next = new Set(path).add(expression);
    const resolve = (value: ts.Expression) => resolveStatic(value, depth + 1, next);
    if (ts.isIdentifier(expression)) {
      const declaration = checker.getSymbolAtLocation(expression)?.valueDeclaration;
      if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer &&
        ts.isVariableDeclarationList(declaration.parent) && (declaration.parent.flags & ts.NodeFlags.Const)) return resolve(declaration.initializer);
      if (declaration && ts.isParameter(declaration)) {
        const callback = declaration.parent;
        const call = callback.parent;
        if ((ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) && callback.parameters[0] === declaration &&
          ts.isCallExpression(call) && call.arguments[0] === callback && ts.isPropertyAccessExpression(call.expression) &&
          call.expression.name.text === "map") {
          return resolve(call.expression.expression).flatMap((array) => ts.isArrayLiteralExpression(array)
            ? array.elements.flatMap((item) => !ts.isSpreadElement(item) && !ts.isOmittedExpression(item) ? resolve(item) : []) : []);
        }
      }
      return [];
    }
    if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
      const key = ts.isPropertyAccessExpression(expression) ? expression.name.text :
        expression.argumentExpression && (ts.isStringLiteral(expression.argumentExpression) || ts.isNumericLiteral(expression.argumentExpression)) ? expression.argumentExpression.text : undefined;
      if (key === undefined) return [];
      return resolve(expression.expression).flatMap((object) => {
        object = unwrap(object);
        if (ts.isArrayLiteralExpression(object) && /^\d+$/.test(key)) {
          const item = object.elements[Number(key)];
          return item && !ts.isSpreadElement(item) && !ts.isOmittedExpression(item) ? resolve(item) : [];
        }
        if (!ts.isObjectLiteralExpression(object)) return [];
        const member = object.properties.find((property) => property.name && propertyName(property.name) === key);
        return member && ts.isPropertyAssignment(member) ? resolve(member.initializer) : [];
      });
    }
    if (ts.isConditionalExpression(expression)) return [...resolve(expression.whenTrue), ...resolve(expression.whenFalse)];
    if (ts.isBinaryExpression(expression)) {
      if (expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return resolve(expression.right);
      if (expression.operatorToken.kind === ts.SyntaxKind.BarBarToken || expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) return [...resolve(expression.left), ...resolve(expression.right)];
      return [];
    }
    return [expression];
  };
  const emitted = new Set<ts.Node>();
  const emit = (node: ts.Expression, kind: CandidateKind) => {
    if (emitted.has(node)) return;
    emitted.add(node);
    if (ts.isStringLiteral(node)) add(node.text, node, kind, true);
    if (ts.isNoSubstitutionTemplateLiteral(node)) add(node.text, node, "template", true);
    if (ts.isTemplateExpression(node)) {
      const placeholders = node.templateSpans.map(({ expression }) => {
        const name = expression.getText(sourceFile);
        // Do not copy literal credentials or arbitrary expressions into metadata.
        return /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(name) ? `\${${name}}` : "${…}";
      });
      const spans = [node.head, ...node.templateSpans.map((item) => item.literal)];
      // Classify the static shell as well: splitting `Bearer ${token}` or
      // `https://${host}` must not turn credential/URL fragments into UI copy.
      const rawShell = spans.map((span) => span.text).join("dynamicvalue");
      const shellRisk = riskOf(normalizeExactKey(rawShell), true, rawShell);
      const protectedRisk = shellRisk === "secret" || shellRisk === "url" || shellRisk === "code" ? shellRisk : undefined;
      const template = shellRisk === "ui"
        ? normalizeTemplate(node.head.text + node.templateSpans.map((span, index) => placeholders[index] + span.literal.text).join(""))
        : undefined;
      for (const span of spans) add(span.text, span, "template", true, placeholders, protectedRisk, template, node);
    }
  };
  const render = (expression: ts.Expression, kind: CandidateKind, depth = 0) => {
    if (depth > maxDepth || remaining-- <= 0) return;
    for (const value of resolveStatic(expression)) {
      emit(value, kind);
      if (ts.isArrayLiteralExpression(value)) {
        for (const item of value.elements) if (!ts.isSpreadElement(item) && !ts.isOmittedExpression(item)) render(item, kind, depth + 1);
      }
      if (ts.isCallExpression(value) && ts.isPropertyAccessExpression(value.expression) && value.expression.name.text === "map") {
        const callback = value.arguments[0];
        if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
          if (ts.isBlock(callback.body)) {
            // Only this callback's returns, not nested functions or arbitrary calls.
            const returns = (node: ts.Node) => {
              if (ts.isReturnStatement(node) && node.expression) render(node.expression, kind, depth + 1);
              else if (!ts.isFunctionLike(node)) ts.forEachChild(node, returns);
            };
            ts.forEachChild(callback.body, returns);
          } else render(callback.body, kind, depth + 1);
        }
      }
    }
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) add(node.getText(sourceFile), node, "jsx-text", true);
    if (ts.isExpression(node)) {
      const kind = uiKind(node, zodRoots);
      if (kind) {
        remaining = maxNodes;
        render(node, kind);
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "COMPOSE_REDEPLOY_TOAST" && node.initializer &&
      /(?:^|\/)components\/dashboard\/application\/domains\/redeploy-hint\.tsx$/.test(file.replaceAll("\\", "/")) &&
      ts.isVariableDeclarationList(node.parent) && (node.parent.flags & ts.NodeFlags.Const) && ts.isVariableStatement(node.parent.parent) &&
      node.parent.parent.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      remaining = maxNodes;
      render(node.initializer, "toast");
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...candidates.values()];
}

function main(): void {
  const root = process.argv[2] ?? join(process.cwd(), "dokploy", "apps", "dokploy");
  const translationDir = join(process.cwd(), "src", "translation");
  if (!existsSync(root)) {
    throw new Error(`未找到 Dokploy 源码目录：${root}。请初始化 dokploy 子模块后再运行提取。`);
  }
  function* candidates(): Generator<Candidate> {
    for (const file of files(root)) {
      yield* collectCandidates(readFileSync(file, "utf8"), relative(root, file));
    }
  }
  const all = mergeCandidates(candidates()).sort((a, b) => a.source.localeCompare(b.source));
  const counts = all.reduce<Record<string, number>>((result, item) => { result[item.risk] = (result[item.risk] ?? 0) + 1; return result; }, {});
  mkdirSync(translationDir, { recursive: true });
  writeFileSync(join(translationDir, "dictionary.generated.json"), `${JSON.stringify({ schemaVersion: 2, source: relative(process.cwd(), root), generatedAt: new Date().toISOString(), candidates: all }, null, 2)}\n`);
  writeFileSync(join(translationDir, "dictionary.report.json"), `${JSON.stringify({ schemaVersion: 1, source: relative(process.cwd(), root), generatedAt: new Date().toISOString(), total: all.length, counts }, null, 2)}\n`);
  writeFileSync(join(translationDir, "dictionary.sensitive.json"), `${JSON.stringify(all.filter((item) => item.risk !== "ui"), null, 2)}\n`);
  console.log(`Extracted ${all.length} candidates: ${JSON.stringify(counts)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
