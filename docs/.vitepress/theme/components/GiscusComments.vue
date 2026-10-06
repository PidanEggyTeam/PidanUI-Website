<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
import { GISCUS } from '@/config';
import { initTheme, onThemeChange, resolvedDark } from '@/composables/useTheme';

// Giscus 评论：客户端按路由动态注入脚本，兼容 SPA 导航。
// 附带两处增强：
//   1. 加载占位骨架屏 —— 评论区在 iframe 就绪前保持视觉填充，减少页底「空白」观感
//   2. 配色跟随站点主题 —— 手动切换深浅色时同步 giscus 主题
const { page } = useData();
const container = ref<HTMLElement | null>(null);
const loading = ref(true);

const GISCUS_ORIGIN = 'https://giscus.app';

let observer: MutationObserver | null = null;
let stopThemeWatch: (() => void) | null = null;
let fallbackTimer: number | null = null;

/** 当前应使用的 giscus 主题（giscus 内置 light / dark） */
function giscusTheme(): string {
  return resolvedDark.value ? 'dark' : 'light';
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

  // giscus 会异步注入 iframe，等其 load 完成后再收起骨架屏
  observer?.disconnect();
  observer = new MutationObserver(() => {
    const frame = el.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!frame || frame.dataset.bound === '1') return;
    frame.dataset.bound = '1';
    frame.addEventListener('load', () => {
      loading.value = false;
      clearFallback();
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
  void nextTick(mountGiscus);
});

watch(
  () => page.value.relativePath,
  () => void nextTick(mountGiscus),
);

onBeforeUnmount(() => {
  observer?.disconnect();
  clearFallback();
  stopThemeWatch?.();
  if (container.value) container.value.innerHTML = '';
});
</script>

<template>
  <div class="giscus-host">
    <div v-if="loading" class="comments-skeleton" aria-hidden="true">
      <div class="skeleton-line w-30" />
      <div class="skeleton-line" />
      <div class="skeleton-line w-70" />
    </div>
    <div ref="container" class="post-comments" />
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;

// 评论区加载占位：骨架条降低「页面底部空白」的观感
.comments-skeleton {
  padding: 6px 0 2px;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 12px;
  background: linear-gradient(
    90deg,
    rgba(127, 127, 127, 0.12) 25%,
    rgba(127, 127, 127, 0.22) 37%,
    rgba(127, 127, 127, 0.12) 63%
  );
  background-size: 400% 100%;
  border-radius: 6px;
  animation: skeleton-loading 1.4s ease infinite;

  &.w-30 {
    width: 30%;
  }

  &.w-70 {
    width: 70%;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
