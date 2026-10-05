import { termParams } from '../.vitepress/build/posts';

/**
 * 分类详情动态路由：为每个分类生成一页（如 /categories/公告.html）
 */
export default {
  watch: ['../posts/*.md'],
  paths() {
    return termParams('categories');
  },
};