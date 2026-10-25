<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useTheme } from '~/composables/useTheme';

// ============================================================
// FeedPulse 实时流量组件（右栏最底部）
// ------------------------------------------------------------
// 引入的是官方 embed 脚本，它会在「脚本标签的前一个兄弟位置」插入自己的
// 容器，因此把 <script> 放进 host 里即可定位到右栏。
//
// 三点工程处理：
//   1. 懒加载：组件在右栏最底部，用 IntersectionObserver 滚到附近才注入
//      脚本（移动端抽屉未展开时不会加载）；
//   2. 主题适配：脚本的颜色是靠 URL 参数写死进内联样式的，切换主题后不会
//      自己变。这里不用「重新加载脚本」的办法（那会遗留一个无法关闭的 SSE
//      长连接），改为用 CSS 变量 + !important 覆盖它的内联色值 —— 主题切换
//      时颜色随变量实时跟随，连接始终只有一条；
//   3. 宽度：脚本用固定像素宽，加载前量一次容器实际宽度传进去，
//      窄屏由它自带的 max-width:100% 兜底。
//
// 另附官方的 track-pixel：SPA 内路由切换时补发一次 pageview（脚本本身只在
// 首次执行时记一次）。
// ============================================================

const SITE_ID = 'c1caab4d-1515-4a84-82a3-bf5ab0503f04';
const ORIGIN = 'https://feed-pulse.com';
/** 可见行数（需求：默认 10 行） */
const ROWS = 10;
/** 脚本 20s 内没产出容器就判定为加载失败（广告拦截 / 网络不通） */
const LOAD_TIMEOUT = 20_000;

const host = ref<HTMLElement | null>(null);
const status = ref<'idle' | 'loading' | 'ready' | 'failed'>('idle');

const { resolvedDark } = useTheme();
const route = useRoute();

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
  const dark = resolvedDark.value;
  return {
    bc: toHexParam(readToken('--card', '#ffffff'), 'FFFFFF'),
    tc: toHexParam(readToken('--ink', '#1d2129'), '1D2129'),
    brd: toHexParam(readToken('--line', '#f0f1f3'), 'F0F1F3'),
    hb: toHexParam(readToken('--brand-deep', '#ff9f1a'), 'FF9F1A'),
    // 橙底上用深色字：白字在 #ff9f1a 上对比度不足
    hf: '1D2129',
    lnk: dark
      ? toHexParam(readToken('--brand', '#ffc53d'), 'FFC53D')
      : toHexParam(readToken('--color-brand-800', '#a85a00'), 'A85A00'),
  };
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
    el.querySelectorAll('[data-ltf-traffic], script[data-fp-widget]').forEach((node) => node.remove());
  }
  scriptEl?.remove();
  scriptEl = null;
  loading = false;
}

