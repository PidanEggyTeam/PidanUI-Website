<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useTheme } from '~/composables/useTheme';

// ============================================================
// FeedPulse 「国家/地区计数器」组件（Flag Counter 版，底栏第三列）
// ------------------------------------------------------------
// 引入的是官方 embed 脚本（flag-counter.js），它会在「脚本标签的前一个兄弟
// 位置」插入自己的容器，因此把 <script> 放进 host 里即可定位。
// 生成的 DOM 结构（v=15，改版本前先重新确认）：
//   div[data-ltf-flag]                     根：width / font-family / bg / border
//   ├─ div:first-child                     标题条（hb / hf）
//   ├─ div[data-ltf-grid]                  网格（背景色 = 1px 分隔线）
//   │   └─ div.ltf-flag > span(旗) + span(代码) + span[data-ltf-cnt]
//   └─ div                                 「忽略我」等页脚链接
//
// 三点工程处理：
//   1. 懒加载：组件在底栏，用 IntersectionObserver 接近视口才注入脚本；
//   2. 主题适配：脚本把颜色写死成内联样式，切主题不会自己变。这里不重新加载
//      脚本（那会重连轮询），而是用带 !important 的规则覆盖内联色 ——
//      内联样式没有 !important，优先级低于任何 !important 规则；
//   3. 宽度与字体：宽度加载前量一次容器（脚本自带 max-width:100% 兜底）；
//      字体一律换成站点字体栈 / 代码字体，不用脚本默认的 IBM Plex Sans。
//
// 另附官方 track-pixel：SPA 内路由切换时补发一次 pageview（脚本本身只在
// 首次执行时记一次）。
// ============================================================

const SITE_ID = 'c1caab4d-1515-4a84-82a3-bf5ab0503f04';
const ORIGIN = 'https://feed-pulse.com';
/** 网格行 / 列：3 列 × 10 行，最多展示 30 个国家/地区 */
const ROWS = 10;
const COLS = 3;
/** 轮询间隔（ms） */
const POLL = 5000;
/** 脚本 20s 内没产出容器就判定为加载失败（广告拦截 / 网络不通） */
const LOAD_TIMEOUT = 20_000;

const host = ref<HTMLElement | null>(null);
const status = ref<'idle' | 'loading' | 'ready' | 'failed'>('idle');

const { resolvedDark } = useTheme();
const route = useRoute();

// SSR 阶段读不到 prefers-color-scheme，resolvedDark 恒为 false；客户端首帧可能
// 直接是 true，class 一旦参与渲染就会触发 hydration 不一致。
// 因此首帧不带深色标记，挂载后再跟随真实主题。
const themeReady = ref(false);
onMounted(() => {
  themeReady.value = true;
});
const darkClass = computed(() => themeReady.value && resolvedDark.value);

let scriptEl: HTMLScriptElement | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
let loading = false;

/** 取站点令牌的计算值（形如 "#1f1f23"），拿不到就回退 */
function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** 把 #rrggbb / #rgb 转成脚本要求的 6 位无井号写法 */
function toHexParam(value: string, fallback: string): string {
  const match = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return fallback;
  const hex = match[1] ?? '';
  return hex.length === 3
    ? hex
        .split('')
        .map((char) => char + char)
        .join('')
        .toUpperCase()
    : hex.toUpperCase();
}

/** 首帧主题下的近似配色：真正的深浅色跟随由下面的 :deep() 规则完成 */
function buildColorParams(): Record<string, string> {
  return {
    // 卡片底 / 正文色 / 分隔线：与站点令牌同源
    bc: toHexParam(readToken('--card', '#ffffff'), 'FFFFFF'),
    tc: toHexParam(readToken('--ink', '#1d2129'), '1D2129'),
    brd: toHexParam(readToken('--line', '#f0f1f3'), 'F0F1F3'),
    // 标题条：品牌深橙底 + 深色字（白字在 #ff9f1a 上对比度不足）
    hb: toHexParam(readToken('--brand-deep', '#ff9f1a'), 'FF9F1A'),
    hf: '1D2129',
  };
}

/** 站点字体栈：与 base.css 的 --font-ui 保持一致，不用脚本默认的 IBM Plex Sans */
function siteFontStack(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--font-ui').trim();
  return value || 'HarmonyOS Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif';
}

