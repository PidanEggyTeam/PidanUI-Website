<script setup lang="ts">
import { withBase } from 'vitepress';
import { openSearchDialog } from '@/composables/useSearch';
</script>

<template>
  <button class="search-launcher" type="button" aria-haspopup="dialog" @click="openSearchDialog($event.currentTarget as HTMLElement)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <span>搜索新闻标题与正文...</span>
  </button>
  <a class="search-launcher-fallback" :href="withBase('/search/')">打开搜索页</a>
</template>

<style scoped lang="scss">
@use 'variables' as *;

.search-launcher {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0 0 18px;
  padding: 12px 18px;
  color: $ink-3;
  font: inherit;
  font-size: 15px;
  text-align: left;
  background: $card;
  border: 1px solid $line;
  border-radius: 40px;
  cursor: pointer;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;

  svg {
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
  }

  &:hover,
  &:focus-visible {
    border-color: $brand-deep;
    box-shadow: 0 0 0 4px rgba(255, 159, 26, 0.14);
    outline: none;
  }
}

.search-launcher-fallback {
  display: none;
  margin-bottom: 18px;
  color: $brand-deep;
  text-decoration: underline;
}

:global(html:not(.js)) .search-launcher {
  display: none;
}

:global(html:not(.js)) .search-launcher-fallback {
  display: inline-block;
}
</style>
