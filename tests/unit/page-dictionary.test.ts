import { describe, expect, it } from "vitest";
import { translateText } from "../../src/translation/dictionary";

const pages = {
  登录: [
    ["Already have account?", "已有账户？"],
    ["Create an account", "创建账户"],
    ["Enter your email and password to sign in", "输入邮箱和密码登录"],
    ["Lost your password?", "忘记密码？"],
    ["Send Reset Link", "发送重置链接"],
    ["Sign in with Passkey", "使用通行密钥登录"],
  ],
  项目: [
    ["Add Variable", "添加变量"],
    ["Duplicate Services", "复制服务"],
    ["Edit Environment", "编辑环境"],
    ["Environment variables", "环境变量"],
    ["Review and Finalize", "检查并完成"],
    ["Select target project", "选择目标项目"],
    ["Variable Value", "变量值"],
  ],
  应用: [
    ["Add Command", "添加命令"],
    ["Add Network", "添加网络"],
    ["Build-time Secrets", "构建时密钥"],
    ["Enable preview deployments", "启用预览部署"],
    ["Open Terminal", "打开终端"],
    ["Redeploy", "重新部署"],
    ["Select a build server", "选择构建服务器"],
  ],
  Compose: [
    ["Apply Randomize", "应用随机化"],
    ["Compose File", "Compose 文件"],
    ["Modify Compose", "修改 Compose"],
    ["Preview Compose", "预览 Compose"],
    ["Start Compose", "启动 Compose"],
    ["Stop Compose", "停止 Compose"],
  ],
  部署: [
    ["Cancel Queues", "取消队列"],
    ["Kill Build", "终止构建"],
    ["Loading deployments...", "正在加载部署记录…"],
    ["No deployments found", "未找到部署记录"],
    ["Queue is empty", "队列为空"],
    ["Show Extra Logs", "显示额外日志"],
  ],
  数据库: [
    ["Database password is required for MariaDB", "MariaDB 数据库密码为必填项"],
    ["Enter database password", "输入数据库密码"],
    ["External Credentials", "外部凭据"],
    ["Internal Credentials", "内部凭据"],
    ["Select a database type", "选择数据库类型"],
    ["Update the Postgres data", "更新 PostgreSQL 数据"],
  ],
  设置: [
    ["Add a new manager", "添加管理节点"],
    ["Allow Impersonation", "允许模拟登录"],
    ["Confirm upgrade", "确认升级"],
    ["Organization Logo", "组织 Logo"],
    ["Reset to Defaults", "恢复默认设置"],
    ["Select the email provider to send the invitation", "选择发送邀请的邮件提供商"],
  ],
  长尾帮助: [
    ["Enter one of the backup codes you received when setting up 2FA", "输入设置双因素认证时获得的任一备份验证码"],
    ["Describe the type of template you need, its purpose, and any specific features you'd like to include.", "描述所需模板的类型、用途以及希望包含的具体功能。"],
    ["Add paths to watch for changes. When files in these paths change, a new deployment will be triggered.", "添加要监视变化的路径。路径中的文件变化时会触发新的部署。"],
    ["Having rollbacks enabled increases storage usage. Be careful with this option. Note that manually cleaning the cache may delete rollback images, making them unavailable for future rollbacks.", "启用回滚会增加存储用量，请谨慎使用。手动清理缓存可能删除回滚镜像，导致后续无法回滚。"],
    ["Isolated deployment is deprecated. Use the Networks section above to attach networks per service and detach them from dokploy-network — it is declarative and does not break on restarts.", "隔离部署已弃用。请使用上方的网络部分为每个服务挂载网络，并从 dokploy-network 分离；这种方式是声明式的，重启后也不会失效。"],
    ["Hey! Looks like the build has been running for more than 10 minutes. Would you like to cancel this deployment?", "构建似乎已运行超过 10 分钟。要取消此次部署吗？"],
    ["In order to make the database reachable through the internet, you must set a port and ensure that the port is not being used by another application or database", "要让数据库可以通过互联网访问，必须设置端口，并确保该端口未被其他应用或数据库占用。"],
    ["Enable this option to allow Dokploy Cloud administrators to temporarily access your account for troubleshooting and support purposes. This helps them quickly identify and resolve any issues you may encounter.", "启用此选项后，Dokploy Cloud 管理员可以临时访问账户以进行故障排查和支持，帮助快速定位并解决问题。"],
  ],
} as const;

describe("page dictionary coverage", () => {
  for (const [page, entries] of Object.entries(pages)) {
    it(`covers ${page}`, () => {
      for (const [source, target] of entries) expect(translateText(source)).toBe(target);
    });
  }
});
