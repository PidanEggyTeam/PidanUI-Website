# Copilot Instructions

> 本文件仅适用于 **PidanUIWebsite_VitePress**（PidanUI 官网）仓库，请勿套用到其他相关项目（如 StarLight-7693-New、EggyUI 系列）。

## 项目指南

### 交互与视觉（硬性规则）
- 搜索对话框使用 Nuxt UI 的 `UModal`（焦点陷阱 / ESC / 遮罩 / 滚动锁由组件负责），关闭后只需清空关键词并把焦点还给触发元素。
- 项目移动端左右侧栏菜单按钮使用相同的圆形品牌色样式，仅图标不同（左侧 `i-lucide-menu`，右侧 `i-lucide-panel-right`）。
- 新增动效必须遵循系统「减少动态效果」偏好，补 `@media (prefers-reduced-motion: reduce)` 分支。
- 悬浮反馈以颜色、阴影、发光为主，保持克制：卡片封面可轻微 `scale`（如 `1.04`），不要新增大位移、旋转等夸张效果。

### 一致性
- 新闻、分类、标签列表页**必须复用同一套卡片机制**（`PostCard` + `CardGrid` + `Pagination` + `usePagedPosts`）。两处例外：归档页（按年分页 + 按月折叠分组）、新闻列表第 1 页（额外渲染一张 `FeaturedPostCard` 特稿，其余仍走同一套卡片）。
- 左右移动端抽屉必须行为一致（同一份全局状态与手势实现，见 `useMobileDrawer.ts`），不要单独为某一侧写特例逻辑。

## 项目概况

| 项 | 值 |
| --- | --- |
| 定位 | PidanUI 项目官网，纯静态站点（SSG），部署于 GitHub Pages |
| 线上地址 | https://pidanui.eggycore.top（`app.baseURL = '/'`，URL 不带 `.html` 与尾斜杠） |
| 技术栈 | Nuxt `4.6.2`（Vite 8 + Nitro 预渲染）+ Vue 3 + TypeScript `~7.0.2` + Tailwind CSS `4.3.3` + Nuxt UI `4.12` + @nuxt/content `3.16.2` |
| 包管理器 | pnpm（`packageManager: pnpm@12.11.2`），CI 用 `pnpm install --frozen-lockfile` |
| 发布流程 | 推送到 `main` → `.github/workflows/deploy.yml` 构建并部署 `.output/public` |
| 许可证 | AGPL v3，禁止商业用途 |

## 常用命令

```bash
pnpm dev                       # 本地开发（默认 http://localhost:3000）
pnpm build                     # 生产构建 = nuxt generate，产物在 .output/public
pnpm preview                   # 预览（静态模式下需另配静态服务器，见下）
pnpm exec nuxt prepare         # 生成 .nuxt 类型与别名（改 nuxt.config 后手动跑一次）
```

- **构建必须零错误零警告**。`nitro.prerender.failOnError: true`，任何路由 404 都会让构建失败。
- `nuxt generate` 只产出 `.output/public`（没有 `.output/server`），因此 `pnpm preview` 不可用；本地验收静态站点请用任意支持「无扩展名 → `.html` 回退」的静态服务器。
- 项目没有单元测试，验收方式：`pnpm build` 通过 + 浏览器实看页面。

## 目录结构

