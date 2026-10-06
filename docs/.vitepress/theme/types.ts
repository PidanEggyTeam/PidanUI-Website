/** 文章（由 posts.data.ts 规范化后供页面/组件消费） */
export interface Post {
  /** 标题 */
  title: string;
  /** 站点内路由，如 /posts/xxx.html */
  url: string;
  /** 展示用日期 YYYY-MM-DD */
  date: string;
  /** 排序用时间戳 */
  timestamp: number;
  /** 是否置顶（来自 frontmatter.stickypost；未指定或非 true 视为 false） */
  stickypost: boolean;
  /** 分类名列表 */
  categories: string[];
  /** 标签名列表 */
  tags: string[];
  /** 封面图（可为外链） */
  cover: string;
  /** 摘要 */
  description: string;
  /**
   * 纯文本正文（本地检索用，截断）。
   * 仅检索语料（postsSearch.data.ts）会填充该字段；列表/侧栏用的轻量数据
   * （posts.data.ts）不含它，以免把整站正文塞进每个页面都要下载的公共 chunk。
   */
  content?: string;
}

/** 分类 / 标签云条目 */
export interface TermItem {
  name: string;
  path: string;
  count: number;
}