import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { PAGE_SIZE } from '../theme/config';

/**
 * 构建期文章元数据读取（供 *.paths.ts 动态路由使用）。
 *
 * 注意：动态路由的 paths 加载器在 VitePress 解析配置之前执行，
 * 因此这里不能使用 createContentLoader，改为直接读取 docs/posts/*.md 的 frontmatter。
 */

export { PAGE_SIZE };

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined).map(String);
  }
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}

/** 从任意起点向上查找 posts/ 目录，兼容打包后模块位置变化 */
function findPostsDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = path.join(dir, 'posts');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error('未能定位 docs/posts 目录，请确认运行目录为项目根目录');
}

function markdownFiles(): string[] {
  const postsDir = findPostsDir();
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(postsDir, file));
}

/** 文章总数（用于计算列表分页页数） */
export function countPosts(): number {
  return markdownFiles().length;
}

/** 统计分类 / 标签下各名称的文章数 */
export function countByField(field: 'categories' | 'tags'): Map<string, number> {
  const counts = new Map<string, number>();
  for (const file of markdownFiles()) {
    const { data } = matter(fs.readFileSync(file, 'utf-8'));
    for (const name of toArray(data[field])) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return counts;
}

/** 列表分页页数（至少 1 页） */
export function totalPagesOf(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

/** 第 2..N 页的路由参数（第 1 页由静态 index.md 承担） */
export function paginationParams(count: number): { params: Record<string, string> }[] {
  const total = totalPagesOf(count);
  return Array.from({ length: Math.max(0, total - 1) }, (_, index) => ({
    params: { page: String(index + 2) },
  }));
}

/** 集合路径段 → 动态路由参数名（categories → category / tags → tag） */
const PARAM_KEY: Record<'categories' | 'tags', string> = {
  categories: 'category',
  tags: 'tag',
};

/**
 * 分类 / 标签详情页的动态参数（每个名称一条）。
 * 名称需与 utils.ts 中 termPath 的编码保持一致。
 */
export function termParams(field: 'categories' | 'tags'): {
  params: Record<string, string>;
}[] {
  // 保留原始中文名，VitePress 动态路由会输出为编码后的路径段
  return [...countByField(field).keys()].map((name) => ({ params: { [PARAM_KEY[field]]: name } }));
}

/** 分类 / 标签第 2..N 页的动态参数 */
export function termPaginationParams(field: 'categories' | 'tags'): {
  params: Record<string, string>;
}[] {
  const key = PARAM_KEY[field];
  const result: { params: Record<string, string> }[] = [];
  for (const [name, count] of countByField(field)) {
    const total = totalPagesOf(count);
    for (let page = 2; page <= total; page += 1) {
      result.push({ params: { [key]: name, page: String(page) } });
    }
  }
  return result;
}