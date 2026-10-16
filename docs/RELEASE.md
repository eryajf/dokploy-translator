# 发布手册

## 版本规则

使用语义化版本号，例如 `v0.1.0`。发布前同步 `package.json` 中的版本号，并更新 `CHANGELOG.md`。

## 本地发布检查

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm exec tsc --noEmit
pnpm build
pnpm check:release
pnpm zip
```

Chrome MV3 目录位于 `.output/chrome-mv3`，WXT 生成的 zip 位于 `.output`。

## GitHub Actions

- `.github/workflows/ci.yml` 在 Pull Request 和主分支提交上运行单元测试、类型检查、构建和发布检查。
- `.github/workflows/release.yml` 在推送 `v*.*.*` 标签后运行完整检查，生成 unpacked Chrome MV3 目录、WXT zip 和 tar.gz，并创建 GitHub Release。

发布命令示例：

```bash
git add .
git commit -m "chore: release v0.1.0"
git tag v0.1.0
git push origin main --tags
```

## 发布前人工检查

- 在 Chrome 和 Edge 中加载产物。
- 添加 localhost、内网 IP 和 HTTPS Dokploy 地址各一个。
- 验证权限撤销、重新授权、启用和删除站点。
- 验证登录页、项目页、部署页、数据库页、服务器页、SSO、DNS、备份和高级表单。
- 验证暗色模式、Portal 弹窗、Toast、客户端路由和刷新。
- 确认 `dictionary.sensitive.json` 中没有凭据、Token 或私有 URL 被加入正式词典。
