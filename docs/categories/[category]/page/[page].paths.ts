import { termPaginationParams } from '../../../.vitepress/build/posts';

/**
 * 分类列表分页：第 1 页为 /categories/<name>.html，此处生成第 2..N 页
 */
export default {
  watch: ['../../../posts/*.md'],
  paths() {
    return termPaginationParams('categories');
  },
};