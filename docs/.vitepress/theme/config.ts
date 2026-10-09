/**
 * 站点常量：站点信息、社交链接、分页与评论配置。
 * 「关于我们」等文案对齐 README，社交链接对齐项目维护者联系方式。
 */
export const SITE = {
  /** 站点品牌名 */
  brand: 'PidanUI',
  /** 作者 / 组织 */
  author: 'PidanUI Team',
  /** 官网根地址（本站在用户主页域名发布） */
  mainUrl: 'https://pidanui.eggycore.top',
  /** 新闻页根地址（与 mainUrl 相同，保留字段以便未来新闻独立部署） */
  newsUrl: 'https://pidanui.eggycore.top',
} as const;

/** 侧栏 / 关于页使用的社交与相关链接 */
export const SOCIAL_LINKS = {
  RSS: '/atom.xml',
  GitHub: 'https://github.com/PidanEggyTeam',
  Bilibili: 'https://space.bilibili.com/3493144343612119',
  QQ群: 'https://qm.qq.com/q/IIwIhrHycq',
} as const;

/** 文章列表每页显示数量 */
export const PAGE_SIZE = 12;

/**
 * Giscus 评论配置。
 * 先沿用参考项目 EggyUIWeb-News-VuePress 的整套配置（repo 与 repoId/categoryId 必须成对匹配，
 * 否则 giscus.app 会报 "giscus is not installed on this repository"）。
 * 后续请在 PidanUI 自己的仓库安装 giscus 应用后，整体替换为 PidanUI 的配置。
 */
export const GISCUS = {
  repo: 'PidanEggyTeam/PidanUI-Website',
  repoId: 'R_kgDOU8wvkw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOU8wvk84DHGnO',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
  loading: 'lazy',
} as const;