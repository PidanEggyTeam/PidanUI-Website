<script setup lang="ts">
import { ref } from 'vue';
import type { DownloadVersion } from '@/types/download';

const props = defineProps<{
  version: DownloadVersion;
  expanded: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

type ImgState = 'placeholder' | 'image' | 'error';

const hasImage = !!props.version.image && props.version.image.trim() !== '';
const imgState = ref<ImgState>('placeholder');

function onImgLoad() {
  imgState.value = 'image';
}

function onImgError() {
  imgState.value = 'error';
}
</script>

<template>
  <div class="accordion-item" :class="{ active: expanded }">
    <button class="accordion-header" type="button" :aria-expanded="expanded" @click="emit('toggle')">
      <span class="header-left">
        <span class="type">{{ version.type || '版本' }}</span>
        <span v-if="version.version" class="ver">{{ version.version }}</span>
        <span v-if="version.fileSize" class="size-tag">{{ version.fileSize }}</span>
      </span>
      <span class="header-right">
        <span class="status-dot" aria-hidden="true"></span>
        <span class="arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </span>
    </button>

    <div class="accordion-body">
      <div class="body-inner">
        <!-- 配图 / 占位 / 失败态 -->
        <div class="body-image">
          <img
            v-if="hasImage && imgState !== 'error'"
            :src="version.image"
            :alt="(version.type || '版本') + ' 配图'"
            :style="{ display: imgState === 'image' ? 'block' : 'none' }"
            loading="lazy"
            @load="onImgLoad"
            @error="onImgError"
          />
          <div v-if="imgState === 'placeholder'" class="image-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{{ hasImage ? '加载中...' : '暂无配图' }}</span>
          </div>
          <div v-if="imgState === 'error'" class="image-state error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>图片加载失败</span>
          </div>
        </div>

        <!-- 描述 -->
        <p class="body-desc">{{ version.description || '暂无描述' }}</p>

        <!-- 元信息 -->
        <div class="body-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            <span class="label">大小</span>
            <span class="value">{{ version.fileSize || '--' }}</span>
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span class="label">更新</span>
            <span class="value">{{ version.updateDate || '--' }}</span>
          </span>
        </div>

        <!-- 下载：有直链 → <a> 新标签打开；无直链 → 禁用 -->
        <a
          v-if="version.downloadUrl"
          class="body-download-btn"
          :href="version.downloadUrl"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>下载</span>
        </a>
        <button v-else class="body-download-btn" type="button" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>暂无链接</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ---- 手风琴 item（单个版本块） ----
.accordion-item {
  overflow: hidden;
  background: $card;
  border: 1px solid $line;
  border-radius: $radius-l;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: rgba(255, 159, 26, 0.25);
    box-shadow: $shadow-card;
  }

  &.active {
    border-color: $brand-deep;
    box-shadow: 0 4px 24px rgba(255, 159, 26, 0.12);
  }
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 18px 24px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: none;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 197, 61, 0.06);
  }
}

.header-left {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;

  .type {
    font-size: 17px;
    font-weight: 600;
    color: $ink;
  }

  .ver,
  .size-tag {
    padding: 0 12px;
    font-size: 13px;
    line-height: 26px;
    color: $ink-3;
    background: $bg;
    border-radius: $radius-full;
  }

  .ver {
    font-size: 14px;
    color: $ink-2;
  }
}

.header-right {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e1;
    transition: background 0.3s ease;
  }

  .arrow {
    transition: transform 0.3s ease;

    svg {
      width: 20px;
      height: 20px;
      color: $ink-3;
      transition: color 0.2s ease;
    }
  }
}

.accordion-item.active .header-right {
  .status-dot {
    background: $brand-deep;
  }

  .arrow {
    transform: rotate(180deg);

    svg {
      color: $brand-deep;
    }
  }
}

.accordion-body {
  max-height: 0;
  padding: 0 24px;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), padding 0.3s ease;
}

.accordion-item.active .accordion-body {
  max-height: 1400px;
  padding: 0 24px 24px;
}

// 禁用 JavaScript 时强制展开所有手风琴：点击头部分页依赖 JS toggle，
// 把 max-height 设为 none 让所有内容立即可读。
// 顶层 html 选择器 Vue scoped 不会加 data-v-xxx 前缀，仍能命中
html:not(.js) {
  .accordion-item {
    .accordion-body {
      max-height: none;
      padding: 0 24px 24px;
    }

    .accordion-header {
      cursor: default;
    }
  }
}

.body-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 4px;
}

.body-image {
  width: 100%;
  max-width: 560px;
  overflow: hidden;
  background: $bg;
  border-radius: $radius-m;

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  .image-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    aspect-ratio: 16 / 9;
    color: $ink-3;
    background: $bg;

    svg {
      width: 44px;
      height: 44px;
    }

    span {
      font-size: 13px;
    }

    &.error svg {
      color: #ef4444;
    }
  }
}

.body-desc {
  max-width: 560px;
  font-size: 15px;
  line-height: 1.7;
  color: $ink-2;
  text-align: center;
}

.body-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 32px;
  font-size: 14px;
  color: $ink-3;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      width: 17px;
      height: 17px;
    }

    .value {
      font-weight: 500;
      color: $ink;
    }
  }
}

.body-download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 160px;
  padding: 14px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: $brand-grad;
  border: none;
  border-radius: 60px;
  box-shadow: $shadow-brand;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    background: linear-gradient(135deg, #94a3b8, #64748b);
    box-shadow: none;

    &:hover {
      transform: none;
    }
  }
}

@include respond-below($bp-xs) {
  .accordion-header {
    padding: 14px 16px;
  }

  .header-left .type {
    font-size: 15px;
  }

  .accordion-body {
    padding: 0 16px;
  }

  .accordion-item.active .accordion-body {
    padding: 0 16px 18px;
  }

  .body-download-btn {
    min-width: 140px;
    padding: 12px 28px;
    font-size: 15px;
  }

  .body-meta {
    gap: 12px 20px;
    font-size: 13px;
  }
}
</style>
