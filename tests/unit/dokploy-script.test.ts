import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  getSettings: vi.fn(), getCustom: vi.fn(), start: vi.fn(), send: vi.fn(), listener: vi.fn(),
}));
vi.mock("wxt/browser", () => ({ browser: { runtime: { sendMessage: mock.send }, storage: { onChanged: { addListener: mock.listener } } } }));
vi.mock("wxt/utils/define-unlisted-script", () => ({ defineUnlistedScript: (fn: unknown) => fn }));
vi.mock("../../src/storage/settings", () => ({ settings: { getValue: mock.getSettings }, customTranslations: { getValue: mock.getCustom } }));
vi.mock("../../src/translation/dom-translator", () => ({ startTranslator: mock.start }));
const enabled = (debugUnknown = false) => ({ enabled: true, debugUnknown, sites: [{ origin: location.origin, enabled: true }] });
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
const change = (value: Record<string, unknown>) => mock.listener.mock.calls[0][0](value, "local");

describe("production content script settings lifecycle", () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); mock.getSettings.mockReset(); mock.getCustom.mockReset(); mock.start.mockReset(); mock.getSettings.mockResolvedValue(enabled()); mock.getCustom.mockResolvedValue({}); mock.start.mockReturnValue(vi.fn()); });
  it("does not let a stale settings read restart after a newer disable", async () => {
    let resolve!: (value: unknown) => void;
    mock.getSettings.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const { default: main } = await import("../../entrypoints/dokploy-script"); (main as unknown as () => void)();
    mock.getSettings.mockResolvedValue({ ...enabled(), enabled: false });
    change({ settings: {} }); await flush();
    resolve(enabled()); await flush();
    expect(mock.start).not.toHaveBeenCalled();
  });
  it("restarts for the latest custom dictionary even when another settings event overtakes it", async () => {
    const stop = vi.fn(); mock.start.mockReturnValue(stop);
    const { default: main } = await import("../../entrypoints/dokploy-script"); (main as unknown as () => void)(); await flush();
    let resolve!: (value: unknown) => void;
    mock.getCustom.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    change({ customTranslations: {} });
    mock.getCustom.mockResolvedValue({ Home: "自定首页" });
    change({ settings: {} }); await flush();
    resolve({ Home: "stale" }); await flush();
    expect(mock.start).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(mock.start.mock.calls[1][0].customTranslations).toEqual({ Home: "自定首页" });
  });
  it("gates reporting on debug and disables translation without repeated stop", async () => {
    const stop = vi.fn(); mock.start.mockReturnValue(stop);
    const { default: main } = await import("../../entrypoints/dokploy-script"); (main as unknown as () => void)(); await flush();
    const entry = { text: "Future safe dashboard action", url: location.origin + "/", tagName: "SPAN", seenAt: 1 };
    const report = mock.start.mock.calls[0][0].onUnknown;
    report(entry); expect(mock.send).not.toHaveBeenCalled();
    mock.getSettings.mockResolvedValue(enabled(true)); change({ settings: {} }); await flush();
    report(entry); expect(mock.send).toHaveBeenCalledTimes(1);
    mock.getSettings.mockResolvedValue({ ...enabled(), enabled: false }); change({ settings: {} }); await flush();
    report({ ...entry, text: "Other future action" }); expect(mock.send).toHaveBeenCalledTimes(1);
    change({ settings: {} }); await flush(); expect(stop).toHaveBeenCalledTimes(1);
  });
});
