<script setup lang="ts">
// 文章列表是各列表页与分页校验的数据前提，先确保已就绪
await fetchAllPosts();

import { usePostSeo } from '~/composables/usePostSeo';

const route = useRoute();
const posts = useAllPosts();

// 路由参数与 content 的 path 一一对应（/posts/<slug>）
const requestFetch = useRequestFetch();
const { data: doc }: { data: Ref<Record<string, any> | null> } = await useAsyncData(
  `post:${route.path}`,
  () => requestFetch<Record<string, any>>(withBase(`/api/posts/${route.params.slug}/index.json`)),
);

if (!doc.value) {
  throw createError({ statusCode: 404, message: '文章不存在', fatal: true });
}

usePostSeo(doc);
</script>

<template>
  <PostView v-if="doc" :doc="doc" :posts="posts" />
</template>
