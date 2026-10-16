# 安装和使用

## 从 GitHub Release 安装

1. 在 Releases 下载最新的 `dokploy-translator-*.zip` 或 `dokploy-translator-*-chrome-mv3.tar.gz`。
2. 解压压缩包。
3. 打开 Chrome 或 Edge 的扩展管理页：`chrome://extensions` 或 `edge://extensions`。
4. 开启“开发者模式”。
5. 点击“加载已解压的扩展”，选择解压后的 `chrome-mv3` 目录。
6. 点击扩展图标进入设置，添加 Dokploy 的完整地址并授权。

扩展只会处理设置页中已授权的 origin。地址可以是 `http://localhost:3000`、内网 IP 或 HTTPS 域名。

## 本地开发

```bash
pnpm install
pnpm dev
```

生产构建输出在 `.output/chrome-mv3`。首次安装或重新加载扩展后，需要刷新已经打开的 Dokploy 标签页。

## 常见问题

- 页面仍是英文：确认地址已授权且启用，然后刷新 Dokploy 页面。
- 权限显示已撤销：在设置页点击“重新授权”。
- 用户生成的项目名、域名、日志、终端和代码内容保持原文，这是为了避免破坏业务数据。
- 关闭全局开关后，刷新页面可以恢复 Dokploy 的原始英文界面。
