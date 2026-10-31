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
      :ui="{ container: 'pt-0 gap-8' }"
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
      :ui="{ container: 'gap-8' }"
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

    <!-- 开发人员：圆形头像 -->
    <UPageSection
      title="开发人员"
      description="一个小团队，维护着一整套系统镜像与辅助组件。"
      :ui="{ container: 'gap-8' }"
    >
      <UPageGrid style="--grid-min: 180px">
        <UUser
          v-for="member in team"
          :key="member.name"
          orientation="vertical"
          size="3xl"
          :avatar="{ src: member.avatar, alt: member.name }"
          :name="member.name"
          :description="member.role"
          :ui="{ root: 'items-center text-center gap-3' }"
        />
      </UPageGrid>
    </UPageSection>

    <!-- 加入我们 -->
    <UPageSection
      title="加入我们"
      description="无论是反馈问题、投稿内容，还是直接参与开发，都欢迎。"
      :ui="{ container: 'gap-8' }"
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
</style>
