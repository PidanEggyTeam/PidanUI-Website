<script setup lang="ts">
import SearchResults from '../SearchResults.vue';
import NewsSearchBox from '../NewsSearchBox.vue';
</script>

<template>
  <div class="search-view">
    <!-- 搜索框置于标题之上（搜索页独有布局） -->
    <NewsSearchBox autofocus />

    <h1 class="list-title">搜索</h1>

    <SearchResults />
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;

// ============================================================
// 搜索页：搜索框在上，标题在下
// ============================================================
.search-view {
  max-width: 1000px;
  margin: 0 auto;
}

// 搜索页标题紧跟搜索框，略加顶部留白（排版与列表页一致）
.list-title {
  margin-top: 8px;
  font-size: clamp(24px, 3.6vw, 32px);
  font-weight: 700;
  color: $ink;
  letter-spacing: -0.01em;
}

</style>
