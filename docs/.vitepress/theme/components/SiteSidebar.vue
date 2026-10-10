<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useData, withBase } from 'vitepress';
import { SITE } from '@/config';
import {
  activeMobileDrawer,
  closeMobileDrawer,
  toggleMobileDrawer,
} from '@/composables/useMobileDrawer';
import ThemeToggle from './ThemeToggle.vue';

// 左侧固定导航栏：品牌标识 + 四个导航项；移动端（≤960px）收起为抽屉
const route = useRoute();
const { page } = useData();

const navOpen = computed(() => activeMobileDrawer.value === 'left');
let mobileBreakpoint: MediaQueryList | undefined;

const NAV_ITEMS = [
  { key: 'home', label: '首页', href: '/' },
  { key: 'download', label: '下载', href: '/download.html' },
  { key: 'news', label: '新闻', href: '/posts/' },
  { key: 'about', label: '关于', href: '/about.html' },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]['key'];

/** 当前路径归属的导航分区（新闻分区包含 posts/categories/tags/archives/search） */
const activeKey = computed<NavKey | ''>(() => {
  const path = route.path;
  if (path === '/' || path.startsWith('/index')) return 'home';
  if (path.startsWith('/download')) return 'download';
  if (
    path.startsWith('/posts') ||
    path.startsWith('/categories') ||
    path.startsWith('/tags') ||
    path.startsWith('/archives') ||
    path.startsWith('/search')
  ) {
    return 'news';
  }
  if (path.startsWith('/about') || path.startsWith('/personality-test')) return 'about';
  return '';
});

function closeMenu() {
  closeMobileDrawer();
}

function toggleMenu() {
  toggleMobileDrawer('left');
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && activeMobileDrawer.value) {
    closeMenu();
  }
}

function onBreakpointChange(event: MediaQueryListEvent) {
  if (!event.matches) closeMenu();
}

// 路由切换时关闭抽屉
watch(
  () => page.value.relativePath,
  () => closeMenu(),
);

onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  mobileBreakpoint = window.matchMedia('(max-width: 960px)');
  mobileBreakpoint.addEventListener('change', onBreakpointChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  mobileBreakpoint?.removeEventListener('change', onBreakpointChange);
  closeMenu();
});
</script>

<template>
  <!-- 移动端汉堡按钮 -->
  <button
    class="menu-toggle"
    type="button"
    :aria-label="navOpen ? '关闭主导航' : '打开主导航'"
    :aria-expanded="navOpen"
    @click="toggleMenu"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  </button>

  <!-- 遮罩 -->
  <div
    class="sidebar-overlay"
    :class="{ open: activeMobileDrawer !== null }"
    aria-hidden="true"
    @click="closeMenu"
  />

  <!-- 左侧导航 -->
  <aside class="sidebar-left" :class="{ open: navOpen }" aria-label="主导航">
    <a class="brand" :href="withBase('/')" :aria-label="SITE.brand">
      <img class="brand-logo" :src="withBase('/images/logo.webp')" :alt="SITE.brand" width="34" height="34" />
      <span class="brand-text">{{ SITE.brand }}</span>
    </a>

    <nav class="nav" aria-label="站点导航">
      <a
        v-for="item in NAV_ITEMS"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        :href="withBase(item.href)"
        :aria-current="activeKey === item.key ? 'page' : undefined"
      >
        <span class="nav-icon" aria-hidden="true">
          <svg v-if="item.key === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <svg v-else-if="item.key === 'download'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <svg v-else-if="item.key === 'news'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9" />
            <line x1="10" y1="7" x2="18" y2="7" />
            <line x1="10" y1="11" x2="18" y2="11" />
            <line x1="10" y1="15" x2="14" y2="15" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>

    <ThemeToggle />
  </aside>
</template>