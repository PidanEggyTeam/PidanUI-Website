<script setup lang="ts">
import { computed } from 'vue';
import PageTitle from '../PageTitle.vue';
import EmptyState from '../EmptyState.vue';
import { collectTerms, useAllPosts } from '~/composables/usePosts';

const allPosts = useAllPosts();
const terms = computed(() => collectTerms('categories', allPosts.value));
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

    <div class="term-grid grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
      <NuxtLink
        v-for="term in terms"
        :key="term.name"
        class="group flex items-center gap-3 rounded-(--radius-l) border border-default bg-default px-4 py-3.5 transition-[border-color,box-shadow] duration-200 hover:border-brand-600/30 hover:shadow-card"
        :to="term.path"
      >
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
      </NuxtLink>
      <EmptyState v-if="!terms.length" text="暂无分类" />
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .term-grid {
    grid-template-columns: 1fr;
  }
}
</style>
