import { computed, ref } from 'vue';
import { QUESTIONS, resolveCharacter } from '@/data/personalityTest';
import type { CharacterProfile, OptionKey } from '@/data/personalityTest';

/** 测试所处阶段：欢迎页 / 答题页 / 结果页 */
export type TestStage = 'welcome' | 'question' | 'result';

/**
 * usePersonalityTest —— 「蛋仔专属性格测试」答题流程逻辑。
 * 状态机：welcome → question(1..N) → result →（重新测试）welcome
 */
export const usePersonalityTest = () => {
  const stage = ref<TestStage>('welcome');
  const questionIndex = ref(0);
  const answers = ref<OptionKey[]>([]);
  const result = ref<CharacterProfile | null>(null);

  const total = QUESTIONS.length;

  /** 当前题目（越界时返回 null，供模板做保护性渲染） */
  const currentQuestion = computed(() => QUESTIONS[questionIndex.value] ?? null);

  /** 当前题号（从 1 开始） */
  const questionNo = computed(() => questionIndex.value + 1);

  /** 答题进度百分比 */
  const progressPercent = computed(() => {
    if (total === 0) return 0;
    return Math.round((answers.value.length / total) * 100);
  });

  /** 结果亮点文案按行拆分（\n 分段） */
  const highlightLines = computed<string[]>(() => {
    if (!result.value) return [];
    return result.value.highlight.split('\n').filter((line) => line.length > 0);
  });

  /** 开始测试：清空进度并进入第 1 题 */
  const start = () => {
    answers.value = [];
    questionIndex.value = 0;
    result.value = null;
    stage.value = 'question';
  };

  /** 选择某个选项：记录答案后进入下一题，最后一题结算结果 */
  const selectOption = (key: OptionKey) => {
    answers.value = [...answers.value, key];

    const isLast = questionIndex.value >= total - 1;
    if (isLast) {
      result.value = resolveCharacter(answers.value);
      stage.value = 'result';
      return;
    }

    questionIndex.value += 1;
  };

  /** 重新测试：回到欢迎页 */
  const restart = () => {
    answers.value = [];
    questionIndex.value = 0;
    result.value = null;
    stage.value = 'welcome';
  };

  return {
    stage,
    questionIndex,
    answers,
    result,
    total,
    currentQuestion,
    questionNo,
    progressPercent,
    highlightLines,
    start,
    selectOption,
    restart,
  };
};