<script setup lang="ts">
import { openSearchDialog } from '~/composables/useSearch';
</script>

<template>
  <UButton
    class="search-launcher mb-[18px] w-full justify-start gap-3 rounded-full px-[18px] py-3 text-[15px] font-normal"
    variant="outline"
    color="neutral"
    icon="i-lucide-search"
    label="搜索新闻标题与正文..."
    aria-haspopup="dialog"
    aria-keyshortcuts="Control+K Meta+K"
    @click="openSearchDialog($event.currentTarget as HTMLElement)"
  >
    <template #trailing>
      <!-- 静态写 Ctrl / K：navigator 在 SSR 不可用，按平台渲染会带来水合跳变；
           真正的平台语义交给 aria-keyshortcuts -->
      <span class="ms-auto flex items-center gap-1" aria-hidden="true">
        <UKbd size="sm">Ctrl</UKbd>
        <UKbd size="sm">K</UKbd>
      </span>
    </template>
  </UButton>
  <!-- 无 JS 时上面的对话框打不开，退化成站内搜索页链接 -->
  <a
    class="search-launcher-fallback mb-[18px] hidden text-brand-600 underline"
    :href="withBase('/search/')"
    >打开搜索页</a
  >
</template>
