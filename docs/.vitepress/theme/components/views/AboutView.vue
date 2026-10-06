<script setup lang="ts">
import { withBase } from 'vitepress';
import { SITE } from '@/config';

// 关于页内容基于 PidanUIWebsite_O/README.md
const CREATION_REASONS = [
  '治理方式与项目性质不符：EggyUI 是由爱好者发起的非盈利粉丝项目，但发展过程中出现尝试公司化运作、引入面试与保密协议等机制，与非盈利性质产生冲突。',
  '管理方式引发内部矛盾：项目组内部出现过管理方式争议、成员排挤、资源控制等问题，消耗了开发者精力，影响项目推进。',
  '方向选择偏离项目定位：部分成员主张推动与官方合作、脱离蛋仔 IP 等方向，与粉丝二创的定位不符。',
  '资源管理存在隐患：项目资源曾集中存放在个人控制的网盘空间中，存在单点故障风险。',
] as const;

const RENAME_REASONS = [
  '减少历史包袱：EggyUI 这个名字承载了太多与项目本身无关的争议，继续使用会增加沟通成本。',
  '避免外部干扰：项目组希望将精力集中在开发上，而不是持续回应与项目无关的纠纷。',
  '保持技术连续性：PidanUI 继承了 EggyUI 在技术路线、组件架构、美化方案上的积累，只是更换了对外名称。',
  '重建用户信任：通过新的名称和更清晰的定位，让用户重新认识这个项目。',
] as const;

const FEATURES = [
  {
    title: '不修改系统核心文件',
    desc: '所有美化内容通过主题包、壁纸、Rainmeter 小组件等安全方式部署，不替换 imageres.dll.mun、shell32.dll.mun 等系统文件，安装与卸载不影响系统稳定性。',
  },
  {
    title: '辅助组件使用 .NET 10',
    desc: '抛弃早期使用的易语言组件，采用 .NET 10 重构辅助程序，解决高 DPI 缩放适配与杀毒软件误报问题。',
  },
  {
    title: '精简美化方案',
    desc: '聚焦主题、小组件等基础美化特性，移除冗余、持久化的美化方式，让系统体验更接近原版 Windows。',
  },
  {
    title: '清晰的定位',
    desc: 'PidanUI 是一个非盈利粉丝项目，不用于商业用途，不冒充官方，不与任何商业实体合作。',
  },
] as const;

const COMPOSITION = [
  { name: '主题包', desc: '蛋仔风格的 Windows 主题，支持 Windows 7 ~ Windows 11。' },
  { name: 'Rainmeter 小组件', desc: '配套的桌面小组件，支持 Windows 10 1607 ~ Windows 11。' },
  { name: '辅助组件', desc: '基于 .NET 10 开发的辅助程序，用于主题部署与组件管理。' },
  { name: '系统镜像', desc: '轻简版系统镜像，在保持系统可用性的前提下适量精简，降低资源占用。' },
] as const;

const DISTRIBUTION = [
  { name: 'GitHub Releases', desc: '辅助组件、主题包等代码相关资源。' },
  { name: '项目官网', desc: '项目介绍、新闻动态、下载导航。' },
  { name: '指定资源站', desc: '系统镜像体积较大，通过项目指定的资源站发布。' },
] as const;

const COPYRIGHT = [
  '本项目为《蛋仔派对》粉丝二次创作，非官方出品，禁止用于商业用途。',
  '所有视觉素材均来自合规渠道或团队重绘，未使用游戏拆包 / 解包资源。',
  '《蛋仔派对》是网易游戏的注册商标，Windows 是微软公司的注册商标。',
  '本项目与网易、微软无任何隶属或赞助关系。',
] as const;
</script>

