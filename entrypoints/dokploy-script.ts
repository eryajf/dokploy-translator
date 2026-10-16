import { browser } from "wxt/browser";
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";
import { customTranslations, settings } from "../src/storage/settings";
import { startTranslator, type UnknownTextCallback } from "../src/translation/dom-translator";

export default defineUnlistedScript(() => {
  let stop: (() => void) | undefined;
  let debugUnknown = false;
  let custom = {} as Record<string, string>;
  const reportedUnknown = new Set<string>();

  const reportUnknown: UnknownTextCallback = (entry) => {
    const key = `${entry.url}\n${entry.text}`;
    if (debugUnknown && !reportedUnknown.has(key)) {
      reportedUnknown.add(key);
      void browser.runtime.sendMessage({ type: "unknownText", entry });
    }
  };

  const sync = async (restart = false) => {
    const current = await settings.getValue();
    custom = await customTranslations.getValue();
    debugUnknown = current.debugUnknown;
    const enabled = import.meta.env.MODE === "e2e" || (current.enabled && current.sites.some(
      (site) => site.enabled && site.origin === location.origin,
    ));
    if (enabled && (restart || !stop)) {
      stop?.();
      stop = startTranslator({ onUnknown: reportUnknown, customTranslations: custom });
    }
    if (!enabled && stop) {
      stop();
      stop = undefined;
    }
  };

  void sync();
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes.customTranslations) void sync(true);
    else if (changes.settings) void sync();
  });
});