```
app/                                  # srcDir
├─ app.vue                            # <UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>
├─ error.vue                          # 404 / 错误页（保留站点外壳）
├─ router.options.ts                  # scrollBehavior：禁止 window 滚动，改滚 .site-main
├─ layouts/default.vue                # 全站壳层：进度条 + 左右栏 + 主滚动区 + 搜索弹窗
├─ pages/                             # 路由即布局（见「路由与页面机制」）
├─ components/
│  ├─ content/                        # Prose 覆盖：ProsePre / ProseH2 / ProseH3
│  ├─ views/                          # 13 个页面视图 + 共用外壳 ListView
│  └─ *.vue                           # SiteSidebar / SiteRightBar / PostCard / CardGrid …
├─ composables/                       # usePosts / useSearch / useTheme / useMobileDrawer …
├─ data/                              # download.json、personalityTest.ts、socialLinks.ts
├─ utils/base.ts                      # withBase 垫片（自动导入）
└─ assets/styles/                     # 全局 CSS：main.css（入口）/ tokens.css（@theme 令牌）/ base.css / layout.css / shell.css / prose.css / animation.css​
content/posts/*.md                    # 文章（唯一内容源）
public/                               # 原样拷贝的静态资源：images/、giscus/、.nojekyll …
server/routes/                        # atom.xml、api/posts.json、api/posts/<slug>/index.json、api/search.json
shared/                               # site.ts（SITE / PAGE_SIZE / GISCUS）、types/、utils/
build/post-index.ts                   # 构建期 fs 枚举：prerender 路由全集
content.config.ts / nuxt.config.ts    # 内容集合定义 / 站点配置
```

不要提交 `.nuxt/`、`.output/`、`.data/`、`debug.log` 等产物与日志（已在 `.gitignore`）。

## 路由与页面机制

- **路由 = 文件**，不再有 `frontmatter.layout` 分派。新页面：在 `app/pages/` 建 `.vue` → 渲染对应 view 组件 → 用 `usePageSeo` 写标题描述。
- 路由表（保持旧 URL 不变）：

| URL | 文件 |
| --- | --- |
| `/`、`/about`、`/download`、`/personality-test`、`/search/` | `pages/index.vue` 等单文件 |
| `/posts/`、`/posts/page/:n`、`/posts/:slug` | `pages/posts/index.vue`、`posts/page/[page].vue`、`posts/[slug].vue` |
| `/archives/`、`/archives/page/:n` | `pages/archives/index.vue`、`archives/page/[page].vue`（第 n 页 = 第 n 个年份） |
| `/categories/`、`/categories/:name`、`/categories/:name/page/:n` | `pages/categories/**` |
| `/tags/`、`/tags/:name`、`/tags/:name/page/:n` | `pages/tags/**` |

- 站内链接一律用 `<NuxtLink :to>`；**严禁裸 `<a href>` 指向站内路由**——Nuxt 不拦截裸链接，会退化成整页刷新，页面过渡与进度条全部失效。
- 拼链接用 `withBase()`（自动导入）或 `shared/utils/term.ts` 的 `termPath` / `termPagePrefix`；分类、标签名必须 `encodeURIComponent`。
- **预渲染路由必须显式登记**：`build/post-index.ts` 的 `buildRoutes()` 由 `nuxt.config.ts` 的 `hooks['prerender:routes']` 注入。新增一类页面（比如按作者归档）时务必同步这里，否则产物里没有该页。
- 中文 term 传给 `prerender:routes` 时用原始 UTF-8（`/categories/公告`），不要预先编码，否则产物文件名会变成 `%E5%85%AC...`。
- `nitro.prerender.autoSubfolderIndex: false`：`/about` 落成 `about.html`，URL 不需要尾斜杠（giscus 的 pathname 映射依赖这一点，别随意改）。

## 内容与数据

- 文章 frontmatter：`title`、`date`（`YYYY-MM-DD HH:mm:ss`）、`categories`、`tags`、`description`、`stickypost`（仅 `true` 才置顶）、`cover`（可外链）。字段类型在 `content.config.ts` 用 zod 声明，**新增字段先改 schema**。
- `date` 由 YAML 1.2 解析为字符串，**必须**经 `shared/utils/date.ts` 的 `parsePostDate()` 按 UTC 解释，否则构建机时区不同会导致日期/年份漂移。
- 默认封面是 `/images/default_cover.webp`（webp），缺失时由 `toBasePost` 兜底。
- 数据链路：`server/routes/api/posts.json.ts`（轻量列表）与 `api/posts/<slug>/index.json`（单篇含正文）在构建期查询内容库并预渲染成静态 JSON；前端通过 `useAllPosts()` / `fetchAllPosts()` 读取。**不要在组件里直接调 `queryCollection`**——预渲染阶段拿不到请求上下文。
- 列表分页统一 `usePagedPosts(getCurrent, getSource)`，`PAGE_SIZE` 在 `shared/site.ts`（构建期枚举与前端共用同一常量）。
- 站点信息、Giscus 配置在 `shared/site.ts`；社交渠道在 `app/data/socialLinks.ts`，增删渠道只改数据。
- 文章内增强由 `usePostEnhance.ts` 在客户端完成（`[TOC]` 目录、页内锚点接管、代码块复制），是纯渐进增强：禁用 JS 时正文仍可读。

