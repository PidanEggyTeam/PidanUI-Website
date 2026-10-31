<div align="center">

![PidanUI 官网截图](https://img.remit.ee/i/q0xhELPvJ585)

# PidanUI-Website

![Last Commit](https://img.shields.io/github/last-commit/PidanEggyTeam/PidanUI-Website?label=Last%20Commit)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.6.2-00DC82?logo=Nuxt&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.44-4FC08D?logo=Vue.js&logoColor=white)](https://cn.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![License](https://img.shields.io/badge/License-AGPL--3.0-orange)

PidanUI 项目的官方网站，使用 Nuxt 4 + @nuxt/content + Nuxt UI 4 + TypeScript + Tailwind CSS 构建，通过 `nuxt generate` 静态生成（SSG）后部署到 GitHub Pages。

</div>

## 网站结构

整站是「**顶栏 + 主内容 + 底栏**」的三段式版式：顶栏吸顶常驻，导航在 1024px 以下收进顶栏下方下拉面板；底栏承担站点导航、社交渠道与实时访客。

- **首页**：`/`，左文右图的 Hero（项目名 / 简介 / 下载按钮 + 宣传图）→ 项目特性 → 最新动态（三张文章卡片）→ 开发人员（圆形头像）→ 加入社区 / 开发组。
- **下载**：`/download`，页面头部是标题与通用信息，下方每个版本一张卡片（宣传图 + 版本信息 + 下载按钮），全部静态展开。
- **新闻**：`/posts/`，由 @nuxt/content 驱动的内容区。全部是封面通栏的三行卡片（标题 / 分类·日期 / 摘要），支持分类 / 标签 / 归档（按年分页、按月折叠）、站内搜索（结果关键词高亮）与 Giscus 评论。
- **单篇文章**：`/posts/<slug>`，不套卡片外壳，正文直接落在页面底上（56rem 可读行宽）。
- **关于**：`/about`，文档式双栏：左侧锚点索引，右侧长文档章节（不堆卡片，与首页刻意区分）。
- **蛋仔专属性格测试**：`/personality-test`，关于页的小彩蛋。

## 技术栈

- [Nuxt 4](https://nuxt.com/)（Nitro 预渲染 + SSG，`nitro.prerender.failOnError: true`）
- [@nuxt/content v3](https://content.nuxt.com/)（Markdown 内容库，MDC + Shiki 双主题）
- [TypeScript](https://www.typescriptlang.org/)
- [Nuxt UI v4](https://ui.nuxt.com/)（组件层：`UHeader` / `UFooter` / `UPageHero` / `UPageSection` / `UPageCard` / `UBlogPost` / `UPage` / `UPageAnchors` / `UModal` / `UCollapsible` / `USkeleton` 等，主题色映射到站点品牌色板）
- [Tailwind CSS v4](https://tailwindcss.com/)（`@theme` 设计令牌 + 工具类；**启用 Preflight**，项目只在 `base.css` 保留主题变量与少量基线）
- [KaTeX](https://katex.org/)（数学公式）

## 外壳与滚动

- 滚动权在浏览器：`body` 自然滚动（`min-height: 100dvh`），**没有**自定义滚动容器；任何滚动监听都应挂 `window`。
- 顶栏 `SiteHeader` 用 Nuxt UI 的 `UHeader`（`position: sticky; top: 0`），底栏 `SiteFooter` 用 `UFooter`，位于文档流末尾。
- 路由滚动交给 Nuxt 默认 `scrollBehavior`（回顶、前进后退位置、hash 偏移都由框架处理，项目不再自建 `router.options.ts`）。
- 需要让开吸顶顶栏的地方统一用 `--shell-header-h`（= `--ui-header-height`）：`html` 的 `scroll-padding-top`、正文标题的 `scroll-margin-top`、代码块信息栏的 `sticky top`。

## 数据文件

- `content/posts/*.md` —— 全部文章（唯一内容源），frontmatter 字段见 `content.config.ts`。
- `app/data/download.json` —— PidanUI 版本清单，用于下载页的版本列表展示，构建时随 SSG 固化。
- `app/data/nav.ts` —— 主导航项（顶栏与移动端下拉面板共用）。
- `app/data/home.ts` / `app/data/team.ts` / `app/data/about.ts` —— 首页特性与社区入口、开发人员占位数据、关于页文案与锚点。
- `app/data/socialLinks.ts` —— 底栏「关注我们」的渠道列表。
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

字体为 HarmonyOS Sans SC（400 / 500 / 700 三个字重，按 unicode-range 分片走 CDN）和 Cascadia Code 分包字体（已不再使用 MiSans），通过 CDN 加载（样式表由 `nuxt.config.ts` 的 `app.head` 注入），仓库不保留字体文件。字体回退链顺序为 HarmonyOS Sans SC → PingFang SC …（定义见 `app/assets/styles/base.css` 的 `--font-ui`）。

图标使用 Nuxt UI 的 Iconify（Lucide + Simple Icons），图标集合以 `@iconify-json/*` 本地安装，**构建期直接内联为 SVG**，运行时不请求 Iconify API。已不再使用 Font Awesome。

## 样式分层

`app/assets/styles/` 下 5 个文件，`main.css` 是唯一入口，导入顺序有硬性要求：

| 文件 | 职责 |
| --- | --- |
| `main.css` | 层声明与 `@import` 顺序：theme → **preflight** → utilities → `@nuxt/ui` → 项目文件 |
| `tokens.css` | `@theme static` 设计令牌（色板 / 圆角 / 阴影 / 字体别名 / 容器宽度） |
| `base.css` | 主题变量真源（浅色 + 深色）、滚动条、过渡基线、`html:not(.js)` 降级 |
| `prose.css` | 文章正文排版（标题 / 列表 / 表格 / 代码块 / TOC / KaTeX） |
| `animation.css` | 页面切换过渡与首屏区块编排式入场 |

- **Preflight 已启用**：元素级默认值（margin / padding / box-sizing / 表单控件 / 列表符号 / 标题字号）由它提供，`base.css` 不再重复声明；只有需要「压过 Preflight」的项目决定（标题字重、svg 垂直对齐）才写在那里。
- **断点只用 Tailwind / Nuxt UI 默认值**：`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`，移动端临界值 = `lg`（1024）。项目不再自定义像素断点。
- 未分层规则（优先级高于所有工具类）目前只剩 `base.css` 的 `:root` 变量、`prose.css` 的图标变量与 `animation.css`。

## 交互与动效

- 过渡基线与主题变量 —— `app/assets/styles/base.css`；
- 页面切换 + 首屏区块编排式入场（`.page-shell > * > :nth-child(-n+8)`）—— `app/assets/styles/animation.css`（纯 CSS，遵循 `prefers-reduced-motion`）；
- 顶部加载进度条 —— `app/components/PageProgress.vue` + `usePageProgress`（真实推进：字体、首屏图片、资源探针）；
- 返回顶部浮钮 —— `app/components/BackToTop.vue`（监听 `window`，滚动超过 700px 出现）；
- `Ctrl / ⌘ + K` 打开搜索 —— `app/plugins/shortcuts.client.ts`（输入法组合中不劫持；不再占用 `/`）。

> 阅读进度条与滚动淡入已移除：前者与吸顶顶栏的视觉权重冲突，后者需要额外一份滚动监听，收益不足以抵消成本。

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
