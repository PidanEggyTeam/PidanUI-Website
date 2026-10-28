<script setup lang="ts">
import { computed } from 'vue';
import ListView from './ListView.vue';
import SearchLauncher from '../SearchLauncher.vue';
import { pinnedFirst, useAllPosts, usePagedPosts } from '~/composables/usePosts';

const props = defineProps<{ page: number }>();

const allPosts = useAllPosts();

// 新闻首页列表：置顶文章优先，其余按时间倒序
const { pagePosts, page, totalPages } = usePagedPosts(
  () => props.page,
  () => pinnedFirst(allPosts.value),
);

/**
 * 首条特稿：**只有第 1 页有**，且在有置顶文章时取「置顶里日期最新的一篇」。
 * pinnedFirst 是稳定排序，置顶组内已按时间倒序，这里再显式取一次 timestamp 最大值，
 * 把「多条置顶时选哪篇」这件事写死，不依赖排序实现的细节。
 */
const feature = computed(() => {
  if (page.value !== 1) return undefined;
  const pool = pagePosts.value;
  const pinned = pool.filter((post) => post.stickypost);
  if (!pinned.length) return pool[0];
  return [...pinned].sort((a, b) => b.timestamp - a.timestamp)[0];
});

/** 网格里剩下的文章（特稿已经从列表里摘走） */
const gridPosts = computed(() => pagePosts.value.filter((post) => post !== feature.value));
</script>

<template>
  <ListView
    title="新闻"
    :posts="gridPosts"
    :feature="feature"
    :current="page"
    :total-pages="totalPages"
    :summary="`共 ${allPosts.length} 篇 · 第 ${page} / ${totalPages} 页`"
    first-href="/posts/"
    page-prefix="/posts/page/"
  >
    <!-- 从新闻页打开全站搜索对话框 -->
    <template #top>
      <SearchLauncher />
    </template>
  </ListView>
</template>