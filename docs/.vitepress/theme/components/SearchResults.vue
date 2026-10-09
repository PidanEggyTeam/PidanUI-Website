<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import CardGrid from './CardGrid.vue';
import { searchKeyword } from '@/composables/useSearch';
import type { Post } from '@/types';

const corpus = shallowRef<Post[]>([]);

onMounted(async () => {
  try {
    const mod = await import('@/postsSearch.data');
    corpus.value = mod.data;
  } catch {
    corpus.value = [];
  }
});

const tokens = computed(() => searchKeyword.value.toLowerCase().split(/\s+/).filter(Boolean));

const hits = computed(() => {
  if (!tokens.value.length) return [];
  return corpus.value.filter((post) => {
    const haystack = [post.title, post.content ?? '', post.tags.join(' ')].map((text) =>
      text.toLowerCase(),
    );
    return tokens.value.every((token) => haystack.some((text) => text.includes(token)));
  });
});

const stats = computed(() => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) return '输入关键词开始搜索新闻。';
  if (!hits.value.length) return `未找到与“${keyword}”相关的新闻。`;
  return `找到 ${hits.value.length} 条与“${keyword}”相关的结果`;
});
</script>

<template>
  <p class="search-tip" aria-live="polite">{{ stats }}</p>
  <CardGrid v-if="tokens.length" :posts="hits" empty-text="未找到相关新闻" />
</template>

<style scoped lang="scss">
@use 'variables' as *;

.search-tip {
  margin: 8px 0 16px;
  font-size: 14px;
  color: $ink-3;
}
</style>
