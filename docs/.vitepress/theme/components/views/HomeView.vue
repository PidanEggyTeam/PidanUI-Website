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

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ============================================================
// 首页 · Hero + 警告条 + 下载引导 + 特性网格
// 结构参考 EggyUIWeb-Vue3，但容器弱化，与暖黄渐变背景融为一体
// ============================================================
.home-view {
  max-width: $max-w;
  margin: 0 auto;
}

// ---- Hero 主视觉 ----
.hero {
  padding: 40px 0 28px;
  text-align: center;
}

.hero-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.25;
  margin: 0 0 16px;
  background: $brand-grad;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  em {
    font-style: normal;
  }
}

.hero-desc {
  max-width: 600px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.7;
  color: $ink-2;
}

// ---- 重要说明 / 警告条（弱化外观：极浅背景 + 左边框） ----
.hero-warning {
  max-width: 720px;
  margin: 24px auto 0;
  padding: 14px 18px;
  text-align: left;
  color: $ink-2;
  background: rgba(255, 197, 61, 0.14);
  border-left: 4px solid $brand;
  border-radius: 0 $radius-m $radius-m 0;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 600;
    color: $brand-deep;
  }

  .warn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    background: $brand;
    border-radius: 50%;
  }

  p {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.65;
    color: $ink-2;
  }
}

// ---- 下载引导（左右分栏，弱化容器） ----
.download-callout {
  display: flex;
  align-items: center;
  gap: 28px;
  margin: 32px 0 8px;
  padding: 24px 28px;
  color: $ink;
  text-decoration: none;
  // 弱化容器：只用一层极淡的背景，不设 border-radius / box-shadow
  background: rgba(255, 197, 61, 0.10);
  border-radius: $radius-m;
}

.download-copy {
  flex: 1;
  min-width: 0;

  .callout-icon {
    display: inline-flex;
    margin-bottom: 10px;
    color: $brand-deep;

    svg {
      width: 38px;
      height: 38px;
    }
  }

  h2 {
    margin: 0 0 4px;
    font-size: clamp(22px, 3.2vw, 28px);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: $ink;

    .highlight {
      background: $brand-grad;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  > p {
    margin: 0 0 14px;
    font-size: 14px;
    color: $ink-2;
  }
}

.arrow-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  font-size: 13px;
  font-weight: 500;
  color: $brand-deep;
  text-decoration: none;
  background: rgba(255, 159, 26, 0.08);
  border: 1px solid rgba(255, 159, 26, 0.14);
  border-radius: 30px;
  transition: background 0.2s ease, transform 0.2s ease;

  svg {
    width: 15px;
    height: 15px;
    transition: transform 0.25s ease;
  }

  &:hover {
    background: rgba(255, 159, 26, 0.16);

    svg {
      transform: translateX(3px);
    }
  }
}

.download-visual {
  flex: 0 0 140px;
  width: 140px;
  height: 140px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: $radius-m;
  }
}

// ---- 项目特性网格 ----
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  margin-top: 40px;
}

.feature-card {
  padding: 22px 22px 20px;
  // 用 CSS 变量承载深浅两套背景：
  //   浅色：$card 是纯白底
  //   深色：$card 是 #1f1f23 深灰底
  // 再叠一层极弱的 brand-soft 让卡片与暖黄品牌色微微呼应
  background: linear-gradient(180deg, #{'rgba(255, 197, 61, 0.10)'} 0%, transparent 100%), $card;
  border: 1px solid $line;
  border-radius: $radius-l;

  .tag {
    display: inline-block;
    margin-bottom: 12px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    color: $brand-deep;
    background: $brand-soft;
    border-radius: $radius-full;
  }

  h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: $ink;
  }

  p {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.7;
    color: $ink-2;
  }
}

// ---- 响应式 ----
@include respond-below($bp-md) {
  .download-callout {
    flex-direction: column;
    text-align: center;
    padding: 22px 20px;

    .download-copy {
      .callout-icon {
        justify-content: center;
      }
    }

    .arrow-hint {
      justify-content: center;
    }

    .download-visual {
      order: -1;
      flex: 0 0 110px;
      width: 110px;
      height: 110px;
    }
  }
}

@include respond-below($bp-xs) {
  .hero {
    padding-top: 20px;
  }

  .hero-title {
    font-size: 28px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
    margin-top: 28px;
  }

  .download-callout {
    margin-top: 24px;
  }
}
</style>
