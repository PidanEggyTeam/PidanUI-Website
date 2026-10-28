<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '#shared/types/post';

// ============================================================
// 首条特稿大卡（新闻列表第 1 页专用）
//
// 只在这一处使用：封面 + 摘要 + 「阅读全文」，与紧凑的 PostCard 形成层级差。
// 不复用 PostCard 的 variant —— PostCard 的根节点是 NuxtLink、类名还被
// SearchDialog 的点击判定间接依赖，加分支会放大风险。
// ============================================================
const props = defineProps<{ post: Post }>();

/** 封面：外链原样输出，站内相对路径补 base（与 PostCard 同一套规则） */
const coverSrc = computed(() => {
  const cover = props.post.cover;
  if (!cover) return withBase('/images/default_cover.webp');
  if (/^(?:https?:|data:)/i.test(cover)) return cover;
  return withBase(cover.startsWith('/') ? cover : `/${cover}`);
});

// variant 用 naked 拿到完全控制权：不用主题的 ring 描边与 hover 底色，
// 描边与阴影统一走全站的 border-default / shadow-card。
const CARD_UI = {
  root:
    'group w-full overflow-hidden rounded-(--radius-l) border border-default bg-default ' +
    'transition-[border-color,box-shadow] duration-200 ' +
    'hover:border-brand-600/30 hover:shadow-card',
  container: 'p-0! gap-0! lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch',
  wrapper: 'min-w-0',
  body: 'flex h-full flex-col justify-center gap-3 p-5 sm:p-6 lg:p-7',
} as const;
</script>

<template>
  <UPageCard
    :to="post.url"
    :title="post.title"
    orientation="horizontal"
    reverse
    variant="naked"
    :ui="CARD_UI"
  >
    <template #body>
      <div class="flex flex-wrap items-center gap-2 text-[12.5px] text-dimmed">
        <UBadge v-if="post.stickypost" color="primary" variant="soft" size="sm" label="置顶" />
        <time class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-calendar-days" class="size-3.5" aria-hidden="true" />
          {{ post.date }}
        </time>
        <span
          v-for="category in post.categories.slice(0, 2)"
          :key="category"
          class="rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-medium text-brand-700"
        >
          {{ category }}
        </span>
      </div>

      <h2 class="line-clamp-3 text-[19px] leading-[1.45] font-semibold text-default">
        {{ post.title }}
      </h2>

      <p v-if="post.description" class="line-clamp-2 text-[13.5px] leading-[1.7] text-toned">
        {{ post.description }}
      </p>

      <span class="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand-600">
        阅读全文
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </template>

    <!-- 默认插槽即封面（PageCard 把它排在 wrapper 之后，reverse 使其在左侧） -->
    <div class="feature-cover">
      <img
        :src="coverSrc"
        :alt="post.title"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
    </div>
  </UPageCard>
</template>

<style scoped>
.feature-cover {
  position: relative;
  overflow: hidden;
  background: var(--bg);
  aspect-ratio: 16 / 9;
  /* 封面贴到卡片边缘，圆角由 root 的 overflow-hidden 统一裁；
     这里再补同值圆角（比边框少 1px），避免部分浏览器在合成层上漏裁——
     漏裁的表现就是左侧两角变方。只圆「外侧」两角：
     窄屏封面在上 → 上左/上右；≥1024 左图右文 → 上左/下左。 */
  border-radius: calc(var(--radius-l) - 1px) calc(var(--radius-l) - 1px) 0 0;
}

.feature-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.group:hover .feature-cover img {
  transform: scale(1.03);
}

/* ≥1024 才进入左右两栏，封面撑满整列高度 */
@media (min-width: 1024px) {
  .feature-cover {
    aspect-ratio: auto;
    height: 100%;
    border-radius: calc(var(--radius-l) - 1px) 0 0 calc(var(--radius-l) - 1px);
  }
}
</style>
