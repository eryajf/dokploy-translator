/** Exact lookup keys only. Decode known entities in one pass, then normalize whitespace.
 * Never apply this to runtime template/pattern captures or replacement values.
 */
export function normalizeExactKey(value: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&", "&apos;": "'", "&#39;": "'", "&quot;": '"', "&#34;": '"',
    "&mdash;": "—", "&nbsp;": " ",
  };
  return value.replace(/&(?:amp|apos|quot|mdash|nbsp|#39|#34);/g, (entity) => entities[entity])
    .replace(/\s+/g, " ").trim();
}
