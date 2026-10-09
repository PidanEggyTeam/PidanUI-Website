<script setup lang="ts">
import ListView from './ListView.vue';
import SearchLauncher from '../SearchLauncher.vue';
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
    <!-- 从新闻页打开全站搜索对话框 -->
    <template #top>
      <SearchLauncher />
    </template>
  </ListView>
</template>