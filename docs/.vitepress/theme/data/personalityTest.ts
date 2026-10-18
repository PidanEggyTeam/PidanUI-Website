/**
 * 蛋仔专属性格测试 · 题库与角色档案。
 * 构建期随 bundle 打包（本地静态模块），运行时不发起任何网络请求。
 * v2：加权计分模式——每个选项携带 6 个角色的权重分，答题后累加取最高分角色。
 */

/** 选项键（A/B/C/D/E/F，对应题库中每道题的六个选项） */
export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/** 蛋仔角色 ID（与 public/images/characters 下的头像文件一一对应） */
export type CharacterId = 'bulu' | 'yeggy' | 'rosie' | 'rocky' | 'minty' | 'dxh';

/** 角色优先级顺序：同分时按此顺序兜底（bulu > yeggy > rosie > rocky > minty > dxh） */
export const CHARACTER_ORDER: CharacterId[] = ['bulu', 'yeggy', 'rosie', 'rocky', 'minty', 'dxh'];

/** 每个角色累计的权重分数 */
export type CharacterScoreMap = Record<CharacterId, number>;

/** 单个选项：携带加权分数 */
export interface TestOption {
  /** 选项键 */
  key: OptionKey;
  /** 选项文案（不含 "A." 前缀，前缀由界面渲染） */
  text: string;
  /** 选择该选项后为各角色累加的权重分 */
  score: CharacterScoreMap;
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

/** 按 A/B/C/D/E/F 顺序组装一道题的加权选项（文案与权重分成对传入） */
const buildWeightOptions = (
  aText: string,
  aScore: CharacterScoreMap,
  bText: string,
  bScore: CharacterScoreMap,
  cText: string,
  cScore: CharacterScoreMap,
  dText: string,
  dScore: CharacterScoreMap,
  eText: string,
  eScore: CharacterScoreMap,
  fText: string,
  fScore: CharacterScoreMap,
): TestOption[] => [
  { key: 'A', text: aText, score: aScore },
  { key: 'B', text: bText, score: bScore },
  { key: 'C', text: cText, score: cScore },
  { key: 'D', text: dText, score: dScore },
  { key: 'E', text: eText, score: eScore },
  { key: 'F', text: fText, score: fScore },
];

/**
 * 权重分快捷常量：`xxx5` 表示该选项最偏向 xxx 角色（5 分），其余角色 1-3 分，
 * 使单一选择也能同时对多个角色产生倾向，支持混合性格。
 */
const S = {
  bulu5: { bulu: 5, yeggy: 1, rosie: 1, rocky: 1, minty: 2, dxh: 1 },
  yeggy5: { bulu: 1, yeggy: 5, rosie: 2, rocky: 1, minty: 2, dxh: 2 },
  rosie5: { bulu: 1, yeggy: 2, rosie: 5, rocky: 1, minty: 3, dxh: 1 },
  rocky5: { bulu: 2, yeggy: 2, rosie: 1, rocky: 5, minty: 1, dxh: 3 },
  minty5: { bulu: 2, yeggy: 2, rosie: 3, rocky: 1, minty: 5, dxh: 1 },
  dxh5: { bulu: 1, yeggy: 2, rosie: 1, rocky: 3, minty: 1, dxh: 5 },
} satisfies Record<string, CharacterScoreMap>;

/** 全部题目：12 题（日常性格 ×4、社交偏好 ×3、蛋仔游戏 ×5） */
export const QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    tag: '日常性格题',
    text: '工作/学习压力大的时候你会怎么调节？',
    options: buildWeightOptions(
      '运动发泄一下，出出汗就好了', S.dxh5,
      '吃好吃的！美食治愈一切不开心', S.yeggy5,
      '听音乐看剧，安静独处回血', S.rosie5,
      '找朋友吐槽，说出来就好多了', S.yeggy5,
      '走进大自然散步，呼吸新鲜空气平复情绪', S.minty5,
      '投入新的爱好，用高度专注忘掉烦恼', S.bulu5,
    ),
  },
  {
    id: 2,
    tag: '日常性格题',
    text: '生活中遇到困难时，你的第一反应是？',
    options: buildWeightOptions(
      '积极想办法解决，干就完事了', S.dxh5,
      '顺其自然吧，船到桥头自然直', S.minty5,
      '会焦虑一会儿，但最终会想办法', S.rosie5,
      '找朋友帮忙，人多力量大嘛', S.yeggy5,
      '先放平心态，慢慢梳理，循序渐进处理', S.bulu5,
      '立刻主动出击，快速打破僵局，不怕冲突', S.rocky5,
    ),
  },
  {
    id: 3,
    tag: '日常性格题',
    text: '周末空闲时间，你更倾向怎么度过？',
    options: buildWeightOptions(
      '规划清单，完成几件有意义的事', S.bulu5,
      '约朋友出门逛街玩耍热闹一番', S.yeggy5,
      '宅家追剧撸猫，安安静静休养', S.rosie5,
      '挑战新的技能，尝试没做过的事', S.rocky5,
      '漫无目的摆烂，怎么舒服怎么来', S.minty5,
      '安排刺激活动，爬山、运动释放活力', S.dxh5,
    ),
  },
  {
    id: 4,
    tag: '日常性格题',
    text: '面对别人提出不同意见，你会？',
    options: buildWeightOptions(
      '理性分析对错，讲道理摆逻辑', S.bulu5,
      '一笑而过，不想把气氛搞僵', S.yeggy5,
      '体谅对方想法，尽量包容理解', S.rosie5,
      '敢于争辩，坚持自己的立场', S.rocky5,
      '保持中立，不急于站队表态', S.minty5,
      '直接表达想法，不怕产生摩擦', S.dxh5,
    ),
  },
  {
    id: 5,
    tag: '社交偏好题',
    text: '参加多人聚会，你通常的状态？',
    options: buildWeightOptions(
      '观察全场，冷静看大家互动', S.bulu5,
      '全场活跃分子，带动聊天氛围', S.yeggy5,
      '跟熟悉的好友轻声聊天就好', S.rosie5,
      '主动认识新朋友拓展圈子', S.rocky5,
      '安静待角落，舒服最重要', S.minty5,
      '爱玩游戏互动，喜欢热闹比拼', S.dxh5,
    ),
  },
  {
    id: 6,
    tag: '社交偏好题',
    text: '朋友情绪低落来找你倾诉，你优先会？',
    options: buildWeightOptions(
      '帮他分析问题，给出解决方案', S.bulu5,
      '讲笑话逗乐，努力哄对方开心', S.yeggy5,
      '耐心倾听共情，温柔给予安慰', S.rosie5,
      '鼓励他振作起来勇敢面对困境', S.rocky5,
      '陪着就好，不用急着开导劝说', S.minty5,
      '陪他做点刺激的事转移坏情绪', S.dxh5,
    ),
  },
  {
    id: 7,
    tag: '社交偏好题',
    text: '团队集体做决定出现分歧，你希望？',
    options: buildWeightOptions(
      '梳理利弊，投票选出最优方案', S.bulu5,
      '希望大家开开心心不要闹矛盾', S.yeggy5,
      '尊重每个人感受，照顾弱者想法', S.rosie5,
      '大胆争取，推动自己看好的方向', S.rocky5,
      '都行，服从大多数人的安排', S.minty5,
      '快速敲定，不要无休止拉扯纠结', S.dxh5,
    ),
  },
  {
    id: 8,
    tag: '蛋仔游戏题',
    text: '组队游戏时你通常是队伍里的什么角色？',
    options: buildWeightOptions(
      '带头冲锋型！跟紧我带你们赢', S.dxh5,
      '紧跟大佬脚步，抱大腿就完事了', S.yeggy5,
      '默默配合队友，该挡刀挡刀该给道具给道具', S.rosie5,
      '喜欢单独行动，靠自己更稳当', S.bulu5,
      '不急不躁稳扎稳打，稳住节奏带动全队节奏', S.minty5,
      '敢打敢冲，主动制造机会，敢于主动对抗对手', S.rocky5,
    ),
  },
  {
    id: 9,
    tag: '蛋仔游戏题',
    text: '巅峰派对决赛圈只剩几个人了，你的打法是？',
    options: buildWeightOptions(
      '躲角落偷鸡！活着到最后的才是赢家', S.bulu5,
      '主动出击！干掉一个少一个', S.dxh5,
      '随缘发挥吧，走到哪算哪', S.minty5,
      '和队友配合，互相掩护一起进圈', S.yeggy5,
      '保守周旋，观察局势等待最合适的时机出手', S.rosie5,
      '强势主动开战，不怕掉分，追求酣畅对战', S.rocky5,
    ),
  },
  {
    id: 10,
    tag: '蛋仔游戏题',
    text: '闯关失败掉下去的那一刻，你的第一反应是？',
    options: buildWeightOptions(
      '立刻点"再来一把"！不服输就是我的信条', S.rocky5,
      '有点emo...需要缓一缓再战', S.rosie5,
      '佛系一笑，没事没事随缘吧~', S.minty5,
      '越挫越勇！分析一下哪里失误了下把赢回来', S.bulu5,
      '心态平和，不急于重开，慢慢总结慢慢练习', S.minty5,
      '燃起斗志！一定要把这一关狠狠打回去', S.dxh5,
    ),
  },
  {
    id: 11,
    tag: '蛋仔游戏题',
    text: '玩蛋仔，你最喜欢哪一类地图？',
    options: buildWeightOptions(
      '烧脑解谜、逻辑机关类地图', S.bulu5,
      '欢乐派对、多人搞怪娱乐图', S.yeggy5,
      '风景好看，适合闲逛打卡观赏图', S.rosie5,
      '高难度魔鬼跑酷，挑战极限图', S.rocky5,
      '节奏舒缓，没有压力休闲闯关图', S.minty5,
      '激烈对抗、抓人打架对战类地图', S.dxh5,
    ),
  },
  {
    id: 12,
    tag: '蛋仔游戏题',
    text: '队友操作失误坑到你的时候，你内心想法？',
    options: buildWeightOptions(
      '冷静，想想接下来怎么弥补劣势', S.bulu5,
      '哈哈没事，游戏而已快乐最重要', S.yeggy5,
      '有点可惜，但可以理解对方', S.rosie5,
      '有点恼火，希望队友多注意操作', S.rocky5,
      '无所谓，输赢本来就不是全部', S.minty5,
      '不甘心！我要靠自己打回局势', S.dxh5,
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

/** 累加所有已选选项的权重分，返回 6 个角色的总分 */
export const calcAllScore = (answers: TestOption[]): CharacterScoreMap => {
  const totalScore: CharacterScoreMap = {
    bulu: 0,
    yeggy: 0,
    rosie: 0,
    rocky: 0,
    minty: 0,
    dxh: 0,
  };
  answers.forEach((option) => {
    CHARACTER_ORDER.forEach((id) => {
      totalScore[id] += option.score[id];
    });
  });
  return totalScore;
};

/** 加权计分得出最终角色（总分最高者胜出，同分时按 CHARACTER_ORDER 顺序兜底） */
export const resolveCharacter = (answers: TestOption[]): CharacterProfile => {
  const totalScore = calcAllScore(answers);
  let resultId: CharacterId = 'bulu';
  CHARACTER_ORDER.forEach((id) => {
    if (totalScore[id] > totalScore[resultId]) {
      resultId = id;
    }
  });
  return CHARACTER_PROFILES[resultId];
};