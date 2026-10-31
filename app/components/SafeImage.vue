<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

/**
 * 带本地兜底的 <img>。
 *
 * 站点的宣传图与部分封面是外链（img.remit.ee 等），外链挂了、被墙了或者被
 * 广告拦截插件挡掉时，浏览器只会渲染一个破图图标，把卡片版式撑歪。这里在
 * error 事件里换成本地占位图，且只换一次 —— 占位图自己再失败时不重试，
 * 避免无限循环。
 *
 * 只监听 error 不够：SSR 输出的 <img> 在 hydration 之前就开始加载，若加载
 * 失败发生在挂载之前，error 事件没有监听者、之后也不会重放。因此挂载时再
 * 用 `complete && naturalWidth === 0` 复查一次「已完成但没解出尺寸」的情况。
 *
 * 其余属性原样透传（class 由 Vue 自动合并到根元素）。
 */
const props = withDefaults(
  defineProps<{
    src: string;
    alt: string;
    /** 本地兜底图，缺省与 PostCard 的封面兜底一致 */
    fallback?: string;
  }>(),
  { fallback: '/images/default_cover.webp' },
);

const el = ref<HTMLImageElement | null>(null);
const current = ref(props.src);
let settled = false;

function useFallback(): void {
  if (settled) return;
  settled = true;
  current.value = withBase(props.fallback);
}

function onError(): void {
  useFallback();
}

onMounted(() => {
  const img = el.value;
  if (!img || !img.complete) return;
  // 已完成却拿不到宽度：加载失败（或被拦截后直接报失败）
  if (img.naturalWidth === 0) useFallback();
});

// 外链地址变化（例如卡片复用、数据刷新）时重试真实图片
watch(
  () => props.src,
  (next) => {
    settled = false;
    current.value = next;
  },
);
</script>

<template>
  <img ref="el" :src="current" :alt="alt" @error="onError" />
</template>
