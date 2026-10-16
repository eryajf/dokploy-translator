import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { browser } from "wxt/browser";
import {
  customTranslations,
  settings,
  unknownTexts,
  normalizeOrigin,
  originPattern,
  siteId,
  type ExportBundle,
  type ExtensionSettings,
  type SiteConfig,
  type UnknownTextEntry,
} from "../../src/storage/settings";
import { dictionaryMeta } from "../../src/translation/dictionary";
import "./style.css";

type PermissionMap = Record<string, boolean>;

function downloadJson(name: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [value, setValue] = useState<ExtensionSettings>();
  const [sitesPermissions, setSitesPermissions] = useState<PermissionMap>({});
  const [unknown, setUnknown] = useState<UnknownTextEntry[]>([]);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  async function refresh(): Promise<void> {
    const current = await settings.getValue();
    const permissions = await Promise.all(current.sites.map(async (site) => [
      site.origin,
      await browser.permissions.contains({ origins: [originPattern(site.origin)] }),
    ] as const));
    setValue(current);
    setSitesPermissions(Object.fromEntries(permissions));
    setUnknown(await unknownTexts.getValue());
  }

  useEffect(() => { void refresh(); }, []);

  async function updateSettings(updater: (current: ExtensionSettings) => ExtensionSettings): Promise<void> {
    setBusy(true);
    try {
      const next = updater(await settings.getValue());
      await settings.setValue(next);
      await browser.runtime.sendMessage({ type: "sync" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function addSite(): Promise<void> {
    setError("");
    try {
      const normalized = normalizeOrigin(origin);
      if ((await settings.getValue()).sites.some((site) => site.origin === normalized)) throw new Error("该地址已存在");
      const granted = await browser.permissions.request({ origins: [originPattern(normalized)] });
      if (!granted) throw new Error("未获得站点访问权限");
      const now = Date.now();
      const site: SiteConfig = { id: siteId(normalized), origin: normalized, enabled: true, locale: "zh-CN", createdAt: now, updatedAt: now };
      await updateSettings((current) => ({ ...current, sites: [...current.sites, site] }));
      setOrigin("");
      setNotice("地址已添加并授权");
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  }

  async function toggleSite(site: SiteConfig): Promise<void> {
    await updateSettings((current) => ({ ...current, sites: current.sites.map((item) => item.id === site.id ? { ...item, enabled: !item.enabled, updatedAt: Date.now() } : item) }));
  }

  async function regrant(site: SiteConfig): Promise<void> {
    const granted = await browser.permissions.request({ origins: [originPattern(site.origin)] });
    if (granted) { await refresh(); setNotice("站点权限已恢复"); }
  }

  async function removeSite(site: SiteConfig): Promise<void> {
    setError("");
    try {
      await browser.permissions.remove({ origins: [originPattern(site.origin)] });
      await updateSettings((current) => ({ ...current, sites: current.sites.filter((item) => item.id !== site.id) }));
      setNotice("地址已删除");
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  async function exportData(): Promise<void> {
    const bundle: ExportBundle = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      settings: await settings.getValue(),
      unknownTexts: await unknownTexts.getValue(),
      customTranslations: await customTranslations.getValue(),
    };
    downloadJson("dokploy-translator-backup.json", bundle);
    setNotice("配置已导出");
  }

  async function importData(file: File): Promise<void> {
    setError("");
    try {
      const parsed = JSON.parse(await file.text()) as Partial<ExportBundle>;
      if (parsed.schemaVersion !== 1 || !parsed.settings || !Array.isArray(parsed.settings.sites)) throw new Error("备份文件格式不受支持");
      const sites = parsed.settings.sites.map((site) => ({ ...site, origin: normalizeOrigin(site.origin), id: siteId(normalizeOrigin(site.origin)) }));
      await settings.setValue({ version: 2, enabled: parsed.settings.enabled !== false, debugUnknown: parsed.settings.debugUnknown === true, sites });
      await customTranslations.setValue(parsed.customTranslations && typeof parsed.customTranslations === "object" ? parsed.customTranslations : {});
      await unknownTexts.setValue(Array.isArray(parsed.unknownTexts) ? parsed.unknownTexts.slice(0, 500) : []);
      await browser.runtime.sendMessage({ type: "sync" });
      await refresh();
      setNotice("配置已导入");
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败");
    }
  }

  async function clearUnknown(): Promise<void> {
    await unknownTexts.setValue([]);
    setUnknown([]);
    setNotice("未翻译文本记录已清空");
  }

  if (!value) return <main><p>加载中…</p></main>;

  return <main>
    <header><h1>Dokploy 中文化</h1><p>本地翻译 Dokploy 控制台，不修改服务器或原项目。</p></header>
    {error && <div className="message error">{error}</div>}
    {notice && <div className="message success">{notice}</div>}
    <section className="card">
      <label className="switch"><input type="checkbox" checked={value.enabled} disabled={busy} onChange={() => void updateSettings((current) => ({ ...current, enabled: !current.enabled }))} /> 全局启用</label>
      <p className="muted">只有已授权且启用的 Dokploy 地址会注入翻译脚本。</p>
    </section>
    <section className="card">
      <h2>Dokploy 地址</h2>
      <div className="add"><input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="https://panel.example.com 或 http://localhost:3000" onKeyDown={(event) => { if (event.key === "Enter") void addSite(); }} /><button disabled={busy} onClick={() => void addSite()}>添加并授权</button></div>
      <ul>{value.sites.map((site) => <li key={site.id}><span><strong>{site.origin}</strong><small>{sitesPermissions[site.origin] ? "已授权" : "权限已撤销"} · {site.enabled ? "已启用" : "已停用"}</small></span><span className="actions">{!sitesPermissions[site.origin] && <button onClick={() => void regrant(site)}>重新授权</button>}<button onClick={() => void toggleSite(site)}>{site.enabled ? "停用" : "启用"}</button><button className="danger" onClick={() => void removeSite(site)}>删除</button></span></li>)}</ul>
      {value.sites.length === 0 && <p className="muted">尚未添加 Dokploy 地址。</p>}
    </section>
    <section className="card">
      <h2>调试与词典</h2>
      <label className="switch"><input type="checkbox" checked={value.debugUnknown} disabled={busy} onChange={() => void updateSettings((current) => ({ ...current, debugUnknown: !current.debugUnknown }))} /> 记录未翻译文本</label>
      <p className="muted">当前记录 {unknown.length} 条，仅保存在本地。</p>
      <div className="button-row"><button onClick={() => void exportData()}>导出配置</button><button onClick={() => importRef.current?.click()}>导入配置</button><button className="secondary" onClick={() => void clearUnknown()}>清空记录</button><input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importData(file); event.currentTarget.value = ""; }} /></div>
      {unknown.length > 0 && <details><summary>查看最近未翻译文本</summary><ul className="unknown-list">{unknown.slice(0, 20).map((entry) => <li key={`${entry.url}-${entry.text}`}><code>{entry.text}</code><small>{entry.tagName} · {entry.url}</small></li>)}</ul></details>}
    </section>
    <footer>词典：{dictionaryMeta.dokployVersion} · 词典版本 {dictionaryMeta.dictionaryVersion} · 支持 Chromium MV3</footer>
  </main>;
}

createRoot(document.getElementById("root")!).render(<App />);
