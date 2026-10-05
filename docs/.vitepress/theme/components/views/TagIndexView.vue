<script setup lang="ts">
import { withBase } from 'vitepress';
import { collectTerms } from '@/composables/usePosts';

const terms = collectTerms('tags');
</script>

<template>
  <div class="terms-view">
    <h1 class="list-title">标签</h1>

    <div class="term-cloud">
      <a
        v-for="term in terms"
        :key="term.name"
        class="tag-chip"
        :href="withBase(term.path)"
      >
        #{{ term.name }}
        <span class="term-count">{{ term.count }}</span>
      </a>
      <p v-if="!terms.length" class="empty-state">暂无标签</p>
    </div>
  </div>
</template>