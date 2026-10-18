# Copilot Instructions

> 本文件仅适用于 **PidanUIWebsite_VitePress**（PidanUI 官网）仓库，请勿套用到其他相关项目（如 StarLight-7693-New、EggyUI 系列）。

## 项目指南

### 交互与视觉（硬性规则）
- 搜索对话框应立即关闭原生 dialog，并由 CSS 对其离场视觉状态做过渡；不要通过 JS 等待动画结束后才调用 close()。
- 项目移动端左右侧栏菜单按钮使用相同的圆形品牌色样式，仅图标不同（左侧 `fa-bars`，右侧 `fa-table-columns`）。
- 新增动效必须遵循系统「减少动态效果」偏好，补 `@media (prefers-reduced-motion: reduce)` 分支。
- 悬浮反馈以颜色、阴影、发光为主，保持克制：卡片封面可轻微 `scale`（如 `1.04`），不要新增大位移、旋转等夸张效果。

### 一致性
- 新闻、分类、标签列表页**必须复用同一套卡片机制**（`PostCard` + `CardGrid` + `Pagination` + `usePagedPosts`），只有归档页例外（按年分页 + 按月折叠分组）。
- 左右移动端抽屉必须行为一致（同一份全局状态与手势实现，见 `useMobileDrawer.ts`），不要单独为某一侧写特例逻辑。

## 项目概况

| 项 | 值 |
| --- | --- |
| 定位 | PidanUI 项目官网，纯静态站点（SSG），部署于 GitHub Pages |
| 线上地址 | https://pidanui.eggycore.top（`base = '/'`，`cleanUrls = true`） |
| 技术栈 | VitePress `2.0.0-alpha.20`（Vite 8）+ Vue 3 + TypeScript `~7.0.2` + SCSS |
| 包管理器 | pnpm（`packageManager: pnpm@12.11.2`），CI 用 `pnpm install --frozen-lockfile` |
| 发布流程 | 推送到 `main` → `.github/workflows/deploy.yml` 自动构建并部署 Pages |
| 许可证 | AGPL v3，禁止商业用途 |

## 常用命令

```bash
pnpm dev                       # 本地开发（通常 http://localhost:5173，被占用会自动顺延）
pnpm build                     # 生产构建，产物在 docs/.vitepress/dist
pnpm preview                   # 预览构建产物
pnpm exec tsc --noEmit         # 类型检查（改动 TS/配置后必跑）
```

- **构建与开发必须零警告**。出现警告先修，不要忽略。
- 项目没有单元测试，验收方式：`pnpm build` + `tsc --noEmit` 通过，并用浏览器实际打开页面确认渲染与交互。

## 目录结构

```
docs/
├─ index.md / download.md / about.md / personality-test.md   # 静态页面（frontmatter.layout 决定外壳）
├─ news/index.md, news/page/[page].md                        # 新闻列表（经 rewrites 映射到 /posts/）
├─ archives/…  categories/…  tags/…  search/index.md          # 列表 / 归档 / 搜索页（含动态路由）
├─ posts/*.md                                                # 文章正文，URL 为 /posts/<slug>
├─ public/                                                   # 原样拷贝的静态资源：images/（logo.webp、favicon.ico、default_cover.webp…）、giscus/{light,dark}.css
└─ .vitepress/
   ├─ config.mts        # 站点配置：head、rewrites、cleanUrls、markdown、transformPageData/Head、Vite、Atom feed
   ├─ env.d.ts          # *.vue / *.scss / markdown-it 插件的模块声明
   ├─ build/posts.ts    # 构建期读取 docs/posts/*.md frontmatter（供 *.paths.ts 使用）
   └─ theme/
      ├─ index.ts, Layout.vue        # 主题入口与页面外壳（按 layout 分派视图）
      ├─ config.ts                   # SITE / SOCIAL_LINKS / PAGE_SIZE / GISCUS 常量（唯一来源）
      ├─ types.ts, postMap.ts, utils.ts
      ├─ posts.data.ts, postsSearch.data.ts   # 内容加载器（轻量 / 含正文）
      ├─ components/  components/views/       # 组件与页面视图
      ├─ composables/                         # useTheme / useSearch / useMobileDrawer / usePostEnhance …
      ├─ data/                                # download.json、personalityTest.ts
      └─ styles/                              # 全局 SCSS（入口 index.scss）
```

