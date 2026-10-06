<script setup lang="ts">
import { ref } from 'vue';
import { downloadMeta } from '@/data';
import DownloadVersionItem from '@/components/DownloadVersionItem.vue';

// 数据来自构建期打包的本地模块（downloadMeta），运行时不发起任何网络请求
const title = downloadMeta.title || '下载';
const badge = downloadMeta.version ? `v${downloadMeta.version}` : '';
const overallDesc = downloadMeta.description || '';
const versions = downloadMeta.versions && downloadMeta.versions.length ? downloadMeta.versions : null;

// -1 表示无展开项
const activeIndex = ref(-1);
const statusText = ref('请选择一个版本');

function handleToggle(index: number) {
  if (activeIndex.value === index) {
    activeIndex.value = -1;
    statusText.value = '请选择一个版本';
    return;
  }
  activeIndex.value = index;
  const v = versions?.[index];
  statusText.value = v ? `已选：${v.type || '版本'}` : '';
}
</script>

<template>
  <div class="download-view">
    <div class="page-head">
      <h1 class="page-title">{{ title }}</h1>
      <span v-if="badge" class="version-badge">{{ badge }}</span>
    </div>
    <p class="page-desc">{{ overallDesc }}</p>

    <div v-if="versions" class="accordion">
      <DownloadVersionItem
        v-for="(v, i) in versions"
        :key="v.id || i"
        :version="v"
        :expanded="activeIndex === i"
        @toggle="handleToggle(i)"
      />
    </div>
    <p v-else class="empty-tip">暂无版本信息</p>

    <div class="status-bar">
      <span class="dot" aria-hidden="true"></span>
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ============================================================
// 下载页 · 页面外壳（单个版本块的样式在 DownloadVersionItem.vue 内）
// ============================================================
.download-view {
  max-width: $max-w;
  margin: 0 auto;
}

// 版本手风琴容器（内部 .accordion-item 的样式见 DownloadVersionItem.vue）
.accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: $ink;
}

.version-badge {
  padding: 3px 14px;
  font-size: 13px;
  font-weight: 600;
  color: $ink-2;
  background: $brand-soft;
  border: 1px solid $line;
  border-radius: $radius-full;
}

.page-desc {
  margin: 8px 0 28px;
  font-size: 15px;
  color: $ink-2;
}

.empty-tip {
  padding: 20px 0;
  font-size: 15px;
  color: $ink-3;
}

// ---- 状态栏 ----
.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 28px;
  margin-top: 24px;
  font-size: 14px;
  color: $ink-3;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #cbd5e1;
  }
}

// ---- 响应式 ----
@include respond-below($bp-xs) {
  .page-title {
    font-size: 23px;
  }
}
</style>
