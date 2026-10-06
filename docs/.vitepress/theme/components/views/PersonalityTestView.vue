<template>
  <div class="test-view">
    <div class="container">
      <!-- 欢迎页 -->
      <section v-if="stage === 'welcome'" class="card welcome">
        <h1>✨ 蛋仔专属性格测试小游戏 ✨</h1>
        <p class="intro">
          这里可以通过你的日常性格 + 游戏习惯，测出最适配你的专属蛋仔角色！<br />
          全程一问一答，没有标准答案，只用最真实的你匹配专属蛋仔~
        </p>
        <button class="btn btn--primary" type="button" @click="start">开始测试 🚀</button>
      </section>

      <!-- 答题页 -->
      <section v-else-if="stage === 'question' && currentQuestion" class="card question">
        <div class="progress">
          <div class="progress-bar" :style="{ width: `${progressPercent}%` }"></div>
        </div>

        <div class="question-head">
          <span class="question-tag">{{ currentQuestion.tag }}</span>
          <span class="question-count">第 {{ questionNo }} / {{ total }} 题</span>
        </div>

        <h2 class="question-text">{{ currentQuestion.text }}</h2>

        <div class="options">
          <button
            v-for="option in currentQuestion.options"
            :key="option.key"
            class="option"
            type="button"
            @click="selectOption(option.key)"
          >
            <span class="option-key">{{ option.key }}</span>
            <span class="option-text">{{ option.text }}</span>
          </button>
        </div>
      </section>

      <!-- 结果页 -->
      <section v-else-if="stage === 'result' && result" class="card result">
        <div class="result-avatar" :style="{ borderColor: result.color }">
          <img :src="withBase(result.avatar)" :alt="result.name" />
        </div>
        <span class="result-name">{{ result.name }}</span>
        <p class="result-tag" :style="{ color: result.color }">{{ result.tag }}</p>

        <div class="result-desc">
          <h3>【角色专属人设】</h3>
          <p>{{ result.desc }}</p>
          <h3>【你的性格亮点】</h3>
          <p v-for="(line, index) in highlightLines" :key="index">{{ line }}</p>
        </div>

        <button class="btn btn--ghost" type="button" @click="restart">重新测试</button>
      </section>

      <a class="back-link" :href="withBase('/about.html')">← 返回关于页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';
import { usePersonalityTest } from '@/composables/usePersonalityTest';

const {
  stage,
  total,
  currentQuestion,
  questionNo,
  progressPercent,
  result,
  highlightLines,
  start,
  selectOption,
  restart,
} = usePersonalityTest();
</script>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ============================================================
// 蛋仔性格测试 · 欢迎 / 答题 / 结果
// ============================================================
.test-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 0 40px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 480px;
}

.card {
  width: 100%;
  padding: 32px;
  background: $card;
  border: 1px solid $line;
  border-radius: $radius-l;
  box-shadow: $shadow-float;
}

// ---- 欢迎页 ----
.welcome {
  text-align: center;

  h1 {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: -0.02em;
    @include brand-text;
  }

  .intro {
    margin-top: 12px;
    font-size: 15px;
    line-height: 1.8;
    color: $ink-2;
  }
}

// ---- 按钮 ----
.btn {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: $radius-full;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

  &--primary {
    margin-top: 24px;
    color: #fff;
    background: $brand-grad;
    box-shadow: $shadow-brand;
  }

  &--ghost {
    color: $ink;
    background: $bg;
    border-color: $line;

    &:hover {
      background: $card;
      border-color: rgba(255, 159, 26, 0.3);
    }
  }
}

// ---- 答题页 ----
.progress {
  height: 6px;
  margin-bottom: 20px;
  overflow: hidden;
  background: $line;
  border-radius: $radius-full;
}

.progress-bar {
  height: 100%;
  background: $brand-grad;
  border-radius: $radius-full;
  transition: width 0.3s ease;
}

.question-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.question-tag {
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: $brand-grad;
  border-radius: $radius-full;
}

.question-count {
  font-size: 13px;
  color: $ink-3;
}

.question-text {
  margin-bottom: 24px;
  font-size: 20px;
  line-height: 1.5;
  color: $ink;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 15px 16px;
  font-size: 15px;
  color: $ink;
  text-align: left;
  background: $card;
  border: 2px solid $line;
  border-radius: $radius-m;
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;

  &:hover {
    background: rgba(255, 159, 26, 0.06);
    border-color: $brand-deep;
  }

  .option-key {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    background: $brand-grad;
    border-radius: 50%;
  }

  .option-text {
    flex: 1;
    line-height: 1.5;
  }
}

// ---- 结果页 ----
.result {
  text-align: center;
}

.result-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  overflow: hidden;
  background: $bg;
  border: 4px solid $brand-deep;
  border-radius: 50%;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.result-name {
  margin-bottom: 12px;
  font-size: 28px;
  font-weight: 700;
  color: $ink;
  text-align: center;
}

.result-tag {
  margin-bottom: 24px;
  font-size: 18px;
  color: $brand-deep;
}

.result-desc {
  margin-bottom: 24px;
  padding: 16px;
  text-align: left;
  background: $bg;
  border-radius: $radius-m;

  h3 {
    margin-bottom: 12px;
    font-size: 17px;
    color: $brand-deep;
  }

  p {
    margin-bottom: 12px;
    font-size: 15px;
    line-height: 1.7;
    color: $ink-2;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.back-link {
  font-size: 14px;
  color: $brand-deep;

  &:hover {
    opacity: 0.75;
  }
}

// ---- 响应式 ----
@include respond-below($bp-xs) {
  .card {
    padding: 22px;
  }

  .welcome h1 {
    font-size: 22px;
  }

  .result-avatar {
    width: 100px;
    height: 100px;
  }
}
</style>