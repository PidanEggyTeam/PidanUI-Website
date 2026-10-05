import { countPosts, paginationParams } from '../../.vitepress/build/posts';

/**
 * 新闻列表分页动态路由。
 * 第 1 页为 /posts/（docs/news/index.md 通过 rewrites 映射），
 * 此处生成 /posts/page/2、/posts/page/3 …
 */
export default {
  watch: ['../../posts/*.md'],
  paths() {
    return paginationParams(countPosts());
  },
};