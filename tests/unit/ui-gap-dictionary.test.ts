import { describe, expect, it } from "vitest";
import { dashboardGapTranslations } from "../../src/translation/dashboard-gap-dictionary";
import { deploymentGapTranslations } from "../../src/translation/deployment-gap-dictionary";
import { translateText } from "../../src/translation/dictionary";
import { finalGapTranslations } from "../../src/translation/final-gap-dictionary";
import { longTailTranslations } from "../../src/translation/long-tail-dictionary";
import { pageTranslations } from "../../src/translation/page-dictionary";
import { settingsGapTranslations } from "../../src/translation/settings-gap-dictionary";

const flows = {
  finalGap: [
    ["· max_queued_events:", "· 最大排队事件数（max_queued_events）："],
    ["Compose:", "Compose："],
    ["Inotify", "Inotify 文件事件监控"],
    ["max_user_instances:", "实例数 / 上限（max_user_instances）："],
    ["max_user_watches:", "最大监视数（max_user_watches）："],
    ["Stack", "堆栈"],
  ],
  dashboard: [
    ["App name is required", "应用名称为必填项"],
    ["Service Created", "服务已创建"],
    ["Environment duplicated successfully", "环境复制成功"],
    ["Container removed successfully", "容器删除成功"],
    ["Could not read network IP usage:", "无法读取网络 IP 使用情况："],
    ["Build cache pruned", "构建缓存已清理"],
    ["Next showcase slide", "下一张展示幻灯片"],
    ["Sign in with GitHub", "使用 GitHub 登录"],
    ["— Status:", "—— 状态："],
    ["services? This action cannot be undone.", "个服务吗？此操作无法撤销。"],
    ["? This will redeploy/restart the selected services.", "？这将重新部署或重启所选服务。"],
    ["2FA", "双重认证"],
  ],
  deployment: [
    ["Application deployed successfully", "应用部署成功"],
    ["Application reloaded successfully", "应用重新加载成功"],
    ["Compose deployed with fresh volumes", "Compose 已使用全新数据卷部署"],
    ["Build Server Settings Updated", "构建服务器设置已更新"],
    ["Are you sure you want to delete this volume?", "确定要删除此数据卷吗？"],
    ["Configure your Docker Compose file for this service.", "为此服务配置 Docker Compose 文件。"],
    [", but the volume of this database is mounted at", "，但此数据库的数据卷挂载在"],
    ["and", "和"],
    ["\"web\" and/or \"websecure\" is used by default.", "默认使用“web”和/或“websecure”。"],
    ["Check to save configs with Go templating (e.g.", "勾选后可保存包含 Go 模板语法的配置（例如"],
  ],
  settings: [
    ["Access Key Id", "访问密钥 ID"],
    ["Access Key ID", "访问密钥 ID"],
    ["App Name is required", "请填写应用名称"],
    ["API key copied to clipboard", "API 密钥已复制到剪贴板"],
    ["API Key Generated Successfully", "API 密钥已生成"],
    ["Add domain", "添加域名"],
    [". Secrets are fetched at deploy time and never stored in Dokploy.", "。密钥在部署时获取，绝不会存储在 Dokploy 中。"],
    ["\"? Users will no longer be able to sign in with this IdP.", "”吗？用户将无法再通过此身份提供商登录。"],
    ["(Should be set to 'deny' for security)", "（为保障安全，应设置为“deny”）"],
    ["Add Cloudflare or Route53 credentials to manage domain records without leaving Dokploy.", "添加 Cloudflare 或 Route53 凭据，即可直接在 Dokploy 中管理域名记录。"],
  ],
  pages: [
    ["Already have account?", "已有账户？"],
    ["Sign in with Passkey", "使用通行密钥登录"],
    ["Duplicate Services", "复制服务"],
    ["Build-time Secrets", "构建时密钥"],
    ["Queue is empty", "队列为空"],
    ["Select target project", "选择目标项目"],
  ],
  longHelp: [
    ["Describe the type of template you need, its purpose, and any specific features you'd like to include.", "描述所需模板的类型、用途以及希望包含的具体功能。"],
    ["Add paths to watch for changes. When files in these paths change, a new deployment will be triggered.", "添加要监视变化的路径。路径中的文件变化时会触发新的部署。"],
    ["Having rollbacks enabled increases storage usage. Be careful with this option. Note that manually cleaning the cache may delete rollback images, making them unavailable for future rollbacks.", "启用回滚会增加存储用量，请谨慎使用。手动清理缓存可能删除回滚镜像，导致后续无法回滚。"],
    ["Isolated deployment is deprecated. Use the Networks section above to attach networks per service and detach them from dokploy-network — it is declarative and does not break on restarts.", "隔离部署已弃用。请使用上方的网络部分为每个服务挂载网络，并从 dokploy-network 分离；这种方式是声明式的，重启后也不会失效。"],
    ["Enter one of the backup codes you received when setting up 2FA", "输入设置双因素认证时获得的任一备份验证码"],
    ["Hey! Looks like the build has been running for more than 10 minutes. Would you like to cancel this deployment?", "构建似乎已运行超过 10 分钟。要取消此次部署吗？"],
  ],
} as const;

