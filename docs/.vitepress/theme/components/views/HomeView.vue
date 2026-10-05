<script setup lang="ts">
import { withBase } from 'vitepress';

// 首页：Hero 主视觉 + 重要说明 + 下载卡片 + 核心特性
// 结构参考 EggyUIWeb-Vue3，但去除容器卡片外观，与 VitePress 暖黄渐变背景融为一体
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
    <!-- Hero 主视觉 -->
    <section class="hero">
      <h1 class="hero-title">Pidan<em>UI</em></h1>
      <p class="hero-desc">
        一个由蛋仔爱好者发起的 Windows 桌面美化项目，专注于实现《蛋仔派对》风格的桌面视觉体验。
      </p>

      <!-- 重要说明（警告条） -->
      <div class="hero-warning" role="note">
        <h3><span class="warn-icon">!</span> 温馨提示</h3>
        <p>
          PidanUI 是一个普通的 Windows 桌面美化包，不适用于手机系统或其他操作系统。本项目为《蛋仔派对》粉丝二次创作作品，严格禁止任何商业用途。
        </p>
      </div>
    </section>

    <!-- 下载引导卡片（与背景融合） -->
    <section class="download-callout" aria-label="立即下载">
      <div class="download-copy">
        <span class="callout-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </span>
        <h2>立即 <span class="highlight">下载</span></h2>
        <p>获取最新版本 · Windows 7/10/11 · 完全免费</p>
        <a class="arrow-hint" :href="withBase('/download.html')">
          前往下载
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
      <div class="download-visual" aria-hidden="true">
        <img :src="withBase('/images/characters/yeggy.webp')" alt="" loading="lazy" />
      </div>
    </section>

    <!-- 项目特性 -->
    <section id="features" class="feature-grid" aria-label="项目特性">
      <article v-for="item in FEATURES" :key="item.title" class="feature-card">
        <span class="tag">{{ item.tag }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </article>
    </section>
  </div>
</template>