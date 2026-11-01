<script setup lang="ts">
// 文章列表是各列表页与分页校验的数据前提，先确保已就绪
await fetchAllPosts();
const allPosts = useAllPosts();

/** 路由参数解码：PreRender 阶段部分路径段仍是百分号编码，这里容错处理 */
function decodeParam(value: unknown): string {
  const raw = String(value ?? '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// 中文分类名：预渲染阶段可能是百分号编码，统一走 decodeParam 容错
const route = useRoute();
const name = computed(() => decodeParam(route.params.category));

const exists = computed(() => allPosts.value.some((post) => post.categories.includes(name.value)));

if (!name.value || !exists.value) {
  throw createError({ statusCode: 404, message: '分类不存在', fatal: true });
}

usePageSeo(
  computed(() => `分类：${name.value}`),
  '按分类浏览 PidanUI 新闻与公告。',
);
</script>

<template>
  <CategoryView :name="name" :page="1" />
</template>
