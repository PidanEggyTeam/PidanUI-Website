<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import GiscusComments from '../GiscusComments.vue';
import { formatDate, termPath, toArray } from '#shared/utils/term';
import { parsePostDate } from '#shared/utils/date';
import { SITE } from '#shared/site';
import { enhancePost } from '~/composables/usePostEnhance';
import type { Post } from '#shared/types/post';

// 文章详情：返回链接 / 标题 / 时间 / 分类标签 / 正文 / 上下篇 / 评论
// 正文由 @nuxt/content 的 <ContentRenderer> 渲染（等价于旧的 <Content />）

/**
 * 文章文档：/api/posts/<slug>/index.json 的响应项，即 content 集合 posts 的一项。
 *
 * 字段由 content.config.ts 的 zod schema 决定：title / date 必填，categories / tags
 * 默认空数组，description / cover 可选；其余字段（body AST、stem、id、meta…）
 * 原样透传给 <ContentRenderer>，所以保留一条 unknown 的索引签名。
 *
 * 之前这里写的是 Record<string, any>：any 既让 eslint 的 no-explicit-any 报警，
 * 也让 doc.title / doc.date 这类取值彻底失去类型约束。
 */
interface PostDocument {
  /** 站点内路径，如 /posts/xxx */
  path?: string;
  /** 标题 */
  title?: string;
  /** 发布日期（YAML 字符串，由 parsePostDate 按 UTC 解释） */
  date?: string;
  /** 摘要 */
  description?: string;
  /** 封面图（可为外链） */
  cover?: string;
  /** 分类名列表 */
  categories?: string[];
  /** 标签名列表 */
  tags?: string[];
  /** 是否置顶 */
  stickypost?: boolean;
  /** 其余 content 字段原样透传给 ContentRenderer */
  [key: string]: unknown;
}

const props = defineProps<{
  doc: PostDocument;
  posts: Post[];
}>();

const route = useRoute();

// 客户端增强：目录（[TOC]）与代码块复制按钮
onMounted(() => void enhancePost(route.path));
watch(
  () => route.path,
  (path) => void enhancePost(path),
);

const categories = computed(() => toArray(props.doc.categories));
const tags = computed(() => toArray(props.doc.tags));
const dateValue = computed(() => parsePostDate(props.doc.date));
const dateText = computed(() => formatDate(dateValue.value));
const dateISO = computed(() => {
  const date = dateValue.value;
  return Number.isNaN(date.getTime()) ? dateText.value : date.toISOString();
});

// 按时间倒序：index-1 为更新的一篇，index+1 为更早的一篇
const index = computed(() => props.posts.findIndex((post) => post.url === props.doc.path));
const prevPost = computed(() => (index.value > 0 ? props.posts[index.value - 1] : null));
const nextPost = computed(() =>
  index.value >= 0 && index.value < props.posts.length - 1 ? props.posts[index.value + 1] : null,
);
</script>

<template>
  <article class="post-view">
    <nav class="mb-[18px]" aria-label="返回新闻列表">
      <UButton
        to="/posts/"
        variant="soft"
        color="primary"
        size="sm"
        rounded-full
        icon="i-lucide-arrow-left"
        label="返回新闻"
      />
    </nav>

    <header class="post-header">
      <h1 class="post-title">{{ doc.title }}</h1>

      <div class="post-meta">
        <span class="post-author">{{ SITE.author }}</span>
        <time class="post-date" :datetime="dateISO">{{ dateText }}</time>
        <NuxtLink
          v-for="category in categories"
          :key="category"
          class="tag"
          :to="termPath('categories', category)"
        >
          {{ category }}
        </NuxtLink>
        <NuxtLink v-for="tag in tags" :key="tag" class="tag" :to="termPath('tags', tag)">
          #{{ tag }}
        </NuxtLink>
      </div>
    </header>

    <div class="post-content"><ContentRenderer :value="doc" /></div>

    <footer class="post-footer">
      <nav class="post-nav" aria-label="上一篇 / 下一篇">
        <NuxtLink v-if="prevPost" class="prev" :to="prevPost.url">
          <UIcon name="i-lucide-arrow-left" class="size-4 shrink-0" aria-hidden="true" />
          {{ prevPost.title }}
        </NuxtLink>
        <span v-else></span>
        <NuxtLink v-if="nextPost" class="next" :to="nextPost.url">
          {{ nextPost.title }}
          <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0" aria-hidden="true" />
        </NuxtLink>
      </nav>

      <aside class="post-comments-wrap" aria-label="评论区">
        <ClientOnly>
          <GiscusComments />
        </ClientOnly>
      </aside>
    </footer>
  </article>
</template>
