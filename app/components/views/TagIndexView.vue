<script setup lang="ts">
import { computed } from 'vue';
import PageTitle from '../PageTitle.vue';
import EmptyState from '../EmptyState.vue';
import { collectTerms, useAllPosts } from '~/composables/usePosts';

const allPosts = useAllPosts();
const terms = computed(() => collectTerms('tags', allPosts.value));
</script>

<template>
  <div class="mx-auto max-w-[1000px]">
    <UPageHeader :as="{ title: 'div' }">
      <template #title>
        <PageTitle title="标签" />
      </template>
      <template #description>
        <p>共 {{ terms.length }} 个标签 · 按收录文章数排序</p>
      </template>
    </UPageHeader>

    <!-- 标签云：计数用品牌色小徽章，hover 转浅黄底 -->
    <div class="flex flex-wrap gap-2.5">
      <NuxtLink
        v-for="term in terms"
        :key="term.name"
        class="inline-flex items-center gap-1.5 rounded-full border border-default bg-default py-1.5 pr-2 pl-3.5 text-sm text-toned transition-colors duration-200 hover:border-brand-600/30 hover:bg-brand-soft hover:text-brand-600"
        :to="term.path"
      >
        <UIcon name="i-lucide-hash" class="size-3.5 text-dimmed" aria-hidden="true" />
        <span>{{ term.name }}</span>
        <span
          class="ml-0.5 rounded-full bg-brand-soft px-1.5 text-[11px] leading-[1.6] font-medium text-brand-600"
        >
          {{ term.count }}
        </span>
      </NuxtLink>
      <EmptyState v-if="!terms.length" text="暂无标签" />
    </div>
  </div>
</template>