<template>
  <div class="about-view">
    <!-- Hero -->
    <section class="about-hero">
      <h1>Pidan<em>UI</em></h1>
      <p class="subtitle">专为 Windows 系统打造的蛋仔风格桌面美化项目</p>
      <div class="badges">
        <span class="chip">非盈利</span>
        <span class="chip">粉丝向 · 非商用</span>
        <span class="chip">持续维护</span>
      </div>
    </section>

    <div class="about-layout">
      <main class="about-main">
        <!-- 性格测试入口 -->
        <section class="card game-entry">
          <div class="game-entry-text">
            <h2>🎮 蛋仔专属性格测试</h2>
            <p>几道关于日常性格与游戏习惯的小问题，测出最适配你的专属蛋仔角色。</p>
          </div>
          <a class="game-entry-btn" :href="withBase('/personality-test.html')">开始测试 🚀</a>
        </section>

        <!-- 项目简介 -->
        <section class="card">
          <h2>项目简介</h2>
          <p>
            PidanUI 是一款专为 Windows 系统打造的桌面美化项目，设计灵感来源于网易游戏《蛋仔派对》。项目延续了
            EggyUI 在视觉风格上的探索，同时吸取了过往项目在治理、技术与分发方式上的经验教训，重新调整了开发路线与组织方式。
          </p>
          <p>
            PidanUI 并非 EggyUI 的官方分支，而是一个在 EggyUI 项目经历分裂与重组后，由原核心开发者与社区成员共同创建的新项目。它的目标不是复刻
            EggyUI 的历史，而是在继承其技术积累与美学方向的基础上，走一条更稳定、更可持续的路。
          </p>
        </section>

        <!-- 为何创建 -->
        <section class="card">
          <h2>为什么要创建 PidanUI</h2>
          <ul>
            <li v-for="reason in CREATION_REASONS" :key="reason">{{ reason }}</li>
          </ul>
          <p class="note">
            这些问题最终导致 EggyUI 项目经历分裂与重组。PidanUI
            正是在这一背景下创建的，目的是让项目回到非盈利爱好者项目的定位上，专注于技术与美化本身。
          </p>
        </section>

        <!-- 换皮说明 -->
        <section class="card">
          <h2>关于 EggyUI 项目「换皮」的说明</h2>
          <p>
            EggyUI 项目在经历分裂与重组后，原有的品牌名称在互联网上的传播环境变得复杂，项目组内部争议也影响了其对外形象。在这种情况下，项目组选择以新的名称
            <strong>PidanUI</strong> 继续推进开发：
          </p>
          <ol>
            <li v-for="reason in RENAME_REASONS" :key="reason">{{ reason }}</li>
          </ol>
          <p class="note">
            需要说明的是，PidanUI 不是 EggyUI 的「替代品」或「山寨版」，它是同一批开发者在经历项目重组后，以更清晰的组织方式继续推进的成果。
          </p>
        </section>

        <!-- 项目特色 -->
        <section class="card">
          <h2>项目特色</h2>
          <div class="sub-block" v-for="feature in FEATURES" :key="feature.title">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </section>

        <!-- 项目构成 -->
        <section class="card">
          <h2>项目构成</h2>
          <ul>
            <li v-for="item in COMPOSITION" :key="item.name">
              <strong>{{ item.name }}</strong>：{{ item.desc }}
            </li>
          </ul>
        </section>

        <!-- 分发方式 -->
        <section class="card">
          <h2>分发方式</h2>
          <ul>
            <li v-for="item in DISTRIBUTION" :key="item.name">
              <strong>{{ item.name }}</strong>：{{ item.desc }}
            </li>
          </ul>
        </section>

        <!-- 版权声明 -->
        <section class="card">
          <h2>版权声明</h2>
          <ul>
            <li v-for="item in COPYRIGHT" :key="item">{{ item }}</li>
          </ul>
        </section>
        </main>
    </div>

    <p class="footnote">本站「关于」文案基于 PidanUI 项目说明整理。© {{ SITE.brand }}</p>
  </div>
</template>

