import { describe, expect, it } from "vitest";
import { translateText } from "../../src/translation/dictionary";
describe("dictionary", () => {
  it("normalizes exact entities once, then collapses decoded whitespace", () => {
    const custom = { "Alpha & Beta": "甲和乙", "Alpha Beta": "甲乙", "Alpha &amp; Beta": "一层编码" };
    expect(translateText("Alpha &amp; Beta", "text", { "Alpha & Beta": "甲和乙" })).toBe("甲和乙");
    expect(translateText(" Alpha&nbsp;  Beta ", "text", custom)).toBe(" 甲乙 ");
    expect(translateText("Alpha &amp;amp; Beta", "text", custom)).toBe("一层编码");
    expect(translateText("Alpha &amp;amp; Beta", "text", { "Alpha & Beta": "不能重复解码" })).toBeUndefined();
  });

  it("never normalizes raw runtime captures", () => {
    expect(translateText('Role "a&amp;b&nbsp;  c" updated')).toBe('角色“a&amp;b&nbsp;  c”已更新');
    expect(translateText("Logs for a&amp;b&nbsp;  c")).toBe("a&amp;b&nbsp;  c 的日志");
  });

  it("translates exact text while preserving surrounding whitespace", () => { expect(translateText("  Home ")).toBe("  首页 "); });
  it.each([
    "my-project", "production-api-server", "serverName", "SERVER_NAME",
    "John", "Doe", "Vandelay Industries", "username", "local", "swarm", "primary", "production",
    "Future Dokploy action", "No clusters found", "Add a new cluster", "Unknown server action",
    "git add .", "npm run build", "pnpm run build", "docker compose up -d", "ssh user@host",
    "https://example.com/api", "Open https://example.com", "Open example.com", "Open /var/log",
    "API_URL=https://example.com", "server: production", "Set the port to 3000",
    "Set the configuration", "Add a new API key", "Choose a new serverName", "Add a new my-server",
    "Add a new ${name}", "Add a new {name}", "Add a new server && build",
  ])("leaves unknown or operational text untouched: %s", (source) => {
    expect(translateText(source)).toBeUndefined();
  });
  it("supports safe operational templates and custom translations", () => {
    expect(translateText("Delete my-service")).toBe("删除 my-service");
    expect(translateText("Logs for api")).toBe("api 的日志");
    expect(translateText("Build: api")).toBe("构建：api");
    expect(translateText("My custom label", "text", { "My custom label": "我的自定义标签" })).toBe("我的自定义标签");
    expect(translateText("Configure OIDC or SAML identity providers for enterprise sign-in. Users can sign in with their organization's IdP.")).toContain("配置 OIDC 或 SAML");
  });
  it("covers the core dashboard and deployment flow", () => {
    expect(translateText("Projects")).toBe("项目");
    expect(translateText("Create Environment")).toBe("创建环境");
    expect(translateText("Deploy Application")).toBe("部署应用");
    expect(translateText("Deployment Logs")).toBe("部署日志");
    expect(translateText("Rollback to this deployment")).toBe("回滚到这次部署");
  });
  it("covers database and infrastructure pages", () => {
    expect(translateText("Database Type")).toBe("数据库类型");
    expect(translateText("Restart the PostgreSQL service without rebuilding")).toBe("重启 PostgreSQL 服务而不重新构建");
    expect(translateText("Docker Swarm")).toBe("Docker Swarm");
    expect(translateText("Create network")).toBe("创建网络");
    expect(translateText("Certificate Provider")).toBe("证书提供商");
  });
  it("covers settings and account pages", () => {
    expect(translateText("API/CLI Keys")).toBe("API/CLI 密钥");
    expect(translateText("Notification Settings")).toBe("通知设置");
    expect(translateText("Manage Subscription")).toBe("管理订阅");
    expect(translateText("Save Changes")).toBe("保存更改");
    expect(translateText("Danger Zone")).toBe("危险操作");
  });

  it("only falls back for reviewed UI sentence templates", () => {
    expect(translateText("Add a new server")).toBe("添加新服务器");
    expect(translateText("  Add a new server.  ")).toBe("  添加新服务器。  ");
    expect(translateText("Please select your server")).toBe("请选择你的服务器");
    expect(translateText("Your server is available")).toBeUndefined();
  });

  it("keeps custom, exact and pattern translations ahead of fallback safety checks", () => {
    expect(translateText("Save Changes", "text", { "Save Changes": "自定义保存" })).toBe("自定义保存");
    expect(translateText("npm run build", "text", { "npm run build": "自定义构建命令" })).toBe("自定义构建命令");
    expect(translateText("Docker Swarm")).toBe("Docker Swarm");
    expect(translateText("No services found.")).toBe("未找到服务。");
    expect(translateText("Logs for production-api-server")).toBe("production-api-server 的日志");
    expect(translateText("Delete my-service")).toBe("删除 my-service");
  });
});
