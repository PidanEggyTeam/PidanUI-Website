<script setup lang="ts">
import { SITE } from '#shared/site';
import { SOCIAL_LINKS } from '~/data/socialLinks';
import { NAV_ITEMS } from '~/data/nav';

// 全站底栏：品牌与站点导航（同时承担无 JS 时的导航兜底）、关注我们、实时访客。
// 右栏原来的「项目状态」不再保留。
const year = new Date().getFullYear();

// 站内相对路径补 base；订阅源补 alternate / Atom MIME
const socialLinks = SOCIAL_LINKS.map((link) => {
  const isFeed = link.url.endsWith('.xml');
  return {
    ...link,
    href: link.url.startsWith('/') ? withBase(link.url) : link.url,
    rel: isFeed ? 'alternate noopener' : 'noopener',
    type: isFeed ? 'application/atom+xml' : undefined,
  };
});
</script>

<template>
  <UFooter class="mt-16 border-t border-default bg-elevated/40">
    <template #top>
      <UContainer class="max-w-none px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <!-- 品牌 + 站点导航 -->
          <div class="min-w-0">
            <NuxtLink class="flex items-center gap-2.5 text-lg font-bold text-default" to="/">
              <img
                class="size-8 rounded-lg object-contain"
                :src="withBase('/images/logo.webp')"
                :alt="SITE.brand"
                width="32"
                height="32"
                decoding="async"
                loading="lazy"
              />
              <!-- 与顶栏同一套视觉补偿：纯大写品牌名的墨迹中心比行盒中心高约 1.5px -->
              <span class="translate-y-[1.5px]">{{ SITE.brand }}</span>
            </NuxtLink>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-toned">
              为 Windows 打造《蛋仔派对》风格的桌面美化 · 非盈利粉丝二创项目
            </p>
            <nav class="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="页脚导航">
              <NuxtLink
                v-for="item in NAV_ITEMS"
                :key="item.key"
                class="text-sm text-toned transition-colors hover:text-brand-600"
                :to="item.href"
                >{{ item.label }}</NuxtLink
              >
            </nav>
          </div>

          <!-- 关注我们 -->
          <div class="min-w-0">
            <h2 class="mb-3 text-[13px] font-bold tracking-[0.5px] text-dimmed uppercase">关注我们</h2>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <a
                v-for="link in socialLinks"
                :key="link.url"
                class="flex items-center gap-2.5 rounded-lg border border-default px-2.5 py-2 text-sm text-toned transition-colors hover:border-brand-600/35 hover:text-brand-600"
                :href="link.href"
                target="_blank"
                :rel="link.rel"
                :type="link.type"
              >
                <UIcon :name="link.icon" class="size-4 shrink-0" aria-hidden="true" />
                <span class="truncate">{{ link.name }}</span>
              </a>
            </div>
          </div>

          <!-- 访客国家/地区：插件按加载时量到的宽度写死像素宽，网格项必须 min-w-0
               才能在窄屏收缩（否则 677px 的固定宽把整行撑出视口） -->
          <div class="min-w-0 md:col-span-2 lg:col-span-1">
            <TrafficWidget />
          </div>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-dimmed">© {{ year }} {{ SITE.brand }} · 非盈利粉丝项目 · AGPL v3</p>
    </template>
  </UFooter>
</template>
