# Copilot Instructions

> 本文件仅适用于 **PidanUI-Website**（PidanUI 官网）仓库，请勿套用到其他相关项目（如 StarLight-7693-New、EggyUI 系列）。

## 项目指南

### 交互与视觉（硬性规则）

- 整站版式是「**吸顶顶栏 + 主内容 + 文档流底栏**」：`SiteHeader`（Nuxt UI `UHeader`）+ `<main id="content">` + `SiteFooter`（`UFooter`）。不要再引入左右侧栏，也不要给 `main` 加固定高度或 `overflow-y: auto`。
- 移动端导航是**顶栏下方下拉面板**（`UHeader` 的 `#bottom` + `grid-rows-[0fr]↔[1fr]` + `inert`）。**禁止换成 `USlideover` / `UDrawer`**：那会带回滚动锁、遮罩与边缘手势，与当前版式冲突。也不要用 `UCollapsible`——reka 的 `Presence` 在关闭态不输出 DOM，SSR 与无 JS 时导航会整块消失。
- 断点只用 Tailwind / Nuxt UI 默认阶梯（`sm 640` / `md 768` / `lg 1024` / `xl 1280` / `2xl 1536`），移动端临界值 = `lg`。**禁止再自定义像素断点**（历史上的 960 体系已删除）。
- 新增动效必须遵循系统「减少动态效果」偏好，补 `@media (prefers-reduced-motion: reduce)` 分支。
- 悬浮反馈以颜色、阴影、发光为主，保持克制：卡片封面可轻微 `scale`（如 `1.04`），不要新增大位移、旋转等夸张效果。

### 禁止注入式增强（硬性规则）

- **禁止在 `public/` 下放 JS / CSS，再通过 `app.head` 的 `link` / `script` 注入它们来做功能增强。** 需要新交互就写 Vue 组件（`app/components/*.vue`）、composable（`app/composables/`）或客户端插件（`app/plugins/*.client.ts`）；需要新样式就写进 `app/assets/styles/` 或组件的 `<style scoped>`。`nuxt.config.ts` 的 `app.head` 只用于**站点元信息**（含首帧主题脚本）与**第三方资源的预连接**，不放本站自己写的业务逻辑；字体也不在这里从 CDN 引（见「字体与图标」）。
- 为什么（历史教训：`a3045cc` 引入 `public/custom/{custom.css,custom.js}`，`b5b79b1` 全部拆回主站代码）：
  - **SPA 不接管**：注入的脚本只在首次加载扫一遍 DOM，站内跳转后新增的页面不会被处理（滚动显现、进度条、返回顶部全部失效），而本站是 Nuxt 客户端路由。
  - **绕开样式分层**：`public/` 里的 CSS 拿不到 Tailwind 的 `@layer`，只能靠 `!important` 和特异性堆叠去压既有规则，改一处坏一片；`base.css` 的 `@layer base` 约束对它完全无效。
  - **不受类型与 lint 覆盖**：`public/` 是原样拷贝，`eslint.config.mjs` 与 `pnpm build` 都不会检查，等于在受管代码之外开了一个无人守的口子。
  - **重复实现**：站内已有 `useScrollReveal` / `PageProgress` 等能力，注入层再写一份必然与它们冲突（当时两套滚动显现就完全重叠）。
- `public/` 只放**原样发给浏览器、不需要加工的资源**：图片、`giscus/` 下的评论皮肤、`BingSiteAuth.xml`、`_headers` 之类。例外是 `giscus/*.css`——那是 giscus iframe 跨源拉取的第三方皮肤，必须公网可访问的独立 URL，不属于本站样式。**这两份皮肤必须由 `public/_headers` 补 `Access-Control-Allow-Origin: *`**：Cloudflare Workers 的静态资源默认不带 CORS 头，缺了它 giscus 会拦掉样式表、退回默认皮肤（GitHub Pages 会默认带，所以换部署方式后才发现）。

### 一致性

