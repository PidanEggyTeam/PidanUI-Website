<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { GISCUS, SITE } from '#shared/site';
import { initTheme, onThemeChange, resolvedDark } from '~/composables/useTheme';

// Giscus 评论：客户端按路由动态注入脚本，兼容 SPA 导航。
// 三处增强：
//   1. 懒初始化 —— 评论区在页面底部，滚到附近（rootMargin 400px）才拉取
//      第三方脚本 + iframe，避免每次打开文章都占用首屏带宽与主线程
//   2. 加载占位骨架屏 —— iframe 就绪前保持视觉填充，减少页底「空白」观感
//   3. 配色跟随站点主题 —— 手动切换深浅色时同步 giscus 主题
const route = useRoute();
const container = ref<HTMLElement | null>(null);
const loading = ref(true);

const GISCUS_ORIGIN = 'https://giscus.app';

let observer: MutationObserver | null = null;
/** 进入视口后才真正加载（null 表示已加载或尚未观察） */
let visibilityObserver: IntersectionObserver | null = null;
let stopThemeWatch: (() => void) | null = null;
let fallbackTimer: number | null = null;

/**
 * 当前应使用的品牌 Giscus 样式表（绝对地址，giscus 只接受公网可访问 URL）。
 *
 * 两个必须注意的点：
 * 1. 必须随实际访问源走，不能写死域名。giscus 在它自己的 iframe 里以 CORS 方式
 *    拉取这份 CSS，域名迁移 / 从 Workers 预览域打开时，写死的主域名可能已经
 *    不提供本站资源；用当前 https 源可天然免疫。http（本地预览）与 SSR 场景退回 SITE.mainUrl。
 * 2. 本站在 Cloudflare Workers 上，静态资源默认不带 Access-Control-Allow-Origin，
 *    需要 public/_headers 给 /giscus/* 补上，否则跨源样式表会被浏览器拦掉，
 *    同样表现为「主题失效」。
 */
function giscusTheme(): string {
  const theme = resolvedDark.value ? 'dark' : 'light';
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const base = origin.startsWith('https://') ? origin : SITE.mainUrl;
  return new URL(`/giscus/${theme}.css`, `${base}/`).href;
}

/** 已加载的 iframe 无法改属性，需通过 postMessage 通知其切换配色 */
function syncGiscusTheme(): void {
  const frame = container.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  frame?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: giscusTheme() } } },
    GISCUS_ORIGIN,
  );
}

function clearFallback(): void {
  if (fallbackTimer !== null) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

function mountGiscus(): void {
  const el = container.value;
  if (!el) return;
  // 每次路由变化都重建，避免评论串页
  el.innerHTML = '';
  loading.value = true;
  clearFallback();

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  const attrs: Record<string, string> = {
    'data-repo': GISCUS.repo,
    'data-repo-id': GISCUS.repoId,
    'data-category': GISCUS.category,
    'data-category-id': GISCUS.categoryId,
    'data-mapping': GISCUS.mapping,
    'data-strict': GISCUS.strict,
    'data-reactions-enabled': GISCUS.reactionsEnabled,
    'data-emit-metadata': GISCUS.emitMetadata,
    'data-input-position': GISCUS.inputPosition,
    'data-theme': giscusTheme(),
    'data-lang': GISCUS.lang,
    'data-loading': GISCUS.loading,
  };
  for (const [key, value] of Object.entries(attrs)) {
    script.setAttribute(key, value);
  }
  el.appendChild(script);

  // giscus 会异步注入 iframe，等其 load 完成后再收起骨架屏，并补一次主题同步：
  // iframe 首次渲染时可能还没读到 data-theme（暗色系统下尤其明显），必须再推一次。
  observer?.disconnect();
  observer = new MutationObserver(() => {
    const frame = el.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!frame || frame.dataset.bound === '1') return;
    frame.dataset.bound = '1';
    frame.addEventListener('load', () => {
      loading.value = false;
      clearFallback();
      syncGiscusTheme();
    });
    observer?.disconnect();
    observer = null;
  });
  observer.observe(el, { childList: true, subtree: true });

  // 兜底：脚本被拦截 / 长期未就绪时也要收起骨架屏，避免一直「加载中」
  fallbackTimer = window.setTimeout(() => {
    loading.value = false;
    fallbackTimer = null;
  }, 10000);
}

onMounted(() => {
  initTheme();
  stopThemeWatch = onThemeChange(syncGiscusTheme);

  const host = container.value;
  // 不支持 IntersectionObserver（极旧浏览器）时退回立即加载
  if (!host || typeof IntersectionObserver === 'undefined') {
    void nextTick(mountGiscus);
    return;
  }

  // 评论区在文章最底部：滚到距视口 400px 时再加载，
  // 打开文章本身不再发起 giscus.app 的请求。
  visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      visibilityObserver?.disconnect();
      visibilityObserver = null;
      void nextTick(mountGiscus);
    },
    { rootMargin: '400px 0px' },
  );
  visibilityObserver.observe(host);
});

watch(
  () => route.fullPath,
  () => {
    // 已经加载过（用户滚到过评论区）时，切文章要重建评论；
    // 还没进入视口则什么都不用做，等观察器触发。
    if (visibilityObserver) return;
    void nextTick(mountGiscus);
  },
);

onBeforeUnmount(() => {
  observer?.disconnect();
  visibilityObserver?.disconnect();
  visibilityObserver = null;
  clearFallback();
  stopThemeWatch?.();
  if (container.value) container.value.innerHTML = '';
});
</script>

<template>
  <div class="giscus-host">
    <!-- 加载占位：骨架条降低「页面底部空白」的观感（USkeleton 自带扫光动画） -->
    <div v-if="loading" class="flex flex-col gap-3 py-1.5" aria-hidden="true">
      <USkeleton class="h-3.5 w-[30%]" :ui="{ base: 'bg-line' }" />
      <USkeleton class="h-3.5 w-full" :ui="{ base: 'bg-line' }" />
      <USkeleton class="h-3.5 w-[70%]" :ui="{ base: 'bg-line' }" />
    </div>
    <div ref="container" class="post-comments" />
  </div>
</template>