## 样式约定

- 样式分两层：全局在 `app/assets/styles/`（`main.css` 入口 → `tokens` / `base` / `layout` / `shell` / `prose` / `animation`），页面与组件样式写在各自 `.vue` 的 `<style scoped>`，**一律原生 CSS + Tailwind 工具类**，无预处理器。
- 组件层用 Nuxt UI（`UButton` / `UCard` / `UBadge` / `UModal` / `UAccordion` / `USkeleton`…），**能靠组件表达的外观不要再手写 CSS**。
- `main.css` 顶部五条铁律：`@import` 全部置顶；Tailwind 两条排在项目文件之前；`@import "@nuxt/ui"` 必须排在 `tokens.css` 之前（它自带只认 `.dark` 的 `@custom-variant dark`，要被我们的三路版本覆盖）；**不引入 Preflight**（保留 `base.css` 自己的重置）；`@theme` / `@custom-variant` 只写在 `tokens.css`。
- `base.css` 的全局 reset **必须待在 `@layer base` 里**：未分层规则（如 `* { margin:0; padding:0 }`）会压过所有 utilities，导致 Nuxt UI 组件的 `py-*` / `mt-auto` 全部失效。
- `tokens.css` 用 `@theme static` 定义令牌。注意三处「清空命名空间」的连带后果，新增色/圆角时必须补齐：
  - `--color-*: initial` 会连 Nuxt UI 的 `--color-primary` / `--color-error` 一起清掉 → 已手动补回；
  - `--radius-*: initial` 会连 `xs/sm/md/lg/xl/2xl/3xl` 一起清掉 → 已补齐，否则 `rounded-md` 整条规则消失；
  - `--breakpoint-*: initial` 需要把 `xl/2xl` 补回，否则 Nuxt UI 组件里的 `xl:` 规则静默失效。
- 品牌色板：`--color-brand-50…950`（500 = `#ffc53d`、600 = `#ff9f1a`、800 = `#a85a00`），灰阶 `--color-ink-50…950`（**不能叫 neutral**，Nuxt UI 对保留名会回退到它自己的 oklch 灰）。`app.config.ts` 里 `ui.colors = { primary: 'brand', neutral: 'ink', error: 'danger' }`。
- `--ui-primary` 指向 `--brand-deep`（`#ff9f1a`）而不是 `#ffc53d`：同一个变量既做实心按钮底色又做 `text-primary` 文字色，浅黄做文字在白底上几乎不可读。
- 换成 `U*` 组件的元素，**必须同时删掉旧语义类声明**（未分层规则恒高于工具类，不删会出现「改 class 没反应」）。
- 深色：`<html>` 上同时有 `data-theme`（三态真源）与 `.dark` / `.light`（Nuxt UI 的 `--ui-*` 按 class 切换），由 `useTheme.apply()` 与首帧内联脚本双写，**两边必须同步**。CSS 里深色只写 `.dark` 一条即可，不再需要 `prefers-color-scheme` 拷贝。
- 媒体查询**手写** `@media (max-width: Npx)`，不用 `sm:` / `md:` 变体：960px 必须与 `useMobileDrawer` 的 `matchMedia('(max-width: 960px)')` 完全一致。
- `vite.build.cssTarget` 已对齐 Tailwind v4 的支持矩阵（chrome111 / safari16.4 / firefox128）：v4 产物本身要求这个下限（`@property`、`color-mix()`、级联层），下调前必须先确认旧内核可用。
- 主题由 `<html data-theme="auto|light|dark">` + CSS 变量驱动（见 `base.css` / `useTheme.ts`）。`localStorage` key 为 `pidanui-theme`，改 key 必须同步 `nuxt.config.ts` head 里的首帧内联脚本。
- `body { overflow: hidden }`，**全站唯一纵向滚动容器是 `.site-main`**。路由滚动由 `app/router.options.ts` 接管（返回 `false` + 手动滚 `.site-main`）；页内锚点由 `usePostEnhance` 接管。
- 折叠/展开：归档月份用 `UCollapsible`（`aria-expanded` / `data-state` 由 reka 注入，动画来自 `collapsible-down/up` + `--ease-out`，因此 `base.css` 必须保留 `--ease-out` 别名）；下载页仍是手写 `grid-template-rows: 1fr ↔ 0fr`。两者都**不要**改成 `max-height` 硬编码。
- 注释风格与现有文件一致：中文、`// ====` 分节横幅，只解释“为什么”，不复述代码。

