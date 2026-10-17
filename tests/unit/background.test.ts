import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getSettings: vi.fn(), getUnknown: vi.fn(), setUnknown: vi.fn(), message: vi.fn() }));
vi.mock("wxt/utils/define-background", () => ({ defineBackground: (fn: unknown) => fn }));
vi.mock("wxt/browser", () => ({ browser: {
  permissions: { contains: vi.fn().mockResolvedValue(false), onAdded: { addListener: vi.fn() }, onRemoved: { addListener: vi.fn() } },
  scripting: { getRegisteredContentScripts: vi.fn().mockResolvedValue([]) }, action: { onClicked: { addListener: vi.fn() } },
  runtime: { onInstalled: { addListener: vi.fn() }, onStartup: { addListener: vi.fn() }, onMessage: { addListener: mocks.message } },
} }));
vi.mock("../../src/storage/settings", () => ({ settings: { getValue: mocks.getSettings }, unknownTexts: { getValue: mocks.getUnknown, setValue: mocks.setUnknown } }));
const entry = { text: "Future dashboard action", url: "https://panel.example.com/path?token=private#detail", tagName: "SPAN", seenAt: 1 };
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
const send = (entry: unknown) => mocks.message.mock.calls[0][0]({ type: "unknownText", entry });

describe("background unknown message boundary", () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); mocks.getSettings.mockResolvedValue({ enabled: true, debugUnknown: true, sites: [] }); mocks.getUnknown.mockResolvedValue([]); mocks.setUnknown.mockResolvedValue(undefined); });
  it("rejects malformed and private records at ingestion", async () => {
    const { default: main } = await import("../../entrypoints/background"); (main as unknown as () => void)();
    for (const value of [{}, { ...entry, text: "Contact alice@example.com" }, { ...entry, text: "Bearer private-token" }]) send(value);
    await flush(); expect(mocks.setUnknown).not.toHaveBeenCalled();
    send(entry); await flush();
    expect(mocks.setUnknown).toHaveBeenCalledWith([{ ...entry, url: "https://panel.example.com/path" }]);
  });
  it("does not store when debug is disabled", async () => {
    mocks.getSettings.mockResolvedValue({ enabled: true, debugUnknown: false, sites: [] });
    const { default: main } = await import("../../entrypoints/background"); (main as unknown as () => void)(); send(entry); await flush();
    expect(mocks.setUnknown).not.toHaveBeenCalled();
  });
  it("serializes concurrent writes without losing existing local records", async () => {
    let records: unknown[] = [{ ...entry, text: "Existing local record" }];
    mocks.getUnknown.mockImplementation(async () => records);
    mocks.setUnknown.mockImplementation(async (next) => { await Promise.resolve(); records = next; });
    const { default: main } = await import("../../entrypoints/background"); (main as unknown as () => void)();
    send(entry); send({ ...entry, text: "Another dashboard action" }); await flush();
    expect(records).toHaveLength(3);
  });
});
