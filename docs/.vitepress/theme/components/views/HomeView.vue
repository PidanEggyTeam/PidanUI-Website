<script setup lang="ts">
import { withBase } from 'vitepress';

// 首页：Hero 主视觉 + 核心特性卡片（版式对齐参考站 PidanUIWebsite_O）
const FEATURES = [
  {
    tag: '安全美化',
    title: '不修改系统文件',
    desc: '所有美化内容通过主题包、壁纸、小组件等安全方式部署，不替换系统核心文件。',
  },
  {
    tag: '现代技术栈',
    title: '.NET 10 辅助组件',
    desc: '辅助组件采用 .NET 10 重构，避免杀毒软件误报，提升稳定性与兼容性。',
  },
  {
    tag: '精简美化',
    title: '保留核心体验',
    desc: '聚焦主题与 Rainmeter 小组件等基础美化，让系统更接近原版 Windows 的使用体验。',
  },
  {
    tag: '持续维护',
    title: '社区驱动',
    desc: '由 PidanUI 团队持续维护，吸取过往项目治理经验，保持稳定迭代。',
  },
] as const;
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <h1>Pidan<em>UI</em></h1>
      <p class="hero-desc">
        一个由蛋仔爱好者发起的 Windows 桌面美化项目，专注于实现《蛋仔派对》风格的桌面视觉体验。
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" :href="withBase('/download.html')">前往下载</a>
        <a class="btn btn-ghost" href="#features">了解更多</a>
      </div>
    </section>

    <section id="features" class="feature-grid" aria-label="项目特性">
      <article v-for="item in FEATURES" :key="item.title" class="feature-card">
        <span class="tag">{{ item.tag }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </article>
    </section>
  </div>
</template>