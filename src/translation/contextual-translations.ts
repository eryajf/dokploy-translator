export type ContextualTranslation = {
  id: string;
  selector: string;
  occurrences: readonly { source: string; file: string; line: number; kind: string }[];
  grammar: RegExp;
  replacements: readonly { pattern: RegExp; target: string }[];
  witnesses: readonly { parts: readonly string[]; output: string }[];
};

const overview = "components/dashboard/overview/show-overview-services.tsx";
const projects = "components/dashboard/projects/show.tsx";
const environment = "pages/dashboard/project/[projectId]/environment/[environmentId].tsx";

// These are complete parent grammars, not globally translatable noun fragments.
// Occurrences are also the coverage registry; witnesses execute the same function
// used by the DOM translator, rather than treating registration as an exemption.
export const contextualTranslations: readonly ContextualTranslation[] = [
  {
    id: "vault-import-count",
    selector: '[role="dialog"] [data-slot="dialog-footer"] button',
    occurrences: [{ source: "secret", file: "components/shared/vault-import-dialog.tsx", line: 300, kind: "jsx-text" }],
    grammar: /^\s*Import\s+(?:\d+\s+)?secrets?\s*$/u,
    replacements: [
      { pattern: /\bImport\s+secrets?\b/gu, target: "导入密钥" },
      { pattern: /\bImport\b/gu, target: "导入" },
      { pattern: /\bsecrets?\b/gu, target: "个密钥" },
    ],
    witnesses: [
      { parts: ["Import ", "1", " secret", ""], output: "导入 1 个密钥" },
      { parts: ["Import ", "2", " secret", "s"], output: "导入 2 个密钥" },
      { parts: ["Import ", "", " secret", "s"], output: "导入密钥" },
    ],
  },
  {
    id: "overview-service-count",
    selector: ".flex.items-center.justify-between.text-sm.text-muted-foreground > span",
    occurrences: ["service", "services", "total"].map((source) => ({ source, file: overview, line: 498, kind: "jsx-text" })),
    grammar: /^\s*\d+\s+services?\s+total\s*$/u,
    replacements: [{ pattern: /\bservices?\b/gu, target: "项服务" }, { pattern: /\btotal\b/gu, target: "总计" }],
    witnesses: [
      { parts: ["1", " ", "service", " total"], output: "1 项服务 总计" },
      { parts: ["12", " ", "services", " total"], output: "12 项服务 总计" },
    ],
  },
  {
    id: "project-service-count",
    selector: '[data-slot="card-footer"] span',
    occurrences: [
      { source: "service", file: projects, line: 502, kind: "jsx-text" },
      { source: "services", file: projects, line: 503, kind: "jsx-text" },
    ],
    grammar: /^\s*\d+\s+services?\s*$/u,
    replacements: [{ pattern: /\bservices?\b/gu, target: "项服务" }],
    witnesses: [
      { parts: ["1", " ", "service"], output: "1 项服务" },
      { parts: ["2", " ", "services"], output: "2 项服务" },
    ],
  },
  {
    id: "move-services-description",
    selector: '[role="dialog"] [data-slot="dialog-description"]',
    occurrences: [
      { source: "Select the target project and environment to move", file: environment, line: 1256, kind: "jsx-text" },
      { source: "services", file: environment, line: 1257, kind: "jsx-text" },
    ],
    grammar: /^\s*Select\s+the\s+target\s+project\s+and\s+environment\s+to\s+move\s+\d+\s+services\s*$/u,
    replacements: [
      { pattern: /Select\s+the\s+target\s+project\s+and\s+environment\s+to\s+move/gu, target: "选择目标项目和环境以移动" },
      { pattern: /\bservices\b/gu, target: "项服务" },
    ],
    witnesses: [
      { parts: ["Select the target project and environment to move ", "1", " services"], output: "选择目标项目和环境以移动 1 项服务" },
      { parts: ["Select the target project and environment to move ", "3", " services"], output: "选择目标项目和环境以移动 3 项服务" },
    ],
  },
];

/** Replace only literal ranges, retaining one output per original Text node. */
export function translateContextualParts(rule: ContextualTranslation, parts: readonly string[]): string[] | undefined {
  const source = parts.join("");
  if (rule.grammar.global || rule.grammar.sticky || !rule.grammar.source.startsWith("^")
    || !rule.grammar.source.endsWith("$") || !rule.grammar.test(source)) return undefined;
  const edits: { start: number; end: number; target: string }[] = [];
  for (const replacement of rule.replacements) {
    const pattern = new RegExp(replacement.pattern.source, replacement.pattern.flags.includes("g") ? replacement.pattern.flags : `${replacement.pattern.flags}g`);
    for (const match of source.matchAll(pattern)) {
      if (!match[0]) return undefined;
      const start = match.index;
      const end = start + match[0].length;
      // Earlier complete phrases take precedence over contained noun edits.
      if (!edits.some((edit) => start < edit.end && end > edit.start)) {
        edits.push({ start, end, target: replacement.target });
      }
    }
  }
  edits.sort((left, right) => left.start - right.start);
  if (!edits.length || edits.some((edit, index) => index > 0 && edit.start < edits[index - 1].end)) return undefined;
  let offset = 0;
  return parts.map((part) => {
    const start = offset;
    offset += part.length;
    let output = "";
    for (let index = start; index < offset;) {
      const edit = edits.find((value) => value.start <= index && index < value.end);
      if (edit) {
        if (index === edit.start) output += edit.target;
        index = Math.min(edit.end, offset);
      } else {
        output += source[index];
        index++;
      }
    }
    return output;
  });
}
