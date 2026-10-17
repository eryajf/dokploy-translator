import { coreTranslations } from "./core-dictionary";
import { deploymentGapTranslations } from "./deployment-gap-dictionary";
import { dashboardGapTranslations } from "./dashboard-gap-dictionary";
import { longTailTranslations } from "./long-tail-dictionary";
import { pageTranslations } from "./page-dictionary";
import { settingsGapTranslations } from "./settings-gap-dictionary";
import { finalGapTranslations } from "./final-gap-dictionary";
import { repairGapTranslations } from "./repair-gap-dictionary";
import { templateTranslations } from "./template-dictionary";
import { normalizeExactKey } from "./normalize";

export type TranslationRule =
  | { kind: "exact"; source: string; target: string; areas?: string[] }
  | { kind: "pattern"; pattern: string; target: string; areas?: string[] };

export const dictionaryMeta = {
  dictionaryVersion: "2026.10.16.4",
  dokployVersion: "v0.30.8",
  dokployCommit: "05970e7b234d4742ceab2967490597fbde47dbdd",
  generatedAt: "2026-10-16",
  reviewedAt: "2026-10-16",
} as const;

export const dictionaryVersion = `${dictionaryMeta.dokployVersion} · ${dictionaryMeta.dictionaryVersion}`;

export const dictionary: TranslationRule[] = [
  ["Home", "首页"], ["Projects", "项目"], ["Overview", "概览"],
  ["Monitoring", "监控"], ["Schedules", "计划任务"], ["Docker", "Docker"],
  ["Settings", "设置"], ["Account", "账户"], ["Profile", "个人资料"],
  ["Sign in", "登录"], ["Sign In", "登录"], ["Sign up", "注册"],
  ["Register", "注册"], ["Email", "邮箱"], ["Password", "密码"],
  ["Confirm Password", "确认密码"], ["First Name", "名"], ["Last Name", "姓"],
  ["Forgot password?", "忘记密码？"], ["Reset Password", "重置密码"],
  ["Backup Code", "备份验证码"], ["Enter Backup Code", "输入备份验证码"],
  ["Save", "保存"], ["Cancel", "取消"], ["Delete", "删除"], ["Create", "创建"],
  ["Update", "更新"], ["Edit", "编辑"], ["Add", "添加"], ["Close", "关闭"],
  ["Search", "搜索"], ["Loading...", "加载中…"], ["Loading", "加载中"],
  ["Actions", "操作"], ["Status", "状态"], ["Name", "名称"], ["Description", "描述"],
  ["Created", "创建时间"], ["Updated", "更新时间"], ["Enabled", "已启用"],
  ["Disabled", "已禁用"], ["Active", "活跃"], ["Inactive", "未活跃"],
  ["Running", "运行中"], ["Done", "完成"], ["Error", "错误"], ["Cancelled", "已取消"],
  ["Application", "应用"], ["Compose", "Compose"], ["Services", "服务"],
  ["Deployments", "部署记录"], ["Deployment", "部署"], ["Domains", "域名"],
  ["Logs", "日志"], ["General", "常规"], ["Advanced", "高级"], ["Servers", "服务器"],
  ["Server", "服务器"], ["Databases", "数据库"], ["Networks", "网络"],
  ["Containers", "容器"], ["Images", "镜像"], ["Volumes", "卷"], ["Events", "事件"],
  ["Health", "健康状态"], ["Nodes", "节点"], ["Swarm", "Swarm 集群"],
  ["Git Providers", "Git 提供商"], ["Notifications", "通知"], ["Security", "安全"],
  ["Certificates", "证书"], ["Backups", "备份"], ["Restore", "恢复"],
  ["No results found.", "未找到结果。"], ["No organizations found.", "未找到组织。"],
  ["No destinations found.", "未找到目标位置。"], ["No networks yet", "暂无线网络"],
  ["Rows per page", "每页行数"], ["All statuses", "全部状态"], ["All types", "全部类型"],
  ["All servers", "全部服务器"], ["All projects", "全部项目"], ["All destinations", "全部目标位置"],
  ["Open menu", "打开菜单"], ["Toggle Sidebar", "切换侧边栏"], ["View Logs", "查看日志"],
  ["Copy", "复制"], ["Copied", "已复制"], ["Refresh", "刷新"], ["Retry", "重试"],
  ["Connected", "已连接"], ["Disconnected", "已断开"], ["Required", "必填"],
  ["Optional", "可选"], ["Yes", "是"], ["No", "否"], ["None", "无"],
].map(([source, target]) => ({ kind: "exact", source, target }) as TranslationRule);

dictionary.push(
  { kind: "pattern", pattern: "^Delete (.+)$", target: "删除 $1" },
  { kind: "pattern", pattern: "^Logs for (.+)$", target: "$1 的日志" },
  { kind: "pattern", pattern: "^Build: (.+)$", target: "构建：$1" },
  { kind: "pattern", pattern: "^View (.+)$", target: "查看 $1" },
  { kind: "pattern", pattern: "^No (deployments|services|projects|environments|domains|networks|volumes) found\\.?$", target: "未找到 $1" },
);

export const exactDictionary = new Map([
  ...dictionary.filter((rule): rule is Extract<TranslationRule, { kind: "exact" }> => rule.kind === "exact").map((rule) => [rule.source, rule.target] as const),
  ...Object.entries(coreTranslations),
  ...Object.entries(pageTranslations),
  ...Object.entries(longTailTranslations),
  ...Object.entries(deploymentGapTranslations),
  ...Object.entries(settingsGapTranslations),
  ...Object.entries(dashboardGapTranslations),
  ...Object.entries(finalGapTranslations),
  ...Object.entries(repairGapTranslations),
]);

const uiWordTranslations: Record<string, string> = {
  server: "服务器", project: "项目", environment: "环境", application: "应用", service: "服务",
  database: "数据库", network: "网络", volume: "卷", domain: "域名",
};

for (const [source, target] of [...exactDictionary.entries()]) {
  const normalized = normalizeExactKey(source);
  if (!exactDictionary.has(normalized)) exactDictionary.set(normalized, target);
}

export function translateText(value: string, area = "text", customTranslations: Record<string, string> = {}): string | undefined {
  const rawKey = value.trim();
  const key = normalizeExactKey(rawKey);
  const custom = customTranslations[rawKey] ?? customTranslations[key];
  if (custom) return value.replace(rawKey, () => custom);
  const exact = exactDictionary.get(key);
  if (exact) return value.replace(rawKey, () => exact);
  for (const rule of templateTranslations) {
    if (rule.pattern.test(rawKey)) return value.replace(rawKey, () => rawKey.replace(rule.pattern, rule.target));
  }
  for (const rule of dictionary) {
    if (rule.kind !== "pattern" || (rule.areas && !rule.areas.includes(area))) continue;
    const match = rawKey.match(new RegExp(rule.pattern));
    if (match) return value.replace(rawKey, () => rule.target.replace(/\$(\d+)/g, (_, index) => match[Number(index)] ?? ""));
  }
  const sentence = key.match(/^(Add a new|Please select your) (server|project|environment|application|service|database|network|volume|domain)(\.)?$/);
  if (sentence) {
    const prefix = sentence[1] === "Add a new" ? "添加新" : "请选择你的";
    return value.replace(rawKey, `${prefix}${uiWordTranslations[sentence[2]]}${sentence[3] ? "。" : ""}`);
  }
  return undefined;
}
