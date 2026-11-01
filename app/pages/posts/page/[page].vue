<script setup lang="ts">
// 文章列表是各列表页与分页校验的数据前提，先确保已就绪
await fetchAllPosts();
const allPosts = useAllPosts();

import { PAGE_SIZE } from '#shared/site';
import { withPageSuffix } from '~/composables/usePageSeo';

const route = useRoute();
const page = computed(() => Math.floor(Number(route.params.page)) || 1);
const totalPages = computed(() => Math.max(1, Math.ceil(allPosts.value.length / PAGE_SIZE)));

if (page.value < 2 || page.value > totalPages.value) {
  throw createError({ statusCode: 404, message: '页码不存在', fatal: true });
}

usePageSeo(
  computed(() => withPageSuffix('新闻', page.value)),
  'PidanUI 新闻中心，获取 PidanUI 最新动态、版本更新与使用教程。',
);
</script>

<template>
  <NewsHomeView :page="page" />
</template>
