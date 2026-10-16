import { exactDictionary, translateText } from "./dictionary";

const SKIP_SELECTOR = "input, textarea, select, [contenteditable], pre, code, script, style, .cm-editor, .cm-scroller, .xterm, .xterm-screen, [data-dokploy-zh-ignore], [aria-hidden=\"true\"]";
const SKIP_ATTRIBUTE_SELECTOR = "[contenteditable], pre, code, script, style, .cm-editor, .cm-scroller, .xterm, .xterm-screen, [data-dokploy-zh-ignore], [aria-hidden=\"true\"]";
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "aria-description", "alt"];
const translatedNodes = new WeakMap<Text, string>();
const translatedAttributes = new WeakMap<Element, Map<string, string>>();
let originalLang: string | null = null;

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

function isLikelyUiText(value: string): boolean {
  const text = value.trim();
  if (text.length < 2 || text.length > 200 || !/[A-Za-z]{2}/.test(text)) return false;
  if (/https?:\/\/|^\/?(?:etc|var|usr|home)\//i.test(text)) return false;
  if (/[{}<>`=]|\b(?:API_URL|DATABASE_URL|BEGIN [A-Z ]+KEY)\b/i.test(text)) return false;
  if (/^[\w./:-]+$/.test(text) && !/\s/.test(text) && !/^[A-Z][a-z]+[.!?]?$/.test(text)) return false;
  if ((text.match(/\d/g) ?? []).length > 6) return false;
  return true;
}

function reportUnknown(node: Node, value: string, callback?: UnknownTextCallback): void {
  if (!callback || !isVisible(node) || !isLikelyUiText(value)) return;
  const element = elementForNode(node);
  callback({
    text: value.trim(),
    url: location.href,
    tagName: element?.tagName.toLowerCase() ?? "text",
    seenAt: Date.now(),
  });
}

function translateTextNode(node: Text, options: TranslatorOptions): void {
  const callback = options.onUnknown;
  if (isSkipped(node) || !isVisible(node) || !node.nodeValue?.trim()) return;
  const original = node.nodeValue;
  const translated = translateText(original, "text", options.customTranslations);
  if (!translated || translated === original) {
    reportUnknown(node, original, callback);
    return;
  }
  if (!translatedNodes.has(node)) translatedNodes.set(node, original);
  node.nodeValue = translated;
  node.parentElement?.setAttribute("data-dokploy-zh-translated", "true");
}

function translateAttribute(element: Element, attribute: string, options: TranslatorOptions): void {
  const callback = options.onUnknown;
  if (element.matches(SKIP_ATTRIBUTE_SELECTOR) || element.closest(SKIP_ATTRIBUTE_SELECTOR) || !isVisible(element)) return;
  const current = element.getAttribute(attribute);
  if (!current) return;
  const translated = translateText(current, attribute, options.customTranslations);
  if (!translated || translated === current) {
    if (!exactDictionary.has(current.trim())) reportUnknown(element, current, callback);
    return;
  }
  let originals = translatedAttributes.get(element);
  if (!originals) {
    originals = new Map();
    translatedAttributes.set(element, originals);
  }
  if (!originals.has(attribute)) originals.set(attribute, current);
  element.setAttribute(attribute, translated);
  element.setAttribute("data-dokploy-zh-translated", "true");
}

export function scan(root: Node = document.body, options: TranslatorOptions = {}): void {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) translateTextNode(node as Text, options);
  const elements = root instanceof Element
    ? [root, ...Array.from(root.querySelectorAll("*"))]
    : Array.from((root as Document).querySelectorAll("*"));
  for (const element of elements) {
    for (const attribute of TRANSLATABLE_ATTRIBUTES) translateAttribute(element, attribute, options);
  }
}

export function restore(): void {
  const marked = Array.from(document.querySelectorAll("[data-dokploy-zh-translated]"));
  for (const element of marked) {
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const original = translatedNodes.get(child as Text);
        if (original) (child as Text).nodeValue = original;
      }
    }
    translatedAttributes.get(element)?.forEach((value, attribute) => element.setAttribute(attribute, value));
    element.removeAttribute("data-dokploy-zh-translated");
  }
  if (originalLang) document.documentElement.setAttribute("lang", originalLang);
  else document.documentElement.removeAttribute("lang");
}

export function startTranslator(options: TranslatorOptions = {}): () => void {
  originalLang = document.documentElement.getAttribute("lang");
  document.documentElement.setAttribute("lang", "zh-CN");
  scan(document.body, options);
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan(document.body, options);
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
    observer.disconnect();
    restore();
  };
}
