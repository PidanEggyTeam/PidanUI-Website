<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { CHARACTER_ORDER, CHARACTER_PROFILES } from '~/data/personalityTest';
import type { TestOption } from '~/data/personalityTest';
import { usePersonalityTest } from '~/composables/usePersonalityTest';

const {
  stage,
  total,
  currentQuestion,
  questionNo,
  progressPercent,
  result,
  highlightLines,
  scores,
  start,
  selectOption,
  restart,
} = usePersonalityTest();

/** 欢迎页角色墙：顺序与同分兜底一致 */
const characters = computed(() => CHARACTER_ORDER.map((id) => CHARACTER_PROFILES[id]));

/** 结果页「隐藏倾向」：得分第二高的角色（不与主角色重复） */
const runnerUp = computed(() => {
  if (!result.value) return null;
  const ranked = CHARACTER_ORDER.map((id) => ({ id, score: scores.value[id] })).sort(
    (a, b) => b.score - a.score,
  );
  const second = ranked.find((item) => item.id !== result.value?.id);
  return second ? CHARACTER_PROFILES[second.id] : null;
});

/**
 * 选中反馈：先高亮 160ms 再切题。
 * 原来点完立刻换页，视觉上像"闪一下"，没有确认感。
 */
const pickedKey = ref<string | null>(null);
let pickTimer: number | undefined;

function choose(option: TestOption): void {
  if (pickedKey.value) return; // 防连点
  pickedKey.value = option.key;

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    pickedKey.value = null;
    selectOption(option);
    return;
  }

  pickTimer = window.setTimeout(() => {
    pickedKey.value = null;
    selectOption(option);
  }, 160);
}

