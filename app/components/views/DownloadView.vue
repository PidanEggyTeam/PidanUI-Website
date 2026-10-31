<script setup lang="ts">
import { downloadMeta } from '~/data';
import { PROMO_IMAGE } from '~/data/home';

// 数据来自构建期打包的本地模块（downloadMeta），运行时不发起任何网络请求。
// 版式：页头（标题 + 说明 + 通用信息）之后，每个版本一张卡片
// （宣传图 + 版本信息 + 下载按钮），全部静态展开（旧版的手风琴已移除）。
const title = downloadMeta.title || '下载';
const overallDesc = downloadMeta.description || '';
const versions = downloadMeta.versions?.length ? downloadMeta.versions : null;
</script>

<template>
  <div class="mx-auto max-w-page">
    <!-- UPageHeader 默认标题是 h1；这里把内建 title 降级为 div，真正的 h1 由 PageTitle 供给 -->
    <UPageHeader :as="{ title: 'div' }" class="list-head">
      <template #title>
        <PageTitle :title="title" />
      </template>
      <template v-if="overallDesc" #description>
        <p>{{ overallDesc }}</p>
      </template>
      <template #links>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-dimmed">
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-monitor" class="size-4" aria-hidden="true" />
            Windows 10 / 11
          </span>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-download" class="size-4" aria-hidden="true" />
            网盘直链 · 免费
          </span>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-shield-check" class="size-4" aria-hidden="true" />
            非盈利 · 禁止商用
          </span>
          <span v-if="versions" class="flex items-center gap-1.5">
            <UIcon name="i-lucide-package" class="size-4" aria-hidden="true" />
            共 {{ versions.length }} 个版本
          </span>
        </div>
      </template>
    </UPageHeader>

    <EmptyState v-if="!versions" text="暂无版本信息" />

    <!-- 逐个版本一张卡片：宣传图通栏 + 标题/版本 + 描述 + 体积·日期 + 下载按钮。
         列数与新闻卡片同一套规则（UPageGrid 的 auto-fill + --grid-min） -->
    <UPageGrid v-else class="mt-6">
      <article
        v-for="(v, i) in versions"
        :key="v.id || i"
        class="flex flex-col overflow-hidden rounded-xl border border-ink-300/60 transition-[border-color,box-shadow] duration-200 hover:border-brand-600/40 hover:shadow-card dark:border-default"
      >
        <div class="aspect-[16/9] w-full overflow-hidden bg-muted">
          <SafeImage
            class="h-full w-full object-cover"
            :src="v.image || PROMO_IMAGE"
            :alt="`${v.type || '版本'} 宣传图`"
            width="960"
            height="540"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div class="flex flex-1 flex-col gap-3 p-5">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base font-semibold text-default">{{ v.type || '版本' }}</h2>
            <UBadge v-if="v.version" variant="soft" color="primary" size="sm" :label="v.version" />
          </div>

          <p v-if="v.description" class="text-[13.5px] leading-[1.7] text-toned">
            {{ v.description }}
          </p>

          <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-dimmed">
              <span v-if="v.fileSize" class="flex items-center gap-1.5">
                <UIcon name="i-lucide-hard-drive" class="size-3.5" aria-hidden="true" />
                {{ v.fileSize }}
              </span>
              <span v-if="v.updateDate" class="flex items-center gap-1.5">
                <UIcon name="i-lucide-calendar-days" class="size-3.5" aria-hidden="true" />
                {{ v.updateDate }}
              </span>
            </div>

            <UButton
              v-if="v.downloadUrl"
              :to="v.downloadUrl"
              target="_blank"
              rel="noopener"
              variant="soft"
              color="primary"
              icon="i-lucide-download"
              label="下载"
            />
            <UButton v-else variant="outline" color="neutral" disabled label="暂无链接" />
          </div>
        </div>
      </article>
    </UPageGrid>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  /* 窄屏标题与右侧信息上下堆叠：scoped 未分层，能压过 wrapper 上的 flex-row */
  .list-head :deep([data-slot='wrapper']) {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
