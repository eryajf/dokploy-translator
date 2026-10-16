# Dokploy 中文化扩展

基于 WXT 的 Chromium Manifest V3 扩展，为用户指定的 Dokploy 实例提供本地中文界面。

## 特性

- 只处理用户明确授权的 Dokploy origin。
- 通过 Content Script 修改 DOM，不改动 Dokploy 源码、接口或服务器数据。
- 支持 Next.js 客户端路由、Portal 弹窗、下拉菜单和 Toast 的动态翻译。
- 跳过输入框、代码编辑器、终端、日志和用户生成内容。
- 翻译节点可恢复，禁用站点后页面回到原文。

## 开发

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm test:e2e
pnpm zip
pnpm check:release
```

运行 `pnpm extract` 会扫描 `dokploy/apps/dokploy` 的 TSX/TS 文案，生成待人工审核的候选词典。

在 Chrome 的 `chrome://extensions` 中打开开发者模式，然后加载 `.output/chrome-mv3`。

发布和版本流程见 [docs/RELEASE.md](docs/RELEASE.md)，安装说明见 [docs/INSTALL.md](docs/INSTALL.md)。向 `main` 分支提交会运行 CI；推送 `v0.1.0` 形式的标签会自动构建 Chrome MV3 压缩包并创建 GitHub Release。

## 权限和隐私

扩展仅使用 `storage`、`scripting` 和用户运行时授予的站点权限。翻译完全在本地完成，不读取或上传 Dokploy API 数据。

## 词典维护

`pnpm extract` 会扫描 `dokploy/apps/dokploy`，生成候选文案和敏感内容报告。正式翻译维护在 `src/translation/core-dictionary.ts`，扩展升级后应先运行提取，再审核候选差异。
