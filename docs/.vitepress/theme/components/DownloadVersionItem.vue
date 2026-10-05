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