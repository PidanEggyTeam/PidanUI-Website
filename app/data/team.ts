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
}

export const TEAM_MEMBERS: TeamMember[] = [
  { name: '冷落的小情绪', role: '剪辑 / 维护、制作、测试镜像', avatar: 'https://img.remit.ee/i/bikJpd8GfRBR' },
  { name: '快乐的泡泡', role: '剪辑 / 客服 / 存储', avatar: 'https://img.remit.ee/i/U8KGFxlvFFou' },
  { name: 'red.blue.light', role: '维护、制作镜像 / 规划', avatar: 'https://img.remit.ee/i/FLj1CJc6EDIi' },
  { name: '大毛', role: '维护、制作镜像及PE', avatar: 'https://img.remit.ee/i/oy4aJoEu9QCS' },
  { name: '一个玩VM和MC的ZSS', role: '维护、制作镜像', avatar: 'https://img.remit.ee/i/1clKA5VvPmin' },
  { name: '嘎达皮蛋', role: '维护、制作、测试镜像', avatar: 'https://img.remit.ee/i/dTigJwxB3nNL' },
  { name: '昶', role: '有多年编程经验', avatar: 'https://img.remit.ee/i/r4nWy3kZl6qn' },
];
