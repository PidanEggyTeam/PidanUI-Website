<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import CardGrid from '../CardGrid.vue';
import NewsSearchBox from '../NewsSearchBox.vue';
import { searchKeyword } from '@/composables/useSearch';
import type { Post } from '@/types';

// 本地检索：与新闻页共用同一个搜索框（NewsSearchBox），输入即时过滤，无需后端。
// 检索语料（含全站正文）体积明显大于轻量列表数据，因此在挂载后动态加载，
// 不进「每个页面都会下载」的公共 chunk。
const corpus = shallowRef<Post[]>([]);

onMounted(async () => {
  try {
    const mod = await import('@/postsSearch.data');
    corpus.value = mod.data;
  } catch {
    // 语料加载失败时搜索无结果，不影响页面其它功能
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

<style scoped lang="scss">
@use 'variables' as *;

// ============================================================
// 搜索页：搜索框在上，标题在下
// ============================================================
.search-view {
  max-width: 1000px;
  margin: 0 auto;
}

// 搜索页标题紧跟搜索框，略加顶部留白（排版与列表页一致）
.list-title {
  margin-top: 8px;
  font-size: clamp(24px, 3.6vw, 32px);
  font-weight: 700;
  color: $ink;
  letter-spacing: -0.01em;
}

.search-tip {
  margin: 8px 0 16px;
  font-size: 14px;
  color: $ink-3;
}
</style>