不要提交 `docs/.vitepress/dist`、`docs/.vitepress/cache`、`debug.log` 等产物与日志（已在 `.gitignore`）。

## 路由与页面机制

- 页面外壳由 frontmatter 的 `layout` 决定，分派逻辑集中在 `Layout.vue`。**新增页面**：写 `components/views/XxxView.vue` → 在 `Layout.vue` 加一个分支 → 在 `docs/` 下新建 md 并写 `layout: xxx`。
- 站内链接一律**不带 `.html`**（`cleanUrls: true`）。拼链接用 `withBase()`（VitePress）或 `utils.ts` 的 `termPath` / `termPagePrefix`；分类、标签名必须 `encodeURIComponent`。
- 动态路由 = `docs/**/[param].md`（仅 frontmatter）+ 同名 `.paths.ts`（导出 `paths()` 与 `watch`）。`paths()` 的数据来自 `build/posts.ts`。
  - `paths()` 在 VitePress 解析配置**之前**执行，因此 `build/posts.ts` 不能用 `createContentLoader`，只能直接读 frontmatter。
  - 第 1 页由静态 `index.md` 承担，`paths()` 只生成第 2..N 页。归档同理：一年一页，`archiveYears()` 决定页数。
- `docs/news/**` 通过 `rewrites` 映射为 `/posts/**`，改动新闻列表结构时别忘了同步 `config.mts` 的 rewrites 与 `absolutePageUrl`。
- 页面标题、OG / Twitter / JSON-LD、Atom feed 都在 `config.mts` 的 `transformPageData` / `transformHead` / `buildEnd` 中生成；新增布局需检查是否要补标题规则。

## 内容与数据

- 文章 frontmatter 字段：`title`、`date`（`YYYY-MM-DD HH:mm:ss`）、`categories`、`tags`、`description`、`stickypost`（仅 `true` 才置顶）、`cover`（可为外链）。
- 默认封面是 `/images/default_cover.webp`（**webp，不是 png**）。缺失封面时由 `postMap.ts` 与 `PostCard` 兜底；该图是极小的占位图，想要更好看的默认封面直接替换 `docs/public/images/default_cover.webp` 这张资源，不要在代码里另造兜底逻辑。
- 日期统一按 **UTC** 取值格式化，避免构建机时区导致日期漂移；排序用 `timestamp`。
- 新增 `Post` 字段的顺序：`types.ts` → `postMap.ts` 的 `toBasePost`（两处加载器共用），不要在组件里各自解析 frontmatter。
- 两个内容加载器职责不同，勿混用：
  - `posts.data.ts`：轻量列表数据，**不含正文**，会进入每个页面公共 chunk；
  - `postsSearch.data.ts`：含纯文本正文，仅给本地搜索语料用。
- 站点信息、社交链接、分页大小、giscus 配置都在 `theme/config.ts`，改链接改常量，不要散落在组件里。
- 文章内增强（`[TOC]`、页内锚点、Mermaid、代码块复制）由 `usePostEnhance.ts` 在客户端完成，是纯渐进增强，禁用 JS 时正文仍可读。

## 样式约定

