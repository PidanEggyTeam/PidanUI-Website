/**
 * Nuxt UI 运行时主题配置。
 *
 * 色彩体系全部落在项目自己的设计令牌上（见 app/assets/styles/tokens.css）：
 *   primary → brand   （蛋仔黄 #ffc53d 色阶，500/600 对齐 --brand / --brand-deep）
 *   neutral → ink     （与 --bg / --line / --ink 逐档对齐的灰阶；
 *                       不能叫 neutral —— 那是 Nuxt UI 的保留名，会被 old- 前缀
 *                       回退到它自己的 oklch 灰，站点灰阶就对不上了）
 *   error   → danger  （站点一贯的红，用于下载失败、表单校验）
 *
 * 只映射这三个别名：nuxt.config.ts 的 ui.theme.colors 也只生成这三个，
 * 多余的语义色（secondary / success / info / warning）不生成 CSS。
 */
export default defineAppConfig({
  // 图标一律渲染成内联 <svg>（Nuxt Icon 默认的 css 模式输出 <span class="iconify">，
  // 要等客户端拿到图标数据才有内容；静态站点要首屏就有图标，必须用 svg 模式）
  icon: {
    mode: 'svg',
  },
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'ink',
      error: 'danger',
    },

    /* ---- UPageHeader ----
       Nuxt UI 的默认值偏营销页（py-8 + sm:text-4xl）。列表页需要的是
       「下边框 + pb-5」的紧凑节奏，这里只压外框，标题本身不覆盖 ——
       由 #title 插槽塞 PageTitle，字号来源保持唯一。 */
    pageHeader: {
      slots: {
        root: 'py-0 pb-5 mb-6 border-b border-default',
        wrapper: 'flex flex-row flex-wrap items-end justify-between gap-x-4 gap-y-3',
        description: 'mt-1.5 text-[13px] text-dimmed',
        links: 'flex flex-wrap gap-2',
      },
    },

    /* ---- UPageGrid ----
       默认 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 是固定列数，卡片宽度
       会被视口牵着走。改为 auto-fill：密度由调用点的 --grid-min 决定
       （列表 clamp(280,28vw,360) / 首页特性 250 / 分类索引 220），min(…, 100%)
       顺带兜住窄屏，不需要再写单列媒体查询。
       列表用 clamp 而不是定值：容器宽度封顶在 1400（max-w-page），定值没法让
       「1024 也能三列、1440 不变成四列」同时成立；clamp 在桌面段稳定落三列，
       768 宽度下仍是两列，卡片不会被拉成通栏。
       末尾的 ! 只用于压掉主题里的 sm:/lg: 列数 —— 调用点 :ui 是追加，删不掉变体。 */
    pageGrid: {
      base:
        'relative grid gap-3.5! ' +
        'grid-cols-[repeat(auto-fill,minmax(min(var(--grid-min,clamp(280px,28vw,360px)),100%),1fr))]!',
    },

    /* ---- ProseBlockquote ----
       Nuxt UI 的 ProseBlockquote 主题默认带 italic 工具类（extend 合并，
       空串压不掉）。这里用 not-italic 在同组覆盖，让引用块默认保持正体；
       显式修饰符（*强调* → <em>）仍由元素自身渲染为斜体。
       引用块的边框 / 内边距 / 背景仍由 prose.css 独占。 */
    prose: {
      blockquote: { base: 'not-italic' },
    },
  },
});
