<script setup lang="ts">
import { computed } from 'vue';
import PageTitle from '../PageTitle.vue';
import EmptyState from '../EmptyState.vue';
import { collectTerms, useAllPosts } from '~/composables/usePosts';

const allPosts = useAllPosts();
const terms = computed(() => collectTerms('categories', allPosts.value));

/** 分类卡：naked 拿回控制权，描边/阴影沿用全站令牌；:title 只服务 aria-label */
const TERM_UI = {
  root:
    'group rounded-(--radius-l) border border-default bg-default ' +
    'transition-[border-color,box-shadow] duration-200 ' +
    'hover:border-brand-600/30 hover:shadow-card',
  container: 'p-0',
  wrapper: 'w-full',
  body: 'w-full px-4 py-3.5',
} as const;
</script>

<template>
  <div class="mx-auto max-w-[1000px]">
    <UPageHeader :as="{ title: 'div' }">
      <template #title>
        <PageTitle title="分类" />
      </template>
      <template #description>
        <p>共 {{ terms.length }} 个分类 · 按收录文章数排序</p>
      </template>
    </UPageHeader>

    <!-- 密度仍走 app.config 的 auto-fill 网格，这里只把最小列宽收到 220px -->
    <UPageGrid class="term-grid" style="--grid-min: 220px">
      <UPageCard
        v-for="term in terms"
        :key="term.name"
        :to="term.path"
        :title="term.name"
        variant="naked"
        :ui="TERM_UI"
      >
        <template #body>
          <div class="flex w-full items-center gap-3">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-(--radius-m) bg-brand-soft text-brand-600"
            >
              <UIcon name="i-lucide-folder" class="size-4" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1 truncate text-[15px] font-semibold text-default">
              {{ term.name }}
            </span>
            <span
              class="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[12px] font-medium text-brand-700"
            >
              {{ term.count }}
            </span>
          </div>
        </template>
      </UPageCard>
      <EmptyState v-if="!terms.length" text="暂无分类" />
    </UPageGrid>
  </div>
</template>

