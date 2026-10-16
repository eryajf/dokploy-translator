import { describe, expect, it } from "vitest";
import { translateText } from "../../src/translation/dictionary";
describe("dictionary", () => {
  it("translates exact text while preserving surrounding whitespace", () => { expect(translateText("  Home ")).toBe("  首页 "); });
  it("leaves unknown and dynamic values untouched", () => { expect(translateText("my-project")).toBeUndefined(); });
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
});
