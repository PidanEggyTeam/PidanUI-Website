<script setup lang="ts">
import { computed } from 'vue';
import { COMMUNITY_GROUPS, HOME_FEATURES, PROMO_IMAGE } from '~/data/home';
import { TEAM_MEMBERS } from '~/data/team';
import { latestPosts, useAllPosts } from '~/composables/usePosts';

// 首页：Hero（左文右图）→ 温馨提示 → 项目特性 → 最新动态 → 开发人员 → 加入我们
// 「最新动态」的数据来自预渲染的文章列表（plugins/posts.ts 在应用创建阶段填充），
// useAllPosts 内部是 useState，必须在 setup 顶层同步调用，不能塞进 computed。
const allPosts = useAllPosts();
const latest = computed(() => latestPosts(allPosts.value, 3));

// 头像存的是站内相对路径，渲染时补 base
const team = TEAM_MEMBERS.map((member) => ({
  ...member,
  avatar: withBase(member.avatar),
}));

/** 首页各区块共用的纵向节奏：默认主题是 py-16/24/32 + body/footer mt-16，
    几个区块叠起来会把页面拉得很长；这里压到一半左右 */
const SECTION_UI = {
  container: 'py-10 sm:py-12 lg:py-14 gap-6 sm:gap-8',
  body: 'mt-8',
  footer: 'mt-8',
} as const;

// ============================================================
// 开发人员：成员够多时用 Nuxt UI 的 UMarquee 做从右到左的循环滚动
// ------------------------------------------------------------
// 少于 6 人时保持静止的横向列表（可手动滑）：那几张卡片本来就放得下，
// 跑马灯只会让人读不完名字。滚动方向、悬停暂停、减少动效时停止，
// 全部交给 UMarquee（它用的是 motion-safe 的 CSS 关键帧）。
// ============================================================
const MARQUEE_MIN = 6;
const marqueeActive = computed(() => team.length >= MARQUEE_MIN);
</script>