- 全局样式只有 `styles/index.scss`（variables / mixins / base / layout / sidebar / post / animation / responsive）。页面级样式写在各自 `.vue` 的 `<style scoped lang="scss">`。
- `.vue` 里直接 `@use 'variables' as *;` / `@use 'mixins' as *;` 即可——`config.mts` 已配置 `loadPaths`，不要写相对路径。
- 颜色、圆角、阴影、尺寸、断点**必须**用 `_variables.scss` 变量；深色专属规则用 `@include dark-mode`；媒体查询用 `@include respond-below($bp-*)` 或传统 `max-width` 写法。
- **禁止 Media Queries Level 4 范围语法**（如 `width<=820px`）：`vite.build.cssTarget` 已锁定到 `chrome103` 系列，改动此处会让旧内核整块丢弃媒体查询。
- 主题由 `<html data-theme="auto|light|dark">` + CSS 变量驱动（见 `_base.scss` / `useTheme.ts`）。`localStorage` key 为 `pidanui-theme`，改 key 必须同步 `config.mts` head 里的首帧内联脚本。
- `body { overflow: hidden }`，**全站唯一纵向滚动容器是 `.site-main`**。新增全屏层、吸附元素或锚点逻辑时按这个前提考虑；页内锚点滚动也由 `usePostEnhance.ts` 接管。
- 折叠/展开动画统一手感：缓动用 `cubic-bezier(0.25, 0.46, 0.45, 0.94)`，头部是 `<button aria-expanded>`、内容区靠 `.active` 切换。高度未知 / 会变的（归档按月分组）用 `grid-template-rows: 1fr ↔ 0fr` 自适应，别写死 `max-height`；下载页手风琴现有实现是 `max-height`（上限 1400px），改动时注意内容变长会被裁切。
- 注释风格与现有文件一致：中文、`// ====` 分节横幅，只解释“为什么”，不复述代码。

## 字体与图标

- 字体与图标全部走 CDN（见 `config.mts` 的 `head`），**仓库不保留任何字体 / 图标文件**：
  - MiSans（`misans-webfont@4.3.1`）—— 正文与 UI；
  - Cascadia Code（`@fontsource/cascadia-code@5.2.3`）—— 代码块等宽英文字体；
  - Font Awesome 7（`@fortawesome/fontawesome-free@7.3.1`）—— 全站图标。
- 图标统一写 `<i class="fa-solid fa-xxx" aria-hidden="true"></i>`（品牌图标用 `fa-brands`），**不要再引入自绘 / 内联 SVG 图标**。
- 网站 Logo 是图片资源（`docs/public/images/logo.webp`），不属于图标 CDN 体系，保持现状。
- 字体栈定义在 `_variables.scss`（`$font-ui` / `$font-mono`）并同步到 `--vp-font-family-*`；调整字体请同时改这两处。
- 离线环境无法直连 jsDelivr 时，可用 npmmirror 下载同版本包到本地临时注入来核对字体族名与图标字形。

## 移动端与抽屉

- 断点：`$bp-md = 960px` 及以下为抽屉模式；左右侧栏共用 `useMobileDrawer.ts` 的模块级状态（`activeMobileDrawer` / `drawerProgress` / `drawerOffset` / `isDrawerDragging`）。
- 抽屉必须用 `transform` + `visibility` 常驻（`display` 无法过渡），位移由 `--drawer-offset` 驱动；拖拽中加 `is-dragging` 取消过渡，避免回弹。
- 手势已实现：屏幕左右边缘内滑、抽屉内反向拖拽关闭、35% 位移或 0.5px/ms 速度阈值、滚动锁定、Esc 关闭、路由切换与跨断点自动关闭——改手势时保持这些行为。
- 交互元素（`a, button, input…`）上的触摸不应被手势劫持，判定依赖 `INTERACTIVE_SELECTOR`。

## 无障碍与降级

- 图标一律 `aria-hidden="true"` 并提供文字或 `aria-label`；可切换按钮补 `aria-expanded` / `aria-controls` / `aria-current`。
- 主内容使用 `<main id="content" role="main">`；`<html class="js">` 仅在 JS 可用时由 head 内联脚本添加，`html:not(.js)` 的降级样式必须保持可用。
- 搜索对话框用原生 `<dialog>` + `showModal()`，退出动画靠 `@starting-style` / `allow-discrete`；JS 只负责善后（清空关键词、还焦点）。

## 配置与类型（升级相关，易踩坑）