## Markdown 渲染（@nuxt/content）

- `app/components/content/Prose*.vue` 复刻了 VitePress 时期的 DOM 契约，`app/assets/styles/prose.css` 的排版依赖它：
  - `ProsePre` 必须输出 `div.language-* > button.copy + span.lang + pre.shiki`，复制按钮逻辑靠这个结构定位；
  - `ProseH2/H3` 输出 `<h2 :id><slot/><a class="header-anchor">`，标题锚点图标是 `::before` + 内联 SVG mask（`--icon-link`）画的；
  - 新增 Prose 覆盖（如 `ProseTable`）放同一目录，文件名即组件名。
- Shiki 双主题配置必须是 `highlight.theme = { light, dark }`（键名决定产物里的 `--shiki-light/--shiki-dark`），**不要用 `default`**，否则深色代码块会失去高亮。
- `[TOC]` 不是构建期占位：`fillToc()` 在客户端把文本为 `[TOC]` 的段落替换成 `.post-toc` 容器再填充。
- 数学公式走 `remark-math` + `rehype-katex`（构建期出 HTML + MathML），样式见 `prose.css` 的 `.katex*` 段。
- 文章正文不允许内联裸 HTML（MDC 会丢弃）；需要结构化块时用 Vue 组件或 MDC 语法。

## 字体与图标

- 字体走 CDN（见 `nuxt.config.ts` 的 `app.head`），**仓库不保留任何字体文件**：
  - MiSans（`misans-webfont@4.3.1`）—— 正文与 UI；
  - Cascadia Code（`@fontsource/cascadia-code@5.2.3`）—— 代码块等宽英文字体。
- 图标统一用 `<UIcon name="i-lucide-xxx" />`（品牌图标 `i-simple-icons-xxx`），已**不再使用 Font Awesome**。图标集以 `@iconify-json/lucide` / `@iconify-json/simple-icons` 本地安装，构建期内联为 SVG，运行时不请求 Iconify API。
- **新增图标必须同步 `nuxt.config.ts` 的 `icon.clientBundle.icons`**（写 `lucide:xxx` / `simple-icons:xxx`）：`scan` 只认模板里的字面量，`:name` 动态绑定的图标不登记就会退化成运行时取图。
- `app.config.ts` 里的 `icon.mode: 'svg'` 保证输出内联 `<svg>`，别改成 `css`（否则首屏只有空占位，等客户端拿到图标数据才有内容）。
- 网站 Logo 是图片资源（`public/images/logo.webp`），不属于图标体系，保持现状。
- 字体栈定义在 `base.css` 的 `:root`（`--font-ui` / `--font-code`），`tokens.css` 只做 `--font-sans` / `--font-mono` 别名。

## 移动端与抽屉

