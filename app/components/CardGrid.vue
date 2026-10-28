<script setup lang="ts">
import PostCard from './PostCard.vue';
import EmptyState from './EmptyState.vue';
import type { Post } from '#shared/types/post';

withDefaults(
  defineProps<{
    posts: Post[];
    emptyText?: string;
    /** 命中关键词（仅搜索结果传入），用于标题高亮 */
    highlight?: string[];
  }>(),
  { emptyText: '暂无内容', highlight: () => [] },
);
</script>

<template>
  <!-- 网格密度由 app.config.ts 的 ui.pageGrid 统一接管（auto-fill + --grid-min），
       这样归档月分组、搜索结果、分类/标签详情都共用同一套列数规则 -->
  <UPageGrid class="card-grid">
    <EmptyState v-if="!posts.length" :text="emptyText" />
    <template v-else>
      <PostCard v-for="post in posts" :key="post.url" :post="post" :highlight="highlight" />
    </template>
  </UPageGrid>
</template>
