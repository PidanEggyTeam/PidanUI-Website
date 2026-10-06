import { formatDate, toArray } from './utils';
import type { Post } from './types';

// ============================================================
// 内容加载器共用映射
//   轻量数据（posts.data.ts）与检索语料（postsSearch.data.ts）都基于
//   同一套字段映射，避免两处各自维护导致字段漂移。
// ============================================================

/** 内容加载器产出的原始条目（这里只声明用到的字段） */
export interface LoaderPage {
  url: string;
  html?: string;
  frontmatter: Record<string, any>;
}

/** 去掉 HTML 标签并压缩空白，得到纯文本 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 原始条目 → 轻量 Post（不含正文，供列表 / 侧栏 / 上下篇使用） */
export function toBasePost(page: LoaderPage): Post {
  const frontmatter = page.frontmatter ?? {};
  return {
    title: frontmatter.title ?? '',
    url: page.url,
    date: formatDate(frontmatter.date),
    timestamp: new Date(frontmatter.date).getTime() || 0,
    // 未指定或非 true 一律视为不置顶
    stickypost: frontmatter.stickypost === true,
    categories: toArray(frontmatter.categories),
    tags: toArray(frontmatter.tags),
    cover: frontmatter.cover || '/images/default_cover.png',
    description: frontmatter.description ?? '',
  };
}

/** 按时间倒序（置顶优先级由消费方按需处理） */
export function byDateDesc(a: Post, b: Post): number {
  return b.timestamp - a.timestamp;
}
