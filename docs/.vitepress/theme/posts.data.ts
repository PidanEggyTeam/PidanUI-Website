import { createContentLoader } from 'vitepress';
import type { Post } from './types';
import { byDateDesc, toBasePost } from './postMap';

/**
 * 轻量文章数据加载器（**不含正文**）。
 *
 * 新闻首页 / 归档 / 分类 / 标签 / 侧栏最新动态 / 文章上下篇均消费这份数据。
 * 由于不产出正文，这里不做 Markdown 渲染（不开启 render），构建更快，
 * 也避免把整站正文塞进「每个页面都会下载」的公共 chunk。
 * 需要正文的全文检索请见 postsSearch.data.ts。
 */
declare const data: Post[];
export { data };

export default createContentLoader('posts/*.md', {
  transform(raw): Post[] {
    return raw.map(toBasePost).sort(byDateDesc);
  },
});
