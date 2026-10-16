import type { UnknownTextEntry } from "../storage/settings";

export function isSafeUnknownText(value: string): boolean {
  const text = value.trim();
  if (text.length < 2 || text.length > 500 || !/[a-z]/i.test(text)) return false;
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) return false;
  if (/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return false;
  if (/\b(?:https?|wss?|ftp):\/\/|-----BEGIN\b|\bBearer\s+\S+/i.test(text)) return false;
  if (/\b(?:pass(?:word|wd)|secret|api[ _-]?key|(?:access[ _-]?|refresh[ _-]?)?token|private[ _-]?key|client[ _-]?secret|authorization)\s*[:=]\s*\S+/i.test(text)) return false;
  if (/\b(?:gh[pousr]_[A-Za-z0-9]+|AKIA[A-Z0-9]{16}|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/.test(text)) return false;
  if (/^(?:(?:sudo|env)\s+)?(?:docker|docker-compose|npm|pnpm|yarn|npx|curl|wget|ssh|scp|bash|sh|git|kubectl|export)\s/i.test(text)) return false;
  return true;
}

export function sanitizeUnknownTextEntry(value: unknown): UnknownTextEntry | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  if (typeof entry.text !== "string" || !isSafeUnknownText(entry.text)) return undefined;
  if (typeof entry.url !== "string" || entry.url.length > 4096) return undefined;
  if (typeof entry.tagName !== "string" || !/^[a-z][a-z0-9-]{0,63}$/i.test(entry.tagName)) return undefined;
  if (typeof entry.seenAt !== "number" || !Number.isFinite(entry.seenAt) || entry.seenAt < 0) return undefined;
  try {
    const url = new URL(entry.url);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.href.split("://")[1]?.split("/")[0].includes("@")) return undefined;
    url.search = "";
    url.hash = "";
    return { text: entry.text.trim(), url: url.href, tagName: entry.tagName.toUpperCase(), seenAt: entry.seenAt };
  } catch {
    return undefined;
  }
}

export function sanitizeUnknownTextEntries(value: unknown): UnknownTextEntry[] {
  if (!Array.isArray(value)) return [];
  const result: UnknownTextEntry[] = [];
  const seen = new Set<string>();
  for (const raw of value.slice(0, 5000)) {
    const entry = sanitizeUnknownTextEntry(raw);
    if (!entry) continue;
    const key = `${entry.url}\n${entry.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
    if (result.length === 500) break;
  }
  return result;
}