- 新闻、分类、标签列表页、站内搜索结果与首页「最新动态」**必须复用同一套卡片机制**（`PostCard` + `CardGrid` + `Pagination` + `usePagedPosts`）。唯一例外是归档页（按年分页 + 按月折叠分组）。**不再有特稿大卡**：`FeaturedPostCard` 已删除，新闻列表第 1 页也只是普通卡片网格。
- 卡片列数由 `app.config.ts` 的 `ui.pageGrid` 统一接管（`auto-fill` + `--grid-min: clamp(280px, 28vw, 360px)`）：1024 起稳定三列，768 两列，窄屏单列。**不要在调用点另写 `--grid-min`**，否则各页列宽会重新走偏。
- 单篇文章页（`.post-view`）**不套卡片外壳**：只有 `max-width: 56rem` 与居中，底色/描边/圆角/阴影都属于列表卡片，不要再加回文章页。
- 卡片外观只有一种语言：封面通栏 + 三行信息（标题 / 分类 · 日期 / 摘要），描边分层（`border-ink-300/60`，深色 `dark:border-default`）+ hover 阴影。**不要再给卡片加 `bg-default` 底色**——页面底 `#fafbfc` 与卡片白只差约 1% 亮度，靠底色分层等于没有边界。
- 导航项与分区判定只有一处数据源：`app/data/nav.ts` + `app/composables/useNav.ts`（顶栏、移动面板、底栏共用）。

## 项目概况

| 项       | 值                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定位     | PidanUI 项目官网，纯静态站点（SSG），以 assets-only Worker 部署于 Cloudflare Workers                                                                              |
| 线上地址 | https://pidanui.eggycore.top（`app.baseURL = '/'`，URL 不带 `.html` 与尾斜杠）                                                                                    |
| 技术栈   | Nuxt `4.6.2`（Vite 8 + Nitro 预渲染）+ Vue 3 + TypeScript（别名装 TS 6 API，见「代码风格与 CI」）+ Tailwind CSS `4.3.3` + Nuxt UI `4.12` + @nuxt/content `3.16.2` |
| 包管理器 | pnpm（`packageManager: pnpm@12.11.2`），CI 用 `pnpm install --frozen-lockfile`                                                                                    |
| 发布流程 | 分支 / PR 触发 `.github/workflows/lint.yml`（`format:check` → `lint` → `build`）；部署由维护者执行 `pnpm deploy`（`wrangler deploy`），仓库里没有 Pages 流水线    |
| 许可证   | AGPL v3，禁止商业用途                                                                                                                                             |

## 常用命令

```bash
pnpm dev                       # 本地开发（默认 http://localhost:3000）
pnpm build                     # 生产构建 = nuxi generate + 字体灌注，产物在 .output/public
pnpm preview                   # wrangler dev：按 Cloudflare 的规则跑同一份产物
pnpm preview:static            # 纯静态服务器（不带 Cloudflare 行为，备用）
pnpm deploy                    # pnpm build + wrangler deploy
pnpm exec nuxt prepare         # 生成 .nuxt 类型与别名（改 nuxt.config 后手动跑一次）
pnpm lint                      # ESLint：找「可能出错的地方」
pnpm lint:fix                  # ESLint 自动修复（漏分号等）
pnpm format                    # Prettier 全量重排
pnpm format:check              # 只检查不写入（CI 用这个）
```

- **构建必须零错误零警告**。`nitro.prerender.failOnError: true`，任何路由 404 都会让构建失败。
- `nuxi generate` 只产出 `.output/public`（没有 `.output/server`）。`nitro.preset` 已显式锁死为 `static`：Cloudflare 的环境变量会把预设切到 `cloudflare-*`，那套产物带 Worker 入口，`wrangler deploy` 会找不到 assets 目录。
- `pnpm build` 里 `node scripts/sync-fonts.mjs` 不能省：它把 HarmonyOS Sans SC 的三档分片写进 `.output/public/fonts/` 并生成 `harmonyos.css`；脚本还会清掉 Nitro 可能留下的 `server/` 与 `.wrangler/`。
- 项目没有单元测试，验收方式：`pnpm build` 通过 + `pnpm preview` 下浏览器实看页面。
- 若构建报 `Another Nuxt build is already running`，说明有残留的 node 进程占着锁：先结束该 PID（`taskkill /PID <pid> /F`），再删 `node_modules/.cache/nuxt/*.lock`。

## 代码风格与 CI

