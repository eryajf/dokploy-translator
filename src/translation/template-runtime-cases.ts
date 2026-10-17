/** Curated runtime examples paired with exact extractor source shells.
 * These are concrete sample assertions, not regex-language or branch-exhaustiveness proofs.
 * Keep independent of rule definitions: coverage and tests consume the same witnesses.
 */
export type TemplateRuntimeCase = { source: string; input: string; output: string };

export const runtimeCases: readonly TemplateRuntimeCase[] = [
  { source: "${value} lines", input: "2500 lines", output: "2500 行" },
  { source: "Setup up to ${STARTUP_SERVERS_INCLUDED} servers", input: "Setup up to 3 servers", output: "最多可配置 3 台服务器" },
  {
    source: "Used: ${currentData.memory.value.used} / Limit: ${currentData.memory.value.total}",
    input: "Used:  1.25GiB / Limit: 512MiB ",
    output: "已用：1.25GiB / 限额：512MiB",
  },
  {
    source: "Used: ${currentData.memory.value.used} / Limit: ${currentData.memory.value.total}",
    input: "Used:  256MiB / Limit: 2GiB ",
    output: "已用：256MiB / 限额：2GiB",
  },
  {
    source: 'Delete the ${record.type} record "${record.name}"? This removes it from the DNS provider, not just from Dokploy.',
    input: 'Delete the HTTPS record "app.example.com"? This removes it from the DNS provider, not just from Dokploy.',
    output: "要删除 HTTPS 记录“app.example.com”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。",
  },
  {
    source: 'Delete the ${record.type} record "${record.name}"? This removes it from the DNS provider, not just from Dokploy.',
    input: 'Delete the DNSKEY record "app.example.com"? This removes it from the DNS provider, not just from Dokploy.',
    output: "要删除 DNSKEY 记录“app.example.com”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。",
  },
  {
    "source": "Are you sure you want to deploy ${selectedServices.length} service${…}? This will redeploy/restart the selected services.",
    "input": "Are you sure you want to deploy 1 service? This will redeploy/restart the selected services.",
    "output": "确定要部署这 1 个服务吗？这将重新部署或重启所选服务。"
  },
  {
    "source": "Are you sure you want to deploy ${selectedServices.length} service${…}? This will redeploy/restart the selected services.",
    "input": "Are you sure you want to deploy 3 services? This will redeploy/restart the selected services.",
    "output": "确定要部署这 3 个服务吗？这将重新部署或重启所选服务。"
  },
  {
    "source": "This will permanently delete \"${service.name}\" and all its associated data.",
    "input": "This will permanently delete \"production-api\" and all its associated data.",
    "output": "这将永久删除“production-api”及其所有关联数据。"
  },
  {
    "source": "Role \"${data.roleName}\" created",
    "input": "Role \"release-admin\" created",
    "output": "角色“release-admin”已创建"
  },
  {
    "source": "Role \"${roleName}\" deleted",
    "input": "Role \"release-admin\" deleted",
    "output": "角色“release-admin”已删除"
  },
  {
    "source": "Remove \"${origin}\" from trusted origins?",
    "input": "Remove \"https://auth.example.com\" from trusted origins?",
    "output": "要将“https://auth.example.com”从受信任来源中移除吗？"
  },
  {
    "source": "Network \"${row.original.name}\" recreated in Docker",
    "input": "Network \"dokploy-overlay\" recreated in Docker",
    "output": "网络“dokploy-overlay”已在 Docker 中重新创建"
  },
  {
    "source": "Network \"${name}\" recreated in Docker",
    "input": "Network \"dokploy-overlay\" recreated in Docker",
    "output": "网络“dokploy-overlay”已在 Docker 中重新创建"
  },
  {
    "source": "Role \"${…}\" updated",
    "input": "Role \"release-admin\" updated",
    "output": "角色“release-admin”已更新"
  },
  {
    "source": "Network \"${name}\" updated from Docker",
    "input": "Network \"dokploy-overlay\" updated from Docker",
    "output": "网络“dokploy-overlay”已根据 Docker 中的配置更新"
  },
  {
    "source": "Browse and edit files inside the \"${volumeName}\" volume",
    "input": "Browse and edit files inside the \"my_data\" volume",
    "output": "浏览和编辑“my_data”数据卷中的文件"
  },
  {
    "source": "The network \"${row.original.name}\" will be removed from Docker and Dokploy. This action cannot be undone.",
    "input": "The network \"dokploy-overlay\" will be removed from Docker and Dokploy. This action cannot be undone.",
    "output": "网络“dokploy-overlay”将从 Docker 和 Dokploy 中移除。此操作无法撤销。"
  },
  {
    "source": "The image \"${…}\" will be removed from Docker. This action cannot be undone.",
    "input": "The image \"registry.example.com/web:v1.2\" will be removed from Docker. This action cannot be undone.",
    "output": "镜像“registry.example.com/web:v1.2”将从 Docker 中移除。此操作无法撤销。"
  },
  {
    "source": "Remove \"${provider.providerId}\"? Existing provisioned users will stay but the IdP will no longer be able to sync.",
    "input": "Remove \"corp-idp\"? Existing provisioned users will stay but the IdP will no longer be able to sync.",
    "output": "要移除“corp-idp”吗？已预配的用户将保留，但此身份提供商（IdP）将无法继续同步。"
  },
  {
    "source": "Delete the ${record.type} record \"${record.name}\"? This removes it from the DNS provider, not just from Dokploy.",
    "input": "Delete the CNAME record \"app.example.com\"? This removes it from the DNS provider, not just from Dokploy.",
    "output": "要删除 CNAME 记录“app.example.com”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。"
  },
  {
    "source": "Are you sure you want to delete the tag \"${tag.name}\"? This will remove the tag from all projects. This action cannot be undone.",
    "input": "Are you sure you want to delete the tag \"needs-review\"? This will remove the tag from all projects. This action cannot be undone.",
    "output": "确定要删除标签“needs-review”吗？这将从所有项目中移除此标签。此操作无法撤销。"
  },
  {
    "source": "Remove provider \"${provider.providerId}\"? Users will no longer be able to sign in with this IdP.",
    "input": "Remove provider \"corp-idp\"? Users will no longer be able to sign in with this IdP.",
    "output": "要移除提供商“corp-idp”吗？用户将无法再通过此身份提供商（IdP）登录。"
  },
  {
    "source": "Mode: ${…} (Aggressive mode recommended for better protection)",
    "input": "Mode: Not Set (Aggressive mode recommended for better protection)",
    "output": "模式：未设置（建议使用激进模式以加强保护）"
  },
  {
    "source": "Mode: ${…} (Aggressive mode recommended for better protection)",
    "input": "Mode: normal (Aggressive mode recommended for better protection)",
    "output": "模式：normal（建议使用激进模式以加强保护）"
  },
  {
    "source": "Certificate ${…} (Leaf)",
    "input": "Certificate 2 (Leaf)",
    "output": "证书 2（叶证书）"
  },
  {
    "source": "(min. ${STARTUP_SERVERS_INCLUDED})",
    "input": "(min. 3)",
    "output": "（最少 3）"
  },
  {
    "source": "Default: ${…} (Should be set to 'deny' for security)",
    "input": "Default: allow (Should be set to 'deny' for security)",
    "output": "默认值：allow（为安全起见，应设为 deny）"
  },
  {
    "source": "Used: ${currentData.memory.value.used} / Limit: ${currentData.memory.value.total}",
    "input": "Used: 128.5 / Limit: 512",
    "output": "已用：128.5 / 限额：512"
  },
  {
    "source": "Used: ${currentData.memory.value.used} / Limit: ${currentData.memory.value.total}",
    "input": "Used:  128.5 / Limit: 512 ",
    "output": "已用：128.5 / 限额：512"
  },
  {
    "source": "Used: ${currentData.memory.value.used} / Limit: ${currentData.memory.value.total}",
    "input": "Used:  1.5 GB / Limit: 8 GB",
    "output": "已用：1.5 GB / 限额：8 GB"
  },
  {
    "source": "In: ${…} / Out: ${…}",
    "input": "In: 1.25 MB / Out: 2.50 GB",
    "output": "入站：1.25 MB / 出站：2.50 GB"
  },
  {
    "source": "Read: ${…} / Write: ${…}",
    "input": "Read: 8.20 kB / Write: 9.10 MB",
    "output": "读取：8.20 kB / 写入：9.10 MB"
  },
  {
    "source": "Error ${…} a backup",
    "input": "Error updating a backup",
    "output": "更新备份失败"
  },
  {
    "source": "Error ${…} a backup",
    "input": "Error creating a backup",
    "output": "创建备份失败"
  },
  {
    "source": "Are you sure you want to deploy \"${service.name}\"?",
    "input": "Are you sure you want to deploy \"my-web\"?",
    "output": "确定要部署“my-web”吗？"
  },
  {
    "source": "Are you sure you want to start ${selectedServices.length} services?",
    "input": "Are you sure you want to start 2 services?",
    "output": "确定要启动这 2 个服务吗？"
  },
  {
    "source": "Are you sure you want to stop ${selectedServices.length} services?",
    "input": "Are you sure you want to stop 2 services?",
    "output": "确定要停止这 2 个服务吗？"
  },
  {
    "source": "Are you sure you want to stop \"${service.name}\"?",
    "input": "Are you sure you want to stop \"my-web\"?",
    "output": "确定要停止“my-web”吗？"
  },
  {
    "source": "Available (v${gpuStatus.cudaVersion})",
    "input": "Available (v12.6)",
    "output": "可用（v12.6）"
  },
  {
    "source": "Backup ${…}",
    "input": "Backup Updated",
    "output": "备份已更新"
  },
  {
    "source": "Backup ${…}",
    "input": "Backup Created",
    "output": "备份已创建"
  },
  {
    "source": "Behind ${validationState.cdnProvider}",
    "input": "Behind Cloudflare",
    "output": "代理服务：Cloudflare"
  },
  {
    "source": "${health.reservation.unsupportedComposeCount} Compose service(s) on this server aren't included — reservations aren't tracked per-service for Compose.",
    "input": "2 Compose service(s) on this server aren't included — reservations aren't tracked per-service for Compose.",
    "output": "未包含此服务器上的 2 个 Compose 服务，因为 Compose 的资源预留未按服务单独统计。"
  },
  {
    "source": "Confirm new ${…}",
    "input": "Confirm new password",
    "output": "确认新密码"
  },
  {
    "source": "Confirm new ${…}",
    "input": "Confirm new root password",
    "output": "确认新 Root 密码"
  },
  {
    "source": "Enter new ${…}",
    "input": "Enter new password",
    "output": "输入新密码"
  },
  {
    "source": "Enter new ${…}",
    "input": "Enter new root password",
    "output": "输入新 Root 密码"
  },
  {
    "source": "Container ${action} successfully",
    "input": "Container restart successfully",
    "output": "容器重启成功"
  },
  {
    "source": "Container ${action} successfully",
    "input": "Container start successfully",
    "output": "容器启动成功"
  },
  {
    "source": "Container ${action} successfully",
    "input": "Container stop successfully",
    "output": "容器停止成功"
  },
  {
    "source": "Container ${action} successfully",
    "input": "Container kill successfully",
    "output": "容器强制终止成功"
  },
  {
    "source": "Failed to ${action} container: ${…}",
    "input": "Failed to restart container: exit status 1",
    "output": "重启容器失败：exit status 1"
  },
  {
    "source": "Failed to ${action} container: ${…}",
    "input": "Failed to start container: bind 0.0.0.0:80 failed",
    "output": "启动容器失败：bind 0.0.0.0:80 failed"
  },
  {
    "source": "Failed to ${action} container: ${…}",
    "input": "Failed to stop container: permission denied",
    "output": "停止容器失败：permission denied"
  },
  {
    "source": "Failed to ${action} container: ${…}",
    "input": "Failed to kill container: Unknown error",
    "output": "强制终止容器失败：Unknown error"
  },
  {
    "source": "${label} copied",
    "input": "Endpoint URL copied",
    "output": "端点 URL 已复制"
  },
  {
    "source": "${label} copied",
    "input": "Bearer token copied",
    "output": "Bearer 令牌已复制"
  },
  {
    "source": "Could not import \"${failure.name}\"",
    "input": "Could not import \"my-network\"",
    "output": "无法导入“my-network”"
  },
  {
    "source": "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
    "input": "1 day left · ends 10/16/2026 · billing starts automatically",
    "output": "剩余 1 天 · 10/16/2026 结束 · 将自动开始计费"
  },
  {
    "source": "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
    "input": "2 days left · billing starts automatically",
    "output": "剩余 2 天 · 将自动开始计费"
  },
  {
    "source": "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
    "input": "3 days left · ends 2026/10/16 · add a card to keep your servers",
    "output": "剩余 3 天 · 2026/10/16 结束 · 请添加银行卡以保留服务器"
  },
  {
    "source": "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
    "input": "1 day left · add a card to keep your servers",
    "output": "剩余 1 天 · 请添加银行卡以保留服务器"
  },
  {
    "source": "Expires in ${daysUntilExpiration} days",
    "input": "Expires in 12 days",
    "output": "12 天后到期"
  },
  {
    "source": "${service.name} deleted successfully",
    "input": "my-web deleted successfully",
    "output": "my-web 删除成功"
  },
  {
    "source": "Editing: ${patch.filePath}",
    "input": "Editing: src/pages/index.tsx",
    "output": "正在编辑：src/pages/index.tsx"
  },
  {
    "source": "Editing: ${selectedFile}",
    "input": "Editing: src/pages/index.tsx",
    "output": "正在编辑：src/pages/index.tsx"
  },
  {
    "source": "Enabled (${gpuStatus.gpuResources} GPU${…})",
    "input": "Enabled (1 GPU)",
    "output": "已启用（1 个 GPU）"
  },
  {
    "source": "Enabled (${gpuStatus.gpuResources} GPU${…})",
    "input": "Enabled (4 GPUs)",
    "output": "已启用（4 个 GPU）"
  },
  {
    "source": "Error configuring Gitea: ${error.message}",
    "input": "Error configuring Gitea: access denied",
    "output": "配置 Gitea 失败：access denied"
  },
  {
    "source": "Error deleting service ${serviceId}: ${…}",
    "input": "Error deleting service svc_123: no such service",
    "output": "删除服务 svc_123 失败：no such service"
  },
  {
    "source": "Error deploying service ${serviceId}: ${…}",
    "input": "Error deploying service svc_123: error: invalid port",
    "output": "部署服务 svc_123 失败：error: invalid port"
  },
  {
    "source": "Error moving service ${serviceId}: ${…}",
    "input": "Error moving service svc_123: target not found",
    "output": "移动服务 svc_123 失败：target not found"
  },
  {
    "source": "Error starting service ${serviceId}",
    "input": "Error starting service svc_123",
    "output": "启动服务 svc_123 失败"
  },
  {
    "source": "Error stopping service ${serviceId}",
    "input": "Error stopping service svc_123",
    "output": "停止服务 svc_123 失败"
  },
  {
    "source": "Error testing the provider: ${…}",
    "input": "Error testing the provider: ECONNREFUSED",
    "output": "测试提供商失败：ECONNREFUSED"
  },
  {
    "source": "Error updating \"${domain.host}\"",
    "input": "Error updating \"app.example.com\"",
    "output": "更新“app.example.com”失败"
  },
  {
    "source": "Expected ${…}",
    "input": "Expected 1 10 5269 talk.example.com",
    "output": "预期格式：1 10 5269 talk.example.com"
  },
  {
    "source": "Expected ${…}",
    "input": "Expected 0 issue \"letsencrypt.org\"",
    "output": "预期格式：0 issue \"letsencrypt.org\""
  },
  {
    "source": "Expired on ${…}",
    "input": "Expired on Oct 16, 2026",
    "output": "已于 Oct 16, 2026 到期"
  },
  {
    "source": "Expires ${…}",
    "input": "Expires 2026年10月16日",
    "output": "将于 2026年10月16日 到期"
  },
  {
    "source": "Failed to create environment: ${…}",
    "input": "Failed to create environment: duplicate name",
    "output": "创建环境失败：duplicate name"
  },
  {
    "source": "${failed} service${…} failed to deploy",
    "input": "1 service failed to deploy",
    "output": "1 个服务部署失败"
  },
  {
    "source": "${failed} service${…} failed to deploy",
    "input": "2 services failed to deploy",
    "output": "2 个服务部署失败"
  },
  {
    "source": "Failed to disconnect repository: ${…}",
    "input": "Failed to disconnect repository: token expired",
    "output": "断开仓库连接失败：token expired"
  },
  {
    "source": "Failed to update environment: ${…}",
    "input": "Failed to update environment: invalid name",
    "output": "更新环境失败：invalid name"
  },
  {
    "source": "Failed to update log cleanup schedule: ${…}",
    "input": "Failed to update log cleanup schedule: cron invalid",
    "output": "更新日志清理计划失败：cron invalid"
  },
  {
    "source": "Force logout for ${row.original.firstName} ${row.original.lastName} (${row.original.email})?",
    "input": "Force logout for Alex Smith (alex@example.com)?",
    "output": "要强制用户 Alex Smith（alex@example.com）退出登录吗？"
  },
  {
    "source": "Force logout for ${row.original.firstName} ${row.original.lastName} (${row.original.email})?",
    "input": "Force logout for Alex van der Smith (alex@example.com)?",
    "output": "要强制用户 Alex van der Smith（alex@example.com）退出登录吗？"
  },
  {
    "source": "Used: ${currentData.disk.value.diskUsage} GB / Limit: ${currentData.disk.value.diskTotal} GB",
    "input": "Used:  12.5 GB / Limit: 100 GB",
    "output": "已用：12.5 GB / 限额：100 GB"
  },
  {
    "source": "Imported ${result.imported.length} network(s)",
    "input": "Imported 2 network(s)",
    "output": "已导入 2 个网络"
  },
  {
    "source": "Installed (v${gpuStatus.driverVersion})",
    "input": "Installed (v550.54.14)",
    "output": "已安装（v550.54.14）"
  },
  {
    "source": "Installed: ${…}",
    "input": "Installed: Docker version 27.1.1, build 6312585",
    "output": "已安装：Docker version 27.1.1, build 6312585"
  },
  {
    "source": "last ${MAX_LOG_LINES}",
    "input": "last 10000",
    "output": "最近 10000 行"
  },
  {
    "source": "You have ${daysLabel} left in your free trial. Add a payment method to keep your servers.",
    "input": "You have 1 day left in your free trial. Add a payment method to keep your servers.",
    "output": "您的免费试用还剩 1 天。请添加付款方式以保留服务器。"
  },
  {
    "source": "You have ${daysLabel} left in your free trial. Add a payment method to keep your servers.",
    "input": "You have 7 days left in your free trial. Add a payment method to keep your servers.",
    "output": "您的免费试用还剩 7 天。请添加付款方式以保留服务器。"
  },
  {
    "source": "Message: ${message}",
    "input": "Message: Error $1: /var/lib/app\nConnection refused",
    "output": "消息：Error $1: /var/lib/app\nConnection refused"
  },
  {
    "source": "Name must be at most ${API_KEY_NAME_MAX_LENGTH} characters",
    "input": "Name must be at most 64 characters",
    "output": "名称不能超过 64 个字符"
  },
  {
    "source": "${selectedNetworks.length} network${…} selected",
    "input": "1 network selected",
    "output": "已选择 1 个网络"
  },
  {
    "source": "${selectedNetworks.length} network${…} selected",
    "input": "3 networks selected",
    "output": "已选择 3 个网络"
  },
  {
    "source": "${result.missing.length} network(s) no longer exist in Docker",
    "input": "2 network(s) no longer exist in Docker",
    "output": "2 个网络已不存在于 Docker 中"
  },
  {
    "source": "New file in ${folderPath}/",
    "input": "New file in src/routes/",
    "output": "在 src/routes/ 中新建文件"
  },
  {
    "source": "Failed to ${…} organization",
    "input": "Failed to update organization",
    "output": "更新组织失败"
  },
  {
    "source": "Failed to ${…} organization",
    "input": "Failed to create organization",
    "output": "创建组织失败"
  },
  {
    "source": "Organization ${…} successfully",
    "input": "Organization updated successfully",
    "output": "组织更新成功"
  },
  {
    "source": "Organization ${…} successfully",
    "input": "Organization created successfully",
    "output": "组织创建成功"
  },
  {
    "source": "$${…} per ${…}",
    "input": "$123.45 per year",
    "output": "每年 $123.45"
  },
  {
    "source": "$${…} per ${…}",
    "input": "$12.00 per month",
    "output": "每月 $12.00"
  },
  {
    "source": "Project name must match \"${expectedName}\"",
    "input": "Project name must match \"Production/web-api\"",
    "output": "项目名称必须与“Production/web-api”一致"
  },
  {
    "source": "${success} service${…} queued for deployment",
    "input": "1 service queued for deployment",
    "output": "1 个服务已加入部署队列"
  },
  {
    "source": "${success} service${…} queued for deployment",
    "input": "4 services queued for deployment",
    "output": "4 个服务已加入部署队列"
  },
  {
    "source": "${data.length} record${…}",
    "input": "1 record",
    "output": "1 条记录"
  },
  {
    "source": "${data.length} record${…}",
    "input": "8 records",
    "output": "8 条记录"
  },
  {
    "source": "Remove stale record ${stale.name}",
    "input": "Remove stale record _acme-challenge.example.com",
    "output": "移除失效记录 _acme-challenge.example.com"
  },
  {
    "source": "Removed stale record \"${name}\"",
    "input": "Removed stale record \"_acme-challenge.example.com\"",
    "output": "已移除失效记录“_acme-challenge.example.com”"
  },
  {
    "source": "Requests ${…}",
    "input": "Requests deactivated",
    "output": "请求日志已停用"
  },
  {
    "source": "Requests ${…}",
    "input": "Requests activated",
    "output": "请求日志已启用"
  },
  {
    "source": "Restarting container ${containerAppName}",
    "input": "Restarting container production-web-1",
    "output": "正在重启容器 production-web-1"
  },
  {
    "source": "Schedule ${…} successfully",
    "input": "Schedule updated successfully",
    "output": "计划任务更新成功"
  },
  {
    "source": "Schedule ${…} successfully",
    "input": "Schedule created successfully",
    "output": "计划任务创建成功"
  },
  {
    "source": "Selected ${selectedTags.length} tags",
    "input": "Selected 2 tags",
    "output": "已选择 2 个标签"
  },
  {
    "source": "${success} services deleted successfully",
    "input": "2 services deleted successfully",
    "output": "2 个服务删除成功"
  },
  {
    "source": "${success} services moved successfully",
    "input": "2 services moved successfully",
    "output": "2 个服务移动成功"
  },
  {
    "source": "${success} services started successfully",
    "input": "2 services started successfully",
    "output": "2 个服务启动成功"
  },
  {
    "source": "${success} services stopped successfully",
    "input": "2 services stopped successfully",
    "output": "2 个服务停止成功"
  },
  {
    "source": "Show showcase slide ${…}",
    "input": "Show showcase slide 3",
    "output": "显示展示幻灯片 3"
  },
  {
    "source": "Error ${…} the Destination",
    "input": "Error Updating the Destination",
    "output": "更新备份目标失败"
  },
  {
    "source": "Error ${…} the Destination",
    "input": "Error Creating the Destination",
    "output": "创建备份目标失败"
  },
  {
    "source": "The volume \"${row.original.Name}\" will be removed from Docker. This action cannot be undone.",
    "input": "The volume \"production_db\" will be removed from Docker. This action cannot be undone.",
    "output": "数据卷“production_db”将从 Docker 中移除。此操作无法撤销。"
  },
  {
    "source": "This will permanently delete ${entryPath}${…}.",
    "input": "This will permanently delete /app/data and all its contents.",
    "output": "这将永久删除 /app/data 及其所有内容。"
  },
  {
    "source": "This will permanently delete ${entryPath}${…}.",
    "input": "This will permanently delete /app/a file.txt.",
    "output": "这将永久删除 /app/a file.txt。"
  },
  {
    "source": "${e.message} Try manually: rclone ls ${connectionString}",
    "input": "AccessDenied\n\nTry manually: rclone ls :s3,provider=AWS,access_key_id=abc,secret_access_key=secret:endpoint",
    "output": "AccessDenied\n\n请手动尝试：rclone ls :s3,provider=AWS,access_key_id=abc,secret_access_key=secret:endpoint"
  },
  {
    "source": "${e.message} Try manually: rclone ls ${connectionString}",
    "input": "AccessDenied Try manually: rclone ls :s3,provider=AWS:my-bucket",
    "output": "AccessDenied\n\n请手动尝试：rclone ls :s3,provider=AWS:my-bucket"
  },
  {
    "source": "${…} users",
    "input": "14 users",
    "output": "14 位用户"
  },
  {
    "source": "${…} users",
    "input": "undefined users",
    "output": "undefined 位用户"
  },
  {
    "source": "View domains for ${provider.name}",
    "input": "View domains for Cloudflare production",
    "output": "查看 Cloudflare production 的域名"
  },
  {
    "source": "Volume backup ${…} successfully",
    "input": "Volume backup updated successfully",
    "output": "数据卷备份更新成功"
  },
  {
    "source": "Volume backup ${…} successfully",
    "input": "Volume backup created successfully",
    "output": "数据卷备份创建成功"
  },
  {
    "source": "Welcome back, ${firstName}",
    "input": "Welcome back, Alex Smith",
    "output": "欢迎回来，Alex Smith"
  },
  {
    "source": "You are now viewing as ${…}",
    "input": "You are now viewing as alex@example.com",
    "output": "您当前正以 alex@example.com 的身份查看"
  },
  {
    "source": "Certificate ${…}",
    "input": "Certificate 3",
    "output": "证书 3"
  },
  {
    "source": "Default ${…}",
    "input": "Default mongo:8",
    "output": "默认值：mongo:8"
  },
  {
    "source": "Default ${…}",
    "input": "Default ghcr.io/tursodatabase/libsql-server:v0.24.32",
    "output": "默认值：ghcr.io/tursodatabase/libsql-server:v0.24.32"
  },
  {
    "source": "Default ${…}",
    "input": "Default mariadb:11",
    "output": "默认值：mariadb:11"
  },
  {
    "source": "Default ${…}",
    "input": "Default mysql:8",
    "output": "默认值：mysql:8"
  },
  {
    "source": "Default ${…}",
    "input": "Default redis:8",
    "output": "默认值：redis:8"
  },
  {
    "source": "Default ${…}",
    "input": "Default libsql",
    "output": "默认值：libsql"
  },
  {
    "source": "Default ${…}",
    "input": "Default mariadb",
    "output": "默认值：mariadb"
  },
  {
    "source": "Default ${…}",
    "input": "Default mongo",
    "output": "默认值：mongo"
  },
  {
    "source": "Default ${…}",
    "input": "Default mysql",
    "output": "默认值：mysql"
  },
  {
    "source": "Default ${…}",
    "input": "Default postgres",
    "output": "默认值：postgres"
  },
  {
    "source": "Default ${…}",
    "input": "Default postgres:18",
    "output": "默认值：postgres:18"
  },
  {
    "source": "Delete ${entry.name}?",
    "input": "Delete notes?.txt?",
    "output": "删除 notes?.txt？"
  },
  {
    "source": "Server ${serverName} deleted successfully",
    "input": "Server production-server deleted successfully",
    "output": "服务器 production-server 删除成功"
  },
  {
    "source": "Destination ${…}",
    "input": "Destination Updated",
    "output": "备份目标已更新"
  },
  {
    "source": "Destination ${…}",
    "input": "Destination Created",
    "output": "备份目标已创建"
  },
  {
    "source": "Editing: ${patch.filePath}",
    "input": "Editing: /var/lib/app/config.yaml",
    "output": "正在编辑：/var/lib/app/config.yaml"
  },
  {
    "source": "Editing: ${selectedFile}",
    "input": "Editing: /var/lib/app/config.yaml",
    "output": "正在编辑：/var/lib/app/config.yaml"
  },
  {
    "source": "Error: ${error.message}",
    "input": "Error: ENOENT: /var/lib/app",
    "output": "错误：ENOENT: /var/lib/app"
  },
  {
    "source": "${selectedTypes.length} selected",
    "input": "3 selected",
    "output": "已选择 3 项"
  },
  {
    "source": "Are you sure you want to deploy \"${service.name}\"?",
    "input": "Are you sure you want to deploy \"Save Changes $1\"?",
    "output": "确定要部署“Save Changes $1”吗？"
  },
  {
    "source": "Role \"${…}\" updated",
    "input": "Role \"a\"b $& $$\" updated",
    "output": "角色“a\"b $& $$”已更新"
  },
  {
    "source": "Error deploying service ${serviceId}: ${…}",
    "input": "Error deploying service svc_1: Error: $& $1 $$\n/var/lib/app is missing",
    "output": "部署服务 svc_1 失败：Error: $& $1 $$\n/var/lib/app is missing"
  }
];
