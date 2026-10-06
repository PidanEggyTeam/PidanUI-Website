<script setup lang="ts">
import { computed } from 'vue';
import { useTheme, type ThemeMode } from '@/composables/useTheme';

// 主题切换按钮：三态循环（跟随系统 → 浅色 → 深色），图标随当前模式变化
const { mode, cycle } = useTheme();

const LABELS: Record<ThemeMode, string> = {
  auto: '跟随系统',
  light: '浅色模式',
  dark: '深色模式',
};

const label = computed(() => LABELS[mode.value]);
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :title="`当前：${label}（点击切换）`"
    :aria-label="`切换主题，当前${label}`"
    @click="cycle"
  >
    <span class="toggle-icon" aria-hidden="true">
      <!-- 跟随系统 -->
      <svg v-if="mode === 'auto'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <!-- 浅色 -->
      <svg v-else-if="mode === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
        <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
        <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
      </svg>
      <!-- 深色 -->
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </span>
    <span class="toggle-label">{{ label }}</span>
  </button>
</template>

<style scoped lang="scss">
@use 'variables' as *;

// 置于左侧栏底部（父级为 flex column，用 margin-top:auto 顶到底）
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding: 10px 12px;
  font-size: 14px;
  color: $ink-2;
  background: transparent;
  border: 1px solid $line;
  border-radius: $radius-m;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  .toggle-icon {
    display: inline-flex;
    width: 20px;
    height: 20px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  &:hover {
    color: $brand-deep;
    background: rgba(255, 197, 61, 0.1);
    border-color: rgba(255, 159, 26, 0.35);
  }
}
</style>
