import { describe, expect, it } from "vitest";
import { translateText } from "../../src/translation/dictionary";

const modules = {
  "高级部署表单": [
    ["CPU Limit", "CPU 限制"],
    ["Memory Reservation", "内存预留"],
    ["Placement constraints", "放置约束"],
    ["Save Health Check", "保存健康检查"],
    ["Save Restart Policy", "保存重启策略"],
    ["Additional Port Mappings", "附加端口映射"],
    ["Watch Paths", "监视路径"],
  ],
  "服务器与集群": [
    ["Setup Server", "设置服务器"],
    ["Server diagnostics", "服务器诊断"],
    ["Generate ED25519 SSH Key", "生成 ED25519 SSH 密钥"],
    ["Docker Swarm Overview", "Docker Swarm 概览"],
    ["Swarm is reachable but service listing failed.", "可以连接 Swarm，但服务列表获取失败。"],
    ["Enable GPU Support?", "启用 GPU 支持？"],
    ["Update Traefik Environment", "更新 Traefik 环境变量"],
  ],
  SSO: [
    ["Single Sign-On (SSO)", "单点登录（SSO）"],
    ["Enforce SSO", "强制使用 SSO"],
    ["Add an OIDC or SAML provider so users can sign in with their organization&apos;s IdP (e.g. Okta, Azure AD).", "添加 OIDC 或 SAML 提供商，让用户使用组织的 IdP（例如 Okta、Azure AD）登录。"],
    ["SCIM provisioning", "SCIM 用户配置"],
    ["Client Secret", "客户端密钥"],
  ],
  DNS: [
    ["DNS Configuration Guide", "DNS 配置指南"],
    ["Validate DNS", "验证 DNS"],
    ["Checking DNS...", "正在检查 DNS…"],
    ["Connect a DNS provider so Dokploy can create the A/CNAME record for a domain instead of you setting it up by hand.", "连接 DNS 提供商，让 Dokploy 自动为域名创建 A/CNAME 记录，无需手动配置。"],
    ["SSL Certificate Provider", "SSL 证书提供商"],
  ],
  备份: [
    ["Volume Backups", "卷备份"],
    ["Run Manual Volume Backup", "执行手动卷备份"],
    ["Keep Latest Backups", "保留最新备份"],
    ["Loading backup files...", "正在加载备份文件…"],
    ["To create a backup it is required to set at least 1 provider.", "创建备份至少需要配置一个提供商。"],
  ],
  通知与计划任务: [
    ["Add Notification", "添加通知"],
    ["Test Notification", "测试通知"],
    ["Scheduled Tasks", "计划任务"],
    ["Cron Job", "Cron 任务"],
    ["Choose a predefined schedule or enter a custom cron expression", "选择预设计划或输入自定义 Cron 表达式"],
  ],
} as const;

describe("module dictionary coverage", () => {
  for (const [module, entries] of Object.entries(modules)) {
    it(`covers ${module}`, () => {
      for (const [source, target] of entries) expect(translateText(source)).toBe(target);
    });
  }

  it("keeps operational identifiers and user data intact", () => {
    expect(translateText("my-production-server")).toBeUndefined();
    expect(translateText("https://idp.example.com/sso")).toBeUndefined();
    expect(translateText("1000000000 (1 CPU)")).toBeUndefined();
  });
});
