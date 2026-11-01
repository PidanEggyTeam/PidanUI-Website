<script setup lang="ts">
defineProps<{
  progress: number;
  active: boolean;
  done: boolean;
}>();
</script>

<template>
  <div
    class="page-progress"
    :class="{ active, done }"
    :style="{ width: `${progress}%` }"
    role="progressbar"
    aria-label="页面加载进度"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(progress)"
    :aria-hidden="active ? undefined : 'true'"
  ></div>
</template>

<style scoped>
/* 顶部固定进度条：层级高于侧栏与抽屉，宽度由真实加载进度驱动 */
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  z-index: 1001;
  opacity: 0;
  pointer-events: none;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(90deg, var(--brand), var(--brand-deep), #ff7a00);
  box-shadow: 0 0 12px rgba(255, 159, 26, 0.35);
  transition:
    width 0.25s ease,
    opacity 0.4s ease;
}

.page-progress.active {
  opacity: 1;
}

.page-progress.done {
  opacity: 0;
  transition: opacity 0.45s ease;
}

@media (prefers-reduced-motion: reduce) {
  .page-progress {
    transition: none;
  }
}
</style>