/** 脚本插入容器后即可认为“已就绪”（数据由它自己轮询填充） */
function watchForContainer(): void {
  const el = host.value;
  if (!el) return;
  mutationObserver?.disconnect();
  mutationObserver = new MutationObserver(() => {
    if (!host.value?.querySelector('[data-ltf-traffic]')) return;
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

  // 宽度随右栏：load 时量一次，之后靠脚本自带的 max-width:100% 自适应
  const width = Math.max(160, Math.round(el.clientWidth || el.getBoundingClientRect().width || 240));

  const params = new URLSearchParams({
    site_id: SITE_ID,
    w: String(width),
    ...buildColorParams(),
    font: 'HarmonyOS Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif',
    rows: String(ROWS),
    poll: '3000',
    lang: 'zh',
    bstyle: 'animated',
    v: '15',
  });

  const script = document.createElement('script');
  script.src = `${ORIGIN}/api/embed/traffic-feed.js?${params.toString()}`;
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
  <section class="mt-5" aria-label="实时访客">
    <h2 class="mb-3 flex items-center gap-1.5 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase">
      <UIcon name="i-lucide-activity" class="size-3.5" aria-hidden="true" />
      实时访客
    </h2>

    <!-- 加载占位：与插件的视觉语言一致（品牌色标题条 + 若干行） -->
    <div v-if="status !== 'ready' && status !== 'failed'" class="traffic-skeleton" aria-hidden="true">
      <div class="traffic-skeleton-bar" />
      <div v-for="row in 4" :key="row" class="traffic-skeleton-row">
        <span class="traffic-skeleton-dot" />
        <span class="traffic-skeleton-line" />
      </div>
    </div>

    <!-- 插件容器：脚本会在此插入自己的 div（位于 script 之前） -->
    <div ref="host" class="traffic-widget" :class="{ 'traffic-widget--dark': resolvedDark }" />

    <p v-if="status === 'failed'" class="traffic-failed">
      实时访客暂时不可用
      <button type="button" class="traffic-retry" @click="retry">重试</button>
    </p>
  </section>
</template>

<style scoped>
/* 占位骨架 */
.traffic-skeleton {
  overflow: hidden;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
}

.traffic-skeleton-bar {
  height: 27px;
  background: var(--brand-deep);
  opacity: 0.85;
}

.traffic-skeleton-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-top: 1px solid var(--line);
}

.traffic-skeleton-row:first-of-type {
  border-top: 0;
}

.traffic-skeleton-dot,
.traffic-skeleton-line {
  display: block;
  background: var(--line);
  border-radius: 999px;
  animation: traffic-shimmer 1.4s ease-in-out infinite;
}

.traffic-skeleton-dot {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.traffic-skeleton-line {
  height: 8px;
  flex: 1;
}

@keyframes traffic-shimmer {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.9;
  }
}

.traffic-failed {
  padding: 10px;
  font-size: 12.5px;
  color: var(--ink-3);
  text-align: center;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
}

.traffic-retry {
  margin-left: 4px;
  color: var(--brand-deep);
  text-decoration: underline;
}

.traffic-retry:focus-visible {
  outline: 2px solid var(--color-brand-deep-a35);
  outline-offset: 2px;
  border-radius: 4px;
}

/* ------------------------------------------------------------
   插件主题适配
   ------------------------------------------------------------
   脚本把颜色写成了内联样式（URL 参数决定），切换主题不会自己跟着变。
   用带 !important 的规则覆盖即可 —— 内联样式没有 !important，优先级
   低于任何 !important 规则，因此深浅色都随站点变量实时切换，
   不需要重新加载脚本（那会遗留一条关不掉的 SSE 连接）。

   :deep() 是必需的：插件节点由脚本动态插入，不带本组件的 data-v 标记。
   ------------------------------------------------------------ */
.traffic-widget :deep([data-ltf-traffic]) {
  background: var(--card) !important;
  border-color: var(--line) !important;
  border-radius: var(--radius-s);
  color: var(--ink-2) !important;
  overflow: hidden;
}

/* 顶部标题条：品牌橙底 + 深色字（浅黄底上用白字对比度不够） */
.traffic-widget :deep([data-ltf-traffic] > div:first-child) {
  background: var(--brand-deep) !important;
  color: #1d2129 !important;
}

/* 行分隔线与底部两条分隔线（插件写死 #e5e7eb） */
.traffic-widget :deep([data-ltf-traffic] .ltf-row),
.traffic-widget :deep([data-ltf-traffic] > div + div) {
  border-top-color: var(--line) !important;
}

/* 「等待访客…」文案的内联色：改为继承容器色，深色下才不会看不见 */
.traffic-widget :deep([data-ltf-traffic] [data-ltf-body] > div) {
  color: inherit !important;
}

/* 链接：浅色用深品牌色（#ff9f1a 做小字号文字对比度不足），深色用亮品牌黄。
   深浅标记由 :class 绑定，避免在 scoped 里写跨组件根节点的选择器。 */
.traffic-widget {
  --fp-link: var(--color-brand-800);
}

.traffic-widget--dark {
  --fp-link: var(--brand);
}

.traffic-widget :deep([data-ltf-traffic] a) {
  color: var(--fp-link) !important;
}

@media (prefers-reduced-motion: reduce) {
  .traffic-skeleton-dot,
  .traffic-skeleton-line {
    animation: none;
  }
}
</style>
