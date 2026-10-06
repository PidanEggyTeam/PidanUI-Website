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

<style scoped lang="scss">
@use 'variables' as *;

.chips-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .chip {
    padding: 6px 16px;
    font-size: 13px;
    color: $ink-2;
    background: $card;
    border: 1px solid $line;
    border-radius: $radius-full;
    transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease;

    &:hover {
      color: $brand-deep;
      background: $brand-soft;
      border-color: rgba(255, 159, 26, 0.3);
    }
  }
}
</style>
