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
       Nuxt UI 的默认值是按「无侧栏营销页」写的：py-8、标题带 sm:text-4xl。
       本站内容宽 = 视口 − 520px 侧栏，标题在 768 视口就会跳到 36px。
       这里把外框压回列表页原有的「下边框 + pb-5」节奏，标题本身不覆盖 ——
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
       默认 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 按视口断点算列，
       而本站 1024 视口只有 448px 内容宽，三列会把卡片压到 ~130px。
       改为 auto-fill：密度由 --grid-min 决定（列表 300px / 分类索引 220px），
       min(…, 100%) 顺带兜住窄屏，不需要再写单列媒体查询。
       末尾的 ! 只用于压掉主题里的 sm:/lg: 列数 —— 调用点 :ui 是追加，删不掉变体。 */
    pageGrid: {
      base:
        'relative grid gap-3.5! ' +
        'grid-cols-[repeat(auto-fill,minmax(min(var(--grid-min,300px),100%),1fr))]!',
    },
  },
});
