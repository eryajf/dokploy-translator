import { defineConfig } from "wxt";

export default defineConfig({
  filterEntrypoints: process.env.WXT_E2E === "true" ? undefined : ["background", "dokploy-script", "options"],
  manifest: {
    name: "Dokploy 中文化",
    description: "为 Dokploy 控制台提供本地中文界面。",
    version: "0.1.0",
    permissions: ["storage", "scripting"],
    optional_host_permissions: ["http://*/*", "https://*/*"],
    icons: {
      16: "/icon-16.png",
      32: "/icon-32.png",
      48: "/icon-48.png",
      128: "/icon-128.png",
    },
    action: {
      default_title: "Dokploy 中文化设置",
      default_icon: {
        16: "/icon-16.png",
        32: "/icon-32.png",
        48: "/icon-48.png",
      },
    },
  },
  modules: [],
  hooks: {
    "build:manifestGenerated": (_wxt, manifest) => {
      if (process.env.WXT_E2E !== "true") return;
      manifest.host_permissions ??= [];
      manifest.host_permissions.push("http://127.0.0.1:4173/*");
    },
  },
});
