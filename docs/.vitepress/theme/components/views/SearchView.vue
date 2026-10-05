<script setup lang="ts">
import { computed } from 'vue';
import CardGrid from '../CardGrid.vue';
import NewsSearchBox from '../NewsSearchBox.vue';
import { data as allPosts } from '@/posts.data';
import { searchKeyword } from '@/composables/useSearch';

// 本地检索：与新闻页共用同一个搜索框（NewsSearchBox），输入即时过滤，无需后端
const tokens = computed(() => searchKeyword.value.toLowerCase().split(/\s+/).filter(Boolean));

const hits = computed(() => {
  if (!tokens.value.length) return [];
  return allPosts.filter((post) => {
    const haystack = [post.title, post.content, post.tags.join(' ')].map((text) =>
      text.toLowerCase(),
    );
    return tokens.value.every((token) => haystack.some((text) => text.includes(token)));
  });
});

const stats = computed(() => {
  if (!searchKeyword.value) return '输入关键词开始搜索新闻。';
  if (!hits.value.length) return `未找到与“${searchKeyword.value}”相关的新闻。`;
  return `找到 ${hits.value.length} 条与“${searchKeyword.value}”相关的结果`;
});
</script>

<template>
  <div class="search-view">
    <!-- 搜索框置于标题之上（搜索页独有布局） -->
    <NewsSearchBox autofocus />

    <h1 class="list-title">搜索</h1>

    <p class="search-tip">{{ stats }}</p>

    <CardGrid v-if="tokens.length" :posts="hits" empty-text="未找到相关新闻" />
  </div>
</template>