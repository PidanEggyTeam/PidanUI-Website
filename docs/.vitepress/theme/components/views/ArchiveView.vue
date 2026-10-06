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

<style scoped lang="scss">
@use 'variables' as *;

// ============================================================
// 归档页：按年份时间轴罗列全部文章
// ============================================================
.archive-view {
  max-width: 860px;
  margin: 0 auto;
}

// 页面主标题（与列表 / 搜索 / 分类索引页保持一致）
.list-title {
  font-size: clamp(24px, 3.6vw, 32px);
  font-weight: 700;
  color: $ink;
  letter-spacing: -0.01em;
}

.archive-total {
  margin: 8px 0 8px;
  font-size: 14px;
  color: $ink-3;
}

.archive-group {
  margin-top: 24px;
}

.archive-year {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 700;
  color: $brand-deep;
}

.post-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.post-row {
  border-bottom: 1px solid $line;

  &:last-child {
    border-bottom: none;
  }

  .row-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 6px;
    color: inherit;

    &:hover .row-title {
      color: $brand-deep;
    }

    .row-title {
      font-size: 15px;
      font-weight: 500;
      line-height: 1.5;
      color: $ink;
      transition: color 0.25s ease;
    }

    .row-date {
      flex-shrink: 0;
      font-size: 13px;
      color: $ink-3;
    }
  }
}
</style>
