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
        <h2 class="result-name">{{ result.name }}</h2>
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