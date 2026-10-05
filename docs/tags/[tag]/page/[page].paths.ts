import { termPaginationParams } from '../../../.vitepress/build/posts';

/**
 * 标签列表分页：第 1 页为 /tags/<name>.html，此处生成第 2..N 页
 */
export default {
  watch: ['../../../posts/*.md'],
  paths() {
    return termPaginationParams('tags');
  },
};