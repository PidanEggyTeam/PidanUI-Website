/**
 * 蛋仔专属性格测试 · 题库与角色档案。
 * 构建期随 bundle 打包（本地静态模块），运行时不发起任何网络请求。
 * 维护题目 / 文案 / 头像时仅需编辑本文件后重新构建发布。
 */

/** 选项键（A/B/C/D/E/F，对应题库中每道题的六个选项） */
export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/** 蛋仔角色 ID（与 public/images/characters 下的头像文件一一对应） */
export type CharacterId = 'bulu' | 'yeggy' | 'rosie' | 'rocky' | 'minty' | 'dxh';

/** 单个选项 */
export interface TestOption {
  /** 选项键 */
  key: OptionKey;
  /** 选项文案（不含 "A." 前缀，前缀由界面渲染） */
  text: string;
}

/** 单道题目 */
export interface TestQuestion {
  /** 题号（从 1 开始） */
  id: number;
  /** 题目分类标签 */
  tag: string;
  /** 题干 */
  text: string;
  /** 选项列表 */
  options: TestOption[];
}

/** 角色档案 */
export interface CharacterProfile {
  /** 角色 ID */
  id: CharacterId;
  /** 角色名 */
  name: string;
  /** 人设标签 */
  tag: string;
  /** 主题色（头像描边 / 强调色） */
  color: string;
  /** 头像资源地址（站内路径，渲染时经 withBase 处理） */
  avatar: string;
  /** 角色专属人设文案 */
  desc: string;
  /** 性格亮点文案（\n 分段：日常 / 游戏） */
  highlight: string;
}

/** 按 A/B/C/D/E/F 顺序组装一道题的选项 */
const buildOptions = (
  a: string,
  b: string,
  c: string,
  d: string,
  e: string,
  f: string,
): TestOption[] => [
  { key: 'A', text: a },
  { key: 'B', text: b },
  { key: 'C', text: c },
  { key: 'D', text: d },
  { key: 'E', text: e },
  { key: 'F', text: f },
];

/** 全部题目（前 2 题考察日常性格，后 3 题考察游戏习惯） */
export const QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    tag: '日常性格题',
    text: '工作/学习压力大的时候你会怎么调节？',
    options: buildOptions(
      '运动发泄一下，出出汗就好了',
      '吃好吃的！美食治愈一切不开心',
      '听音乐看剧，安静独处回血',
      '找朋友吐槽，说出来就好多了',
      '走进大自然散步，呼吸新鲜空气平复情绪',
      '投入新的爱好，用高度专注忘掉烦恼',
    ),
  },
  {
    id: 2,
    tag: '日常性格题',
    text: '生活中遇到困难时，你的第一反应是？',
    options: buildOptions(
      '积极想办法解决，干就完事了',
      '顺其自然吧，船到桥头自然直',
      '会焦虑一会儿，但最终会想办法',
      '找朋友帮忙，人多力量大嘛',
      '先放平心态，慢慢梳理，循序渐进处理',
      '立刻主动出击，快速打破僵局，不怕冲突',
    ),
  },
  {
    id: 3,
    tag: '蛋仔游戏题',
    text: '组队游戏时你通常是队伍里的什么角色？',
    options: buildOptions(
      '带头冲锋型！跟紧我带你们赢',
      '紧跟大佬脚步，抱大腿就完事了',
      '默默配合队友，该挡刀挡刀该给道具给道具',
      '喜欢单独行动，靠自己更稳当',
      '不急不躁稳扎稳打，稳住节奏带动全队节奏',
      '敢打敢冲，主动制造机会，敢于主动对抗对手',
    ),
  },
  {
    id: 4,
    tag: '蛋仔游戏题',
    text: '巅峰派对决赛圈只剩几个人了，你的打法是？',
    options: buildOptions(
      '躲角落偷鸡！活着到最后的才是赢家',
      '主动出击！干掉一个少一个',
      '随缘发挥吧，走到哪算哪',
      '和队友配合，互相掩护一起进圈',
      '保守周旋，观察局势等待最合适的时机出手',
      '强势主动开战，不怕掉分，追求酣畅对战',
    ),
  },
  {
    id: 5,
    tag: '蛋仔游戏题',
    text: '闯关失败掉下去的那一刻，你的第一反应是？',
    options: buildOptions(
      '立刻点"再来一把"！不服输就是我的信条',
      '有点emo...需要缓一缓再战',
      '佛系一笑，没事没事随缘吧~',
      '越挫越勇！分析一下哪里失误了下把赢回来',
      '心态平和，不急于重开，慢慢总结慢慢练习',
      '燃起斗志！一定要把这一关狠狠打回去',
    ),
  },
];

