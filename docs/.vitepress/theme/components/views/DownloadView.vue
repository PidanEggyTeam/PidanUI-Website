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