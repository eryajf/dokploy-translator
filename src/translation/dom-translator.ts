import { exactDictionary, translateText } from "./dictionary";
import { isSafeUnknownText } from "./unknown-text";
import { contextualTranslations, translateContextualParts } from "./contextual-translations";
import { normalizeExactKey } from "./normalize";

const RAW_LOG_SELECTOR = ".custom-logs-scrollbar span.font-mono.whitespace-pre-wrap.break-all";
const SKIP_ATTRIBUTE_SELECTOR = `[contenteditable], pre, code, script, style, .cm-editor, .cm-scroller, .xterm, .xterm-screen, [data-dokploy-zh-ignore], [aria-hidden="true"], ${RAW_LOG_SELECTOR}`;
const SKIP_SELECTOR = `input, textarea, select, ${SKIP_ATTRIBUTE_SELECTOR}`;
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "aria-description", "alt"];
// Dokploy's Add handlers locate these inputs by their English placeholders.
const SELECTOR_PLACEHOLDERS = new Set([
  "Enter a label (e.g. enhancements, needs-review)",
  "Enter a path to watch (e.g., src/**, dist/*.js)",
  "e.g., rate-limit@file, auth@file",
]);
type TranslationState = { source: string; translated: string; contextual?: boolean };
const translatedNodes = new Map<Text, TranslationState>();
const translatedAttributes = new Map<Element, Map<string, TranslationState>>();
const markedElements = new Set<Element>();
let originalLang: string | null | undefined;

export type UnknownTextCallback = (entry: {
  text: string;
  url: string;
  tagName: string;
  seenAt: number;
}) => void;

export type TranslatorOptions = {
  onUnknown?: UnknownTextCallback;
  customTranslations?: Record<string, string>;
};

function elementForNode(node: Node): Element | null {
  return node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
}

function isSkipped(node: Node): boolean {
  const element = elementForNode(node);
  return Boolean(element?.closest(SKIP_SELECTOR));
}

function isVisible(node: Node): boolean {
  const element = elementForNode(node);
  if (!element || (element instanceof HTMLElement && element.hidden) || element.closest("[hidden], [aria-hidden=\"true\"]")) return false;
  const style = typeof getComputedStyle === "function" ? getComputedStyle(element) : undefined;
  return style?.display !== "none" && style?.visibility !== "hidden";
}

function safePageUrl(): string {
  try {
    const url = new URL(location.href);
    return `${url.origin}${url.pathname}`;
  } catch {
    return location.origin;
  }
}

function reportUnknown(node: Node, value: string, callback?: UnknownTextCallback): void {
  if (!callback || !isVisible(node) || !isSafeUnknownText(value)) return;
  const element = elementForNode(node);
  callback({
    text: value.trim(),
    url: safePageUrl(),
    tagName: element?.tagName.toLowerCase() ?? "text",
    seenAt: Date.now(),
  });
}

function markTranslated(element: Element | null): void {
  if (!element) return;
  element.setAttribute("data-dokploy-zh-translated", "true");
  markedElements.add(element);
}

function translateTextNode(node: Text, options: TranslatorOptions): void {
  const original = node.nodeValue ?? "";
  const previous = translatedNodes.get(node);
  // A rescan must not translate our own output or report it as unknown.
  if (previous?.translated === original) return;
  translatedNodes.delete(node);
  if (isSkipped(node) || !isVisible(node) || !original.trim()) return;
  const translated = translateText(original, "text", options.customTranslations);
  if (!translated || translated === original) {
    reportUnknown(node, original, options.onUnknown);
    return;
  }
  translatedNodes.set(node, { source: original, translated });
  node.nodeValue = translated;
  markTranslated(node.parentElement);
}

