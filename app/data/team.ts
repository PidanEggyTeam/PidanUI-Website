/**
 * 首页「开发人员」区块的数据。
 */
export interface TeamMember {
  /** 成员名称 */
  name: string;
  /** 成员角色 */
  role: string;
  /** 成员头像链接（头像图片引用一律走图床CDN，仓库内不要放头像文件） */
  avatar: string;
  /** 成员B站个人空间链接（可选） */
  bilibiliSpaceLink?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { name: '前端小蓝蛋', role: '本网站维护者', avatar: 'https://img.remit.ee/i/lPHogqCFw4YO' },
  {
    name: '快乐的泡泡',
    role: '剪辑 / 客服 / 存储',
    avatar: 'https://img.remit.ee/i/U8KGFxlvFFou',
    bilibiliSpaceLink: 'https://space.bilibili.com/3747563612147456',
  },
  {
    name: 'red.blue.light',
    role: '维护、制作镜像 / 规划',
    avatar: 'https://img.remit.ee/i/FLj1CJc6EDIi',
    bilibiliSpaceLink: 'https://space.bilibili.com/3546389388724715',
  },
  {
    name: '一个玩VM和MC的ZSS',
    role: '维护、制作镜像',
    avatar: 'https://img.remit.ee/i/1clKA5VvPmin',
    bilibiliSpaceLink: 'https://space.bilibili.com/3546711859399222',
  },
  {
    name: '嘎达皮蛋',
    role: '维护、制作、测试镜像',
    avatar: 'https://img.remit.ee/i/dTigJwxB3nNL',
    bilibiliSpaceLink: 'https://space.bilibili.com/3493144343612119',
  },
  {
    name: '昶',
    role: '技术指导',
    avatar: 'https://img.remit.ee/i/r4nWy3kZl6qn',
    bilibiliSpaceLink: 'https://space.bilibili.com/1714708262',
  },
  {
    name: '冒泡の狼小蓝',
    role: '测试镜像',
    avatar: 'https://img.remit.ee/i/ha3lcBWBpym0',
    bilibiliSpaceLink: 'https://space.bilibili.com/1521328433',
  },
  { name: 'DFZX-XSX', role: '测试镜像', avatar: 'https://img.remit.ee/i/EOlVuVdJ060K' },
  // { name: '蓝天正义之鸿', role: 'Logo设计', avatar: 'https://img.remit.ee/i/xedXoCZv9UHK' },
];
