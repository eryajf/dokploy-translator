import { test, expect } from "@playwright/test";
import path from "node:path";
import { chromium } from "@playwright/test";

test.describe("Dokploy translator extension", () => {
  test("translates static and dynamic UI while preserving code blocks", async () => {
    const extensionPath = path.resolve(".output/chrome-mv3-e2e");
    const context = await chromium.launchPersistentContext("", {
      headless: true,
      channel: "chromium",
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173");
    await expect(page.locator("h1")).toHaveText("首页");
    await expect(page.locator("h2").nth(0)).toHaveText("数据库类型");
    await expect(page.locator("h2").nth(1)).toHaveText("SSO 认证");
    await expect(page.locator("h2").nth(2)).toHaveText("DNS 配置指南");
    await expect(page.locator("h2").nth(3)).toHaveText("卷备份");
    await expect(page.locator("h2").nth(4)).toHaveText("CPU 限制");
    await expect(page.locator("#save")).toHaveText("保存");
    await expect(page.locator("#save")).toHaveAttribute("title", "保存");
    await expect(page.locator("#search")).toHaveAttribute("placeholder", "搜索");
    await expect(page.locator("#code")).toHaveText("Save");
    await expect(page.locator("[aria-hidden=\"true\"]")).toHaveText("Save");
    await expect(page.locator("#account h3")).toHaveText("通行密钥");
    await expect(page.locator("#account button")).toHaveText("取消关联");
    await expect(page.locator("#account button")).toHaveAttribute("title", "要移除此通行密钥吗？");
    await expect(page.locator("#network")).toHaveText("网络已更新。请重新部署服务以应用更改。");
    await expect(page.locator("#user-value")).toHaveValue("production-api-server");
    await expect(page.locator("#user-value")).toHaveAttribute("placeholder", "通行密钥名称");
    await expect(page.locator("#command")).toHaveText("npm run build");
    await expect(page.locator("#unknown")).toHaveText("Future Dokploy action");
    await expect(page.locator("#memory-template")).toHaveText("已用：1.25GiB / 限额：512MiB");
    await expect(page.locator("#dns-template")).toHaveText("要删除 HTTPS 记录“app.example.com”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。");
    await expect(page.locator("#billing-feature")).toHaveText("不限应用和数据库数量");
    await expect(page.locator("#log-line-count")).toHaveText("2500 行");
    await expect(page.locator("#import-count")).toHaveText("导入 1 个密钥");
    await expect(page.locator("#move-count")).toHaveText("选择目标项目和环境以移动 1 项服务");
    await expect(page.locator("#overview-count")).toHaveText("1 项服务 总计");
    await expect(page.locator("#project-count")).toHaveText("1 项服务");
    await expect(page.locator("#config-key")).toHaveText("services");
    await expect(page.locator("#mount-path")).toHaveAttribute("placeholder", "secret");
    await page.locator("#update-context-counts").click();
    await expect(page.locator("#import-count")).toHaveText("导入 2 个密钥");
    await expect(page.locator("#move-count")).toHaveText("选择目标项目和环境以移动 2 项服务");
    await expect(page.locator("#overview-count")).toHaveText("2 项服务 总计");
    await expect(page.locator("#project-count")).toHaveText("2 项服务");
    await expect(page.locator("#preview-label input")).toHaveAttribute("placeholder", "Enter a label (e.g. enhancements, needs-review)");
    await page.locator("#preview-label input").fill("needs-review");
    await page.locator("#preview-label button").click();
    await expect(page.locator("#preview-label output")).toHaveText("needs-review");
    await expect(page.locator("#watch-path input")).toHaveAttribute("placeholder", "Enter a path to watch (e.g., src/**, dist/*.js)");
    await page.locator("#watch-path input").fill("src/**");
    await page.locator("#watch-path button").click();
    await expect(page.locator("#watch-path output")).toHaveText("src/**");
    await expect(page.locator("#middleware input")).toHaveAttribute("placeholder", "e.g., rate-limit@file, auth@file");
    await page.locator("#middleware input").fill("rate-limit@file");
    await page.locator("#middleware button").click();
    await expect(page.locator("#middleware output")).toHaveText("rate-limit@file");
    await expect(page.locator("#middleware input")).toHaveValue("");
    await expect(page.locator("#logs h3")).toHaveText("部署日志");
    await expect(page.locator("#logs button")).toHaveText("保存");
    await expect(page.locator("#logs button")).toHaveAttribute("title", "保存");
    await expect(page.locator("#raw-log")).toHaveText("SaveCancelFuture private log message");
    await expect(page.locator("#raw-log")).toHaveAttribute("title", "Save");
    await expect(page.locator("#raw-log strong")).toHaveAttribute("title", "Save");
    await expect(page.locator("#dynamic-raw-log")).toHaveText("SaveCancel");
    await expect(page.locator("#dynamic-raw-log strong")).toHaveAttribute("title", "Save");
    await expect(page.locator("#log-ui")).toHaveText("保存");
    await expect(page.locator("#outside-log")).toHaveText("保存");
    await expect(page.locator("#dynamic button")).toHaveText("部署日志");
    await expect(page.locator("#dynamic p")).toHaveText("api-service 的日志");
    await expect(page.locator("#template-toast")).toHaveText("网络“production-api-server”已根据 Docker 中的配置更新");
    await context.close();
  });
});
