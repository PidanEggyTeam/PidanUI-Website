/**
 * 底栏的社交链接及友情链接列表。新增 / 调整渠道只需编辑本文件后重新构建发布。
 */
export interface SocialLink {
  /** 站点名 */
  name: string;
  /** 站点链接（站内写 / 开头的相对路径，站外写完整 URL） */
  url: string;
  /**
   * 显示图标（Iconify 名称，用 <UIcon> 渲染）。
   * 品牌图标走 simple-icons 集（i-simple-icons-*），通用图标走 lucide 集
   * （i-lucide-*）；两个集都由 @iconify-json 本地安装，构建期不联网。
   */
  icon: string;
}

/** 社交链接 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/PidanUI-Team',
    icon: 'i-simple-icons-github',
  },
  {
    name: 'GitCode',
    url: 'https://gitcode.com/PidanUI-Team',
    icon: 'i-lucide-git-branch',
  },
  {
    name: '哔哩哔哩',
    url: 'https://space.bilibili.com/3546563248916693',
    icon: 'i-simple-icons-bilibili',
  },
  {
    name: 'QQ 交流群',
    url: 'https://qm.qq.com/q/WiTRsJYre0',
    icon: 'i-simple-icons-tencentqq',
  },
];

/** 友情链接 */
export const FRIEND_LINKS: SocialLink[] = [
  {
    name: 'PidanUI 上线了官网',
    url: 'https://eggyui.mysxl.cn',
    icon: 'i-lucide-globe',
  },
  {
    name: 'OpenPidanUI 官网',
    url: 'https://open.pidanui.eggycore.top',
    icon: 'i-lucide-globe',
  },
];