const gapModules = {
  dashboard: dashboardGapTranslations,
  deployment: deploymentGapTranslations,
  settings: settingsGapTranslations,
  finalGap: finalGapTranslations,
};

// These are exact technical values, not a blanket exemption for short UI text.
const protectedValues = [
  "--color-", "-copy", "-form-item", "-form-item-description", "-form-item-message", "-ipam-",
  ".detachDokployNetwork", ".gateway", ".ipRange", ".log.txt", ".md", ".networkIds", ".subnet",
  "| Dokploy", "AI", "bridge", "build", "chart-", "checkout:", "CI/CD",
  "command", "default", "default-address-pools:", "docker info | grep Swarm",
  "docker stats", "Dokploy", "environment", "environment.", "Esc", "expose",
  "flex items-center justify-center font-mono text-[11px] tabular-nums size-5 rounded-full",
  "font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2",
  "GB (", "GB /", "GB ↓", "GB)", "GHz", "github", "gitlab",
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity",
  "group flex items-center rounded-md hover:bg-muted", "h-2.5 w-2.5 rounded-full",
  "ID", "ID:", "image", "IP:", "IPAM", "ipamConfig.", "KB", "KB)", "libsql",
  "max_queued_events:", "ms", "object-contain shrink-0",
  "overlay", "ports", "project.", "restart", "services.", "size-2 rounded-full shrink-0",
  "size-4 mr-1", "size-4 text-muted-foreground transition-transform", "SSL", "SSO",
  "text-4xl sm:text-5xl leading-[1.05] tracking-tight", "text-sm font-medium transition-colors pb-6 last:pb-0",
  "translateX(-", "trial:", "URL:", "User not found for email:", "UTC", "var(--color-", "vault.",
  "version", "w-px flex-1 min-h-7 my-1.5", "docker compose up -d", "/etc/docker/daemon.json",
  "https://idp.example.com/sso", "production-api-server", "API_URL=https://example.com",
] as const;

describe("UI gap dictionary regressions", () => {
  for (const [module, entries] of Object.entries(flows)) {
    describe(module, () => {
      for (const [source, target] of entries) {
        it(`translates the complete UI text: ${source}`, () => {
          expect(translateText(source)).toBe(target);
        });
      }
    });
  }

  for (const [module, translations] of Object.entries(gapModules)) {
    it(`keeps every ${module} export exactly reachable through translateText`, () => {
      expect(Object.keys(translations).length).toBeGreaterThan(0);
      for (const [source, target] of Object.entries(translations)) {
        expect(translateText(source), `${module}: ${JSON.stringify(source)}`).toBe(target);
      }
    });
  }

  it("keeps page flow entries connected to their source module", () => {
    for (const [source, target] of flows.pages) expect(pageTranslations[source]).toBe(target);
  });

  it.each([
    ["Configure health check settings", "配置健康检查设置"],
    ["Configure restart policy", "配置重启策略"],
    ["Enable Isolated Deployment", "启用隔离部署"],
    ["Download logs as text file", "以文本文件下载日志"],
    ["Let's get your first app", "开始创建你的第一个应用"],
    ["Start 7-day free trial", "开始 7 天免费试用"],
  ])("keeps the complete long-tail module translation: %s", (source, target) => {
    expect(longTailTranslations[source]).toBe(target);
    expect(translateText(source)).toBe(target);
  });

  it("does not collapse distinct case-sensitive UI labels", () => {
    expect(translateText("App name is required")).toBe("应用名称为必填项");
    expect(translateText("App Name is required")).toBe("请填写应用名称");
    expect(translateText("Add Domain")).toBe("添加域名");
    expect(translateText("Add domain")).toBe("添加域名");
  });

  it("normalizes whitespace and JSX entities without losing the full translation", () => {
    expect(translateText(" \nEnvironment duplicated successfully\t ")).toBe(" \n环境复制成功\t ");
    expect(translateText("Access\nKey\tID")).toBe("访问密钥 ID");
    expect(translateText("(Should be set to &apos;deny&apos; for security)")).toBe("（为保障安全，应设置为“deny”）");
    expect(translateText("&mdash; Status:")).toBe("—— 状态：");
    expect(translateText("&quot;web&quot; and/or &quot;websecure&quot; is used by default.")).toBe("默认使用“web”和/或“websecure”。");
  });

  it("translates short JSX segments and toast errors instead of treating them as technical values", () => {
    expect(translateText("and")).toBe("和");
    expect(translateText("day")).toBe("天");
    expect(translateText("template")).toBe("模板");
    expect(translateText("Error starting checkout")).toBe("发起结账时出错");
    expect(translateText("Failed to update log cleanup schedule:")).toBe("更新日志清理计划失败：");
  });

  it.each(protectedValues)("preserves the exact technical or non-UI value: %s", (source) => {
    // An identity entry and no dictionary match both preserve the original DOM text.
    expect(translateText(source) ?? source).toBe(source);
    for (const translations of Object.values(gapModules)) {
      expect(translations[source] ?? source).toBe(source);
    }
  });
});
