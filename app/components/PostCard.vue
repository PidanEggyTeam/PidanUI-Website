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

// ============================================================
// 卡片结构：封面通栏 + 三行信息（标题 / 分类 · 日期 / 摘要）
//
// 刻意不用 bg-default 做「容器色」：页面底色 #fafbfc 与卡片白 #ffffff
// 只差约 1% 亮度，靠底色分层等于没有边界。改用描边 + hover 阴影分层，
// 亮色下描边取 ink-300（可在 #fafbfc 上看出来），深色沿用 --line。
// ============================================================
const CARD_UI = {
  root:
    'group w-full overflow-hidden rounded-xl border border-ink-300/60 bg-transparent ' +
    'transition-[border-color,box-shadow] duration-200 hover:border-brand-600/40 ' +
    'hover:shadow-card dark:border-default',
  // 头图与下载页版本卡片一致：16:9 通栏、直角、无内投影（主题 naked 变体给的
  // shadow-lg / rounded-lg 会在卡片里描出一圈内影），也不做 hover 缩放。
  header: 'relative aspect-video w-full overflow-hidden rounded-none bg-muted shadow-none',
  image: 'h-full w-full object-cover',
  // 内边距放在插槽内容上而不是 #body：主题给 body 打了 sm:p-0，
  // 工具类的 p-* 会输给同一个变体下的 sm:p-0
  body: 'p-0',
} as const;
</script>

<template>
  <UBlogPost :to="post.url" variant="naked" :ui="CARD_UI">
    <template #header>
      <UBadge
        v-if="post.stickypost"
        class="absolute top-2 left-2 z-1"
        color="primary"
        size="sm"
        label="置顶"
      />
      <SafeImage :src="coverSrc" :alt="post.title" loading="lazy" decoding="async" />
    </template>

    <!-- 三行：标题 → 分类 · 日期 → 摘要。
         整块走 #body 插槽，一是保证 DOM 顺序与视觉顺序一致（BlogPost 默认把
         元信息排在标题之前），二是摘要需要 line-clamp 的独立控制。 -->
    <template #body>
      <div class="flex flex-col gap-3 p-5">
        <h3 class="line-clamp-2 text-base leading-[1.5] font-semibold text-default">
          <template v-for="(part, index) in titleParts" :key="index">
            <mark v-if="part.hit" class="post-mark">{{ part.text }}</mark>
            <template v-else>{{ part.text }}</template>
          </template>
        </h3>

        <div class="flex flex-wrap items-center gap-1.5 text-[12.5px] text-dimmed">
          <span v-if="post.categories.length" class="font-medium text-brand-600">
            {{ post.categories[0] }}
          </span>
          <span v-if="post.categories.length" aria-hidden="true">·</span>
          <time>{{ post.date }}</time>
        </div>

        <p v-if="post.description" class="line-clamp-2 text-[13.5px] leading-[1.7] text-toned">
          {{ post.description }}
        </p>
      </div>
    </template>
  </UBlogPost>
</template>

<style scoped>
/* 搜索命中的高亮底色：Preflight 不会重置 <mark>，不写就是 UA 的亮黄底 */
.post-mark {
  color: inherit;
  background: color-mix(in srgb, var(--brand) 35%, transparent);
  border-radius: 3px;
  padding: 0 1px;
  box-decoration-break: clone;
}
</style>
