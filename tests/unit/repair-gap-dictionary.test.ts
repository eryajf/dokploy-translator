import { describe, expect, it } from "vitest";
import { assessCandidate } from "../../src/translation/coverage-review";
import type { CoverageCandidate } from "../../src/translation/coverage-review";
import generated from "../../src/translation/dictionary.generated.json";
import { normalizeExactKey } from "../../src/translation/normalize";
import { repairGapTranslations } from "../../src/translation/repair-gap-dictionary";

const candidates: CoverageCandidate[] = generated.candidates;
const entries = Object.entries(repairGapTranslations);
// Exercise this module alone: main owns dictionary.ts integration separately.
const exact = new Map(entries.map(([source, target]) => [normalizeExactKey(source), target]));
const swarmFile = "components/dashboard/application/advanced/cluster/modify-swarm-settings.tsx";
const swarmDescriptions = [
  {
    source: "Control which nodes service tasks can be scheduled on. Constraints (node.id==xyz), Preferences (spread.node.labels.zone), MaxReplicas, and Platforms specify task placement rules.",
    risk: "ui",
    tokens: ["Constraints", "node.id==xyz", "Preferences", "spread.node.labels.zone", "MaxReplicas", "Platforms"],
  },
  {
    source: "Add metadata to services using labels. Labels are key-value pairs (e.g., com.example.foo=bar) for organizing and filtering services.",
    risk: "ui",
    tokens: ["com.example.foo=bar"],
  },
  {
    source: "Time to wait before forcefully killing a container. Specified in nanoseconds (e.g., 10000000000 = 10 seconds). Allows containers to shutdown gracefully.",
    risk: "ui",
    tokens: ["10000000000", "10 秒", "纳秒"],
  },
] as const;
const redactedSources = new Set<string>(swarmDescriptions.map(({ source }) => source));
const generatedEntries = entries.filter(([source]) => !redactedSources.has(source));

const excludedValues = [
  "AAAA", "AI", "API URL", "Bash", "Bitbucket", "bridge", "CAA", "CI/CD", "CNAME", "configs",
  "created", "dead", "Doe", "done", "email@dokploy.com", "error", "exited", "false", "Ghost",
  "Git", "Gitea", "Gitea URL", "Github", "GitHub URL", "GitLab", "HTTP", "HTTPS", "IP:", "John",
  "Let's Encrypt", "MSA/SLA", "MX", "MySQL", "networks", "NS", "overlay", "paused", "PTR",
  "removing", "restarting", "root", "sctp", "secret", "secrets", "services", "SRV", "tcp", "TXT",
  "udp", "Uptime Kuma", "URL:", "Vandelay Industries", "volumes", "WordPress",
  "http: routers: router-name: rule: Host('domain.com') service: container-name entryPoints: - web tls: false middlewares: []",
  // Literal commands and Swarm config tokens must not become standalone matches.
  "docker build", "sudo", "Target", "Constraints", "MaxReplicas", "Platforms", "node.id==xyz",
  "spread.node.labels.zone", "com.example.foo=bar", "10000000000",
] as const;

