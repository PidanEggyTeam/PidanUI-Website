<script setup lang="ts">
import ChipsNav from '../ChipsNav.vue';
import CardGrid from '../CardGrid.vue';
import Pagination from '../Pagination.vue';
import type { Post } from '@/types';

// 列表页通用外壳：标题 + 快捷入口 + 卡片网格 + 分页
defineProps<{
  title: string;
  posts: Post[];
  current: number;
  totalPages: number;
  firstHref: string;
  pagePrefix: string;
  /** 隐藏分类/标签/归档快捷入口（分类、标签详情页使用） */
  hideChips?: boolean;
}>();
</script>

<template>
  <div class="news-list">
    <!-- 页面级顶部插槽（如新闻页的搜索框） -->
    <slot name="top" />

    <div class="list-head">
      <h1 class="list-title">{{ title }}</h1>
      <ChipsNav v-if="!hideChips" />
    </div>

    <CardGrid :posts="posts" />

    <Pagination
      :current="current"
      :total-pages="totalPages"
      :first-href="firstHref"
      :page-prefix="pagePrefix"
    />
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ============================================================
// 列表页通用外壳：新闻 / 分类 / 标签 列表共用
// ============================================================
.news-list {
  max-width: $max-w;
  margin: 0 auto;
}

.list-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 22px;
}

// 页面主标题（与搜索 / 归档 / 分类索引 / 标签索引页保持一致的排版）
.list-title {
  font-size: clamp(24px, 3.6vw, 32px);
  font-weight: 700;
  color: $ink;
  letter-spacing: -0.01em;
}

@include respond-below($bp-sm) {
  .list-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