<template>
  <div class="mx-auto max-w-page">
    <!-- Hero：左侧项目名 / 简介 / 下载按钮，右侧宣传图。
         UPageHero 在 horizontal 下的两列分别是「wrapper（标题/描述/按钮）」与
         默认插槽，因此宣传图必须走默认插槽 —— 放进 #body 会被塞进左列底部，
         右列留空。 -->
    <UPageHero
      orientation="horizontal"
      :ui="{ container: 'py-8 sm:py-12 lg:py-16 gap-10 lg:gap-14' }"
    >
      <template #headline>
        <UBadge variant="soft" color="primary" size="md" label="非盈利 · 粉丝二创" />
      </template>

      <template #title>
        <span class="hero-title text-[clamp(34px,5.4vw,54px)] leading-[1.15] font-extrabold tracking-[1px]">
          Pidan<em>UI</em>
        </span>
      </template>

      <template #description>
        <p class="max-w-[560px] text-[15.5px] leading-[1.8] text-toned">
          一个由蛋仔爱好者发起的 Windows &amp; Linux 桌面美化项目，专注于实现《蛋仔派对》风格的桌面视觉体验。
        </p>
      </template>

      <template #links>
        <UButton
          to="/download"
          size="lg"
          icon="i-lucide-download"
          trailing-icon="i-lucide-arrow-right"
          label="立即下载"
        />
        <UButton to="/posts/" size="lg" variant="outline" color="neutral" label="查看新闻" />
      </template>

      <div class="overflow-hidden rounded-2xl shadow-float ring-1 ring-default">
        <SafeImage
          class="aspect-video w-full object-cover"
          :src="PROMO_IMAGE"
          alt="PidanUI 宣传图"
          width="960"
          height="540"
          decoding="async"
          fetchpriority="high"
        />
      </div>
    </UPageHero>

    <!-- 重要说明 -->
    <UAlert
      class="mb-12"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="温馨提示"
      description="PidanUI 是一个普通的 Windows & Linux 桌面美化包，不适用于手机系统或其他操作系统。本项目为《蛋仔派对》粉丝二次创作作品，严格禁止任何商业用途。"
    />

    <!-- 项目特性 -->
    <UPageSection
      title="项目特性"
      description="从系统镜像到辅助组件，每一层都为「像原版 Windows 一样稳定」让路。"
      :ui="{ ...SECTION_UI, container: 'pt-0 pb-10 sm:pb-12 lg:pb-14 gap-6 sm:gap-8' }"
    >
      <UPageGrid style="--grid-min: 250px">
        <UPageCard
          v-for="feature in HOME_FEATURES"
          :key="feature.title"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
          variant="subtle"
          spotlight
        />
      </UPageGrid>
    </UPageSection>

    <!-- 最新动态：从右栏搬到主页 -->
    <UPageSection
      title="最新动态"
      description="版本发布、项目公告与前瞻报道。"
      :ui="SECTION_UI"
    >
      <!-- 与新闻 / 下载列表共用同一套卡片网格（CardGrid → UPageGrid 的 auto-fill
           密度规则），列数与卡片内边距才对得上 -->
      <CardGrid :posts="latest" empty-text="暂无动态" />

      <template #footer>
        <!-- 与 Hero 的「立即下载」保持同一套按钮样式（实心品牌色 + lg + 右箭头），
             并居中收尾这一区块 -->
        <div class="flex justify-center">
          <UButton
            to="/posts/"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
            label="查看全部新闻"
          />
        </div>
      </template>
    </UPageSection>

    <!-- 开发人员：成员卡片横向排列，头像放在卡片顶部 -->
    <UPageSection
      title="开发人员"
      description="一个小团队，维护着一整套系统镜像与辅助组件。"
      :ui="SECTION_UI"
    >
      <!-- 人数够多 → UMarquee 循环滚动（pause-on-hover 悬停暂停） -->
      <UMarquee
        v-if="marqueeActive"
        :repeat="2"
        pause-on-hover
        :overlay="false"
        class="team-marquee"
      >
        <TeamMemberCard v-for="member in team" :key="member.name" :member="member" />
      </UMarquee>

      <!-- 人数不足 → 静止的横向列表；可聚焦，键盘用户才能滚动它 -->
      <div
        v-else
        class="team-scroller"
        role="region"
        tabindex="0"
        aria-label="开发人员列表，可横向滚动"
      >
        <TeamMemberCard v-for="member in team" :key="member.name" :member="member" />
      </div>
    </UPageSection>

    <!-- 加入我们 -->
    <UPageSection
      title="加入我们"
      description="无论是反馈问题、投稿内容，还是直接参与开发，都欢迎。"
      :ui="SECTION_UI"
    >
      <div class="grid gap-6 md:grid-cols-2">
        <UPageCard
          v-for="group in COMMUNITY_GROUPS"
          :key="group.title"
          :icon="group.icon"
          :title="group.title"
          :description="group.description"
          variant="outline"
        >
          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="link in group.links"
                :key="link.label"
                :to="link.to"
                target="_blank"
                rel="noopener"
                :icon="link.icon"
                :trailing-icon="link.trailingIcon"
                :label="link.label"
                variant="soft"
                color="neutral"
                size="sm"
              />
            </div>
          </template>
        </UPageCard>
      </div>
    </UPageSection>
  </div>
</template>

<style scoped>
/* 品牌渐变文字：需要 background-clip:text，工具类写起来过于冗长 */
.hero-title {
  background: var(--brand-grad);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title em {
  font-style: normal;
}

/* 开发人员横向列表（成员不足 UMarquee 阈值时的静止形态）：
   - overflow-x: auto 保留键盘 / 触控板 / 触摸的滚动能力
   - scroll-snap 让每次滑动停在卡片边界 */
.team-scroller {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 2px;
  padding: 2px 2px 12px;
}

/* 键盘聚焦时给一条可见的焦点环（容器本身没有可见边框） */
.team-scroller:focus-visible {
  outline: 2px solid var(--color-brand-deep-a35);
  outline-offset: 4px;
  border-radius: var(--radius-m);
}

/* UMarquee 默认 gap 是 spacing(16) = 64px、一圈 20s；
   这里与卡片间距对齐为 16px，并放慢到 48s（12 张卡≈2.8k px，太快看不清名字） */
.team-marquee {
  --gap: 16px;
  --duration: 48s;
}

/* 键盘聚焦时给一条可见的焦点环（容器本身不可见边框） */
.team-scroller:focus-visible {
  outline: 2px solid var(--color-brand-deep-a35);
  outline-offset: 4px;
  border-radius: var(--radius-m);
}
</style>
