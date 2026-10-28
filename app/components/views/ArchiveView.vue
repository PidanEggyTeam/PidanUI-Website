<script setup lang="ts">
import { computed, ref } from 'vue';
import CardGrid from '../CardGrid.vue';
import Pagination from '../Pagination.vue';
import PageTitle from '../PageTitle.vue';
import EmptyState from '../EmptyState.vue';
import { useAllPosts } from '~/composables/usePosts';
import type { Post } from '#shared/types/post';

const props = defineProps<{ page: number }>();

const allPosts = useAllPosts();

interface MonthGroup {
  key: string;
  label: string;
  posts: Post[];
}

/**
 * 归档：按年份分页，每年一页。
 * 页内按月分组，每组可折叠（动画与下载页手风琴一致）；
 * 文章卡片与新闻 / 分类 / 标签 / 搜索页共用同一套紧凑卡片。
 */
const years = computed<[string, Post[]][]>(() => {
  const map = new Map<string, Post[]>();
  for (const post of allPosts.value) {
    const year = post.date.slice(0, 4) || '未知';
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
});

const totalPages = computed(() => Math.max(1, years.value.length));

const page = computed(() => {
  const raw = Math.floor(Number(props.page));
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(raw, totalPages.value);
});

const currentYear = computed(() => years.value[page.value - 1]?.[0] ?? '');

const currentPosts = computed(() => years.value[page.value - 1]?.[1] ?? []);

/** 页内按月分组（文章已按时间倒序，分组后顺序天然正确） */
const months = computed<MonthGroup[]>(() => {
  const map = new Map<string, MonthGroup>();
  for (const post of currentPosts.value) {
    const key = post.date.slice(0, 7);
    let group = map.get(key);
    if (!group) {
      const month = Number(key.slice(5, 7));
      group = { key, label: `${month || key.slice(5)} 月`, posts: [] };
      map.set(key, group);
    }
    group.posts.push(post);
  }
  return [...map.values()];
});

// 默认全部展开；记录被用户收起的月份
const collapsed = ref<Set<string>>(new Set());

function isOpen(key: string): boolean {
  return !collapsed.value.has(key);
}

function toggleMonth(key: string): void {
  const next = new Set(collapsed.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  collapsed.value = next;
}
</script>

<template>
  <div class="mx-auto max-w-page">
    <UPageHeader :as="{ title: 'div' }" class="list-head">
      <template #title>
        <PageTitle title="归档" />
      </template>
      <template #description>
        <p>共 {{ allPosts.length }} 篇文章 · {{ totalPages }} 个年份</p>
      </template>
    </UPageHeader>

    <h2 v-if="currentYear" class="mb-5 flex items-baseline gap-2">
      <span class="text-[26px] leading-none font-extrabold tracking-[-0.02em] text-default">
        {{ currentYear }}
      </span>
      <span class="text-[13px] font-medium text-dimmed">年 · {{ currentPosts.length }} 篇</span>
    </h2>

    <EmptyState v-if="!months.length" text="暂无归档内容" />

    <!-- 时间线：左侧竖线 + 月份节点，月份分组仍是可折叠卡片 -->
    <div v-else class="timeline">
      <section
        v-for="month in months"
        :key="month.key"
        class="month-group"
        :class="{ open: isOpen(month.key) }"
      >
        <span class="timeline-dot" aria-hidden="true" />

        <button
          class="month-head flex w-full items-center gap-2.5 py-3.5 text-left"
          type="button"
          :aria-expanded="isOpen(month.key)"
          @click="toggleMonth(month.key)"
        >
          <span class="text-[15px] font-semibold text-default">{{ month.label }}</span>
          <UBadge variant="soft" color="primary" size="sm" :label="`${month.posts.length} 篇`" />
          <UIcon
            name="i-lucide-chevron-down"
            class="month-arrow ms-auto text-dimmed"
            aria-hidden="true"
          />
        </button>

        <div class="month-body">
          <div class="min-h-0 overflow-hidden">
            <CardGrid class="month-grid" :posts="month.posts" />
          </div>
        </div>
      </section>
    </div>

    <Pagination
      :current="page"
      :total-pages="totalPages"
      first-href="/archives/"
      page-prefix="/archives/page/"
    />
  </div>
</template>

<style scoped>
/* ---- 时间线骨架 ---- */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 24px;
  border-left: 1px solid var(--line);
}

.month-group {
  position: relative;
  padding: 0 14px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-l);
  transition: border-color 0.2s ease;
}

.month-group:hover {
  border-color: color-mix(in srgb, var(--brand-deep) 30%, var(--line));
}

/* 节点圆点：圆心落在时间线上（-29px = 24px 缩进 + 5px 半径） */
.timeline-dot {
  position: absolute;
  top: 21px;
  left: -29px;
  width: 10px;
  height: 10px;
  background: var(--brand-deep);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--bg);
}

.month-head {
  color: inherit;
  background: none;
  border: none;
}

.month-head:hover {
  color: var(--brand-deep);
}

.month-head:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--brand-deep) 45%, transparent);
  outline-offset: 2px;
  border-radius: var(--radius-s);
}

/* 展开 / 收起：grid-template-rows 0fr ↔ 1fr，高度随内容自适应 */
.month-body {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.month-group:not(.open) .month-body {
  grid-template-rows: 0fr;
}

.month-arrow {
  transition: transform 0.3s ease;
}

.month-group:not(.open) .month-arrow {
  transform: rotate(-90deg);
}

.month-grid {
  margin-bottom: 14px;
}

@media (max-width: 768px) {
  /* UPageHeader 的 wrapper 默认是 flex-row，窄屏改为上下堆叠 */
  .list-head :deep([data-slot='wrapper']) {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline {
    padding-left: 18px;
  }

  .month-group {
    padding: 0 10px;
  }

  .timeline-dot {
    left: -23px;
  }

  .month-grid {
    margin-bottom: 10px;
  }
}
</style>