- **硬约束：语句结束必须写分号。** 两处一起兜：Prettier 的 `"semi": true` 负责排版时补上，ESLint 的 `@stylistic/semi: ['error', 'always']` 负责当场报红（手写或粘贴代码漏分号会直接失败，不用等 `format:check`）。**不要**把任何一方改成 `false` / `'never'`。
- 分工固定：**Prettier 管排版（缩进、引号、换行、分号），ESLint 只管可能出错的地方**（未定义变量、无效 Vue 用法、可疑 TS 写法）。职责重叠的规则由 `eslint-config-prettier` 关掉，所以不要把格式化规则加回 ESLint，否则两个工具会互相改来改去。
- 配置文件：`.prettierrc.json`（`singleQuote`、`printWidth: 100`、`endOfLine: auto`）+ `.prettierignore` + `eslint.config.mjs`（flat config）。`content/` 与 `public/` 不进 Prettier：MDC 组件、KaTeX 公式和中文长句经不起换行重排。
- `endOfLine: auto` 是刻意的：仓库里存的是 LF（CI 检出 LF），Windows 工作区是 CRLF，写死 `lf` 会让本机 `format:check` 全红。
- **CI 顺序：`.github/workflows/lint.yml`（`format:check` → `lint` → `build`）**。仓库已不再使用 GitHub Pages，`deploy.yml` 已删除；部署由维护者本地 `pnpm deploy` 完成，因此 CI 里的 `build` 就是发版前唯一的构建校验。
- **TypeScript 是别名安装的**：`"typescript": "npm:@typescript/typescript6@^6.0.2"`。原因是类型化 lint 的 `typescript-eslint` 目前硬性拒绝 TS 7（启动即抛错），官方给的做法就是让 lint 工具走 TS 6 的 API（见 TS 7.0 发布说明「Running Side-by-Side with TypeScript 6.0」）。本项目构建用 `nuxt generate`、不跑 `tsc`，所以拿不到 TS 7 的 `tsc` 没有影响；**升级 TypeScript 前先确认 typescript-eslint 已支持 TS 7**，否则 `pnpm lint` 会直接崩。

## 目录结构

```
app/                                  # srcDir
├─ app.vue                            # <UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>
├─ error.vue                          # 404 / 错误页（保留站点外壳）
├─ layouts/default.vue                # 外壳：加载进度条 + 顶栏 + main#content + 底栏 + 搜索弹窗
├─ pages/                             # 路由即布局（见「路由与页面机制」）
├─ components/
│  ├─ content/                        # Prose 覆盖：ProsePre / ProseH2 / ProseH3
│  ├─ views/                          # 13 个页面视图 + 共用外壳 ListView
│  └─ *.vue                           # SiteHeader / SiteFooter / PostCard / CardGrid / AboutSection …
├─ composables/                       # usePosts / useSearch / useTheme / useNav / usePageProgress …
├─ data/                              # download.json / nav.ts / home.ts / team.ts / about.ts / socialLinks.ts
├─ utils/base.ts                      # withBase 垫片（自动导入）
└─ assets/styles/                     # main.css（入口）/ tokens.css / base.css / prose.css / animation.css
content/posts/*.md                    # 文章（唯一内容源）
public/                               # 原样拷贝的静态资源：images/、giscus/、BingSiteAuth.xml …（只放资源，不放注入式 JS/CSS，也不放字体）
server/routes/                        # atom.xml、api/posts.json、api/posts/<slug>/index.json、api/search.json
shared/                               # site.ts（SITE / PAGE_SIZE / GISCUS）、types/、utils/
build/post-index.ts                   # 构建期 fs 枚举：prerender 路由全集
content.config.ts / nuxt.config.ts    # 内容集合定义 / 站点配置
```

不要提交 `.nuxt/`、`.output/`、`.data/`、`debug.log` 等产物与日志（已在 `.gitignore`）。

## 路由与页面机制

- **路由 = 文件**，不再有 `frontmatter.layout` 分派。新页面：在 `app/pages/` 建 `.vue` → 渲染对应 view 组件 → 用 `usePageSeo` 写标题描述。
- 路由表（保持旧 URL 不变）：