describe("repair gap exact UI dictionary", () => {
  it("contains 70 generated UI entries and three source-reviewed Swarm descriptions", () => {
    expect(entries).toHaveLength(73);
    expect(generatedEntries).toHaveLength(70);
    expect(exact.size).toBe(entries.length);
    for (const [source, target] of entries) {
      expect(normalizeExactKey(source), source).toBe(source);
      expect(target.trim(), source).toBe(target);
      expect(target, source).toMatch(/\p{Script=Han}/u);
      expect(normalizeExactKey(target), source).not.toBe(source);
      expect(target, source).not.toMatch(/\[REDACTED|\{\{/u);
    }
  });

  it.each(generatedEntries)("covers real generated UI copy with its exact target: %s", (source, target) => {
    const candidate = candidates.find((entry) => entry.source === source);
    expect(candidate, source).toBeDefined();
    expect(candidate?.risk, source).toBe("ui");
    expect(candidate?.occurrences?.length, source).toBeGreaterThan(0);
    const result = assessCandidate(candidate!, { exact, patterns: [], reviews: [] });
    expect(result.status).toBe("translated");
    expect(result.method).toBe("exact");
    expect(result.translation).toBe(target);
  });

  it.each(swarmDescriptions)("keeps the reviewed Swarm prose and its literal tokens: $source", ({ source, risk, tokens }) => {
    expect(candidates.some((candidate) => candidate.source === source && candidate.risk === risk
      && candidate.occurrences?.some((location) => location.file === swarmFile))).toBe(true);
    const target = repairGapTranslations[source];
    expect(target).toMatch(/\p{Script=Han}/u);
    for (const token of tokens) expect(target).toContain(token);
    expect(assessCandidate({ source, file: swarmFile, kind: "string-literal", risk: "ui" }, {
      exact, patterns: [], reviews: [],
    })).toMatchObject({ status: "translated", method: "exact", translation: target });
  });

  it.each([
    ["1 Backup per Database", "每个数据库可保留 1 份备份"],
    ["1 Scheduled Job per Application", "每个应用可配置 1 个定时任务"],
    ["1 Volume Backup per Application", "每个应用可保留 1 份数据卷备份"],
    ["Basic RBAC (Admin, Developer)", "基础 RBAC（管理员、开发者）"],
    ["Basic RBAC + 2FA", "基础 RBAC 和双因素认证"],
    ["Fine-grained RBAC", "细粒度 RBAC"],
    ["Unlimited Deployments", "不限部署次数"],
    ["Unlimited deployments", "不限部署次数"],
    ["Unlimited users & environments", "不限用户和环境数量"],
    ["Setup 1 server", "可配置 1 台服务器"],
    ["Setup 1 Server", "可配置 1 台服务器"],
    ["Setup up to 3 Servers", "最多可配置 3 台服务器"],
    ["All Incoming features", "所有即将推出的功能"],
    ["White Labeling", "品牌定制"],
    ["Domain Created", "域名已创建"],
    ["Domain Updated", "域名已更新"],
    ["Error creating the domain", "域名创建失败"],
    ["Redeploy the compose to apply the changes.", "请重新部署 Compose 以应用更改。"],
    ["Drag & drop a logo or click to upload", "拖放徽标或点击上传"],
    ["Sendgrid service opensource analogue", "SendGrid 服务的开源替代方案"],
    ["--- No time found ---", "--- 未找到时间信息 ---"],
    ["Layers cached by \"docker build\" on this server will appear here.", "此服务器上由“docker build”缓存的镜像层将显示在这里。"],
    ["No sudo access (required for non-root)", "无 sudo 权限（非 root 用户必须具备此权限）"],
    ["Use \"root\" or a non-root user with passwordless sudo access.", "请使用“root”用户，或具有免密 sudo 权限的非 root 用户。"],
    ["You can connect as root or as a non-root user with passwordless sudo access. If using a non-root user, ensure passwordless sudo is configured.", "您可以使用 root 用户或具有免密 sudo 权限的非 root 用户连接。如果使用非 root 用户，请确保已配置免密 sudo。"],
    ["Failed to toggle dashboard. Please check if port 8080 is available.", "切换控制台启用状态失败，请检查端口 8080 是否可用。"],
  ])("uses the reviewed complete translation: %s", (source, target) => {
    expect(repairGapTranslations[source]).toBe(target);
  });

  it.each([
    // These are untranslated UI nouns, NOT technical-English exemptions. The
    // runtime currently cannot distinguish them using a global exact map.
    ["secret", "components/shared/vault-import-dialog.tsx", "jsx-text"],
    ["services", "components/dashboard/overview/show-overview-services.tsx", "jsx-text"],
    ["services", "components/dashboard/projects/show.tsx", "jsx-text"],
    ["services", "pages/dashboard/project/[projectId]/environment/[environmentId].tsx", "jsx-text"],
    // The same keys also have real technical uses that must stay in English.
    ["secret", "components/dashboard/settings/vault/handle-vault-provider.tsx", "attribute"],
    ["services", "components/dashboard/compose/general/randomize-compose.tsx", "jsx-text"],
    ["services", "components/shared/code-editor.tsx", "string-literal"],
  ])("leaves ambiguous %s at %s for context-aware handling, not a global exact rule", (source, file, kind) => {
    const candidate = candidates.find((entry) => entry.source === source);
    expect(candidate, source).toBeDefined();
    expect(candidate?.occurrences).toEqual(expect.arrayContaining([
      expect.objectContaining({ file, kind }),
    ]));
    expect(exact.has(source)).toBe(false);
    // Do not use the global technical reviews here: technical provenance must
    // not make the ordinary UI occurrences look translated or reviewed.
    expect(assessCandidate({ source, file, kind, risk: "ui" }, {
      exact, patterns: [], reviews: [],
    }).status).toBe("missing");
  });

  it.each(excludedValues)("does not register a globally unsafe exact key: %s", (source) => {
    expect(Object.hasOwn(repairGapTranslations, source)).toBe(false);
    expect(exact.has(normalizeExactKey(source))).toBe(false);
  });

  it.each([
    "Layers cached by docker buildx on this server will appear here.",
    "Setup up to 99 Servers",
    "Domain Created for example.com",
    "Use root with unrestricted privileges.",
    "Attach the service to a made-up network.",
  ])("does not claim unrelated copy through a broad fallback: %s", (source) => {
    const result = assessCandidate({ source, file: "components/example.tsx", risk: "ui" }, {
      exact, patterns: [], reviews: [],
    });
    expect(result.status).toBe("missing");
    expect(result.translation).toBeUndefined();
  });
});
