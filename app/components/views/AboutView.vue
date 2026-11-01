<script setup lang="ts">
import {
  ABOUT_ANCHORS,
  COMPOSITION,
  COPYRIGHT,
  CREATION_NOTE,
  CREATION_REASONS,
  DISTRIBUTION,
  FEATURES,
  INTRO_PARAGRAPHS,
  RENAME_INTRO,
  RENAME_NOTE,
  RENAME_REASONS,
} from '~/data/about';

// ============================================================
// 关于页：文档式双栏
//   左：锚点索引（lg 以上 sticky，跟随顶栏高度）
//   右：左对齐的长文档，章节之间用间距分隔
//
// 与首页的区别：首页是营销落地页（居中大标题、左文右图、卡片网格、多个
// CTA）；关于页是说明文档——没有 Hero 大图、不居中、不堆卡片，靠锚点索引
// 让人能跳读。两条路径刻意不共用版式。
// ============================================================
const badges = ['非盈利', '粉丝向 · 非商用', '持续维护'];
</script>

<template>
  <UPage>
    <template #left>
      <UPageAside>
        <UPageAnchors :links="ABOUT_ANCHORS" />
      </UPageAside>
    </template>

    <UPageHeader
      title="关于 PidanUI"
      description="一个由蛋仔爱好者维护的非盈利桌面美化项目。"
      :ui="{ root: 'py-0 pb-8 mb-10' }"
    >
      <template #links>
        <UBadge
          v-for="badge in badges"
          :key="badge"
          variant="soft"
          color="primary"
          :label="badge"
        />
      </template>
    </UPageHeader>

    <div class="max-w-3xl space-y-12">
      <AboutSection id="about-intro" title="项目简介" icon="i-lucide-info">
        <p v-for="paragraph in INTRO_PARAGRAPHS" :key="paragraph">{{ paragraph }}</p>
      </AboutSection>

      <AboutSection id="about-why" title="为什么要创建 PidanUI" icon="i-lucide-circle-help">
        <ul class="list-disc space-y-2 pl-5">
          <li v-for="reason in CREATION_REASONS" :key="reason">{{ reason }}</li>
        </ul>
        <p class="rounded-lg bg-elevated/50 p-4 text-[14px] leading-[1.8]">{{ CREATION_NOTE }}</p>
      </AboutSection>

      <AboutSection id="about-rename" title="关于 EggyUI 项目「换皮」的说明" icon="i-lucide-repeat">
        <p>{{ RENAME_INTRO }}</p>
        <ol class="list-decimal space-y-2 pl-5">
          <li v-for="reason in RENAME_REASONS" :key="reason">{{ reason }}</li>
        </ol>
        <p class="rounded-lg bg-elevated/50 p-4 text-[14px] leading-[1.8]">{{ RENAME_NOTE }}</p>
      </AboutSection>

      <AboutSection id="about-features" title="项目特色" icon="i-lucide-sparkles">
        <div v-for="feature in FEATURES" :key="feature.title">
          <h3 class="mb-1 font-semibold text-brand-600">{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </AboutSection>

      <AboutSection id="about-composition" title="项目构成" icon="i-lucide-boxes">
        <ul class="list-disc space-y-2 pl-5">
          <li v-for="item in COMPOSITION" :key="item.name">
            <strong class="font-semibold text-default">{{ item.name }}</strong
            >：{{ item.desc }}
          </li>
        </ul>
      </AboutSection>

      <AboutSection id="about-distribution" title="分发方式" icon="i-lucide-share-2">
        <ul class="list-disc space-y-2 pl-5">
          <li v-for="item in DISTRIBUTION" :key="item.name">
            <strong class="font-semibold text-default">{{ item.name }}</strong
            >：{{ item.desc }}
          </li>
        </ul>
      </AboutSection>

      <AboutSection id="about-copyright" title="版权声明" icon="i-lucide-scale">
        <ul class="list-disc space-y-2 pl-5">
          <li v-for="item in COPYRIGHT" :key="item">{{ item }}</li>
        </ul>
      </AboutSection>

      <!-- 性格测试入口：保留 game-entry 类名，无 JS 时由 base.css 隐藏 -->
      <UPageCTA
        class="game-entry"
        variant="subtle"
        title="蛋仔专属性格测试"
        description="几道关于日常性格与游戏习惯的小问题，测出最适配你的专属蛋仔角色。"
        :links="[
          { label: '开始测试', to: '/personality-test', trailingIcon: 'i-lucide-arrow-right' },
        ]"
      />

      <p class="text-xs leading-[1.8] text-dimmed">
        本站「关于」文案基于 PidanUI 项目说明整理。本网站使用 FeedPulse
        小组件统计访客数据，该组件不会泄露用户隐私，请放心访问本网站。
      </p>
    </div>
  </UPage>
</template>
