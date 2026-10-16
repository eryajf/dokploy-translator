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
    await expect(page.locator("#dynamic button")).toHaveText("部署日志");
    await expect(page.locator("#dynamic p")).toHaveText("api-service 的日志");
    await context.close();
  });
});
