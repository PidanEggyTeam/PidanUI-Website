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

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ============================================================
// 分类索引页：卡片网格罗列全部分类
// ============================================================
.terms-view {
  max-width: 1000px;
  margin: 0 auto;
}

// 页面主标题（与列表 / 搜索 / 归档页保持一致）
.list-title {
  font-size: clamp(24px, 3.6vw, 32px);
  font-weight: 700;
  color: $ink;
  letter-spacing: -0.01em;
}

.term-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.term-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  background: $card;
  border: 1px solid $line;
  border-radius: $radius-m;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 159, 26, 0.3);
    box-shadow: $shadow-card;
  }

  .term-name {
    font-size: 15px;
    font-weight: 600;
    color: $ink;
  }

  .term-count {
    font-size: 13px;
    color: $ink-3;
  }
}

.empty-state {
  grid-column: 1 / -1;
  padding: 40px 0;
  font-size: 15px;
  color: $ink-3;
  text-align: center;
}

@include respond-below($bp-sm) {
  .term-grid {
    grid-template-columns: 1fr;
  }
}
</style>