function teardown(): void {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
  mutationObserver?.disconnect();
  mutationObserver = null;
  const el = host.value;
  if (el) {
    el.querySelectorAll('[data-ltf-flag], script[data-fp-widget]').forEach((node) => node.remove());
  }
  scriptEl?.remove();
  scriptEl = null;
  loading = false;
}

/** 脚本插入容器后即可认为「已就绪」（数据由它自己轮询填充） */
function watchForContainer(): void {
  const el = host.value;
  if (!el) return;
  mutationObserver?.disconnect();
  mutationObserver = new MutationObserver(() => {
    if (!host.value?.querySelector('[data-ltf-flag]')) return;
    mutationObserver?.disconnect();
    mutationObserver = null;
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
    status.value = 'ready';
  });
  mutationObserver.observe(el, { childList: true, subtree: true });
}

function mountWidget(): void {
  const el = host.value;
  if (!el || loading) return;
  loading = true;
  status.value = 'loading';

  // 宽度随底栏列宽：load 时量一次，之后靠脚本自带的 max-width:100% 自适应
  const width = Math.max(
    240,
    Math.round(el.clientWidth || el.getBoundingClientRect().width || 320),
  );

  const params = new URLSearchParams({
    site_id: SITE_ID,
    w: String(width),
    ...buildColorParams(),
    font: siteFontStack(),
    rows: String(ROWS),
    cols: String(COLS),
    cod: '1',
    poll: String(POLL),
    nobot: '0',
    lang: 'zh',
    bstyle: 'minimal',
    v: '15',
  });

  const script = document.createElement('script');
  script.src = `${ORIGIN}/api/embed/flag-counter.js?${params.toString()}`;
  script.async = true;
  script.dataset.fpWidget = '1';
  script.addEventListener(
    'load',
    () => {
      loading = false;
    },
    { once: true },
  );
  script.addEventListener(
    'error',
    () => {
      loading = false;
      status.value = 'failed';
    },
    { once: true },
  );

  el.appendChild(script);
  scriptEl = script;

  watchForContainer();
  timeoutTimer = setTimeout(() => {
    if (status.value === 'ready') return;
    status.value = 'failed';
  }, LOAD_TIMEOUT);
}

function retry(): void {
  teardown();
  status.value = 'idle';
  mountWidget();
}

/** 官方 track-pixel：统计路径 / 标题 / 来源站点 */
function trackPageview(): void {
  try {
    const params = new URLSearchParams({
      path: location.pathname || '/',
      title: (document.title || '').slice(0, 160),
      host: location.host,
      ref: document.referrer || '',
    });
    const image = new Image();
    image.src = `${ORIGIN}/api/track-pixel/${SITE_ID}?${params.toString()}`;
  } catch {
    // 统计失败不影响页面
  }
}

onMounted(() => {
  trackPageview();

  const el = host.value;
  if (!el || typeof IntersectionObserver === 'undefined') {
    mountWidget();
    return;
  }

  // 评论区同款策略：距视口 240px 时才开始拉取
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      intersectionObserver?.disconnect();
      intersectionObserver = null;
      mountWidget();
    },
    { rootMargin: '240px 0px' },
  );
  intersectionObserver.observe(el);
});

watch(
  () => route.fullPath,
  () => trackPageview(),
);

onBeforeUnmount(() => {
  intersectionObserver?.disconnect();
  intersectionObserver = null;
  teardown();
});
</script>

<template>
  <section aria-label="访问来源国家与地区">
    <h2
      class="mb-3 flex items-center gap-1.5 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase"
    >
      <UIcon name="i-lucide-globe" class="size-3.5" aria-hidden="true" />
      访客国家 / 地区
    </h2>

    <!-- 加载占位：标题条 + 3 列网格，尺寸与插件一致，避免布局跳动 -->
    <div v-if="status !== 'ready' && status !== 'failed'" class="flag-skeleton" aria-hidden="true">
      <div class="flag-skeleton-head" />
      <div class="flag-skeleton-grid">
        <div v-for="cell in 6" :key="cell" class="flag-skeleton-cell">
          <span class="flag-skeleton-dot" />
          <span class="flag-skeleton-line" />
        </div>
      </div>
    </div>

    <!-- 插件容器：脚本会在此插入 div[data-ltf-flag]（位于 script 之前） -->
    <div ref="host" class="flag-widget" :class="{ 'flag-widget--dark': darkClass }" />

    <p v-if="status === 'failed'" class="flag-failed">
      访客统计暂时不可用
      <button type="button" class="flag-retry" @click="retry">重试</button>
    </p>

    <!-- 无 JS 时的兜底入口（默认隐藏，规则在 base.css 的 html:not(.js) 段） -->
    <a
      class="flag-noscript"
      :href="`https://feed-pulse.com/site/pidanui.eggycore.top/traffic`"
      target="_blank"
      rel="noopener"
      >查看访客统计</a
    >
  </section>
