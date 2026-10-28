<div align="center">

![PidanUI 官网截图](https://img.remit.ee/i/q0xhELPvJ585)

# PidanUI-Website

![Last Commit](https://img.shields.io/github/last-commit/PidanEggyTeam/PidanUI-Website?label=Last%20Commit)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.6.2-00DC82?logo=Nuxt&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.44-4FC08D?logo=Vue.js&logoColor=white)](https://cn.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![License](https://img.shields.io/badge/License-AGPL--3.0-orange)

PidanUI 项目的官方网站，使用 Nuxt 4 + @nuxt/content + TypeScript + Tailwind CSS 构建，通过 `nuxt generate` 静态生成（SSG）后部署到 GitHub Pages。

</div>

## 网站结构

- **首页**：项目介绍、特性展示、下载入口。
- **下载**：`/download`，一个版本列表，提供 PidanUI 多个版本的下载链接。
- **新闻**：`/posts/`，由 @nuxt/content 驱动的内容区。列表首条为特稿大卡、其余为卡片网格，支持分类 / 标签 / 归档（按年分页、按月折叠）、站内搜索（结果关键词高亮）与 Giscus 评论。
- **关于**：`/about`，展示 PidanUI 项目的简介及项目背后的故事。
- **蛋仔专属性格测试**：`/personality-test`，蛋仔专属性格测试小游戏，关于页的小彩蛋。

## 技术栈

- [Nuxt 4](https://nuxt.com/)（Nitro 预渲染 + SSG）
- [@nuxt/content v3](https://content.nuxt.com/)（Markdown 内容库，MDC + Shiki 双主题）
- [TypeScript](https://www.typescriptlang.org/)
- [Nuxt UI v4](https://ui.nuxt.com/)（组件层：`UButton` / `UPageHeader` / `UPageGrid` / `UPageCard` / `UModal` / `UCollapsible` / `USkeleton` 等，主题色映射到站点品牌色板）
- [Tailwind CSS v4](https://tailwindcss.com/)（`@theme` 设计令牌 + 工具类；保留项目自建 reset，**不引 Preflight**）
- [KaTeX](https://katex.org/)（数学公式）

## 数据文件

- `content/posts/*.md` —— 全部文章（唯一内容源），frontmatter 字段见 `content.config.ts`。
- `app/data/download.json` —— PidanUI 版本清单，用于下载页的版本列表展示，构建时随 SSG 固化。
- `shared/site.ts` —— 站点信息、分页大小（`PAGE_SIZE`）、Giscus 配置。

## 构建步骤

1. [下载并安装 Node.js](https://nodejs.org/zh-cn)（建议 22 LTS）
2. 安装 `pnpm`：`npm install -g pnpm`（`pnpm --version` 可验证）
3. 在项目文件夹下执行 `pnpm install`
4. `pnpm dev` 启动开发服务器（默认 `http://localhost:3000`）
5. `pnpm build` 生成静态产物，输出在 **`.output/public`**

> [!TIP]
> 如果 `npm install` 安装较慢，可先执行 `npm config set registry https://registry.npmmirror.com` 切换至镜像源。

## 字体与图标

字体为 HarmonyOS Sans SC（400 / 500 / 700 三个字重，按 unicode-range 分片走 CDN） 和 Cascadia Code 分包字体（已不再使用 MiSans），通过 CDN 加载（样式表由 `nuxt.config.ts` 的 `app.head` 注入），仓库不保留字体文件。字体回退链顺序为 HarmonyOS Sans SC → PingFang SC …（定义见 `app/assets/styles/base.css` 的 `--font-ui`）。

图标使用 Nuxt UI 的 Iconify（Lucide + Simple Icons），图标集合以 `@iconify-json/*` 本地安装，**构建期直接内联为 SVG**，运行时不请求 Iconify API。已不再使用 Font Awesome。

## 交互与动效

- 字体栈、交互过渡基线（`a` / `button` / `img` / `:focus-visible`）、品牌色文本选区 —— `app/assets/styles/base.css`；
- 页面切换与 `.site-main` 前 8 个直接子块的编排式入场 —— `app/assets/styles/animation.css`（纯 CSS，遵循 `prefers-reduced-motion`）；
- 长文阅读进度条 —— `app/components/ReadingProgress.vue`（z-index 1000，压在 `.page-progress` 路由加载条下一层）；
- 返回顶部浮钮 —— `app/components/BackToTop.vue`（z-index 85，抽屉遮罩展开时会被盖住）；
- `Ctrl / ⌘ + K` 打开搜索 —— `app/plugins/shortcuts.client.ts`（输入法组合中不劫持；不再占用 `/`）。

## 关于 PidanUI

PidanUI 是一款专为 Windows & Linux 系统打造的桌面美化项目，设计灵感来源于网易游戏《蛋仔派对》。项目延续了 EggyUI 在视觉风格上的探索，同时吸取了过往项目在治理、技术与分发方式上的经验教训，重新调整了开发路线与组织方式。

PidanUI 并非 EggyUI 的官方分支，而是一个在 EggyUI 项目经历分裂与重组后，由原核心开发者与社区成员共同创建的新项目。它的目标不是复刻 EggyUI 的历史，而是在继承其技术积累与美学方向的基础上，走一条更稳定、更可持续的路。

## 部署方式

本网站部署于 **GitHub Pages**，通过静态托管的方式对外提供服务。推送到 `main` 后由 `.github/workflows/deploy.yml` 自动执行 `pnpm build` → 上传 `.output/public` → 部署 Pages。站点没有后端，所有内容以静态资源形式存在，更新时需重新构建并推送。

## 许可证

本项目采用 **AGPL v3** 许可证。

**禁止商业用途。** 任何个人或组织不得将本项目及其衍生作品用于商业目的。使用、修改、分发本项目时，请遵守 AGPL v3 的相关条款。

## 版权声明

- 本项目为《蛋仔派对》粉丝二次创作，非官方出品，禁止用于商业用途。
- 所有视觉素材均来自合规渠道或团队重绘，未使用游戏拆包/解包资源。
- 《蛋仔派对》是网易游戏的注册商标，Windows 是微软公司的注册商标。
- 本项目与网易、微软无任何隶属或赞助关系。
