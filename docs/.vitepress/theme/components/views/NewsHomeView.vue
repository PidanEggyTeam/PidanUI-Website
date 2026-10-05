<script setup lang="ts">
import ListView from './ListView.vue';
import NewsSearchBox from '../NewsSearchBox.vue';
import { allPosts, pinnedFirst, usePagedPosts } from '@/composables/usePosts';

const props = defineProps<{ page: number }>();

// 新闻首页列表：置顶文章优先，其余按时间倒序
const { pagePosts, page, totalPages } = usePagedPosts(
  () => props.page,
  () => pinnedFirst(allPosts),
);
</script>

<template>
  <ListView
    title="新闻"
    :posts="pagePosts"
    :current="page"
    :total-pages="totalPages"
    first-href="/posts/"
    page-prefix="/posts/page/"
  >
    <!-- 搜索框置于新闻页顶部，输入即跳转到搜索结果页 -->
    <template #top>
      <NewsSearchBox navigate-on-input />
    </template>
  </ListView>
</template>