# Dokploy 中文化项目开发约定

## 目录结构

当前目录是中文化扩展项目根目录，同时包含一个用于提取文案的 Dokploy 官方源码副本：

```text
dokploy-zh/
├── .github/workflows/    # 中文化扩展自己的 CI 和 Release 流程
├── dokploy/              # Dokploy 官方源码副本（独立 Git 仓库）
├── src/                  # 中文化扩展源码和词典
├── scripts/              # 提取和发布检查脚本
└── ...                   # WXT、测试和扩展配置
```

`dokploy/` 是官方 Dokploy 源码仓库，根目录其余内容属于中文化扩展。不要把翻译代码直接修改到 `dokploy/` 中，也不要复制源码到翻译项目内。根目录的 `.github/workflows/` 只负责中文化扩展；`dokploy/.github/` 属于官方项目，保持在 `dokploy/` 内，不要移动或修改其归属。

根目录发布为 GitHub 仓库时，应将 `dokploy/` 登记为 Git submodule，指向官方仓库的 `main` 分支提交。这样其他开发者克隆中文化项目后，可以通过 `git submodule update --init --remote dokploy` 获取和更新官方源码。不要把 `dokploy/` 内部文件作为根仓库普通文件提交。

初始化根仓库并登记源码子仓库的参考命令：

如果 `dokploy/` 已经是现有官方克隆，先将它临时移出根目录，再执行 `git submodule add`，避免 Git 因目录非空而拒绝添加；确认 submodule 已登记后再删除临时副本。

```bash
git init -b main
git remote add origin <中文化项目的 GitHub 仓库地址>
git submodule add -b main https://github.com/Dokploy/dokploy.git dokploy
git add .
git commit -m "chore: initialize Dokploy Chinese translator"
git push -u origin main
```

首次克隆中文化项目后：

```bash
git clone <中文化项目的 GitHub 仓库地址>
cd dokploy-zh
git submodule update --init --recursive
pnpm install --frozen-lockfile
```

## Dokploy 源码同步

`dokploy/` 的 Git 远程仓库必须使用官方仓库：

```text
https://github.com/Dokploy/dokploy
```

本项目只跟踪官方 `main` 分支。`canary` 是开发分支，不作为日常翻译和开发的同步目标。

首次检查或重新配置远程仓库时：

```bash
cd dokploy
git remote -v
git remote set-url origin https://github.com/Dokploy/dokploy
git fetch origin --prune
git switch main
git branch --set-upstream-to=origin/main main
```

以后更新官方源码：

```bash
cd dokploy
git switch main
git pull --ff-only origin main
```

`git pull --ff-only` 用于避免把本地无关提交自动合并进官方源码副本。如果工作区有本地修改，应先处理修改，再执行同步。

## 翻译同步流程

官方源码更新后，在翻译扩展中重新提取候选文案：

```bash
cd /Users/eryajf/code/cnb/dokploy-zh
pnpm extract
```

提取脚本会扫描 `dokploy/apps/dokploy`。提取结果需要人工审核，正式翻译继续维护在 `src/translation/core-dictionary.ts` 和相关词典文件中。

推荐的日常流程：

```bash
cd dokploy
git switch main
git pull --ff-only origin main

cd /Users/eryajf/code/cnb/dokploy-zh
pnpm extract
git diff
```

翻译仓库应记录与之对应的 Dokploy 源码提交，便于定位翻译是否落后于上游。