function translateAttribute(element: Element, attribute: string, options: TranslatorOptions): void {
  const current = element.getAttribute(attribute);
  let states = translatedAttributes.get(element);
  if (states?.get(attribute)?.translated === current) return;
  states?.delete(attribute);
  if (states?.size === 0) translatedAttributes.delete(element);
  if (!current || element.closest(SKIP_ATTRIBUTE_SELECTOR) || !isVisible(element)) return;
  if (attribute === "placeholder" && element.matches("input") && SELECTOR_PLACEHOLDERS.has(current)) return;
  const translated = translateText(current, attribute, options.customTranslations);
  if (!translated || translated === current) {
    if (!exactDictionary.has(current.trim())) reportUnknown(element, current, options.onUnknown);
    return;
  }
  if (!states) states = new Map();
  translatedAttributes.set(element, states);
  states.set(attribute, { source: current, translated });
  element.setAttribute(attribute, translated);
  markTranslated(element);
}

function translateContextualElement(element: Element, options: TranslatorOptions): boolean {
  if (isSkipped(element) || !isVisible(element)) return false;
  // No textContent writes: React owns each numeric/plural Text node. Even an
  // intervening element breaks this narrowly reviewed continuous-text grammar.
  const children = Array.from(element.childNodes);
  if (!children.length || children.some((node) => node.nodeType !== Node.TEXT_NODE)) return false;
  const nodes = children as Text[];
  const sources = nodes.map((node) => {
    const state = translatedNodes.get(node);
    return state?.translated === node.nodeValue ? state.source : node.nodeValue ?? "";
  });
  const custom = options.customTranslations;
  if (custom && sources.some((source) => custom[source.trim()] || custom[normalizeExactKey(source)])) {
    nodes.forEach((node, index) => {
      const state = translatedNodes.get(node);
      if (state?.contextual) {
        if (state.translated === node.nodeValue) node.nodeValue = sources[index];
        translatedNodes.delete(node);
      }
    });
    return false;
  }
  for (const rule of contextualTranslations) {
    if (!element.matches(rule.selector)) continue;
    const output = translateContextualParts(rule, sources);
    if (!output) continue;
    nodes.forEach((node, index) => {
      if (output[index] !== sources[index]) {
        translatedNodes.set(node, { source: sources[index], translated: output[index], contextual: true });
        if (node.nodeValue !== output[index]) node.nodeValue = output[index];
        markTranslated(element);
      } else {
        translatedNodes.delete(node);
      }
    });
    return true;
  }
  return false;
}

export function scan(root: Node = document.body, options: TranslatorOptions = {}): void {
  if (!root) return;
  const elements = root instanceof Element
    ? [root, ...Array.from(root.querySelectorAll("*"))]
    : Array.from((root as Document).querySelectorAll("*"));
  const contextualParents = new Set(elements.filter((element) => translateContextualElement(element, options)));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.parentElement || !contextualParents.has(node.parentElement)) translateTextNode(node as Text, options);
  }
  for (const element of elements) {
    for (const attribute of TRANSLATABLE_ATTRIBUTES) translateAttribute(element, attribute, options);
  }
}

export function restore(): void {
  for (const [node, state] of translatedNodes) {
    if (node.nodeValue === state.translated) node.nodeValue = state.source;
  }
  translatedNodes.clear();
  for (const [element, states] of translatedAttributes) {
    for (const [attribute, state] of states) {
      if (element.getAttribute(attribute) === state.translated) element.setAttribute(attribute, state.source);
    }
  }
  translatedAttributes.clear();
  for (const element of markedElements) element.removeAttribute("data-dokploy-zh-translated");
  markedElements.clear();
  if (originalLang !== undefined && document.documentElement.getAttribute("lang") === "zh-CN") {
    if (originalLang !== null) document.documentElement.setAttribute("lang", originalLang);
    else document.documentElement.removeAttribute("lang");
  }
  originalLang = undefined;
}

export function startTranslator(options: TranslatorOptions = {}): () => void {
  originalLang = document.documentElement.getAttribute("lang");
  document.documentElement.setAttribute("lang", "zh-CN");
  scan(document.body, options);
  let active = true;
  let frame: number | undefined;
  const observer = new MutationObserver(() => {
    if (!active || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (active) scan(document.body, options);
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRIBUTES,
  });
  return () => {
    if (!active) return;
    active = false;
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    restore();
  };
}
