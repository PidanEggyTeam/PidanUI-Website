<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import CardGrid from './CardGrid.vue';
import PostCardSkeleton from './PostCardSkeleton.vue';
import EmptyState from './EmptyState.vue';
import { searchKeyword } from '~/composables/useSearch';
import type { Post } from '#shared/types/post';

// 检索语料是 nuxt generate 构建期固定的静态文件（/api/search.json），
// 内容只随部署更新。此前每次打开搜索弹窗 / 进入搜索页都会重新下载全量
// 语料，这里按「会话内只请求一次」复用结果；请求失败时不缓存（复位
// Promise），下次打开仍按原行为重试，不会把失败结果留成空语料。
let corpusRequest: Promise<Post[]> | null = null;

function loadCorpus(): Promise<Post[]> {
  corpusRequest ||= $fetch<Post[]>(withBase('/api/search.json')).catch((error) => {
    corpusRequest = null;
    throw error;
  });
  return corpusRequest;
}

type CorpusStatus = 'idle' | 'loading' | 'ready' | 'error';

const corpus = shallowRef<Post[]>([]);
const status = ref<CorpusStatus>('idle');

onMounted(async () => {
  if (status.value === 'ready') return;
  // 只在客户端置 loading：SSR / 无 JS 的静态 HTML 里不会出现骨架
  status.value = 'loading';
  try {
    corpus.value = await loadCorpus();
    status.value = 'ready';
  } catch {
    corpus.value = [];
    status.value = 'error';
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

/** 五态：空关键词 / 语料加载中 / 加载失败 / 无命中 / 有结果 */
const state = computed(() => {
  if (!tokens.value.length) return 'idle' as const;
  if (status.value === 'loading') return 'loading' as const;
  if (status.value === 'error') return 'error' as const;
  return hits.value.length ? ('results' as const) : ('empty' as const);
});

const stats = computed(() => {
  const keyword = searchKeyword.value.trim();
  switch (state.value) {
    case 'idle':
      return '输入关键词开始搜索新闻。';
    case 'loading':
      return '正在加载检索语料…';
    case 'error':
      return '检索语料加载失败，请刷新重试。';
    case 'empty':
      return `未找到与“${keyword}”相关的新闻。`;
    default:
      return `找到 ${hits.value.length} 条与“${keyword}”相关的结果`;
  }
});
</script>

<template>
  <p class="mt-2 mb-4 flex items-center gap-2 text-sm text-dimmed" aria-live="polite">
    <UIcon name="i-lucide-search" class="size-4 shrink-0" aria-hidden="true" />
    {{ stats }}
  </p>

  <!-- 骨架：与 PostCard 同尺寸，弹窗高度不跳变 -->
  <UPageGrid v-if="state === 'loading'" role="status">
    <span class="sr-only">正在加载检索语料</span>
    <PostCardSkeleton v-for="n in 3" :key="n" />
  </UPageGrid>

  <CardGrid v-else-if="state === 'results'" :posts="hits" :highlight="tokens" />

  <EmptyState v-else-if="state === 'empty'" text="未找到相关新闻" />
  <EmptyState v-else-if="state === 'error'" text="暂时无法搜索，请刷新重试" />
</template>
