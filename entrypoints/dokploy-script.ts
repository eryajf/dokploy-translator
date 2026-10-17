import { browser } from "wxt/browser";
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";
import { customTranslations, settings } from "../src/storage/settings";
import { startTranslator, type UnknownTextCallback } from "../src/translation/dom-translator";

export default defineUnlistedScript(() => {
  let stop: (() => void) | undefined;
  let debugUnknown = false;
  let generation = 0;
  let restartPending = false;
  let appliedCustom = "";
  const reportedUnknown = new Set<string>();

  const reportUnknown: UnknownTextCallback = (entry) => {
    const key = `${entry.url}\n${entry.text}`;
    if (debugUnknown && !reportedUnknown.has(key)) {
      reportedUnknown.add(key);
      void browser.runtime.sendMessage({ type: "unknownText", entry });
    }
  };

  const sync = async (restart = false) => {
    const request = ++generation;
    restartPending ||= restart;
    debugUnknown = false;
    const [current, custom] = await Promise.all([settings.getValue(), customTranslations.getValue()]);
    if (request !== generation) return;
    const customKey = JSON.stringify(custom);
    const shouldRestart = restartPending || appliedCustom !== customKey;
    restartPending = false;
    debugUnknown = current.debugUnknown;
    const enabled = import.meta.env.MODE === "e2e" || (current.enabled && current.sites.some(
      (site) => site.enabled && site.origin === location.origin,
    ));
    if (enabled && (shouldRestart || !stop)) {
      stop?.();
      appliedCustom = customKey;
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
