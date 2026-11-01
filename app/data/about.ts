/**
 * 关于页文案与锚点索引。
 * 内容来自 PidanUI 项目说明（原 AboutView 的组件内常量，这里集中成数据，
 * 版式改动不用碰文案）。
 */

export interface AboutSectionData {
  id: string;
  title: string;
  icon: string;
}

/** 左侧锚点索引：id 必须与页面里 AboutSection 的 id 一致 */
export const ABOUT_ANCHORS = [
  { id: 'about-intro', label: '项目简介' },
  { id: 'about-why', label: '为什么要创建 PidanUI' },
  { id: 'about-rename', label: '关于「换皮」的说明' },
  { id: 'about-features', label: '项目特色' },
  { id: 'about-composition', label: '项目构成' },
  { id: 'about-distribution', label: '分发方式' },
  { id: 'about-copyright', label: '版权声明' },
];

export const INTRO_PARAGRAPHS = [
  'PidanUI 是一款专为 Windows 系统打造的桌面美化项目，设计灵感来源于网易游戏《蛋仔派对》。项目延续了 EggyUI 在视觉风格上的探索，同时吸取了过往项目在治理、技术与分发方式上的经验教训，重新调整了开发路线与组织方式。',
  'PidanUI 并非 EggyUI 的官方分支，而是一个在 EggyUI 项目经历分裂与重组后，由原核心开发者与社区成员共同创建的新项目。它的目标不是复刻 EggyUI 的历史，而是在继承其技术积累与美学方向的基础上，走一条更稳定、更可持续的路。',
];

export const CREATION_REASONS = [
  '治理方式与项目性质不符：EggyUI 是由爱好者发起的非盈利粉丝项目，但发展过程中出现尝试公司化运作、引入面试与保密协议等机制，与非盈利性质产生冲突。',
  '管理方式引发内部矛盾：项目组内部出现过管理方式争议、成员排挤、资源控制等问题，消耗了开发者精力，影响项目推进。',
  '方向选择偏离项目定位：部分成员主张推动与官方合作、脱离蛋仔 IP 等方向，与粉丝二创的定位不符。',
  '资源管理存在隐患：项目资源曾集中存放在个人控制的网盘空间中，存在单点故障风险。',
];

export const CREATION_NOTE =
  '这些问题最终导致 EggyUI 项目经历分裂与重组。PidanUI 正是在这一背景下创建的，目的是让项目回到非盈利爱好者项目的定位上，专注于技术与美化本身。';

export const RENAME_INTRO =
  'EggyUI 项目在经历分裂与重组后，原有的品牌名称在互联网上的传播环境变得复杂，项目组内部争议也影响了其对外形象。在这种情况下，项目组选择以新的名称 PidanUI 继续推进开发：';

export const RENAME_REASONS = [
  '减少历史包袱：EggyUI 这个名字承载了太多与项目本身无关的争议，继续使用会增加沟通成本。',
  '避免外部干扰：项目组希望将精力集中在开发上，而不是持续回应与项目无关的纠纷。',
  '保持技术连续性：PidanUI 继承了 EggyUI 在技术路线、组件架构、美化方案上的积累，只是更换了对外名称。',
  '重建用户信任：通过新的名称和更清晰的定位，让用户重新认识这个项目。',
];

export const RENAME_NOTE =
  '需要说明的是，PidanUI 不是 EggyUI 的「替代品」或「山寨版」，它是同一批开发者在经历项目重组后，以更清晰的组织方式继续推进的成果。';

export const FEATURES = [
  {
    title: '辅助组件使用 .NET 10',
    desc: '抛弃早期使用的易语言组件，采用 .NET 10 重构辅助程序，解决高 DPI 缩放适配与杀毒软件误报问题。',
  },
  {
    title: '清晰的定位',
    desc: 'PidanUI 是一个非盈利粉丝项目，不用于商业用途，不冒充官方，不与任何商业实体合作。',
  },
];

export const COMPOSITION = [
  {
    name: '主题包',
    desc: '蛋仔风格的 Windows & Linux 主题，支持 Windows 7 ~ Windows 11 和 Linux。',
  },
  { name: 'Rainmeter 小组件', desc: '配套的桌面小组件，支持 Windows 10 1607 ~ Windows 11。' },
  { name: '辅助组件', desc: '基于 .NET 10 和 Python 开发的辅助程序，用于主题部署与组件管理。' },
];

export const DISTRIBUTION = [
  { name: 'GitHub Releases', desc: '辅助组件、主题包等代码相关资源。' },
  { name: '项目官网', desc: '项目介绍、新闻动态、下载导航。' },
];

export const COPYRIGHT = [
  '本项目为《蛋仔派对》粉丝二次创作，非官方出品，禁止用于商业用途。',
  '所有视觉素材均来自合规渠道或团队重绘，未使用游戏拆包 / 解包资源。',
  '《蛋仔派对》是网易游戏的注册商标，Windows 是微软公司的注册商标，Linux 是一个开源操作系统的统称。',
  '本项目与网易、微软无任何隶属或赞助关系。',
];