/** A–F 键盘直接作答 */
function onKeydown(event: KeyboardEvent): void {
  if (stage.value !== 'question' || event.metaKey || event.ctrlKey || event.altKey) return;
  const index = 'ABCDEF'.indexOf(event.key.toUpperCase());
  if (index < 0) return;
  const option = currentQuestion.value?.options[index];
  if (!option) return;
  event.preventDefault();
  choose(option);
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  if (pickTimer !== undefined) window.clearTimeout(pickTimer);
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-[520px] flex-col gap-4 py-6">
    <!-- 三个阶段的切换：淡入 + 轻微上移 -->
    <Transition name="stage" mode="out-in">
      <!-- 欢迎页 -->
      <UCard v-if="stage === 'welcome'" key="welcome" :ui="{ body: 'p-7' }">
        <div class="text-center">
          <h1 class="welcome-title text-[26px] leading-[1.4] font-bold tracking-[-0.02em]">
            ✨ 蛋仔专属性格测试小游戏 ✨
          </h1>
          <p class="mt-3 text-[15px] leading-[1.8] text-toned">
            这里可以通过你的日常性格 + 游戏习惯，测出最适配你的专属蛋仔角色！<br />
            全程一问一答，没有标准答案，只用最真实的你匹配专属蛋仔~
          </p>
        </div>

        <!-- 角色墙：先让玩家看到可能的结果 -->
        <div class="mt-6 grid grid-cols-6 gap-2" aria-hidden="true">
          <div
            v-for="character in characters"
            :key="character.id"
            class="flex flex-col items-center gap-1.5"
          >
            <img
              class="size-11 rounded-full border-2 object-cover"
              :style="{ borderColor: character.color }"
              :src="withBase(character.avatar)"
              :alt="character.name"
              width="44"
              height="44"
              loading="lazy"
              decoding="async"
            />
            <span class="text-[11px] text-dimmed">{{ character.name }}</span>
          </div>
        </div>

        <UButton
          class="mt-7"
          type="button"
          color="primary"
          size="xl"
          block
          rounded-full
          label="开始测试 🚀"
          @click="start"
        />
      </UCard>

      <!-- 答题页 -->
      <UCard
        v-else-if="stage === 'question' && currentQuestion"
        key="question"
        :ui="{ body: 'p-7' }"
      >
        <div class="flex items-center gap-3">
          <div
            class="progress flex-1"
            role="progressbar"
            :aria-valuenow="progressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`答题进度 ${progressPercent}%`"
          >
            <div class="progress-bar" :style="{ width: `${progressPercent}%` }" />
          </div>
          <span class="shrink-0 text-[12px] text-dimmed">{{ questionNo }} / {{ total }}</span>
        </div>

        <div class="mt-5 flex items-center justify-between gap-3">
          <UBadge variant="soft" color="primary" size="sm" :label="currentQuestion.tag" />
          <span class="text-[13px] text-dimmed">第 {{ questionNo }} 题</span>
        </div>

        <Transition name="question" mode="out-in">
          <div :key="questionNo">
            <h2 class="mt-4 mb-6 text-[20px] leading-[1.5] font-semibold text-default">
              {{ currentQuestion.text }}
            </h2>

            <div class="flex flex-col gap-3">
              <button
                v-for="option in currentQuestion.options"
                :key="option.key"
                class="option flex w-full items-center gap-3 rounded-(--radius-m) border-2 border-default bg-default px-4 py-3.5 text-left text-[15px] text-default transition-[border-color,background-color,transform] duration-200 hover:border-brand-600 hover:bg-brand-a06 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600/45 active:scale-[0.99]"
                :class="pickedKey === option.key ? 'is-picked' : ''"
                type="button"
                @click="choose(option)"
              >
                <span
                  class="option-key flex size-6.5 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
                >
                  {{ option.key }}
                </span>
                <span class="flex-1 leading-[1.5]">{{ option.text }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </UCard>

      <!-- 结果页 -->
      <UCard v-else-if="stage === 'result' && result" key="result" :ui="{ body: 'p-7' }">
        <div class="text-center">
          <div
            class="result-avatar mx-auto mb-5 size-[120px]"
            :style="{ borderColor: result.color }"
          >
            <img
              :src="withBase(result.avatar)"
              :alt="result.name"
              width="120"
              height="120"
              decoding="async"
            />
          </div>

          <p class="text-[28px] leading-tight font-bold text-default">{{ result.name }}</p>
          <p class="mt-1 mb-6 text-[18px]" :style="{ color: result.color }">{{ result.tag }}</p>
        </div>

        <div class="mb-6 rounded-(--radius-m) bg-muted p-4 text-left">
          <h3 class="mb-3 text-[15px] font-semibold text-brand-600">【角色专属人设】</h3>
          <p class="mb-3 text-[15px] leading-[1.7] text-toned">{{ result.desc }}</p>

          <h3 class="mb-3 text-[15px] font-semibold text-brand-600">【你的性格亮点】</h3>
          <p
            v-for="(line, index) in highlightLines"
            :key="index"
            class="mb-2 text-[15px] leading-[1.7] text-toned last:mb-0"
          >
            {{ line }}
          </p>

          <p v-if="runnerUp" class="mt-3 border-t border-default pt-3 text-[13.5px] text-dimmed">
            隐藏倾向：<span :style="{ color: runnerUp.color }"
              >{{ runnerUp.name }} · {{ runnerUp.tag }}</span
            >
          </p>
        </div>

        <div class="flex flex-col gap-2.5">
          <UButton
            type="button"
            color="primary"
            size="lg"
            block
            rounded-full
            icon="i-lucide-rotate-ccw"
            label="重新测试"
            @click="restart"
          />
          <UButton
            to="/about"
            variant="ghost"
            color="neutral"
            size="lg"
            block
            rounded-full
            label="返回关于页"
          />
        </div>
      </UCard>
    </Transition>

    <UButton
      v-if="stage !== 'result'"
      to="/about"
      variant="ghost"
      color="neutral"
      size="sm"
      rounded-full
      icon="i-lucide-arrow-left"
      label="返回关于页"
      class="self-center"
    />
  </div>
</template>

<style scoped>
/* ---- 品牌渐变标题 ---- */
.welcome-title {
  background: var(--brand-grad);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ---- 进度条（渐变填充 + 宽度过渡） ---- */
.progress {
  height: 6px;
  overflow: hidden;
  background: var(--line);
  border-radius: var(--radius-full);
}

.progress-bar {
  height: 100%;
  background: var(--brand-grad);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* ---- 选项序号 ---- */
.option-key {
  background: var(--brand-grad);
}

/* 选中反馈：按下瞬间高亮，随后由脚本切题 */
.option.is-picked {
  border-color: var(--brand-deep);
  background: var(--color-brand-a14);
}

/* ---- 结果头像 ---- */
.result-avatar {
  overflow: hidden;
  background: var(--bg);
  border: 4px solid var(--brand-deep);
  border-radius: 50%;
  animation: pop-in 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.result-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.86);
  }
}

/* ---- 阶段 / 题目切换 ---- */
.stage-enter-active,
.stage-leave-active,
.question-enter-active,
.question-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.stage-enter-from,
.question-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.stage-leave-to,
.question-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .result-avatar {
    width: 100px;
    height: 100px;
  }
}

/* 全局减弱动效偏好：所有过渡与动画一律关闭 */
@media (prefers-reduced-motion: reduce) {
  .progress-bar,
  .stage-enter-active,
  .stage-leave-active,
  .question-enter-active,
  .question-leave-active {
    transition: none;
  }

  .result-avatar {
    animation: none;
  }
}
</style>
