<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import type { Post } from '@/types';

const props = defineProps<{ post: Post }>();

// 封面：外链原样输出，站内相对路径补 base
const coverSrc = computed(() => {
  const cover = props.post.cover;
  if (!cover) return withBase('/images/default_cover.png');
  if (/^(?:https?:|data:)/i.test(cover)) return cover;
  return withBase(cover.startsWith('/') ? cover : `/${cover}`);
});
</script>

<template>
  <a class="post-card" :href="withBase(post.url)">
    <div class="card-cover">
      <span v-if="post.stickypost" class="pin-badge">置顶</span>
      <img :src="coverSrc" :alt="post.title" loading="lazy" />
    </div>
    <div class="card-body">
      <div class="card-text">
        <span class="card-title">{{ post.title }}</span>
        <time class="card-date">{{ post.date }}</time>
      </div>
      <svg
        class="card-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    </div>
  </a>
</template>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

.post-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $card;
  border: 1px solid $line;
  border-radius: $radius-l;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    box-shadow: $shadow-card;
    border-color: rgba(255, 159, 26, 0.25);

    .card-arrow {
      color: $brand-deep;
      transform: translateX(4px);
    }
  }

  .card-cover {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: $bg;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
  }

  &:hover .card-cover img {
    transform: scale(1.04);
  }

  .pin-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: $brand-deep;
    border-radius: $radius-full;
  }

  .card-body {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
  }

  .card-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .card-title {
    font-size: 15.5px;
    font-weight: 600;
    line-height: 1.5;
    color: $ink;
    @include clamp-lines(2);
  }

  .card-date {
    font-size: 13px;
    color: $ink-3;
  }

  .card-arrow {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: $ink-3;
    transition: color 0.25s ease, transform 0.25s ease;
  }
}
</style>
