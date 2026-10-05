import { termParams } from '../.vitepress/build/posts';

/**
 * 标签详情动态路由：为每个标签生成一页（如 /tags/主题包.html）
 */
export default {
  watch: ['../posts/*.md'],
  paths() {
    return termParams('tags');
  },
};