/** 角色档案表 */
export const CHARACTER_PROFILES: Record<CharacterId, CharacterProfile> = {
  bulu: {
    id: 'bulu',
    name: '蛋小蓝',
    tag: '靠谱智慧星',
    color: '#4a90e2',
    avatar: '/images/characters/bulu.webp',
    desc: '你是蛋仔岛上的智商担当蛋小蓝！冷静理性、逻辑满分，就像清澈的蓝色一样让人安心。朋友遇到难题第一个想到你，你总能给出最靠谱的建议。玩游戏时你是战术大师，观察地图找最佳路线，道具使用时机精算到毫秒，解谜地图是你的主场，闯关稳赢属于你！',
    highlight:
      '【日常】遇事不慌先分析，朋友圈里的"军师"角色，逻辑清晰做事有条理\n【游戏】闯关前先观察地图找最优路线，道具使用时机精算到毫秒，解谜地图是你的主场，闯关稳赢属于你',
  },
  yeggy: {
    id: 'yeggy',
    name: '蛋小黄',
    tag: '快乐开心果',
    color: '#f5b301',
    avatar: '/images/characters/yeggy.webp',
    desc: '你是蛋仔岛上的快乐源泉蛋小黄！永远充满活力，走到哪里笑声就到哪里。你是团队里的气氛担当，再难的关卡有你在都能变得轻松有趣。你喜欢尝试新事物，对一切都充满好奇，是蛋仔岛上最受欢迎的小伙伴！',
    highlight:
      '【日常】天生乐天派，遇到什么事都能往好处想，朋友的"开心果"\n【游戏】喜欢尝试各种新奇的地图和玩法，哪怕失败也能笑着再来，团队里的气氛担当',
  },
  rosie: {
    id: 'rosie',
    name: '蛋小粉',
    tag: '温柔治愈家',
    color: '#ff6b9d',
    avatar: '/images/characters/rosie.webp',
    desc: '你是蛋仔岛上的温柔治愈家蛋小粉！性格温柔体贴，总能给身边的人带来温暖和安慰。你不喜欢争抢，更享受和朋友一起玩的过程，哪怕输了也没关系，开心最重要。你是团队里的"治愈担当"，有你在大家都会觉得很安心。',
    highlight:
      '【日常】性格温柔体贴，总能察觉到朋友的情绪，是大家的"树洞"\n【游戏】不喜欢争抢，更享受和朋友一起玩的过程，哪怕输了也没关系，开心最重要',
  },
  rocky: {
    id: 'rocky',
    name: '蛋小黑',
    tag: '勇敢挑战者',
    color: '#3a3a4a',
    avatar: '/images/characters/rocky.webp',
    desc: '你是蛋仔岛上的勇敢挑战者蛋小黑！性格勇敢果断，喜欢挑战高难度的关卡和玩法。你不怕失败，越挫越勇，是团队里的"挑战担当"。你喜欢探索未知的地图，尝试各种新奇的玩法，是蛋仔岛上最勇敢的小伙伴！',
    highlight:
      '【日常】性格勇敢果断，遇到困难从不退缩，喜欢挑战新事物\n【游戏】喜欢挑战高难度的关卡和玩法，越挫越勇，是团队里的"挑战担当"',
  },
  minty: {
    id: 'minty',
    name: '蛋小绿',
    tag: '平和慢行者',
    color: '#3ddc84',
    avatar: '/images/characters/minty.webp',
    desc: '你是蛋仔岛上心态松弛的蛋小绿！内心平和从容，崇尚松弛有度的生活节奏。待人包容友善，懂得接纳不完美，很少会焦躁内耗。游戏中不追求极速冲分，享受慢慢体验地图的乐趣，稳扎稳打，不争不抢，属于细水长流型蛋仔。',
    highlight:
      '【日常】心态松弛平和，待人包容，遇事不急不躁，擅长自我调节情绪\n【游戏】游戏节奏舒缓，不急于上分，享受游玩本身，稳扎稳打慢慢通关',
  },
  dxh: {
    id: 'dxh',
    name: '蛋小红',
    tag: '热血行动派',
    color: '#ef4444',
    avatar: '/images/characters/dxh.webp',
    desc: '你是蛋仔岛上满腔热忱的蛋小红！热血直率，行动力拉满，敢爱敢恨，充满如火一般的感染力。遇到事情绝不畏缩，敢于直面冲突。游戏中热爱酣畅淋漓的对抗，敢打敢拼，就算局势不利也会全力一搏，是队伍里极具冲劲的热血选手。',
    highlight:
      '【日常】直率热血，行动力极强，想到就做，富有感染力，敢直面矛盾\n【游戏】热爱激烈对抗，敢打敢冲，无论局势好坏都会全力拼搏，斗志永不熄灭',
  },
};

/** 选项多数决 → 角色映射（A蛋小蓝 / B蛋小黄 / C蛋小粉 / D蛋小黑 / E蛋小绿 / F蛋小红） */
export const RESULT_BY_OPTION: Record<OptionKey, CharacterId> = {
  A: 'bulu',
  B: 'yeggy',
  C: 'rosie',
  D: 'rocky',
  E: 'minty',
  F: 'dxh',
};

/** 统计各选项票数并得出多数决角色（平票时按 A > B > C > D > E > F 优先） */
export const resolveCharacter = (answers: OptionKey[]): CharacterProfile => {
  const counts: Record<OptionKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  answers.forEach((key) => {
    counts[key] += 1;
  });
  let winner: OptionKey = 'A';
  const order: OptionKey[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  order.forEach((key) => {
    if (counts[key] > counts[winner]) {
      winner = key;
    }
  });
  return CHARACTER_PROFILES[RESULT_BY_OPTION[winner]];
};