<style scoped lang="scss">
@use 'variables' as *;
@use 'mixins' as *;

// ============================================================
// 关于页 · 卡片式章节
// ============================================================
.about-view {
  max-width: $max-w;
  margin: 0 auto;
}

.about-hero {
  padding: 32px 0 28px;
  text-align: center;

  h1 {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 800;
    letter-spacing: 1px;
    // 与首页 hero 标题统一：品牌渐变文字
    background: $brand-grad;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    em {
      font-style: normal;
      // 渐变色本身已覆盖 em，无需额外改色
    }
  }

  .subtitle {
    margin-top: 10px;
    font-size: clamp(15px, 2vw, 18px);
    color: $ink-2;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 16px;

    .chip {
      padding: 4px 14px;
      font-size: 12px;
      letter-spacing: 1px;
      color: $ink-2;
      background: $brand-soft;
      border: 1px solid $line;
      border-radius: $radius-full;
    }
  }
}

.about-layout {
  // 关于页现在只有一列：about-main 撑满网格
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.about-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 通用卡片 —— scoped 后只在 AboutView 内生效，不再污染别的页面。
// 与首页 .feature-card / .download-callout 统一：弱化容器，用极淡品牌色叠在 $card 上，无硬阴影。
.card {
  position: relative;
  padding: 26px 30px;
  background: linear-gradient(180deg, rgba(255, 197, 61, 0.10) 0%, transparent 100%), $card;
  border: 1px solid $line;
  border-radius: $radius-l;
  box-shadow: none;

  // 章节小徽章：tag 式细左边框，和首页 hero-warning 呼应
  h2 {
    margin-bottom: 14px;
    font-size: 1rem;
    font-weight: 700;
    color: $ink;
    letter-spacing: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    &::before {
      content: '';
      width: 3px;
      height: 18px;
      background: $brand-grad;
      border-radius: 2px;
      flex-shrink: 0;
    }
  }

  p {
    margin-bottom: 10px;
    font-size: 15px;
    line-height: 1.85;
    color: $ink-2;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul,
  ol {
    margin: 6px 0 0 1.4em;
    font-size: 15px;
    line-height: 1.9;
    color: $ink-2;

    li {
      margin: 0.25em 0;

      &::marker {
        color: $brand-deep;
      }
    }
  }

  strong {
    color: $ink;
  }

  .note {
    margin-top: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: $ink-2;
    background: $bg;
    border-radius: $radius-m;
  }
}

.sub-block {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin-bottom: 6px;
    font-size: 1rem;
    font-weight: 600;
    color: $brand-deep;
  }

  p {
    margin-bottom: 0;
  }
}

// 性格测试入口 —— 保留独立暖色渐变，但去掉阴影以和整体风格统一
.game-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  // 覆盖 .card 的极淡品牌层，用独立的暖色渐变
  background: linear-gradient(135deg, rgba(255, 197, 61, 0.16), rgba(255, 159, 26, 0.12)), $card;
  border-color: rgba(255, 159, 26, 0.28);
  box-shadow: none;

  .game-entry-text {
    h2 {
      margin-bottom: 6px;
    }

    p {
      margin-bottom: 0;
      font-size: 14px;
    }
  }

  // 禁用 JavaScript 时隐藏：scoped 后 Vue 会把 `html:not(.js) &` 展开成
  // `html:not(.js) .game-entry[data-v-xxx]`，外层 html 选择器保持原样仍然能命中
  html:not(.js) & {
    display: none;
  }
}

.game-entry-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  background: $brand-grad;
  border-radius: 30px;
  box-shadow: $shadow-brand;
  transition: transform 0.25s ease;
}

.footnote {
  margin-top: 24px;
  font-size: 12px;
  color: $ink-3;
  text-align: center;
}

// ---- 响应式 ----
@include respond-below($bp-sm) {
  .card {
    padding: 20px;
  }

  .game-entry {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