- 断点：`$bp-md = 960px` 及以下为抽屉模式；左右侧栏共用 `useMobileDrawer.ts` 的模块级状态（`activeMobileDrawer` / `drawerProgress` / `drawerOffset` / `isDragging`）。
- 抽屉必须用 `transform` + `visibility` 常驻（`display` 无法过渡），位移由 `--drawer-offset` 驱动；拖拽中加 `is-dragging` 取消过渡，避免回弹。
- 手势已实现：屏幕左右边缘内滑、抽屉内反向拖拽关闭、35% 位移或 0.5px/ms 速度阈值、滚动锁定、Esc 关闭、路由切换与跨断点自动关闭——改手势时保持这些行为。
- 交互元素（`a, button, input…`）上的触摸不应被手势劫持，判定依赖 `INTERACTIVE_SELECTOR`。

## 无障碍与降级

- 图标一律 `aria-hidden="true"` 并提供文字或 `aria-label`；可切换按钮补 `aria-expanded` / `aria-controls` / `aria-current`。
- 主内容使用 `<main id="content" role="main">`；`<html class="js">` 仅在 JS 可用时由 head 内联脚本添加，`html:not(.js)` 的降级样式必须保持可用。
- 搜索对话框用 `UModal`（焦点陷阱 / ESC / 遮罩 / 滚动锁由组件负责），JS 只负责善后（清空关键词、把焦点还给触发元素）；快捷键是 `Ctrl / ⌘ + K`，不再使用 `/`。
- 不要在模板里用 `<noscript>` 做降级（会造成 hydration mismatch），统一走 `html:not(.js)` + CSS。

## 配置与类型（易踩坑）

- `tsconfig.json` 只是 `extends ./.nuxt/tsconfig.json`；别名规则：`@` / `~` → `app/`，`~~` → 仓库根，`#shared` → `shared/`，`#server` → `server/`。
- `@nuxt/content` 需要 `better-sqlite3` 原生绑定：它已在 `pnpm-workspace.yaml` 的 `allowBuilds` 中放行，**不要在 CI 上加 `--ignore-scripts`**。
- 改了 `nuxt.config.ts` 里影响类型 / 别名的配置后跑一次 `pnpm exec nuxt prepare`，否则编辑器会报找不到自动导入。
- 服务端路由里查询内容库必须 `queryCollection(event, 'posts')`（带 event）；文件名不要写 `[slug].json.ts` 这种「参数 + 点后缀」组合，Nitro 会把后缀并进参数——需要 JSON 后缀时用 `<dir>/index.json.ts`。
- `nuxt generate` 之后不要再跑 `nuxt preview`（静态预设没有 server 产物）。

## Git 与协作

- 提交信息用中文，`feat:` / `fix:` / `style:` / `chore:` / `docs:` 前缀，一句话说明做了什么。
- PR 从 fork `ColdFieldObserver:main` 发往 `PidanEggyTeam:main`（`gh pr create --repo PidanEggyTeam/PidanUI-Website --base main --head ColdFieldObserver:main`）。
- 创建跨 fork PR 前确认 `gh auth status` 的活动账号不是组织账号（组织账号会报 `Fork collab can't be granted`），必要时 `gh auth switch -u ColdFieldObserver`。
- 中文提交信息请写入 UTF-8（无 BOM）文件后用 `git commit -F`，避免编码错乱成 `??`。

## 提交前自检清单

1. `pnpm build` 通过且**零警告**（`failOnError: true` 下任何预渲染 404 都会失败）。
2. `find .output/public -name "*.html"` 与预期路由清单一致；中文分类 / 标签文件名未被百分号编码。
3. 浏览器实看：首页、`/download`、`/posts/`、`/archives/`、`/tags/`、一篇 `/posts/<slug>`。
4. 桌面与 ≤960px 移动端各过一遍：左右抽屉开合与拖拽、搜索对话框、主题三态切换。
5. 站内跳转不整页刷新（Network 里不应出现 document 请求）。
6. 新增图标已登记进 `icon.clientBundle.icons`，新增颜色 / 圆角 / 断点来自变量，新增动效有 reduced-motion 分支。
7. 没有提交构建产物、缓存或临时文件。
