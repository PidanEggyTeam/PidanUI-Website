import { computed, type ComputedRef } from 'vue';
import { data as allPosts } from '@/posts.data';
import { PAGE_SIZE } from '@/config';
import type { Post, TermItem } from '@/types';

export interface PagedPosts {
  /** 全部文章（按时间倒序） */
  allPosts: Post[];
  /** 总页数（至少 1） */
  totalPages: ComputedRef<number>;
  /** 当前页（已按上下界收敛） */
  page: ComputedRef<number>;
  /** 当前页文章 */
  pagePosts: ComputedRef<Post[]>;
}

/**
 * 置顶优先排序：stickypost 为 true 的文章整体前移。
 * Array#sort 是稳定排序，因此置顶组内部与其余文章都保持原有的时间倒序。
 * 仅用于按时间倒序的列表页（首页 / 分类 / 标签）；归档时间轴与搜索结果按原顺序展示。
 */
export function pinnedFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => Number(b.stickypost) - Number(a.stickypost));
}

/**
 * 列表分页组合式函数。
 * @param getCurrent 当前页取值函数（响应式）
 * @param getSource  数据集取值函数，默认全部文章（分类/标签页可传入过滤后的集合）
 */
export function usePagedPosts(
  getCurrent: () => number,
  getSource: () => Post[] = () => allPosts,
): PagedPosts {
  const totalPages = computed(() => Math.max(1, Math.ceil(getSource().length / PAGE_SIZE)));
  const page = computed(() => {
    const raw = Math.floor(Number(getCurrent()));
    if (!Number.isFinite(raw) || raw < 1) return 1;
    return Math.min(raw, totalPages.value);
  });
  const pagePosts = computed(() =>
    getSource().slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
  );

  return { allPosts, totalPages, page, pagePosts };
}

/** 统计分类集合（返回按文章数倒序的条目） */
export function collectTerms(kind: 'categories' | 'tags'): TermItem[] {
  const counter = new Map<string, number>();
  for (const post of allPosts) {
    const names = kind === 'categories' ? post.categories : post.tags;
    for (const name of names) {
      counter.set(name, (counter.get(name) ?? 0) + 1);
    }
  }
  return [...counter.entries()]
    .map(([name, count]) => ({
      name,
      count,
      path: `/${kind}/${encodeURIComponent(name)}.html`,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** 取最新 n 篇文章（侧栏「最新动态」用，置顶不改变时间序） */
export function latestPosts(n: number): Post[] {
  return allPosts.slice(0, n);
}

export { allPosts };