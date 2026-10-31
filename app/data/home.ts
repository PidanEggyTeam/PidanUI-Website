/**
 * 首页专属数据：宣传图、项目特性、社区入口。
 * 图片与链接都是内容性数据，改这里不需要动版式。
 */

/** 首页 / 下载页共用的一张宣传图（外链，仓库不存图） */
export const PROMO_IMAGE = 'https://img.remit.ee/i/hsjlCZAGQuf2';

export interface HomeFeature {
  icon: string;
  title: string;
  description: string;
}

export const HOME_FEATURES: HomeFeature[] = [
  {
    icon: 'i-lucide-layers',
    title: '现代技术栈',
    description: '系统镜像基于 Win11 / Win10 最新分支定制，桌面组件用 .NET 10 + WPF 重写，界面与逻辑一起换代。',
  },
  {
    icon: 'i-lucide-feather',
    title: '精简而不缺功能',
    description: '剔除 App-V 等企业级冗余组件，保留 Hyper-V 与 Edge 以便日用，安装完即可上手。',
  },
  {
    icon: 'i-lucide-star',
    title: '继承 EggyUI 的美化风格',
    description: '一切都是你熟悉的样子——PidanUI 不仅继承了 EggyUI 的蛋仔风的美化风格，还力求在美学上有所创新。',
  },
  {
    icon: 'i-lucide-shield-check',
    title: '持续维护',
    description: '版本清单与公告由官网统一维护，更新内容、校验信息与下载渠道都在一处。',
  },
];

export interface CommunityGroup {
  icon: string;
  title: string;
  description: string;
  links: { label: string; to: string; icon: string; trailingIcon?: string }[];
}

/** 页面底部的两个入口：加入社区 / 加入开发组 */
export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    icon: 'i-lucide-messages-square',
    title: '加入社区',
    description: '使用答疑、版本反馈、内测通知都在群里，遇到问题先来这里。',
    links: [
      { label: 'QQ 交流群', to: 'https://qm.qq.com/q/WiTRsJYre0', icon: 'i-simple-icons-tencentqq', trailingIcon: 'i-lucide-arrow-up-right' },
      { label: '哔哩哔哩', to: 'https://space.bilibili.com/3546563248916693', icon: 'i-simple-icons-bilibili', trailingIcon: 'i-lucide-arrow-up-right' },
    ],
  },
  {
    icon: 'i-lucide-git-pull-request',
    title: '加入开发组',
    description: '前端、WPF 组件、系统封装都在招人，提 issue 或直接开 PR 都欢迎。',
    links: [
      { label: 'GitHub', to: 'https://github.com/PidanEggyTeam', icon: 'i-simple-icons-github', trailingIcon: 'i-lucide-arrow-up-right' },
      { label: '官网仓库', to: 'https://github.com/PidanEggyTeam/PidanUI-Website', icon: 'i-lucide-folder-git-2', trailingIcon: 'i-lucide-arrow-up-right' },
    ],
  },
];
