<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '#shared/types/post';

const props = withDefaults(
  defineProps<{
    post: Post;
    /** 命中关键词（仅搜索结果传入），用于标题高亮 */
    highlight?: string[];
  }>(),
  { highlight: () => [] },
);

/** 标题按命中词切成片段；未传关键词时是单段原文，零开销 */
const titleParts = computed(() => splitHighlight(props.post.title, props.highlight));

// 封面：外链原样输出，站内相对路径补 base
const coverSrc = computed(() => {
  const cover = props.post.cover;
  if (!cover) return withBase('/images/default_cover.webp');
  if (/^(?:https?:|data:)/i.test(cover)) return cover;
  return withBase(cover.startsWith('/') ? cover : `/${cover}`);
});
</script>

<template>
  <!-- 紧凑横排卡片：新闻 / 分类 / 标签 / 搜索页 / 搜索对话框共用。
       封面做成「内嵌圆角块」，与卡片外框形成双层圆角，比通栏封面更精致。 -->
  <NuxtLink
    class="group card flex min-h-[104px] gap-3 rounded-(--radius-l) border border-default bg-default p-2 transition-[border-color,box-shadow] duration-200 hover:border-brand-600/30 hover:shadow-card"
    :to="post.url"
  >
    <div class="relative w-[148px] shrink-0 overflow-hidden rounded-(--radius-m) bg-muted">
      <UBadge
        v-if="post.stickypost"
        class="absolute top-1.5 left-1.5 z-1"
        color="primary"
        size="sm"
        label="置顶"
      />
      <img
        class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        :src="coverSrc"
        :alt="post.title"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1 pr-1">
      <h3 class="line-clamp-2 text-[15px] leading-[1.5] font-semibold text-default">
        <template v-for="(part, index) in titleParts" :key="index">
          <mark v-if="part.hit" class="post-mark">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </h3>
      <div class="flex flex-wrap items-center gap-2 text-[12.5px] text-dimmed">
        <time class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-calendar-days" class="size-3.5" aria-hidden="true" />
          {{ post.date }}
        </time>
        <span
          v-if="post.categories.length"
          class="rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-medium text-brand-700"
        >
          {{ post.categories[0] }}
        </span>
      </div>
    </div>

    <UIcon
      name="i-lucide-arrow-right"
      class="my-auto mr-1 shrink-0 text-dimmed transition-colors duration-200 group-hover:text-brand-600"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<style scoped>
/* 项目没引 Preflight：不显式写就是 UA 的亮黄底 + 黑字，深色下非常刺眼 */
.post-mark {
  color: inherit;
  background: color-mix(in srgb, var(--brand) 35%, transparent);
  border-radius: 3px;
  padding: 0 1px;
  box-decoration-break: clone;
}

/* 窄屏收紧缩略图（断点与 tokens.css 的 2xs=480 对齐，
   仍手写媒体查询，避免与 960px 主断点的约定冲突） */
@media (max-width: 480px) {
  .card {
    min-height: 96px;
  }

  .card > div:first-child {
    width: 112px;
  }
}
</style>
