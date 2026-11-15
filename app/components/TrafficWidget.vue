<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// ============================================================
// FeedPulse 「在线访客」按钮组件（Online Button 版，底栏第三列）
// ------------------------------------------------------------
// 官方 embed 脚本 online-visitors.js 会在脚本标签所在位置注入一个
// 在线人数按钮（自带样式：圆角矩形）。颜色改走站点品牌色（橙黄渐变底 +
// 深色字，见 buildEmbedSrc），不再用后台默认的蓝绿；品牌色在浅色 / 深色
// 下取同一组值，故无需像国家计数器那样用 :deep() 覆盖内联色或随主题重载。
//
// 三点工程处理（沿用国家计数器版的经验，简化）：
//   1. 懒加载：底栏在视口底部，用 IntersectionObserver 接近视口才注入脚本；
//   2. 统计埋点：官方 track-pixel 只在首次执行时记一次 pageview；
//      SPA 内路由切换时由 watch(route) 补发，保证各页统计准确；
//   3. 无 JS 兜底：不写 <noscript>（会造成 hydration mismatch，见
//      AGENTS.md），改为 html:not(.js) 才显示的链接（规则在 base.css）。
// ============================================================

const SITE_ID = 'c1caab4d-1515-4a84-82a3-bf5ab0503f04';
const ORIGIN = 'https://feed-pulse.com';

const host = ref<HTMLElement | null>(null);

let intersectionObserver: IntersectionObserver | null = null;
let loading = false;

/** 取站点令牌的计算值（形如 "#ff9f1a"），拿不到就回退 */
function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** 把 #rrggbb / #rgb 转成脚本要求的 6 位无井号大写写法 */
function toHexParam(value: string, fallback: string): string {
  const match = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return fallback;
  const hex = match[1] ?? '';
  return hex.length === 3
    ? hex.split('').map((char) => char + char).join('').toUpperCase()
    : hex.toUpperCase();
}

/** 官方 online-visitors embed 脚本。
 *  颜色改走站点品牌色（橙黄渐变底 + 深色字），不再用后台默认的蓝绿。
 *  品牌色在浅色 / 深色下取同一组值，故无需随主题重载脚本。 */
function buildEmbedSrc(): string {
  const brand = toHexParam(readToken('--brand', '#FFC53D'), 'FFC53D');
  const brandDeep = toHexParam(readToken('--brand-deep', '#FF9F1A'), 'FF9F1A');
  const params = new URLSearchParams({
    site_id: SITE_ID,
    size: '140',
    shape: 'rect-rounded',
    bgt: 'gradient',
    bc: brandDeep,
    gf: brand,
    gt: brandDeep,
    tc: '1D2129',
    brd: '0A0A0A',
    bw: '0',
    font: 'IBM Plex Mono',
    label: 'Online',
    poll: '3000',
    lang: 'en',
    v: '15',
  });
  return `${ORIGIN}/api/embed/online-visitors.js?${params.toString()}`;
}

/** 移除脚本以及它注入的按钮节点（脚本会把容器插入 host 内） */
function teardown(): void {
  intersectionObserver?.disconnect();
  intersectionObserver = null;
  const el = host.value;
  if (el) el.innerHTML = '';
  loading = false;
}

function mountWidget(): void {
  const el = host.value;
  if (!el || loading) return;
  loading = true;

  const script = document.createElement('script');
  script.src = buildEmbedSrc();
  script.async = true;
  script.dataset.fpOnline = '1';
  script.addEventListener(
    'error',
    () => {
      loading = false;
    },
    { once: true },
  );
  script.addEventListener(
    'load',
    () => {
      loading = false;
    },
    { once: true },
  );

  el.appendChild(script);
}

/** 官方 track-pixel：统计路径 / 标题 / 来源站点（每页 + 每次路由切换各发一次） */
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

const route = useRoute();

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
  teardown();
});
</script>

<template>
  <section aria-label="实时在线访客">
    <h2
      class="mb-3 flex items-center gap-1.5 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase"
    >
      <UIcon name="i-lucide-globe" class="size-3.5" aria-hidden="true" />
      实时访客
    </h2>

    <!-- 插件容器：online-visitors.js 会在此注入在线人数按钮 -->
    <div ref="host" class="online-widget" />

    <!-- 无 JS 时的兜底入口（默认隐藏，规则在 base.css 的 html:not(.js) 段） -->
    <a
      class="online-noscript"
      href="https://feed-pulse.com/site/pidanui.eggycore.top/traffic"
      target="_blank"
      rel="noopener"
      >查看实时访客 · FeedPulse</a
    >
  </section>
</template>

<style scoped>
/* 占位高度：在线按钮约 140×40，加载前先占住高度避免布局跳动 */
.online-widget {
  min-height: 44px;
}

/* JS 可用时隐藏兜底链接，无 JS 时由 base.css 的 html:not(.js) 规则打开 */
.online-noscript {
  display: none;
}
</style>
