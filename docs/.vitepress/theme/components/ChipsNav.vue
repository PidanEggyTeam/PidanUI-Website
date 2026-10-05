<script setup lang="ts">
import { withBase } from 'vitepress';

// 分类 / 标签 / 归档快捷入口
const CHIPS = [
  { label: '全部分类', href: '/categories/' },
  { label: '全部标签', href: '/tags/' },
  { label: '归档', href: '/archives/' },
] as const;
</script>

<template>
  <nav class="chips-nav" aria-label="新闻快捷入口">
    <a v-for="chip in CHIPS" :key="chip.href" class="chip" :href="withBase(chip.href)">
      {{ chip.label }}
    </a>
  </nav>
</template>