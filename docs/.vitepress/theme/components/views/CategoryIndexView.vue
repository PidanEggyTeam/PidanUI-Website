<script setup lang="ts">
import { withBase } from 'vitepress';
import { collectTerms } from '@/composables/usePosts';

const terms = collectTerms('categories');
</script>

<template>
  <div class="terms-view">
    <h1 class="list-title">分类</h1>

    <div class="term-grid">
      <a v-for="term in terms" :key="term.name" class="term-card" :href="withBase(term.path)">
        <span class="term-name">{{ term.name }}</span>
        <span class="term-count">{{ term.count }} 篇</span>
      </a>
      <p v-if="!terms.length" class="empty-state">暂无分类</p>
    </div>
  </div>
</template>