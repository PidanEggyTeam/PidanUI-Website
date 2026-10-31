<script setup lang="ts">
// ============================================================
// 全站壳层：顶栏 + 主内容 + 底栏
//
// 滚动模型：body 自然滚动，顶栏 UHeader 自带 sticky top-0。
// 页面容器 .page-shell 只负责宽度与内边距，不再承担「唯一滚动容器」
// 的角色——上一版那个 height:100vh + overflow-y:auto 的 .site-main 已移除，
// 相应地路由滚动、锚点、返回顶部全部改回监听 window。
//
// 与 VitePress 时期的 Layout.vue 差异：按 frontmatter.layout 分派视图的逻辑
// 已下沉到 app/pages/**（路由即布局），这里只保留外壳与全站钩子。
// ============================================================

// 注意：这里**不能**用顶层 await。layout 不在 <Suspense> 包裹范围内，
// 异步 setup 会让客户端 hydration 一直挂起（表现为页面卡死）。
// 文章列表改由 plugins/posts.ts 在应用创建阶段填充（见该文件注释）。
const nuxtApp = useNuxtApp();
const route = useRoute();
const {
  progress,
  active: progressActive,
  done: progressDone,
  completeRendering,
  start,
  markPageLoaded,
} = usePageProgress();

const offLoadingStart = nuxtApp.hook('page:loading:start', () => start(false));
const offLoadingEnd = nuxtApp.hook('page:loading:end', () => markPageLoaded());
// 新页面已挂载：让进度条等字体 / 图片就绪后收尾
const offPageFinish = nuxtApp.hook('page:finish', () => {
  completeRendering();
  // 新页 DOM 已就绪：重新给区块打标，让视口外的块滚动时才淡入。
  // 用异步补刷而不是立即执行 —— 从页面中部跳转时，新页的滚动回顶发生在
  // 这一帧之后；立刻量尺寸会把所有块误判成「已在视口上方」而跳过动画。
  scheduleScrollRevealRefresh();
  // 带 hash 的跨页导航：此时新页 DOM 已就绪，交给 usePostEnhance 精确对齐
  const hash = route.hash;
  if (hash) {
    document.dispatchEvent(new CustomEvent('pidan:anchor', { detail: hash }));
  }
});

// 页面过渡结束后再补一次：out-in 期间量到的位置带着过渡位移，不可靠
const offTransitionFinish = nuxtApp.hook('page:transition:finish', () => {
  scheduleScrollRevealRefresh();
});

// 全站区块的滚动入场（首屏交错 + 视口外按需淡入）
useScrollReveal();

onMounted(() => {
  completeRendering();
});

onBeforeUnmount(() => {
  offLoadingStart();
  offLoadingEnd();
  offPageFinish();
  offTransitionFinish();
});
</script>

<template>
  <PageProgress :progress="progress" :active="progressActive" :done="progressDone" />

  <!-- 纵向三段式：顶栏 sticky、主区撑满剩余高度、底栏留在文档流末尾 -->
  <div class="flex min-h-dvh flex-col">
    <SiteHeader />

    <!-- 主内容地标：浏览器阅读模式据此定位正文，忽略顶栏与底栏 -->
    <main id="content" class="flex-1" role="main">
      <UContainer class="page-shell py-6 sm:py-8 lg:py-10">
        <slot />
      </UContainer>
    </main>

    <SiteFooter />
  </div>

  <BackToTop />
  <SearchDialog />
</template>
