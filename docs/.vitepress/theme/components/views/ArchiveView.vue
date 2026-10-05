<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import Pagination from '../Pagination.vue';
import { allPosts, usePagedPosts } from '@/composables/usePosts';
import type { Post } from '@/types';

const props = defineProps<{ page: number }>();

// 归档：按时间倒序展示全部文章，支持分页（/archives/ 与 /archives/page/N）
const { pagePosts, page, totalPages } = usePagedPosts(() => props.page);

/** 按年份分组，形成时间轴 */
const groups = computed(() => {
  const map = new Map<string, Post[]>();
  for (const post of pagePosts.value) {
    const year = post.date.slice(0, 4) || '未知';
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return [...map.entries()];
});
</script>

<template>
  <div class="archive-view">
    <h1 class="list-title">归档</h1>
    <p class="archive-total">共 {{ allPosts.length }} 篇文章</p>

    <div v-for="[year, posts] in groups" :key="year" class="archive-group">
      <h2 class="archive-year">{{ year }}</h2>
      <ul class="post-list">
        <li v-for="post in posts" :key="post.url" class="post-row">
          <a class="row-link" :href="withBase(post.url)">
            <span class="row-title">{{ post.title }}</span>
            <time class="row-date">{{ post.date }}</time>
          </a>
        </li>
      </ul>
    </div>

    <Pagination
      :current="page"
      :total-pages="totalPages"
      first-href="/archives/"
      page-prefix="/archives/page/"
    />
  </div>
</template>