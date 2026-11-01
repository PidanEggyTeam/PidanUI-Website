<script setup lang="ts">
// 文章列表是各列表页与分页校验的数据前提，先确保已就绪
await fetchAllPosts();
const allPosts = useAllPosts();

import { withPageSuffix } from '~/composables/usePageSeo';

// 归档「一年一页」：第 N 页即第 N 个年份（与 VitePress 时期的语义一致）
const route = useRoute();
const page = computed(() => Math.floor(Number(route.params.page)) || 1);

const years = computed(() => {
  const set = new Set<string>();
  for (const post of allPosts.value) {
    const year = post.date.slice(0, 4);
    if (year) set.add(year);
  }
  return [...set].sort((a, b) => b.localeCompare(a));
});

const yearOfPage = computed(() => years.value[page.value - 1] ?? '');

if (page.value < 2 || !yearOfPage.value) {
  throw createError({ statusCode: 404, message: '归档页码不存在', fatal: true });
}

usePageSeo(
  computed(() =>
    yearOfPage.value ? `归档 · ${yearOfPage.value} 年` : withPageSuffix('归档', page.value),
  ),
  '按时间浏览 PidanUI 全部新闻与公告。',
);
</script>

<template>
  <ArchiveView :page="page" />
</template>
