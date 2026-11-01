<script setup lang="ts">
// 列表 / 搜索 / 归档 / 分类索引 / 标签索引页共用的页面主标题。
// 抽出来是为了让五个页面的标题排版只有一个来源。
defineProps<{
  title: string;
}>();
</script>

<template>
  <h1 class="text-[clamp(24px,3.6vw,32px)] font-bold tracking-[-0.01em] text-default">
    {{ title }}
  </h1>
</template>
