import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";
import {
  settings,
  unknownTexts,
  originPattern,
  siteId,
  type SiteConfig,
} from "../src/storage/settings";
import { desiredScriptIds, staleScriptIds } from "../src/runtime/registry";
import { sanitizeUnknownTextEntry } from "../src/translation/unknown-text";
let syncPromise: Promise<void> = Promise.resolve();

async function hasPermission(origin: string): Promise<boolean> {
  return browser.permissions.contains({ origins: [originPattern(origin)] });
}

async function unregister(id: string): Promise<void> {
  await browser.scripting.unregisterContentScripts({ ids: [id] }).catch(() => undefined);
}

async function register(site: SiteConfig): Promise<void> {
  const id = siteId(site.origin);
  await unregister(id);
  await browser.scripting.registerContentScripts([{
    id,
    matches: [originPattern(site.origin)],
    js: ["dokploy-script.js"],
    runAt: "document_idle",
    persistAcrossSessions: true,
  }]);
}

export async function syncRegisteredScripts(): Promise<void> {
  const current = await settings.getValue();
  const registered = await browser.scripting.getRegisteredContentScripts().catch(() => []);
  const grantedOrigins = new Set<string>();
  for (const site of current.sites) if (await hasPermission(site.origin)) grantedOrigins.add(site.origin);
  const desiredIds = desiredScriptIds(current.sites, current.enabled, grantedOrigins);

  for (const site of current.sites) {
    const id = siteId(site.origin);
    const enabled = current.enabled && site.enabled && await hasPermission(site.origin);
    if (enabled) {
      await register(site);
    } else {
      await unregister(id);
    }
  }

  for (const id of staleScriptIds(registered.map((script) => script.id), desiredIds)) await unregister(id);
}

function queueSync(): void {
  syncPromise = syncPromise.catch(() => undefined).then(() => syncRegisteredScripts());
}

let recordPromise: Promise<void> = Promise.resolve();

async function recordUnknown(value: unknown): Promise<void> {
  const entry = sanitizeUnknownTextEntry(value);
  if (!entry) return;
  const current = await settings.getValue();
  if (!current.debugUnknown) return;
  const existing = await unknownTexts.getValue();
  const key = `${entry.url}\n${entry.text}`;
  const next = [entry, ...existing.filter((item) => `${item.url}\n${item.text}` !== key)].slice(0, 500);
  await unknownTexts.setValue(next);
}

export default defineBackground(() => {
  browser.action.onClicked.addListener(() => {
    void browser.runtime.openOptionsPage();
  });
  browser.runtime.onInstalled.addListener(() => queueSync());
  browser.runtime.onStartup.addListener(() => queueSync());
  browser.permissions.onAdded.addListener(() => queueSync());
  browser.permissions.onRemoved.addListener(() => queueSync());
  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === "sync") queueSync();
    if (message?.type === "unknownText" && message.entry) {
      recordPromise = recordPromise.catch(() => undefined).then(() => recordUnknown(message.entry));
    }
  });
  queueSync();
});
