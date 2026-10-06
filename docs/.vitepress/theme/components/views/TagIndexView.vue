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

<style scoped lang="scss">
@use 'variables' as *;

// ============================================================
// 标签索引页：标签云罗列全部标签
// ============================================================
.terms-view {
  max-width: 1000px;
  margin: 0 auto;
}

// 页面主标题（与列表 / 搜索 / 归档 / 分类索引页保持一致）
.list-title {
  font-size: clamp(24px, 3.6vw, 32px);
  font-weight: 700;
  color: $ink;
  letter-spacing: -0.01em;
}

.term-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    font-size: 14px;
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

    .term-count {
      font-size: 12px;
      color: $ink-3;
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  padding: 40px 0;
  font-size: 15px;
  color: $ink-3;
  text-align: center;
}
</style>