</template>

<style scoped>
/* ---- 加载骨架 ---- */
.flag-skeleton {
  overflow: hidden;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
}

.flag-skeleton-head {
  height: 31px;
  background: var(--brand-deep);
  opacity: 0.85;
}

.flag-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
}

.flag-skeleton-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--card);
}

.flag-skeleton-dot,
.flag-skeleton-line {
  display: block;
  background: var(--line);
  border-radius: 999px;
  animation: flag-shimmer 1.4s ease-in-out infinite;
}

.flag-skeleton-dot {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.flag-skeleton-line {
  height: 8px;
  flex: 1;
}

@keyframes flag-shimmer {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.9;
  }
}

.flag-failed {
  padding: 10px;
  font-size: 12.5px;
  color: var(--ink-3);
  text-align: center;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
}

.flag-retry {
  margin-left: 4px;
  color: var(--brand-deep);
  text-decoration: underline;
}

.flag-retry:focus-visible {
  outline: 2px solid var(--color-brand-deep-a35);
  outline-offset: 2px;
  border-radius: 4px;
}

/* 无 JS 兜底链接：默认不占位，只有 html 没有 .js 时由 base.css 打开 */
.flag-noscript {
  display: none;
}

/* ------------------------------------------------------------
   插件主题适配
   ------------------------------------------------------------
   脚本把颜色写成内联样式（URL 参数决定），切主题不会自己跟着变。
   用带 !important 的规则覆盖 —— 内联样式没有 !important，优先级低于
   任何 !important 规则，因此深浅色随站点变量实时切换，不用重载脚本。

   :deep() 是必需的：插件节点由脚本动态插入，不带本组件的 data-v 标记。
   ------------------------------------------------------------ */
/* 根容器：底 / 描边 / 正文色 / 圆角
   宽度由脚本按加载时量到的像素写死，这里强制跟随列宽（内部是 1fr 网格，
   收缩不会破版），否则从宽屏缩到窄屏会把整行撑出视口 */
.flag-widget :deep([data-ltf-flag]) {
  width: 100% !important;
  max-width: 100% !important;
  background: var(--card) !important;
  border-color: var(--line) !important;
  border-radius: var(--radius-s);
  color: var(--ink-2) !important;
  overflow: hidden;
  font-size: 12px;
}

/* 标题条：品牌深橙底 + 深色字 */
.flag-widget :deep([data-ltf-flag] > div:first-child) {
  background: var(--brand-deep) !important;
  color: #1d2129 !important;
}

/* 网格的 1px 分隔线靠容器底色透出 */
.flag-widget :deep([data-ltf-grid]) {
  background: var(--line) !important;
}

/* 单元格底色 */
.flag-widget :deep([data-ltf-flag] .ltf-flag) {
  background: var(--card) !important;
}

/* 计数：用站点等宽字体，而不是脚本写死的默认字体 */
.flag-widget :deep([data-ltf-cnt]) {
  color: var(--ink) !important;
  font-family: var(--font-code) !important;
}

/* 标题条里的今日 / 累计数字：脚本写死 IBM Plex Mono */
.flag-widget :deep([data-ltf-flag] b),
.flag-widget :deep([data-ltf-flag] span[style*='IBM Plex Mono']) {
  font-family: var(--font-code) !important;
}

/* 国家代码小字：脚本写死 font-family:monospace */
.flag-widget :deep([data-ltf-flag] span[style*='monospace']) {
  font-family: var(--font-code) !important;
}

/* 页脚链接（忽略我 / 徽章）：浅色用深品牌色，深色用亮品牌黄 */
.flag-widget {
  --fp-link: var(--color-brand-800);
}

.flag-widget--dark {
  --fp-link: var(--brand);
}

.flag-widget :deep([data-ltf-flag] a) {
  color: var(--fp-link) !important;
}

.flag-widget :deep([data-ltf-flag] a:hover) {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .flag-skeleton-dot,
  .flag-skeleton-line,
  .flag-widget :deep(.ltf-new) {
    animation: none !important;
  }
}
</style>
