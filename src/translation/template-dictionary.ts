/**
 * Reviewed complete UI templates with exact extractor source shells.
 * `source` is the exact extractor shell; never compile its anonymous slots as a generic matcher.
 * `pattern` is an anchored runtime matcher. Use the first matching rule, then
 * `text.replace(rule.pattern, rule.target)` exactly once, without translating captures again.
 * Targets use native String.replace $1/$2/... capture references; $$ is a literal dollar sign.
 * Known operation/plural/billing branches are finite rules, not opaque captures.
 * User names, service names, paths, dates, technical values and error details stay verbatim.
 */
export const templateTranslations: {
	source: string;
	pattern: RegExp;
	target: string;
}[] = [
	{
		source: "${value} lines",
		pattern: /^(\d+) lines$/u,
		target: "$1 行",
	},
	{
		source: "Setup up to ${STARTUP_SERVERS_INCLUDED} servers",
		pattern: /^Setup up to (\d+) servers$/u,
		target: "最多可配置 $1 台服务器",
	},
	{
		source: "Are you sure you want to deploy ${selectedServices.length} service${…}? This will redeploy/restart the selected services.",
		pattern: new RegExp("^Are you sure you want to deploy (\\d+) services?\\? This will redeploy/restart the selected services\\.$", "u"),
		target: "确定要部署这 $1 个服务吗？这将重新部署或重启所选服务。",
	},
	{
		source: "This will permanently delete \"${service.name}\" and all its associated data.",
		pattern: new RegExp("^This will permanently delete \"([\\s\\S]*)\" and all its associated data\\.$", "u"),
		target: "这将永久删除“$1”及其所有关联数据。",
	},
	{
		source: "Role \"${data.roleName}\" created",
		pattern: new RegExp("^Role \"([\\s\\S]*)\" created$", "u"),
		target: "角色“$1”已创建",
	},
	{
		source: "Role \"${roleName}\" deleted",
		pattern: new RegExp("^Role \"([\\s\\S]*)\" deleted$", "u"),
		target: "角色“$1”已删除",
	},
	{
		source: "Remove \"${origin}\" from trusted origins?",
		pattern: new RegExp("^Remove \"([\\s\\S]*)\" from trusted origins\\?$", "u"),
		target: "要将“$1”从受信任来源中移除吗？",
	},
	{
		source: "Network \"${row.original.name}\" recreated in Docker",
		pattern: new RegExp("^Network \"([\\s\\S]*)\" recreated in Docker$", "u"),
		target: "网络“$1”已在 Docker 中重新创建",
	},
	{
		source: "Role \"${…}\" updated",
		pattern: new RegExp("^Role \"([\\s\\S]*)\" updated$", "u"),
		target: "角色“$1”已更新",
	},
	{
		source: "Network \"${name}\" updated from Docker",
		pattern: new RegExp("^Network \"([\\s\\S]*)\" updated from Docker$", "u"),
		target: "网络“$1”已根据 Docker 中的配置更新",
	},
	{
		source: "Browse and edit files inside the \"${volumeName}\" volume",
		pattern: new RegExp("^Browse and edit files inside the \"([\\s\\S]*)\" volume$", "u"),
		target: "浏览和编辑“$1”数据卷中的文件",
	},
	{
		source: "The network \"${row.original.name}\" will be removed from Docker and Dokploy. This action cannot be undone.",
		pattern: new RegExp("^The network \"([\\s\\S]*)\" will be removed from Docker and Dokploy\\. This action cannot be undone\\.$", "u"),
		target: "网络“$1”将从 Docker 和 Dokploy 中移除。此操作无法撤销。",
	},
	{
		source: "The image \"${…}\" will be removed from Docker. This action cannot be undone.",
		pattern: new RegExp("^The image \"([\\s\\S]*)\" will be removed from Docker\\. This action cannot be undone\\.$", "u"),
		target: "镜像“$1”将从 Docker 中移除。此操作无法撤销。",
	},
	{
		source: "Remove \"${provider.providerId}\"? Existing provisioned users will stay but the IdP will no longer be able to sync.",
		pattern: new RegExp("^Remove \"([\\s\\S]*)\"\\? Existing provisioned users will stay but the IdP will no longer be able to sync\\.$", "u"),
		target: "要移除“$1”吗？已预配的用户将保留，但此身份提供商（IdP）将无法继续同步。",
	},
	{
		source: "Delete the ${record.type} record \"${record.name}\"? This removes it from the DNS provider, not just from Dokploy.",
		pattern: new RegExp("^Delete the ([A-Z][A-Z0-9]*) record \"([\\s\\S]*)\"\\? This removes it from the DNS provider, not just from Dokploy\\.$", "u"),
		target: "要删除 $1 记录“$2”吗？此操作会从 DNS 提供商处删除该记录，而不只是从 Dokploy 中移除。",
	},
	{
		source: "Are you sure you want to delete the tag \"${tag.name}\"? This will remove the tag from all projects. This action cannot be undone.",
		pattern: new RegExp("^Are you sure you want to delete the tag \"([\\s\\S]*)\"\\? This will remove the tag from all projects\\. This action cannot be undone\\.$", "u"),
		target: "确定要删除标签“$1”吗？这将从所有项目中移除此标签。此操作无法撤销。",
	},
	{
		source: "Remove provider \"${provider.providerId}\"? Users will no longer be able to sign in with this IdP.",
		pattern: new RegExp("^Remove provider \"([\\s\\S]*)\"\\? Users will no longer be able to sign in with this IdP\\.$", "u"),
		target: "要移除提供商“$1”吗？用户将无法再通过此身份提供商（IdP）登录。",
	},
	{
		source: "Mode: ${…} (Aggressive mode recommended for better protection)",
		pattern: new RegExp("^Mode: Not Set \\(Aggressive mode recommended for better protection\\)$", "u"),
		target: "模式：未设置（建议使用激进模式以加强保护）",
	},
	{
		source: "Mode: ${…} (Aggressive mode recommended for better protection)",
		pattern: new RegExp("^Mode: ([A-Za-z][A-Za-z0-9_-]*) \\(Aggressive mode recommended for better protection\\)$", "u"),
		target: "模式：$1（建议使用激进模式以加强保护）",
	},
	{
		source: "Certificate ${…} (Leaf)",
		pattern: new RegExp("^Certificate (\\d+) \\(Leaf\\)$", "u"),
		target: "证书 $1（叶证书）",
	},
	{
		source: "(min. ${STARTUP_SERVERS_INCLUDED})",
		pattern: new RegExp("^\\(min\\. (\\d+)\\)$", "u"),
		target: "（最少 $1）",
	},
	{
		source: "Default: ${…} (Should be set to 'deny' for security)",
		pattern: new RegExp("^Default: ([A-Za-z][A-Za-z0-9_-]*) \\(Should be set to 'deny' for security\\)$", "u"),
		target: "默认值：$1（为安全起见，应设为 deny）",
	},
	{
		source: "Used: ${currentData.memory.value.used} / Limit: ${currentData.memory.value.total}",
		pattern: new RegExp("^Used: +([0-9]+(?:\\.[0-9]+)?(?: ?(?:B|KiB|MiB|GiB|TiB|kB|MB|GB|TB))?) / Limit: ([0-9]+(?:\\.[0-9]+)?(?: ?(?:B|KiB|MiB|GiB|TiB|kB|MB|GB|TB))?) *$", "u"),
		target: "已用：$1 / 限额：$2",
	},
	{
		source: "In: ${…} / Out: ${…}",
		pattern: new RegExp("^In: ([0-9]+(?:\\.[0-9]+)? (?:kB|MB|GB)) / Out: ([0-9]+(?:\\.[0-9]+)? (?:kB|MB|GB))$", "u"),
		target: "入站：$1 / 出站：$2",
	},
	{
		source: "Read: ${…} / Write: ${…}",
		pattern: new RegExp("^Read: ([0-9]+(?:\\.[0-9]+)? (?:kB|MB|GB)) / Write: ([0-9]+(?:\\.[0-9]+)? (?:kB|MB|GB))$", "u"),
		target: "读取：$1 / 写入：$2",
	},
	{
		source: "Error ${…} a backup",
		pattern: new RegExp("^Error updating a backup$", "u"),
		target: "更新备份失败",
	},
	{
		source: "Error ${…} a backup",
		pattern: new RegExp("^Error creating a backup$", "u"),
		target: "创建备份失败",
	},
	{
		source: "Are you sure you want to deploy \"${service.name}\"?",
		pattern: new RegExp("^Are you sure you want to deploy \"([\\s\\S]*)\"\\?$", "u"),
		target: "确定要部署“$1”吗？",
	},
	{
		source: "Are you sure you want to start ${selectedServices.length} services?",
		pattern: new RegExp("^Are you sure you want to start (\\d+) services\\?$", "u"),
		target: "确定要启动这 $1 个服务吗？",
	},
	{
		source: "Are you sure you want to stop ${selectedServices.length} services?",
		pattern: new RegExp("^Are you sure you want to stop (\\d+) services\\?$", "u"),
		target: "确定要停止这 $1 个服务吗？",
	},
	{
		source: "Are you sure you want to stop \"${service.name}\"?",
		pattern: new RegExp("^Are you sure you want to stop \"([\\s\\S]*)\"\\?$", "u"),
		target: "确定要停止“$1”吗？",
	},
	{
		source: "Available (v${gpuStatus.cudaVersion})",
		pattern: new RegExp("^Available \\(v([A-Za-z0-9][A-Za-z0-9.+_-]*)\\)$", "u"),
		target: "可用（v$1）",
	},
	{
		source: "Backup ${…}",
		pattern: new RegExp("^Backup Updated$", "u"),
		target: "备份已更新",
	},
	{
		source: "Backup ${…}",
		pattern: new RegExp("^Backup Created$", "u"),
		target: "备份已创建",
	},
	{
		source: "Behind ${validationState.cdnProvider}",
		pattern: new RegExp("^Behind ([^\\r\\n]+)$", "u"),
		target: "代理服务：$1",
	},
	{
		source: "${health.reservation.unsupportedComposeCount} Compose service(s) on this server aren't included — reservations aren't tracked per-service for Compose.",
		pattern: new RegExp("^(\\d+) Compose service\\(s\\) on this server aren't included — reservations aren't tracked per-service for Compose\\.$", "u"),
		target: "未包含此服务器上的 $1 个 Compose 服务，因为 Compose 的资源预留未按服务单独统计。",
	},
	{
		source: "Confirm new ${…}",
		pattern: new RegExp("^Confirm new password$", "u"),
		target: "确认新密码",
	},
	{
		source: "Confirm new ${…}",
		pattern: new RegExp("^Confirm new root password$", "u"),
		target: "确认新 Root 密码",
	},
	{
		source: "Enter new ${…}",
		pattern: new RegExp("^Enter new password$", "u"),
		target: "输入新密码",
	},
	{
		source: "Enter new ${…}",
		pattern: new RegExp("^Enter new root password$", "u"),
		target: "输入新 Root 密码",
	},
	{
		source: "Container ${action} successfully",
		pattern: new RegExp("^Container restart successfully$", "u"),
		target: "容器重启成功",
	},
	{
		source: "Failed to ${action} container: ${…}",
		pattern: new RegExp("^Failed to restart container: ([\\s\\S]*)$", "u"),
		target: "重启容器失败：$1",
	},
	{
		source: "Container ${action} successfully",
		pattern: new RegExp("^Container start successfully$", "u"),
		target: "容器启动成功",
	},
	{
		source: "Failed to ${action} container: ${…}",
		pattern: new RegExp("^Failed to start container: ([\\s\\S]*)$", "u"),
		target: "启动容器失败：$1",
	},
	{
		source: "Container ${action} successfully",
		pattern: new RegExp("^Container stop successfully$", "u"),
		target: "容器停止成功",
	},
	{
		source: "Failed to ${action} container: ${…}",
		pattern: new RegExp("^Failed to stop container: ([\\s\\S]*)$", "u"),
		target: "停止容器失败：$1",
	},
	{
		source: "Container ${action} successfully",
		pattern: new RegExp("^Container kill successfully$", "u"),
		target: "容器强制终止成功",
	},
	{
		source: "Failed to ${action} container: ${…}",
		pattern: new RegExp("^Failed to kill container: ([\\s\\S]*)$", "u"),
		target: "强制终止容器失败：$1",
	},
	{
		source: "${label} copied",
		pattern: new RegExp("^Endpoint URL copied$", "u"),
		target: "端点 URL 已复制",
	},
	{
		source: "${label} copied",
		pattern: new RegExp("^Bearer token copied$", "u"),
		target: "Bearer 令牌已复制",
	},
	{
		source: "Could not import \"${failure.name}\"",
		pattern: new RegExp("^Could not import \"([\\s\\S]*)\"$", "u"),
		target: "无法导入“$1”",
	},
	{
		source: "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
		pattern: new RegExp("^(\\d+) days? left · ends ([^\\r\\n]+) · billing starts automatically$", "u"),
		target: "剩余 $1 天 · $2 结束 · 将自动开始计费",
	},
	{
		source: "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
		pattern: new RegExp("^(\\d+) days? left · billing starts automatically$", "u"),
		target: "剩余 $1 天 · 将自动开始计费",
	},
	{
		source: "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
		pattern: new RegExp("^(\\d+) days? left · ends ([^\\r\\n]+) · add a card to keep your servers$", "u"),
		target: "剩余 $1 天 · $2 结束 · 请添加银行卡以保留服务器",
	},
	{
		source: "${billingStatus.trialDaysRemaining} day${…} left${…}${…}",
		pattern: new RegExp("^(\\d+) days? left · add a card to keep your servers$", "u"),
		target: "剩余 $1 天 · 请添加银行卡以保留服务器",
	},
	{
		source: "Expires in ${daysUntilExpiration} days",
		pattern: new RegExp("^Expires in (\\d+) days$", "u"),
		target: "$1 天后到期",
	},
	{
		source: "Editing: ${patch.filePath}",
		pattern: new RegExp("^Editing: ([\\s\\S]+)$", "u"),
		target: "正在编辑：$1",
	},
	{
		source: "Enabled (${gpuStatus.gpuResources} GPU${…})",
		pattern: new RegExp("^Enabled \\((\\d+) GPUs?\\)$", "u"),
		target: "已启用（$1 个 GPU）",
	},
	{
		source: "Error configuring Gitea: ${error.message}",
		pattern: new RegExp("^Error configuring Gitea: ([\\s\\S]*)$", "u"),
		target: "配置 Gitea 失败：$1",
	},
	{
		source: "Error deleting service ${serviceId}: ${…}",
		pattern: new RegExp("^Error deleting service ([^\\s:]+): ([\\s\\S]*)$", "u"),
		target: "删除服务 $1 失败：$2",
	},
	{
		source: "Error deploying service ${serviceId}: ${…}",
		pattern: new RegExp("^Error deploying service ([^\\s:]+): ([\\s\\S]*)$", "u"),
		target: "部署服务 $1 失败：$2",
	},
	{
		source: "Error moving service ${serviceId}: ${…}",
		pattern: new RegExp("^Error moving service ([^\\s:]+): ([\\s\\S]*)$", "u"),
		target: "移动服务 $1 失败：$2",
	},
	{
		source: "Error starting service ${serviceId}",
		pattern: new RegExp("^Error starting service ([^\\s:]+)$", "u"),
		target: "启动服务 $1 失败",
	},
	{
		source: "Error stopping service ${serviceId}",
		pattern: new RegExp("^Error stopping service ([^\\s:]+)$", "u"),
		target: "停止服务 $1 失败",
	},
	{
		source: "Error testing the provider: ${…}",
		pattern: new RegExp("^Error testing the provider: ([\\s\\S]*)$", "u"),
		target: "测试提供商失败：$1",
	},
	{
		source: "Error updating \"${domain.host}\"",
		pattern: new RegExp("^Error updating \"([\\s\\S]*)\"$", "u"),
		target: "更新“$1”失败",
	},
	{
		source: "Expected ${…}",
		pattern: new RegExp("^Expected (1 10 5269 talk\\.example\\.com|0 issue \"letsencrypt\\.org\")$", "u"),
		target: "预期格式：$1",
	},
	{
		source: "Expired on ${…}",
		pattern: new RegExp("^Expired on ([^\\r\\n]+)$", "u"),
		target: "已于 $1 到期",
	},
	{
		source: "Expires ${…}",
		pattern: new RegExp("^Expires ([^\\r\\n]+)$", "u"),
		target: "将于 $1 到期",
	},
	{
		source: "Failed to create environment: ${…}",
		pattern: new RegExp("^Failed to create environment: ([\\s\\S]*)$", "u"),
		target: "创建环境失败：$1",
	},
	{
		source: "${failed} service${…} failed to deploy",
		pattern: new RegExp("^(\\d+) services? failed to deploy$", "u"),
		target: "$1 个服务部署失败",
	},
	{
		source: "Failed to disconnect repository: ${…}",
		pattern: new RegExp("^Failed to disconnect repository: ([\\s\\S]*)$", "u"),
		target: "断开仓库连接失败：$1",
	},
	{
		source: "Failed to update environment: ${…}",
		pattern: new RegExp("^Failed to update environment: ([\\s\\S]*)$", "u"),
		target: "更新环境失败：$1",
	},
	{
		source: "Failed to update log cleanup schedule: ${…}",
		pattern: new RegExp("^Failed to update log cleanup schedule: ([\\s\\S]*)$", "u"),
		target: "更新日志清理计划失败：$1",
	},
	{
		source: "Force logout for ${row.original.firstName} ${row.original.lastName} (${row.original.email})?",
		pattern: new RegExp("^Force logout for ([\\s\\S]*?) ([\\s\\S]*?) \\(([^\\r\\n]+)\\)\\?$", "u"),
		target: "要强制用户 $1 $2（$3）退出登录吗？",
	},
	{
		source: "Used: ${currentData.disk.value.diskUsage} GB / Limit: ${currentData.disk.value.diskTotal} GB",
		pattern: new RegExp("^Used: +([0-9]+(?:\\.[0-9]+)?) GB / Limit: ([0-9]+(?:\\.[0-9]+)?) GB$", "u"),
		target: "已用：$1 GB / 限额：$2 GB",
	},
	{
		source: "Imported ${result.imported.length} network(s)",
		pattern: new RegExp("^Imported (\\d+) network\\(s\\)$", "u"),
		target: "已导入 $1 个网络",
	},
	{
		source: "Installed (v${gpuStatus.driverVersion})",
		pattern: new RegExp("^Installed \\(v([A-Za-z0-9][A-Za-z0-9.+_-]*)\\)$", "u"),
		target: "已安装（v$1）",
	},
	{
		source: "Installed: ${…}",
		pattern: new RegExp("^Installed: ([^\\r\\n]+)$", "u"),
		target: "已安装：$1",
	},
	{
		source: "last ${MAX_LOG_LINES}",
		pattern: new RegExp("^last (\\d+)$", "u"),
		target: "最近 $1 行",
	},
	{
		source: "You have ${daysLabel} left in your free trial. Add a payment method to keep your servers.",
		pattern: new RegExp("^You have (\\d+) days? left in your free trial\\. Add a payment method to keep your servers\\.$", "u"),
		target: "您的免费试用还剩 $1 天。请添加付款方式以保留服务器。",
	},
	{
		source: "Message: ${message}",
		pattern: new RegExp("^Message: ([\\s\\S]*)$", "u"),
		target: "消息：$1",
	},
	{
		source: "Name must be at most ${API_KEY_NAME_MAX_LENGTH} characters",
		pattern: new RegExp("^Name must be at most (\\d+) characters$", "u"),
		target: "名称不能超过 $1 个字符",
	},
	{
		source: "${selectedNetworks.length} network${…} selected",
		pattern: new RegExp("^(\\d+) networks? selected$", "u"),
		target: "已选择 $1 个网络",
	},
	{
		source: "${result.missing.length} network(s) no longer exist in Docker",
		pattern: new RegExp("^(\\d+) network\\(s\\) no longer exist in Docker$", "u"),
		target: "$1 个网络已不存在于 Docker 中",
	},
	{
		source: "New file in ${folderPath}/",
		pattern: new RegExp("^New file in ([\\s\\S]+)/$", "u"),
		target: "在 $1/ 中新建文件",
	},
	{
		source: "Failed to ${…} organization",
		pattern: new RegExp("^Failed to update organization$", "u"),
		target: "更新组织失败",
	},
	{
		source: "Failed to ${…} organization",
		pattern: new RegExp("^Failed to create organization$", "u"),
		target: "创建组织失败",
	},
	{
		source: "Organization ${…} successfully",
		pattern: new RegExp("^Organization updated successfully$", "u"),
		target: "组织更新成功",
	},
	{
		source: "Organization ${…} successfully",
		pattern: new RegExp("^Organization created successfully$", "u"),
		target: "组织创建成功",
	},
	{
		source: "$${…} per ${…}",
		pattern: new RegExp("^\\$([0-9]+\\.[0-9]{2}) per year$", "u"),
		target: "每年 $$$1",
	},
	{
		source: "$${…} per ${…}",
		pattern: new RegExp("^\\$([0-9]+\\.[0-9]{2}) per month$", "u"),
		target: "每月 $$$1",
	},
	{
		source: "Project name must match \"${expectedName}\"",
		pattern: new RegExp("^Project name must match \"([\\s\\S]*)\"$", "u"),
		target: "项目名称必须与“$1”一致",
	},
	{
		source: "${success} service${…} queued for deployment",
		pattern: new RegExp("^(\\d+) services? queued for deployment$", "u"),
		target: "$1 个服务已加入部署队列",
	},
	{
		source: "${data.length} record${…}",
		pattern: new RegExp("^(\\d+) records?$", "u"),
		target: "$1 条记录",
	},
	{
		source: "Remove stale record ${stale.name}",
		pattern: new RegExp("^Remove stale record ([\\s\\S]+)$", "u"),
		target: "移除失效记录 $1",
	},
	{
		source: "Removed stale record \"${name}\"",
		pattern: new RegExp("^Removed stale record \"([\\s\\S]*)\"$", "u"),
		target: "已移除失效记录“$1”",
	},
	{
		source: "Requests ${…}",
		pattern: new RegExp("^Requests deactivated$", "u"),
		target: "请求日志已停用",
	},
	{
		source: "Requests ${…}",
		pattern: new RegExp("^Requests activated$", "u"),
		target: "请求日志已启用",
	},
	{
		source: "Restarting container ${containerAppName}",
		pattern: new RegExp("^Restarting container ([\\s\\S]+)$", "u"),
		target: "正在重启容器 $1",
	},
	{
		source: "Schedule ${…} successfully",
		pattern: new RegExp("^Schedule updated successfully$", "u"),
		target: "定时任务更新成功",
	},
	{
		source: "Schedule ${…} successfully",
		pattern: new RegExp("^Schedule created successfully$", "u"),
		target: "定时任务创建成功",
	},
	{
		source: "Selected ${selectedTags.length} tags",
		pattern: new RegExp("^Selected (\\d+) tags$", "u"),
		target: "已选择 $1 个标签",
	},
	{
		source: "${success} services deleted successfully",
		pattern: new RegExp("^(\\d+) services deleted successfully$", "u"),
		target: "$1 个服务删除成功",
	},
	{
		source: "${success} services moved successfully",
		pattern: new RegExp("^(\\d+) services moved successfully$", "u"),
		target: "$1 个服务移动成功",
	},
	{
		source: "${success} services started successfully",
		pattern: new RegExp("^(\\d+) services started successfully$", "u"),
		target: "$1 个服务启动成功",
	},
	{
		source: "${success} services stopped successfully",
		pattern: new RegExp("^(\\d+) services stopped successfully$", "u"),
		target: "$1 个服务停止成功",
	},
	{
		source: "Show showcase slide ${…}",
		pattern: new RegExp("^Show showcase slide (\\d+)$", "u"),
		target: "显示展示幻灯片 $1",
	},
	{
		source: "Error ${…} the Destination",
		pattern: new RegExp("^Error Updating the Destination$", "u"),
		target: "更新备份目标失败",
	},
	{
		source: "Error ${…} the Destination",
		pattern: new RegExp("^Error Creating the Destination$", "u"),
		target: "创建备份目标失败",
	},
	{
		source: "The volume \"${row.original.Name}\" will be removed from Docker. This action cannot be undone.",
		pattern: new RegExp("^The volume \"([\\s\\S]*)\" will be removed from Docker\\. This action cannot be undone\\.$", "u"),
		target: "数据卷“$1”将从 Docker 中移除。此操作无法撤销。",
	},
	{
		source: "This will permanently delete ${entryPath}${…}.",
		pattern: new RegExp("^This will permanently delete (/[\\s\\S]*?) and all its contents\\.$", "u"),
		target: "这将永久删除 $1 及其所有内容。",
	},
	{
		source: "This will permanently delete ${entryPath}${…}.",
		pattern: new RegExp("^This will permanently delete (/[\\s\\S]*)\\.$", "u"),
		target: "这将永久删除 $1。",
	},
	{
		source: "${e.message} Try manually: rclone ls ${connectionString}",
		pattern: new RegExp("^([\\s\\S]*?)(?:\\n\\n| )Try manually: (rclone ls :s3,[\\s\\S]+)$", "u"),
		target: "$1\n\n请手动尝试：$2",
	},
	{
		source: "${…} users",
		pattern: new RegExp("^(\\d+|undefined) users$", "u"),
		target: "$1 位用户",
	},
	{
		source: "View domains for ${provider.name}",
		pattern: new RegExp("^View domains for ([\\s\\S]+)$", "u"),
		target: "查看 $1 的域名",
	},
	{
		source: "Volume backup ${…} successfully",
		pattern: new RegExp("^Volume backup updated successfully$", "u"),
		target: "数据卷备份更新成功",
	},
	{
		source: "Volume backup ${…} successfully",
		pattern: new RegExp("^Volume backup created successfully$", "u"),
		target: "数据卷备份创建成功",
	},
	{
		source: "Welcome back, ${firstName}",
		pattern: new RegExp("^Welcome back, ([\\s\\S]*)$", "u"),
		target: "欢迎回来，$1",
	},
	{
		source: "You are now viewing as ${…}",
		pattern: new RegExp("^You are now viewing as ([\\s\\S]+)$", "u"),
		target: "您当前正以 $1 的身份查看",
	},
	{
		source: "Network \"${name}\" recreated in Docker",
		pattern: new RegExp("^Network \"([\\s\\S]*)\" recreated in Docker$", "u"),
		target: "网络“$1”已在 Docker 中重新创建",
	},
	{
		source: "Certificate ${…}",
		pattern: new RegExp("^Certificate (\\d+)$", "u"),
		target: "证书 $1",
	},
	{
		source: "Default ${…}",
		pattern: new RegExp("^Default (ghcr\\.io/tursodatabase/libsql-server:v0\\.24\\.32|postgres:18|mariadb:11|postgres|redis:8|mysql:8|mariadb|mongo:8|libsql|mongo|mysql)$", "u"),
		target: "默认值：$1",
	},
	{
		source: "Delete ${entry.name}?",
		pattern: new RegExp("^Delete ([\\s\\S]+)\\?$", "u"),
		target: "删除 $1？",
	},
	{
		source: "Server ${serverName} deleted successfully",
		pattern: new RegExp("^Server ([\\s\\S]*) deleted successfully$", "u"),
		target: "服务器 $1 删除成功",
	},
	{
		source: "Destination ${…}",
		pattern: new RegExp("^Destination Updated$", "u"),
		target: "备份目标已更新",
	},
	{
		source: "Destination ${…}",
		pattern: new RegExp("^Destination Created$", "u"),
		target: "备份目标已创建",
	},
	{
		source: "Editing: ${selectedFile}",
		pattern: new RegExp("^Editing: ([\\s\\S]+)$", "u"),
		target: "正在编辑：$1",
	},
	{
		source: "Error: ${error.message}",
		pattern: new RegExp("^Error: ([\\s\\S]*)$", "u"),
		target: "错误：$1",
	},
	{
		source: "${selectedTypes.length} selected",
		pattern: new RegExp("^(\\d+) selected$", "u"),
		target: "已选择 $1 项",
	},
	// A service name can be arbitrary text: apply this suffix-only rule last.
	{
		source: "${service.name} deleted successfully",
		pattern: new RegExp("^([\\s\\S]+) deleted successfully$", "u"),
		target: "$1 删除成功",
	},
];
