import { countPosts, paginationParams } from '../../.vitepress/build/posts';

/**
 * 归档分页动态路由：第 1 页为 /archives/，此处生成 /archives/page/2 …
 */
export default {
  watch: ['../../posts/*.md'],
  paths() {
    return paginationParams(countPosts());
  },
};