- Vite 8 的 `configLoader: 'native'` 要求**相对 TS 导入必须带 `.ts` 扩展名**（如 `./build/posts.ts`），缺扩展名会产生构建警告。
- TypeScript 7 已移除 `baseUrl`：`tsconfig.json` 的 `paths` 必须写成相对路径（`./docs/.vitepress/theme/*`），并开启 `allowImportingTsExtensions`。
- `.vue` / `.scss` / markdown-it 插件的模块声明在 `docs/.vitepress/env.d.ts`；引入新的无类型依赖时先补声明，不要用 `@ts-ignore`。
- Vite 8 已不再有 Sass `api` 选项（现代 API 为唯一实现），不要重新加回。
- **Sass 版本下限是 1.70.0**（Vite 8 的 peer 为 `sass: ^1.70.0`，且依赖 1.70.0 才引入的 `initAsyncCompiler`）。低于该版本的任何版本（含 npm 上的 `rc` / `test` dist-tag）都会让全部 SCSS 入口报 `TypeError: [sass] sass.initAsyncCompiler is not a function`，构建直接失败 23 处，不要试图通过降级 Vite / VitePress 来迁就旧 Sass。
- Sass 的 `rc` / `test` dist-tag **不是新版本预发布通道**：`rc` 指向 2021 年的 `1.45.0-rc.2`、`test` 指向 2022 年的 `1.26.0-test.3`，都远低于上述下限。升级 Sass 请按实际版本号指定（已验证 1.70.0 / 1.75.0 / 1.85.0 / 1.95.0 / 1.100.0 / 1.105.2 均可构建），不要用这两个 tag 做渐进升级。
- VitePress 的 `next` dist-tag 就是 `2.0.0-alpha.20`（`latest` 仍是 1.6.4），因此本项目**已经运行在 vitepress `next` 上**，无需再单独升级 VitePress。
- TypeScript 的 `next` 是每日 Nightly（`7.1.0-dev.<日期>` 形式）。已实测 `7.1.0-dev.20261016.1` 与 VitePress `next`（2.0.0-alpha.20）+ Sass 1.105.2 组合：`pnpm exec tsc --noEmit`、`pnpm build` 均零错误零警告，`pnpm preview` 页面渲染正常。
- 但 `next` 是流动 tag，每次 `pnpm install` 都可能拉到新的 nightly 并改动 lockfile，**不要长期把它写进 `package.json`**：仅在验证兼容性时临时 `pnpm add -D typescript@next`，验证后回落到 `~7.0.2`（或更新的稳定版本）。另外 dist-tag 查询结果与 pnpm 实际安装到的 nightly 日期可能差一天（registry 镜像缓存所致），以 `pnpm ls typescript` 或 `node -e "console.log(require('typescript').version)"` 为准。
- 别名 `@` → `docs/.vitepress/theme`，Vite 与 tsconfig 两处需同时维护。

## Git 与协作

- 提交信息用中文，`feat:` / `fix:` / `style:` / `chore:` / `docs:` 前缀，一句话说明做了什么。
- PR 从 fork `ColdFieldObserver:main` 发往 `PidanEggyTeam:main`（`gh pr create --repo PidanEggyTeam/PidanUI-Website --base main --head ColdFieldObserver:main`）。
- 创建跨 fork PR 前确认 `gh auth status` 的活动账号不是组织账号（组织账号会报 `Fork collab can't be granted`），必要时 `gh auth switch -u ColdFieldObserver`。
- 中文提交信息请写入 UTF-8（无 BOM）文件后用 `git commit -F`，避免编码错乱成 `??`。

## 提交前自检清单

1. `pnpm build` 与 `pnpm exec tsc --noEmit` 均通过，且**无警告**。
2. 浏览器实看：首页、`/download`、`/posts/`、`/archives/`、`/tags/`、一篇 `/posts/<slug>`。
3. 桌面与 ≤960px 移动端各过一遍：左右抽屉开合与拖拽、搜索对话框、主题三态切换。
4. 新增图标是 Font Awesome 类名，新增颜色 / 圆角 / 断点来自变量，新增动效有 reduced-motion 分支。
5. 没有提交构建产物、缓存或临时文件。