| URL                                                              | 文件                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/`、`/about`、`/download`、`/personality-test`、`/search/`      | `pages/index.vue` 等单文件                                                      |
| `/posts/`、`/posts/page/:n`、`/posts/:slug`                      | `pages/posts/index.vue`、`posts/page/[page].vue`、`posts/[slug].vue`            |
| `/archives/`、`/archives/page/:n`                                | `pages/archives/index.vue`、`archives/page/[page].vue`（第 n 页 = 第 n 个年份） |
| `/categories/`、`/categories/:name`、`/categories/:name/page/:n` | `pages/categories/**`                                                           |
| `/tags/`、`/tags/:name`、`/tags/:name/page/:n`                   | `pages/tags/**`                                                                 |

- 站内链接一律用 `<NuxtLink :to>`；**严禁裸 `<a href>` 指向站内路由**——Nuxt 不拦截裸链接，会退化成整页刷新，页面过渡与进度条全部失效。
- 拼链接用 `withBase()`（自动导入）或 `shared/utils/term.ts` 的 `termPath` / `termPagePrefix`；分类、标签名必须 `encodeURIComponent`。
- **预渲染路由必须显式登记**：`build/post-index.ts` 的 `buildRoutes()` 由 `nuxt.config.ts` 的 `hooks['prerender:routes']` 注入。新增一类页面（比如按作者归档）时务必同步这里，否则产物里没有该页。
- 中文 term 传给 `prerender:routes` 时用原始 UTF-8（`/categories/公告`），不要预先编码，否则产物文件名会变成 `%E5%85%AC...`。
- `nitro.prerender.autoSubfolderIndex: false`：`/about` 落成 `about.html`，URL 不需要尾斜杠（giscus 的 pathname 映射依赖这一点，别随意改）。

## 外壳与滚动

- **滚动权在浏览器**：`body` 自然滚动（`min-height: 100dvh`，`overflow-x: clip`），**没有自定义滚动容器**。历史上那个 `height: 100vh + overflow-y: auto` 的 `.site-main` 已移除，不要以任何形式恢复它。
- 所有滚动监听 / `IntersectionObserver` / `scrollTo` 一律面向 `window`；`#content` 只作为阅读模式地标与图片统计根，不是滚动根。
- 路由滚动交给 Nuxt 默认 `scrollBehavior`（回顶、前进后退位置、hash 偏移都由框架处理）。**不要新建 `router.options.ts`**——手写版本一旦拿不到滚动容器就会 `return false`，导致回顶与前进后退全部失效。
- 需要让开吸顶顶栏的地方统一用 `--shell-header-h`（= `--ui-header-height`）：`html { scroll-padding-top }`、正文标题 `scroll-margin-top`、代码块信息栏 `position: sticky; top`、关于页章节 `scroll-mt-*`。**不要写死 64px / 4rem 这类字面值。**
- 页面容器的类名是 `.page-shell`（`UContainer`）。首屏入场动画的选择器是 `.page-shell > * > :nth-child(-n+8)`，所以每个 view 组件必须保持**单一根节点**，否则该页丢失去重入场编排。
- 顶部加载进度条 `PageProgress` + `usePageProgress` 保留；阅读进度条与滚动淡入已移除，不要重新加回来。

## 内容与数据

- 文章 frontmatter：`title`、`date`（`YYYY-MM-DD HH:mm:ss`）、`categories`、`tags`、`description`、`stickypost`（仅 `true` 才置顶）、`cover`（可外链）。字段类型在 `content.config.ts` 用 zod 声明，**新增字段先改 schema**。
- `date` 由 YAML 1.2 解析为字符串，**必须**经 `shared/utils/date.ts` 的 `parsePostDate()` 按 UTC 解释，否则构建机时区不同会导致日期/年份漂移。
- 默认封面是 `/images/default_cover.webp`（webp），缺失时由 `toBasePost` 兜底。
- 数据链路：`server/routes/api/posts.json.ts`（轻量列表）与 `api/posts/<slug>/index.json`（单篇含正文）在构建期查询内容库并预渲染成静态 JSON；前端通过 `useAllPosts()` / `fetchAllPosts()` 读取。**不要在组件里直接调 `queryCollection`**——预渲染阶段拿不到请求上下文。
- `useAllPosts()` 内部是 `useState`，**只能在 setup 顶层同步调用**，不能放进 `computed` / 模板 / 回调。
- 列表分页统一 `usePagedPosts(getCurrent, getSource)`，`PAGE_SIZE` 在 `shared/site.ts`（构建期枚举与前端共用同一常量）。
- 站点信息、Giscus 配置在 `shared/site.ts`；导航在 `app/data/nav.ts`；社区渠道在 `app/data/socialLinks.ts`；首页/团队/关于的文案在 `app/data/{home,team,about}.ts`。**改内容只改数据文件，不动版式。**

## 样式约定

- 样式分两层：全局在 `app/assets/styles/`（`main.css` 入口 → `tokens` / `base` / `prose` / `animation`），页面与组件样式写在各自 `.vue` 的 `<style scoped>`，**一律原生 CSS + Tailwind 工具类**，无预处理器。
- 组件层用 Nuxt UI（`UHeader` / `UFooter` / `UButton` / `UBadge` / `UModal` / `UAlert` / `USkeleton` / `UKbd`，页面骨架用 `UPageHero` / `UPageSection` / `UPageGrid` / `UPageCard` / `UBlogPost` / `UPage` / `UPageAside` / `UPageAnchors` / `UPageCTA`），**能靠组件表达的外观不要再手写 CSS**。
- `main.css` 的 `@import` 顺序（硬性）：`tailwindcss/theme.css` → **`tailwindcss/preflight.css`** → `tailwindcss/utilities.css` → `@import "@nuxt/ui"`（必须在 `tokens.css` 之前，它自带只认 `.dark` 的 `@custom-variant dark`，要被我们的三路版本覆盖）→ `tokens.css` → `base.css` → `prose.css` → `animation.css`。
- **Preflight 已启用**：元素级默认值（`margin` / `padding` / `box-sizing` / 表单控件 / 列表符号 / 标题字号与字重）都由它提供。**不要在 `base.css` 里重复声明这些**——两处抢同一批属性，改一处忘一处。`base.css` 只保留：主题变量、滚动条、过渡基线、`svg` 垂直对齐、`h1-h6` 字重补齐（否则只写颜色的标题会变成常规体）、`::selection`、`[data-slot='overlay']`、`html:not(.js)` 降级。
- 全局 reset **必须待在 `@layer base` 里**：未分层规则（如 `* { margin: 0 }`）会压过所有 utilities，导致 Nuxt UI 组件的 `py-*` / `mt-auto` 全部失效。
- `tokens.css` 用 `@theme static` 定义令牌。**断点不要覆盖**（用默认值）；`--radius-*: initial` 与 `--color-*: initial` 会连带清掉 Nuxt UI 依赖的键，新增色/圆角时必须补齐：
  - `--color-*: initial` 连 `--color-primary` / `--color-error` 一起清掉 → 已手动补回；
  - `--radius-*: initial` 连 `xs/sm/md/lg/xl/2xl/3xl` 一起清掉 → 已补齐，否则 `rounded-md` 整条规则消失。
- 品牌色板：`--color-brand-50…950`（500 = `#ffc53d`、600 = `#ff9f1a`、800 = `#a85a00`），灰阶 `--color-ink-50…950`（**不能叫 neutral**，Nuxt UI 对保留名会回退到它自己的 oklch 灰）。`app.config.ts` 里 `ui.colors = { primary: 'brand', neutral: 'ink', error: 'danger' }`。
- `--ui-primary` 指向 `--brand-deep`（`#ff9f1a`）而不是 `#ffc53d`：同一个变量既做实心按钮底色又做 `text-primary` 文字色，浅黄做文字在白底上几乎不可读。**主题色板是本项目的既有决定，不要"顺手优化"配色。**
- 换成 `U*` 组件的元素，**必须同时删掉旧语义类声明**（未分层规则恒高于工具类，不删会出现「改 class 没反应」）。
- 深色：`<html>` 上同时有 `data-theme`（三态真源）与 `.dark` / `.light`（Nuxt UI 的 `--ui-*` 按 class 切换），由 `useTheme.apply()` 与首帧内联脚本双写，**两边必须同步**。CSS 里深色只写 `.dark` 一条即可。
- `vite.build.cssTarget` 已对齐 Tailwind v4 的支持矩阵（chrome111 / safari16.4 / firefox128）：v4 产物本身要求这个下限（`@property`、`color-mix()`、级联层），下调前必须先确认旧内核可用。
- `body { overflow-x: clip }` 而不是 `hidden`：`hidden` 会让 body 成为滚动容器，**sticky 顶栏会直接失效**。
- 注释风格与现有文件一致：中文、`// ====` 分节横幅，只解释"为什么"，不复述代码。

## Markdown 渲染（@nuxt/content）

- `app/components/content/Prose*.vue` 定义了正文里标题与代码块的 DOM 契约，`app/assets/styles/prose.css` 的排版直接依赖它（改结构必须同步改样式）：
  - `ProsePre` 输出 `div.code-block.language-* > .code-head(span.lang + button.copy) + pre.shiki`：
    语言标签在信息栏内（不是左上角角标），信息栏 `position: sticky` 且 `top: var(--shell-header-h)`；
    复制逻辑靠 `button.copy` + `div[class*="language-"] pre code` 定位，**这两个契约名不能改**；
  - `ProseH2/H3` 输出 `<h2 :id><slot/><a class="header-anchor">`，标题锚点图标是 `::before` + 内联 SVG mask（`--icon-link`）画的；
  - 新增 Prose 覆盖（如 `ProseTable`）放同一目录，文件名即组件名。
- Shiki 双主题配置必须是 `highlight.theme = { light, dark }`（键名决定产物里的 `--shiki-light/--shiki-dark`），**不要用 `default`**，否则深色代码块会失去高亮。
- `[TOC]` 不是构建期占位：`fillToc()` 在客户端把文本为 `[TOC]` 的段落替换成 `.post-toc` 容器再填充。
- 数学公式走 `remark-math` + `rehype-katex`（构建期出 HTML + MathML），样式见 `prose.css` 的 `.katex*` 段。
- 文章正文不允许内联裸 HTML（MDC 会丢弃）；需要结构化块时用 Vue 组件或 MDC 语法。
- 正文里的站外链接由构建期 rehype 插件 `build/rehype-external-links.ts` 补 `target="_blank" rel="noopener noreferrer"`（只认 `http(s)`，站内相对路径与锚点保持原样）。新增 Markdown 处理插件时插进 `nuxt.config.ts` 的 `content.build.markdown.rehypePlugins`，本地插件用 `{ instance }` 传入。

## 字体与图标

- 字体**自包含，构建期灌注**，**仓库不保留任何字体文件，也不走 CDN**：
  - HarmonyOS Sans SC（`harmonyos-sans-sc-webfont-splitted` 的 `Regular` / `Medium` / `Bold` 三个 unicode-range 分片）—— 正文与 UI。`nuxi generate` **之后**由 `scripts/sync-fonts.mjs` 把三档 CSS 与分片平铺复制进 `.output/public/fonts/`，并生成 `fonts/harmonyos.css`（`nuxt.config.ts` 的 `app.head` 只引用这一个本地路径）；
  - Cascadia Code（`@fontsource/cascadia-code`）—— 代码块等宽英文字体，在 `main.css` 里 `@import '@fontsource/cascadia-code/400.css'` / `700.css`，由 Vite 打包。
- **MiSans 已彻底移除**：不要再把它加回回退链或引入同名包，正文栈以 `--font-ui` 为准。
- **字体栈是既有决定**：`base.css` 的 `--font-ui` / `--font-code`、`scripts/sync-fonts.mjs` 的字重列表、`main.css` 的 fontsource 导入是一组，改字体要一起动；不要在 `nuxt.config.ts` 里重新加回 `cdn.jsdelivr.net` 的字体 `<link>`。
- **新增依赖需要构建脚本时**（例如 `workerd` 的平台二进制），必须在 `pnpm-workspace.yaml` 的 `allowBuilds` 里放行，否则 `pnpm install` 会以 `ERR_PNPM_IGNORED_BUILDS` 失败。
- 图标统一用 `<UIcon name="i-lucide-xxx" />`（品牌图标 `i-simple-icons-xxx`），已**不再使用 Font Awesome**。图标集以 `@iconify-json/lucide` / `@iconify-json/simple-icons` 本地安装，构建期内联为 SVG，运行时不请求 Iconify API。**只引这两个集合**，其他集合（如 octicon、bi）没有安装，写了就是空白。
- **新增图标必须同步 `nuxt.config.ts` 的 `icon.clientBundle.icons`**（写 `lucide:xxx` / `simple-icons:xxx`）：`scan` 只认模板里的字面量，`:name` 动态绑定（导航项、特性列表、社交链接、主题图标）的图标不登记就会退化成运行时取图。
- `app.config.ts` 里的 `icon.mode: 'svg'` 保证输出内联 `<svg>`，别改成 `css`（否则首屏只有空占位）。
- 网站 Logo 是图片资源（`public/images/logo.webp`），不属于图标体系，保持现状。

## 移动端导航

- 临界值 `lg`（1024px）：`UHeader` 的 `center`（桌面横排导航）默认 `hidden lg:flex`，汉堡按钮 `lg:hidden`。
- 下拉面板挂在 `UHeader` 的 `#bottom` 插槽，用 `absolute inset-x-0 top-full`：**绝对定位不撑高顶栏**，所以展开/收起不会让页面跳动。收起态 `grid-rows-[0fr]` + `inert`（内容不占位、也不进键盘 Tab 序列），展开态 `grid-rows-[1fr]`，过渡靠 `transition-[grid-template-rows]`。
- **不做滚动锁**（不是抽屉，body 继续可滚）、**不做边缘手势**、**不接遮罩**。路由变化与 `Escape` 都要自动收起。
- 无 JS 时的导航兜底在 `SiteFooter` 的站点导航列，**不要在模板里用 `<noscript>`**（会造成 hydration mismatch）。

## 无障碍与降级

- 图标一律 `aria-hidden="true"` 并提供文字或 `aria-label`；可切换按钮补 `aria-expanded` / `aria-controls` / `aria-current`（汉堡按钮即按此实现）。
- 主内容使用 `<main id="content" role="main">`；`<html class="js">` 仅在 JS 可用时由 head 内联脚本添加，`html:not(.js)` 的降级样式必须保持可用。
- 搜索对话框用 `UModal`（焦点陷阱 / ESC / 遮罩 / 滚动锁由组件负责），JS 只负责善后（清空关键词、把焦点还给触发元素）；快捷键是 `Ctrl / ⌘ + K`，不再使用 `/`。搜索入口有两处：顶栏图标按钮（`<SearchLauncher compact />`）与新闻列表页的搜索框。
- 依赖 JS 的交互入口（性格测试卡片 `.game-entry`、搜索按钮 `.search-launcher`）都要提供 `html:not(.js)` 分支。

## 配置与类型（易踩坑）

- `tsconfig.json` 只是 `extends ./.nuxt/tsconfig.json`；别名规则：`@` / `~` → `app/`，`~~` → 仓库根，`#shared` → `shared/`，`#server` → `server/`。
- `@nuxt/content` 需要 `better-sqlite3` 原生绑定：它已在 `pnpm-workspace.yaml` 的 `allowBuilds` 中放行，**不要在 CI 上加 `--ignore-scripts`**。
- 改了 `nuxt.config.ts` 里影响类型 / 别名的配置后跑一次 `pnpm exec nuxt prepare`，否则编辑器会报找不到自动导入。
- 服务端路由里查询内容库必须 `queryCollection(event, 'posts')`（带 event）；文件名不要写 `[slug].json.ts` 这种「参数 + 点后缀」组合，Nitro 会把后缀并进参数——需要 JSON 后缀时用 `<dir>/index.json.ts`。
- `nuxt preview` 不可用（静态预设没有 server 产物）：本地验收产物请用 `pnpm preview`（`wrangler dev`，与 Cloudflare 行为一致）或 `pnpm preview:static`（纯静态服务器）。

## Git 与协作（外部贡献者）

维护者的发布流程：`pnpm deploy`（`nuxi generate` → 字体灌注 → `wrangler deploy`）。仓库里只有 `.github/workflows/lint.yml`（`format:check` → `lint` → `build`），不再有 GitHub Pages 部署流水线。本节只约束**外部贡献者（含其使用的 AI 代理）**。

- **不要直接向主仓库的 `main` 推送**：一律「分支 + PR」，`main` 只接受合并。
- 分支命名 `feat/<简述>` / `fix/<简述>` / `docs/<简述>`；同一主题的多次提交留在同一分支，不要为每个小改动开新 PR。
- **每个提交都要能独立 `pnpm build` 通过**。改版类改动按「可回滚单元」拆（先换组件、再调样式、最后补文档），便于二分定位与单独 revert。
- 提交信息用中文，`feat:` / `fix:` / `style:` / `refactor:` / `chore:` / `docs:` 前缀；正文说清「为什么这么做、影响面是什么」，不要复述 diff。**提交信息里不要用反引号包代码片段**——在部分 shell 下会被当命令执行。
- PR 指向 **`PidanEggyTeam/PidanUI-Website` 的 `main`**，从自己的 fork 发起。描述里写：改动范围、取舍理由、验证方式（`pnpm build` 结果 + 浏览器看过的页面），以及是否触及下面「不要动」的清单。
- **不要动**（属发布链路与站点身份，需先开 issue 讨论）：`nuxt.config.ts` 的 `nitro` / `icon` / `ui.theme.colors`；`wrangler.jsonc`；`shared/site.ts` 的 `SITE` 常量；`public/` 下的图片与 giscus 主题文件；`base.css` 的字体栈与 `tokens.css` 的品牌色板。**`.github/workflows/` 同样要慎重**：`lint.yml` 里 `format:check → lint → build` 的顺序是刻意排的，`build` 是发版前唯一的构建校验。
- 依赖变更必须同时提交 `pnpm-lock.yaml`（CI 用 `--frozen-lockfile`）；新增需要构建脚本的依赖要在 `pnpm-workspace.yaml` 的 `allowBuilds` 里放行。
- 不要提交产物与临时文件（`.nuxt/`、`.output/`、`.data/`、`debug.log`）；不要为了本地调试临时改 `PAGE_SIZE`、`failOnError` 这类配置后忘记还原。
- 不要对已推送的公共分支 `rebase` / `force-push`；同步上游用 merge。
- 视觉改动请附截图：浅色 + 深色、桌面 + ≤1024px 各一组。
- 不要自行合并自己的 PR（自己 fork 仓库上的 PR 除外）；有疑问在 issue 或 PR 评论里问。

## 提交前自检清单

1. `pnpm build` 通过且**零警告**（`failOnError: true` 下任何预渲染 404 都会失败）。
2. `find .output/public -name "*.html"` 与预期路由清单一致；中文分类 / 标签文件名未被百分号编码。
3. 浏览器实看：首页（Hero / 特性 / 最新动态 / 开发人员 / 加入我们）、`/download`、`/posts/`、`/archives/`、`/tags/`、`/about`、一篇 `/posts/<slug>`。
4. 宽度 1440 / 1024 / 1023 / 768 / 375 各过一遍：顶栏吸顶不抖、底栏在文末、无横向滚动、汉堡下拉面板开合与 `Escape` 收起、`aria-expanded` 正确。
5. 长文页：目录锚点、脚注、标题锚点、代码块复制按钮、代码块信息栏不被顶栏遮挡；顶部加载进度条正常收尾。
6. 站内跳转不整页刷新（Network 里不应出现 document 请求）；从页面中部跳转后新页在顶部；浏览器后退回到原位置。
7. 主题三态（auto / light / dark）切换正常，首帧不闪白；品牌色与字体观感未被改动。
8. 新增图标已登记进 `icon.clientBundle.icons`，新增颜色 / 圆角来自变量，新增动效有 reduced-motion 分支。
9. 没有提交构建产物、缓存或临时文件。
10. `pnpm format:check` 与 `pnpm lint` 都通过（CI 里它们排在 `build` 之前，本地先跑一遍省得等）。
11. `public/` 里只有资源（图片、giscus 皮肤、`BingSiteAuth.xml`），没有新增的注入式 JS / CSS，也没有字体文件。
12. `.output/public/fonts/` 里三档字重与 `harmonyos.css` 都在，产物内没有 `cdn.jsdelivr.net` 的字体请求；`pnpm preview`（wrangler dev）下 `/about`、`/posts/`、`/posts/<slug>` 都能正常返回。
13. `pnpm preview` 下 `HEAD /giscus/light.css` 带 `Access-Control-Allow-Origin: *`（没有的话评论主题会失效）。
