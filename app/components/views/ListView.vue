<script setup lang="ts">
import ChipsNav from '../ChipsNav.vue';
import CardGrid from '../CardGrid.vue';
import Pagination from '../Pagination.vue';
import PageTitle from '../PageTitle.vue';
import type { Post } from '#shared/types/post';

// 列表页通用外壳：标题 + 统计 + 快捷入口 + 卡片网格 + 分页
defineProps<{
  title: string;
  posts: Post[];
  current: number;
  totalPages: number;
  firstHref: string;
  pagePrefix: string;
  /** 标题下方的一行说明，如「共 12 篇 · 第 1 / 2 页」 */
  summary?: string;
  /** 隐藏分类/标签/归档快捷入口（分类、标签详情页使用） */
  hideChips?: boolean;
}>();
</script>

<template>
  <div class="mx-auto max-w-page">
    <!-- 页面级顶部插槽（如新闻页的搜索框） -->
    <slot name="top" />

    <!-- UPageHeader 默认标题是 h1、外框 py-8；这里用 as 把 title 降级为 div，
         真正的 h1 由 PageTitle 供给（字号来源唯一），外框样式在 app.config 覆盖 -->
    <UPageHeader :as="{ title: 'div' }" class="list-head">
      <template #title>
        <PageTitle :title="title" />
      </template>
      <template v-if="summary" #description>
        <p>{{ summary }}</p>
      </template>
      <template v-if="!hideChips" #links>
        <ChipsNav />
      </template>
    </UPageHeader>

    <CardGrid :posts="posts" />

    <Pagination
      :current="current"
      :total-pages="totalPages"
      :first-href="firstHref"
      :page-prefix="pagePrefix"
    />
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  /* 窄屏标题与快捷入口上下堆叠：scoped 未分层，能压过 wrapper 上的 flex-row */
  .list-head :deep([data-slot='wrapper']) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
