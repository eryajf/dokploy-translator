export const reviewedTechnicalValues: readonly { source: string; file: string; reason: string }[] = [
  { source: "Doe", file: "components/dashboard/settings/profile/profile-form.tsx", reason: "姓氏输入框的示例人名，保留示例以避免全局替换真实用户姓氏。" },
  { source: "John", file: "components/dashboard/settings/profile/profile-form.tsx", reason: "名字输入框的示例人名，保留示例以避免全局替换真实用户名字。" },
  { source: "Vandelay Industries", file: "components/dashboard/application/update-application.tsx", reason: "应用名称输入框中的公司名称示例，属于名称数据，不作全局中文改写。" },
  { source: "username", file: "components/dashboard/settings/notifications/handle-notifications.tsx", reason: "凭据输入框中的示例账户值，保留以避免全局改写实际用户名。" },
  { source: "production", file: "components/shared/advance-breadcrumb.tsx", reason: "默认环境名称标识符，与用户可创建的环境名称保持一致，不作全局中文改写。" },
  { source: "primary", file: "components/dashboard/project/add-database.tsx", reason: "数据库角色选择框的原始枚举值，保留 primary/replica 的技术标识，不全局改写同名文件或资源。" },
  { source: "local", file: "components/dashboard/networks/show-networks.tsx", reason: "Docker 网络 Scope 的技术值 local，不是普通本地化标签。" },
  { source: "swarm", file: "components/dashboard/networks/show-networks.tsx", reason: "Docker 网络 Scope 的技术值 swarm，保持 Docker 的原始标识。" },
  {
    "source": "'/etc/dokploy/traefik'",
    "file": "components/dashboard/file-system/show-traefik-system.tsx",
    "reason": "Traefik 配置目录的路径字面值 /etc/dokploy/traefik，不能翻译。"
  },
  {
    "source": "*.sslip.io",
    "file": "components/dashboard/application/preview-deployments/show-preview-settings.tsx",
    "reason": "预览部署使用的通配域名示例 *.sslip.io，必须保留域名语法。"
  },
  {
    "source": "^http://localhost/(.*)",
    "file": "components/dashboard/application/advanced/redirects/handle-redirect.tsx",
    "reason": "重定向规则输入框中的正则表达式示例，包含捕获组，不可翻译。"
  },
  {
    "source": "| Dokploy",
    "file": "pages/dashboard/project/[projectId]/environment/[environmentId]/services/libsql/[libsqlId].tsx",
    "reason": "页面标题中的分隔符和 Dokploy 品牌名，不含待翻译自然语言。"
  },
  {
    "source": "0 issue \"letsencrypt.org\"",
    "file": "components/dashboard/settings/dns/dns-record-panel.tsx",
    "reason": "CAA DNS 记录内容示例，含 flags、issue 标签及证书颁发机构域名，必须符合 DNS 记录格式。"
  },
  {
    "source": "1 10 5269 talk.example.com",
    "file": "components/dashboard/settings/dns/dns-record-panel.tsx",
    "reason": "SRV DNS 记录内容示例，依次为优先级、权重、端口、目标主机，不可翻译。"
  },
  {
    "source": "1. Ubuntu 24.04 LTS",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "10 mail.example.com",
    "file": "components/dashboard/settings/dns/dns-record-panel.tsx",
    "reason": "MX DNS 记录内容示例，包含优先级和邮件服务器域名，不可翻译。"
  },
  {
    "source": "10. Centos 9",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "11. Centos 8",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "2. Ubuntu 23.10 LTS",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "2001:db8::1",
    "file": "components/dashboard/settings/dns/dns-record-panel.tsx",
    "reason": "DNS 记录输入框中的 IPv6 文档示例地址，必须保持地址格式。"
  },
  {
    "source": "3. Ubuntu 22.04 LTS",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "4. Ubuntu 20.04 LTS",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "5. Ubuntu 18.04 LTS",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "6. Debian 12",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "7. Debian 11",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "8. Debian 10",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "9. Fedora 40",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "支持的 Linux 发行版名称及版本号（含列表序号），属于软件名和技术版本值。"
  },
  {
    "source": "admin",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "Vault Namespace 输入框中的命名空间示例值 admin，不是管理员角色标签。"
  },
  {
    "source": "AI",
    "file": "components/dashboard/docker/logs/analyze-logs.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "alias1, alias2, alias3",
    "file": "components/dashboard/application/advanced/cluster/swarm-forms/network-form.tsx",
    "reason": "Docker 网络别名的逗号分隔示例列表，属于待配置的别名值。"
  },
  {
    "source": "amd64",
    "file": "components/dashboard/application/advanced/cluster/swarm-forms/placement-form.tsx",
    "reason": "Docker 节点架构约束中的 CPU 架构标识符 amd64。"
  },
  {
    "source": "API / CLI",
    "file": "components/proprietary/roles/manage-custom-roles.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "API URL",
    "file": "components/dashboard/settings/handle-ai.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "asd123asdasw",
    "file": "components/dashboard/settings/destination/handle-destinations.tsx",
    "reason": "凭据输入框中的示例密钥/令牌值，保留示例技术值及其格式。"
  },
  {
    "source": "AzxcvbnmKjhgfdsa...",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "凭据输入框中的示例密钥/令牌值，保留示例技术值及其格式。"
  },
  {
    "source": "backup-",
    "file": "components/dashboard/application/volume-backups/handle-volume-backups.tsx",
    "reason": "备份文件名前缀输入框的示例值 backup-，用于组成文件名。"
  },
  {
    "source": "Bash",
    "file": "components/dashboard/application/schedules/handle-schedules.tsx",
    "reason": "脚本解释器名称 Bash/sh，不是说明文案；保留软件/命令名称。"
  },
  {
    "source": "Bitbucket",
    "file": "components/dashboard/application/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "bridge",
    "file": "components/dashboard/networks/show-networks.tsx",
    "reason": "Docker 网络驱动的官方名称 bridge，与驱动技术值一致。"
  },
  {
    "source": "build",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "CI/CD",
    "file": "components/dashboard/onboarding/steps/complete-step.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "CMD-SHELL",
    "file": "components/dashboard/application/advanced/cluster/swarm-forms/health-check-form.tsx",
    "reason": "Docker healthcheck 的测试类型枚举 CMD-SHELL，必须按官方枚举名保留。"
  },
  {
    "source": "command",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "configs",
    "file": "components/dashboard/compose/general/randomize-compose.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "default",
    "file": "components/dashboard/networks/handle-network.tsx",
    "reason": "Docker IPAM 驱动输入框中的技术值 default，不是“默认”状态标签。"
  },
  {
    "source": "DELETE /domain/zone/*",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "OVH API 授权规则中的 HTTP 方法和精确路径，翻译会改变需授予的规则。"
  },
  {
    "source": "deployments",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "ntfy Topic 输入框中的通知主题标识符示例 deployments，不是部署栏目名。"
  },
  {
    "source": "DevOps",
    "file": "components/proprietary/roles/manage-custom-roles.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "Discord",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "dns:read",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "Infomaniak API 的 scope 权限标识符，必须与服务商定义的权限字符串一致。"
  },
  {
    "source": "dns:write",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "Infomaniak API 的 scope 权限标识符，必须与服务商定义的权限字符串一致。"
  },
  {
    "source": "docker",
    "file": "components/dashboard/compose/advanced/add-command.tsx",
    "reason": "Docker 自定义命令的可执行程序名前缀 docker，翻译会破坏命令。"
  },
  {
    "source": "docker info | grep Swarm",
    "file": "components/dashboard/swarm/containers/empty-states.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "docker stats",
    "file": "components/dashboard/swarm/containers/show-swarm-containers.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "dokploy",
    "file": "components/dashboard/database/backups/handle-backup.tsx",
    "reason": "数据库备份配置中的名称示例 dokploy，属于用户可填写的技术配置值。"
  },
  {
    "source": "dokploy/",
    "file": "components/dashboard/database/backups/handle-backup.tsx",
    "reason": "备份目录/前缀输入框中的路径示例 dokploy/，不能翻译路径。"
  },
  {
    "source": "domain:read",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "Infomaniak API 的 scope 权限标识符，必须与服务商定义的权限字符串一致。"
  },
  {
    "source": "Dp4kz@example.com",
    "file": "components/dashboard/settings/web-domain.tsx",
    "reason": "邮箱地址或被脱敏的邮箱地址示例，属于输入框的地址技术值，不应将地址翻译成中文。"
  },
  {
    "source": "echo Hello World",
    "file": "components/dashboard/application/advanced/general/add-command.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "email",
    "file": "components/proprietary/sso/register-oidc-dialog.tsx",
    "reason": "OIDC 用户属性映射的 claim 名称示例，指向身份令牌字段，不是普通字段标签。"
  },
  {
    "source": "email@dokploy.com",
    "file": "components/dashboard/settings/users/add-invitation.tsx",
    "reason": "邮箱地址或被脱敏的邮箱地址示例，属于输入框的地址技术值，不应将地址翻译成中文。"
  },
  {
    "source": "email@example.com",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "邮箱地址或被脱敏的邮箱地址示例，属于输入框的地址技术值，不应将地址翻译成中文。"
  },
  {
    "source": "environment",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "environment.",
    "file": "components/shared/env-autocomplete.ts",
    "reason": "环境变量自动补全的命名空间前缀，用于插入引用表达式；必须保持 environment./project./vault. 的语法。"
  },
  {
    "source": "Esc",
    "file": "components/shared/advance-breadcrumb.tsx",
    "reason": "键盘快捷键的键帽名称 Esc，保留标准按键名称。"
  },
  {
    "source": "expose",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "Fail2Ban",
    "file": "components/dashboard/settings/servers/security-audit.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "false",
    "file": "components/dashboard/libsql/general/show-internal-libsql-credentials.tsx",
    "reason": "布尔值选择框中的 false 技术值，必须保持布尔字面值。"
  },
  {
    "source": "from@example.com",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "邮箱地址或被脱敏的邮箱地址示例，属于输入框的地址技术值，不应将地址翻译成中文。"
  },
  {
    "source": "GB (",
    "file": "components/dashboard/monitoring/paid/servers/memory-chart.tsx",
    "reason": "标准计量单位（GB、KB、GHz）及相邻标点/方向符号，不含需要翻译的自然语言。"
  },
  {
    "source": "GB /",
    "file": "components/dashboard/monitoring/paid/servers/show-paid-monitoring.tsx",
    "reason": "标准计量单位（GB、KB、GHz）及相邻标点/方向符号，不含需要翻译的自然语言。"
  },
  {
    "source": "GB ↓",
    "file": "components/dashboard/monitoring/paid/servers/network-chart.tsx",
    "reason": "标准计量单位（GB、KB、GHz）及相邻标点/方向符号，不含需要翻译的自然语言。"
  },
  {
    "source": "GB)",
    "file": "components/dashboard/monitoring/paid/servers/memory-chart.tsx",
    "reason": "标准计量单位（GB、KB、GHz）及相邻标点/方向符号，不含需要翻译的自然语言。"
  },
  {
    "source": "GET /domain/zone",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "OVH API 授权规则中的 HTTP 方法和精确路径，翻译会改变需授予的规则。"
  },
  {
    "source": "GET /domain/zone/*",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "OVH API 授权规则中的 HTTP 方法和精确路径，翻译会改变需授予的规则。"
  },
  {
    "source": "GHz",
    "file": "components/dashboard/monitoring/paid/servers/show-paid-monitoring.tsx",
    "reason": "标准计量单位（GB、KB、GHz）及相邻标点/方向符号，不含需要翻译的自然语言。"
  },
  {
    "source": "Git",
    "file": "components/dashboard/application/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Gitea",
    "file": "components/dashboard/application/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Gitea URL",
    "file": "components/dashboard/settings/git/gitea/add-gitea-provider.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "github",
    "file": "components/icons/data-tools-icons.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Github",
    "file": "components/dashboard/application/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "GitHub",
    "file": "components/dashboard/compose/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "GitHub URL",
    "file": "components/dashboard/settings/git/github/add-github-provider.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "gitlab",
    "file": "components/icons/data-tools-icons.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Gitlab",
    "file": "components/dashboard/application/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "GitLab",
    "file": "components/dashboard/compose/general/generic/show.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Gitlab Url",
    "file": "components/dashboard/settings/git/gitlab/edit-gitlab-provider.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "Gitlab URL",
    "file": "components/dashboard/settings/git/gitlab/add-gitlab-provider.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "Gotify",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "GPU",
    "file": "components/dashboard/settings/servers/gpu-support.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "HTTP",
    "file": "components/dashboard/application/domains/columns.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "HTTPS",
    "file": "components/dashboard/application/domains/columns.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "ID",
    "file": "components/dashboard/swarm/applications/columns.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "ID:",
    "file": "components/dashboard/impersonation/impersonation-bar.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "image",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "IP:",
    "file": "components/dashboard/requests/columns.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "IPAM",
    "file": "components/dashboard/networks/handle-network.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "john@example.com",
    "file": "pages/index.tsx",
    "reason": "邮箱地址或被脱敏的邮箱地址示例，属于输入框的地址技术值，不应将地址翻译成中文。"
  },
  {
    "source": "KB)",
    "file": "components/dashboard/docker/upload/upload-file-modal.tsx",
    "reason": "标准计量单位（GB、KB、GHz）及相邻标点/方向符号，不含需要翻译的自然语言。"
  },
  {
    "source": "kms:Decrypt",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "AWS IAM 操作权限标识符，属于配置/核对权限所用的技术值，不可翻译。"
  },
  {
    "source": "Lark",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Let's Encrypt",
    "file": "components/dashboard/application/domains/handle-domain.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "letsencrypt",
    "file": "components/dashboard/application/domains/handle-domain.tsx",
    "reason": "Traefik cert resolver 的示例标识符 letsencrypt，需与静态配置的解析器名称一致。"
  },
  {
    "source": "libsql",
    "file": "components/icons/data-tools-icons.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Linode",
    "file": "components/dashboard/settings/servers/handle-servers.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "linux",
    "file": "components/dashboard/application/advanced/cluster/swarm-forms/placement-form.tsx",
    "reason": "Docker 节点操作系统约束的技术值 linux，需匹配节点元数据。"
  },
  {
    "source": "mariadb",
    "file": "components/dashboard/database/backups/handle-backup.tsx",
    "reason": "MariaDB 数据库用户输入框中的示例用户名 mariadb，不是自然语言标签。"
  },
  {
    "source": "Mattermost",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Microsoft Teams",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "mongo",
    "file": "components/dashboard/database/backups/handle-backup.tsx",
    "reason": "MongoDB 数据库用户输入框中的示例用户名 mongo，不是自然语言标签。"
  },
  {
    "source": "MySQL",
    "file": "components/dashboard/database/backups/handle-backup.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "networks",
    "file": "components/dashboard/compose/general/randomize-compose.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "node:16",
    "file": "components/dashboard/application/general/generic/save-docker-provider.tsx",
    "reason": "Docker 镜像输入框中的镜像名及标签 node:16，必须保持镜像引用语法。"
  },
  {
    "source": "ntfy",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "NVIDIA Container Runtime",
    "file": "components/dashboard/settings/servers/gpu-support.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "okta, entra, jumpcloud...",
    "file": "components/proprietary/sso/scim-dialog.tsx",
    "reason": "SCIM providerId 输入框中的提供商标识符示例，不是供翻译的显示名称。"
  },
  {
    "source": "openid",
    "file": "components/proprietary/sso/register-oidc-dialog.tsx",
    "reason": "OIDC 的标准 scope 名称 openid，协议固定值不可翻译。"
  },
  {
    "source": "overlay",
    "file": "components/dashboard/networks/show-networks.tsx",
    "reason": "Docker 网络驱动的官方名称 overlay，与驱动技术值一致。"
  },
  {
    "source": "picture",
    "file": "components/proprietary/sso/register-oidc-dialog.tsx",
    "reason": "OIDC 用户属性映射的 claim 名称示例，指向身份令牌字段，不是普通字段标签。"
  },
  {
    "source": "ports",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "POST /domain/zone/*",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "OVH API 授权规则中的 HTTP 方法和精确路径，翻译会改变需授予的规则。"
  },
  {
    "source": "postgres",
    "file": "components/dashboard/database/backups/handle-backup.tsx",
    "reason": "数据库用户输入框中的被脱敏示例账户值，属于配置示例而不是可翻译标签。"
  },
  {
    "source": "postgres:18",
    "file": "components/dashboard/postgres/advanced/show-custom-command.tsx",
    "reason": "Docker 镜像输入框中的被脱敏镜像名及版本标签 :18，须保留镜像引用格式。"
  },
  {
    "source": "prd",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "外部密钥服务 Config 输入框中的配置标识符示例 prd。"
  },
  {
    "source": "prod",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "外部密钥服务 Environment 输入框中的环境标识符示例 prod，不是显示环境名称的标签。"
  },
  {
    "source": "project.",
    "file": "components/shared/env-autocomplete.ts",
    "reason": "环境变量自动补全的命名空间前缀，用于插入引用表达式；必须保持 environment./project./vault. 的语法。"
  },
  {
    "source": "pss_*",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "Phase CLI/SDK token 的格式示例 pss_*，用于区分令牌类型。"
  },
  {
    "source": "Pushover",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "PUT /domain/zone/*",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "OVH API 授权规则中的 HTTP 方法和精确路径，翻译会改变需授予的规则。"
  },
  {
    "source": "re_********",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "Resend API key 的前缀及掩码格式示例 re_********，必须保留其格式。"
  },
  {
    "source": "read:pullrequest:bitbucket",
    "file": "components/dashboard/settings/git/bitbucket/add-bitbucket-provider.tsx",
    "reason": "Bitbucket API token 的 scope 标识符，必须保持官方权限字符串原样。"
  },
  {
    "source": "read:repository:bitbucket",
    "file": "components/dashboard/settings/git/bitbucket/add-bitbucket-provider.tsx",
    "reason": "Bitbucket API token 的 scope 标识符，必须保持官方权限字符串原样。"
  },
  {
    "source": "read:webhook:bitbucket",
    "file": "components/dashboard/settings/git/bitbucket/add-bitbucket-provider.tsx",
    "reason": "Bitbucket API token 的 scope 标识符，必须保持官方权限字符串原样。"
  },
  {
    "source": "read:workspace:bitbucket",
    "file": "components/dashboard/settings/git/bitbucket/add-bitbucket-provider.tsx",
    "reason": "Bitbucket API token 的 scope 标识符，必须保持官方权限字符串原样。"
  },
  {
    "source": "redis-server --port 6379",
    "file": "components/dashboard/postgres/advanced/show-custom-command.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "Resend",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "restart",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "root",
    "file": "components/dashboard/settings/servers/handle-servers.tsx",
    "reason": "SSH 用户名输入框中的系统账户名 root，不能翻译成中文账户名。"
  },
  {
    "source": "route53:ChangeResourceRecordSets",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "AWS IAM 操作权限标识符，属于配置/核对权限所用的技术值，不可翻译。"
  },
  {
    "source": "route53:ListHostedZones",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "AWS IAM 操作权限标识符，属于配置/核对权限所用的技术值，不可翻译。"
  },
  {
    "source": "route53:ListResourceRecordSets",
    "file": "components/dashboard/settings/dns/handle-dns-provider.tsx",
    "reason": "AWS IAM 操作权限标识符，属于配置/核对权限所用的技术值，不可翻译。"
  },
  {
    "source": "secret",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "HashiCorp Vault KV Mount 输入框中的挂载路径示例 secret，不是“密钥”字段标签。"
  },
  {
    "source": "SecretManagerReadOnly",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "Scaleway 的预定义权限集名称 SecretManagerReadOnly，必须按服务商定义原样保留。"
  },
  {
    "source": "secrets",
    "file": "components/dashboard/compose/general/randomize-compose.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "services",
    "file": "components/dashboard/compose/general/randomize-compose.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "set -e echo \"Hello world\"",
    "file": "components/dashboard/settings/servers/edit-script.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "Sh",
    "file": "components/dashboard/application/schedules/handle-schedules.tsx",
    "reason": "脚本解释器名称 Bash/sh，不是说明文案；保留软件/命令名称。"
  },
  {
    "source": "Slack",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "sqld --db-path iku.db --http-listen-addr 0.0.0.0:8080 --grpc-listen-addr 0.0.0.0:5001 --admin-listen-addr 0.0.0.0:5000",
    "file": "components/dashboard/postgres/advanced/show-custom-command.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "ssh",
    "file": "components/dashboard/settings/servers/setup-server.tsx",
    "reason": "可执行程序或 shell 命令示例，按要求保留命令、参数、路径和示例字面值原样。"
  },
  {
    "source": "SSH",
    "file": "components/dashboard/settings/servers/security-audit.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "SSL",
    "file": "components/dashboard/overview/show-overview-domains.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "ssm:DescribeParameters",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "AWS IAM 操作权限标识符，属于配置/核对权限所用的技术值，不可翻译。"
  },
  {
    "source": "ssm:GetParameters",
    "file": "components/dashboard/settings/vault/handle-vault-provider.tsx",
    "reason": "AWS IAM 操作权限标识符，属于配置/核对权限所用的技术值，不可翻译。"
  },
  {
    "source": "SSO",
    "file": "components/layouts/side.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "sub",
    "file": "components/proprietary/sso/register-oidc-dialog.tsx",
    "reason": "OIDC 用户属性映射的 claim 名称示例，指向身份令牌字段，不是普通字段标签。"
  },
  {
    "source": "TCP",
    "file": "components/dashboard/application/advanced/ports/handle-ports.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "Telegram",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "test",
    "file": "components/dashboard/application/advanced/security/handle-security.tsx",
    "reason": "HTTP Basic Auth 密码输入框中的示例密码 test，属于凭据技术值。"
  },
  {
    "source": "test1",
    "file": "components/dashboard/application/advanced/security/handle-security.tsx",
    "reason": "HTTP Basic Auth 用户名输入框中的示例账户 test1，属于凭据技术值。"
  },
  {
    "source": "TTL",
    "file": "components/dashboard/settings/dns/show-dns-records.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "UDP",
    "file": "components/dashboard/application/advanced/ports/handle-ports.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "UFW",
    "file": "components/dashboard/settings/servers/security-audit.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "URL:",
    "file": "components/dashboard/monitoring/paid/container/show-paid-container-monitoring.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "vault.",
    "file": "components/shared/env-autocomplete.ts",
    "reason": "环境变量自动补全的命名空间前缀，用于插入引用表达式；必须保持 environment./project./vault. 的语法。"
  },
  {
    "source": "version",
    "file": "components/shared/code-editor.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "version: '3' services: web: image: nginx ports: - \"80:80\"",
    "file": "components/dashboard/compose/general/compose-file-editor.tsx",
    "reason": "Docker Compose YAML 示例，包含版本、服务、镜像及端口映射，翻译配置键会使示例失效。"
  },
  {
    "source": "volumes",
    "file": "components/dashboard/compose/general/randomize-compose.tsx",
    "reason": "Docker Compose 的配置关键字；出现在代码编辑器补全或需改写的配置键列表中，必须保持原始键名，不能翻译成普通栏目名。"
  },
  {
    "source": "Vultr",
    "file": "components/dashboard/settings/servers/handle-servers.tsx",
    "reason": "产品、服务商或软件的专有名称，保留名称和源文案大小写，不作中文改写。"
  },
  {
    "source": "Webhook URL",
    "file": "components/dashboard/settings/notifications/handle-notifications.tsx",
    "reason": "由通用技术缩写、协议名或专有名词组成的标签；保留 AI、API、URL、GPU、IP、SSH 等原技术名称。"
  },
  {
    "source": "write:webhook:bitbucket",
    "file": "components/dashboard/settings/git/bitbucket/add-bitbucket-provider.tsx",
    "reason": "Bitbucket API token 的 scope 标识符，必须保持官方权限字符串原样。"
  },
  {
    "source": "xcas41dasde",
    "file": "components/dashboard/settings/destination/handle-destinations.tsx",
    "reason": "凭据输入框中的示例密钥/令牌值，保留示例技术值及其格式。"
  },
  {
    "source": "you@company.com",
    "file": "components/proprietary/sso/sign-in-with-sso.tsx",
    "reason": "邮箱地址或被脱敏的邮箱地址示例，属于输入框的地址技术值，不应将地址翻译成中文。"
  },
  // Additional real occurrences audited after extraction started retaining provenance.
  { source: "John", file: "pages/invitation.tsx", reason: "邀请注册表单的名字占位示例 John，属于人名数据。" },
  { source: "John", file: "pages/register.tsx", reason: "注册表单的名字占位示例 John，属于人名数据。" },
  { source: "Doe", file: "pages/invitation.tsx", reason: "邀请注册表单的姓氏占位示例 Doe，属于人名数据。" },
  { source: "Doe", file: "pages/register.tsx", reason: "注册表单的姓氏占位示例 Doe，属于人名数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/compose/update-compose.tsx", reason: "Compose 名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/libsql/update-libsql.tsx", reason: "LibSQL 名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/mariadb/update-mariadb.tsx", reason: "MariaDB 名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/mongo/update-mongo.tsx", reason: "MongoDB 名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/mysql/update-mysql.tsx", reason: "MySQL 名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/postgres/update-postgres.tsx", reason: "数据库名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/projects/handle-project.tsx", reason: "项目名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "Vandelay Industries", file: "components/dashboard/redis/update-redis.tsx", reason: "Redis 名称输入框中的示例公司名称，属于资源名称数据。" },
  { source: "email@dokploy.com", file: "pages/register.tsx", reason: "注册表单中的被脱敏邮箱地址占位示例，不是可翻译的邮箱字段标签。" },
  { source: "root", file: "components/dashboard/settings/web-server/local-server-config.tsx", reason: "本地服务器 SSH 用户名输入框的系统账户示例 root。" },
  { source: "false", file: "components/dashboard/project/add-database.tsx", reason: "创建 LibSQL 数据库时布尔选项的占位值 false，保持布尔字面值。" },
  { source: "AI", file: "components/layouts/side.tsx", reason: "侧栏人工智能设置项仅含标准技术缩写 AI。" },
  { source: "API URL", file: "components/dashboard/settings/vault/handle-vault-provider.tsx", reason: "Scaleway 和 Phase 服务端点字段仅由标准缩写 API、URL 组成。" },
  { source: "Bash", file: "components/dashboard/docker/terminal/docker-terminal.tsx", reason: "容器终端选择的 shell 程序名称 Bash，不是操作说明。" },
  { source: "CI/CD", file: "components/dashboard/settings/servers/welcome-stripe/welcome-subscription.tsx", reason: "功能标题仅含持续集成/持续交付的标准技术缩写 CI/CD。" },
  { source: "Bitbucket", file: "components/dashboard/compose/general/generic/show.tsx", reason: "Compose 源码提供商选项中的 Bitbucket 品牌名称。" },
  { source: "Bitbucket", file: "components/dashboard/settings/git/bitbucket/add-bitbucket-provider.tsx", reason: "添加 Git 提供商按钮中的 Bitbucket 品牌名称。" },
  { source: "Git", file: "components/dashboard/compose/general/generic/show.tsx", reason: "Compose 源码类型选项中的版本控制系统名称 Git。" },
  { source: "Git", file: "components/layouts/side.tsx", reason: "侧栏 Git 提供商设置项中的技术名称 Git。" },
  { source: "Gitea", file: "components/dashboard/compose/general/generic/show.tsx", reason: "Compose 源码提供商选项中的 Gitea 品牌名称。" },
  { source: "Gitea", file: "components/dashboard/settings/git/gitea/add-gitea-provider.tsx", reason: "添加 Git 提供商按钮中的 Gitea 品牌名称。" },
  { source: "Gitea URL", file: "components/dashboard/settings/git/gitea/edit-gitea-provider.tsx", reason: "提供商端点字段仅由 Gitea 品牌名和标准缩写 URL 组成。" },
  { source: "Github", file: "components/dashboard/settings/git/github/add-github-provider.tsx", reason: "添加 Git 提供商按钮中的 GitHub 品牌名称，保留源文案大小写。" },
  { source: "GitHub URL", file: "components/dashboard/settings/git/github/edit-github-provider.tsx", reason: "提供商端点字段仅由 GitHub 品牌名和标准缩写 URL 组成。" },
  { source: "GitLab", file: "components/dashboard/settings/git/gitlab/add-gitlab-provider.tsx", reason: "添加 Git 提供商按钮中的 GitLab 品牌名称。" },
  { source: "MySQL", file: "components/dashboard/database/backups/restore-backup.tsx", reason: "备份恢复的数据库引擎选项 MySQL，属于产品名称。" },
  { source: "MySQL", file: "components/dashboard/project/add-database.tsx", reason: "创建数据库的引擎选项 MySQL，属于产品名称。" },
  { source: "MySQL", file: "pages/dashboard/project/[projectId]/environment/[environmentId].tsx", reason: "环境页面数据库类型选项 MySQL，属于产品名称。" },
  { source: "Ghost", file: "components/dashboard/onboarding/steps/deploy-step.tsx", reason: "精选部署模板中的 Ghost 博客软件品牌名称，不是普通名词。" },
  { source: "WordPress", file: "components/dashboard/onboarding/steps/deploy-step.tsx", reason: "精选部署模板中的 WordPress 软件品牌名称。" },
  { source: "Uptime Kuma", file: "components/dashboard/onboarding/steps/deploy-step.tsx", reason: "精选部署模板中的 Uptime Kuma 监控软件品牌名称。" },
  { source: "Let's Encrypt", file: "components/dashboard/application/preview-deployments/add-preview-domain.tsx", reason: "预览域名证书提供商选项中的证书颁发机构品牌名称。" },
  { source: "Let's Encrypt", file: "components/dashboard/application/preview-deployments/show-preview-settings.tsx", reason: "预览部署证书提供商选项中的证书颁发机构品牌名称。" },
  { source: "Let's Encrypt", file: "components/dashboard/settings/web-domain.tsx", reason: "Web 域名证书提供商选项中的证书颁发机构品牌名称。" },
  { source: "Let's Encrypt", file: "components/proprietary/sso/forward-auth-servers.tsx", reason: "SSO 转发认证服务器的证书提供商品牌名称。" },
  { source: "HTTP", file: "components/dashboard/application/domains/show-domains.tsx", reason: "域名协议徽标仅包含标准协议名称 HTTP。" },
  { source: "HTTP", file: "components/dashboard/overview/show-overview-domains.tsx", reason: "域名概览协议徽标仅包含标准协议名称 HTTP。" },
  { source: "HTTPS", file: "components/dashboard/application/domains/handle-domain.tsx", reason: "域名安全协议选项仅包含标准协议名称 HTTPS。" },
  { source: "HTTPS", file: "components/dashboard/application/domains/show-domains.tsx", reason: "域名协议徽标仅包含标准协议名称 HTTPS。" },
  { source: "HTTPS", file: "components/dashboard/application/preview-deployments/add-preview-domain.tsx", reason: "预览域名安全协议选项仅包含标准协议名称 HTTPS。" },
  { source: "HTTPS", file: "components/dashboard/application/preview-deployments/show-preview-settings.tsx", reason: "预览部署安全协议选项仅包含标准协议名称 HTTPS。" },
  { source: "HTTPS", file: "components/dashboard/overview/show-overview-domains.tsx", reason: "域名概览协议徽标仅包含标准协议名称 HTTPS。" },
  { source: "HTTPS", file: "components/dashboard/settings/web-domain.tsx", reason: "Web 域名安全协议选项仅包含标准协议名称 HTTPS。" },
  { source: "IP:", file: "components/dashboard/settings/servers/show-servers.tsx", reason: "服务器地址前的标签仅含标准协议缩写 IP 及冒号。" },
  { source: "URL:", file: "components/dashboard/monitoring/paid/servers/show-paid-monitoring.tsx", reason: "监控端点前的标签仅含标准技术缩写 URL 及冒号。" },
  { source: "MSA/SLA", file: "components/dashboard/settings/billing/show-billing.tsx", reason: "企业套餐条目仅含主服务协议和服务等级协议的行业缩写 MSA/SLA。" },
  { source: "AAAA", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "IPv6 地址的标准 DNS 记录类型标识 AAAA。" },
  { source: "CNAME", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "规范名称的标准 DNS 记录类型标识 CNAME。" },
  { source: "MX", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "邮件交换器的标准 DNS 记录类型标识 MX。" },
  { source: "TXT", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "文本记录的标准 DNS 记录类型标识 TXT。" },
  { source: "NS", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "权威名称服务器的标准 DNS 记录类型标识 NS。" },
  { source: "SRV", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "服务定位的标准 DNS 记录类型标识 SRV。" },
  { source: "CAA", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "证书颁发机构授权的标准 DNS 记录类型标识 CAA。" },
  { source: "PTR", file: "components/dashboard/settings/dns/dns-record-panel.tsx", reason: "反向地址映射的标准 DNS 记录类型标识 PTR。" },
  { source: "tcp", file: "components/dashboard/settings/web-server/manage-traefik-ports.tsx", reason: "Traefik 端口配置的传输协议枚举 tcp，保留原始小写技术值。" },
  { source: "udp", file: "components/dashboard/settings/web-server/manage-traefik-ports.tsx", reason: "Traefik 端口配置的传输协议枚举 udp，保留原始小写技术值。" },
  { source: "sctp", file: "components/dashboard/settings/web-server/manage-traefik-ports.tsx", reason: "Traefik 端口配置的传输协议枚举 sctp，保留原始小写技术值。" },
  { source: "bridge", file: "components/dashboard/networks/handle-network.tsx", reason: "Docker 网络驱动选项的原始枚举 bridge，必须与 Docker 驱动名称一致。" },
  { source: "overlay", file: "components/dashboard/networks/handle-network.tsx", reason: "Docker 网络驱动选项的原始枚举 overlay，必须与 Docker 驱动名称一致。" },
  { source: "created", file: "components/dashboard/docker/show/show-containers.tsx", reason: "Docker 容器状态筛选的原始枚举 created，与 API 返回的 State 对应。" },
  { source: "dead", file: "components/dashboard/docker/show/show-containers.tsx", reason: "Docker 容器状态筛选的原始枚举 dead，与 API 返回的 State 对应。" },
  { source: "exited", file: "components/dashboard/docker/show/show-containers.tsx", reason: "Docker 容器状态筛选的原始枚举 exited，与 API 返回的 State 对应。" },
  { source: "paused", file: "components/dashboard/docker/show/show-containers.tsx", reason: "Docker 容器状态筛选的原始枚举 paused，与 API 返回的 State 对应。" },
  { source: "removing", file: "components/dashboard/docker/show/show-containers.tsx", reason: "Docker 容器状态筛选的原始枚举 removing，与 API 返回的 State 对应。" },
  { source: "restarting", file: "components/dashboard/docker/show/show-containers.tsx", reason: "Docker 容器状态筛选的原始枚举 restarting，与 API 返回的 State 对应。" },
  { source: "done", file: "components/dashboard/overview/show-overview-services.tsx", reason: "服务筛选的内部状态枚举 done；显示标签由独立 STATUS_LABELS 映射为 Running。" },
  { source: "error", file: "components/dashboard/overview/show-overview-services.tsx", reason: "服务筛选的内部状态枚举 error；显示标签由独立 STATUS_LABELS 映射为 Error。" },
  { source: "configs", file: "components/shared/code-editor.tsx", reason: "Docker Compose 自动补全插入的配置键 configs，不是自然语言栏目。" },
  { source: "networks", file: "components/shared/code-editor.tsx", reason: "Docker Compose 自动补全插入的顶层/服务配置键 networks。" },
  { source: "secrets", file: "components/shared/code-editor.tsx", reason: "Docker Compose 自动补全插入的配置键 secrets，不是自然语言栏目。" },
  { source: "services", file: "components/shared/code-editor.tsx", reason: "仅此文件中的 Docker Compose 自动补全配置键 services；其他页面的服务计数仍须翻译。" },
  { source: "volumes", file: "components/shared/code-editor.tsx", reason: "Docker Compose 自动补全插入的顶层/服务配置键 volumes。" },
  { source: "${{vault.<name>./path/to/parameter}}", file: "components/dashboard/settings/vault/handle-vault-provider.tsx", reason: "密钥引用表达式示例，语法必须原样保留，翻译会破坏用户可复制的引用格式。" },
  { source: "${{vault.<name>.folder/secret-name}}", file: "components/dashboard/settings/vault/handle-vault-provider.tsx", reason: "密钥引用表达式示例，语法必须原样保留，翻译会破坏用户可复制的引用格式。" },
  { source: "${{vault.<name>.SECRET_KEY}}", file: "components/dashboard/settings/vault/handle-vault-provider.tsx", reason: "密钥引用表达式示例，语法必须原样保留，翻译会破坏用户可复制的引用格式。" },
];
