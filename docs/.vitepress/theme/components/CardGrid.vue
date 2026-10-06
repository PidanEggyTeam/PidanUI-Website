<script setup lang="ts">
import PostCard from './PostCard.vue';
import type { Post } from '@/types';

withDefaults(
  defineProps<{
    posts: Post[];
    emptyText?: string;
  }>(),
  { emptyText: '暂无内容' },
);
</script>

<template>
  <div class="card-grid">
    <p v-if="!posts.length" class="empty-state">{{ emptyText }}</p>
    <template v-else>
      <PostCard v-for="post in posts" :key="post.url" :post="post" />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 40px 0;
  font-size: 15px;
  color: $ink-3;
  text-align: center;
}

@include respond-below($bp-sm) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
