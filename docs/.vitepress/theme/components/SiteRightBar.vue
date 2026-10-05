<script setup lang="ts">
import { withBase } from 'vitepress';
import { SOCIAL_LINKS } from '@/config';
import { latestPosts } from '@/composables/usePosts';

// 右侧小部件栏：最新动态 + 关注我们 + 项目状态（搜索框已移至新闻页顶部）
const posts = latestPosts(3);
</script>

<template>
  <aside class="sidebar-right" aria-label="侧边栏">
    <!-- 最新动态 -->
    <section class="widget">
      <h2 class="widget-title">最新动态</h2>
      <div class="widget-list">
        <a v-for="post in posts" :key="post.url" :href="withBase(post.url)">
          {{ post.title }}
        </a>
        <p v-if="!posts.length" class="widget-empty">暂无动态</p>
      </div>
      <a class="widget-more" :href="withBase('/posts/')">查看全部新闻 →</a>
    </section>

    <!-- 关注我们 -->
    <section class="widget">
      <h2 class="widget-title">关注我们</h2>
      <div class="social-links">
        <a :href="withBase(SOCIAL_LINKS.RSS)" target="_blank" rel="alternate noopener" type="application/atom+xml">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" />
          </svg>
          RSS 订阅
        </a>
        <a :href="SOCIAL_LINKS.GitHub" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          GitHub
        </a>
        <a :href="SOCIAL_LINKS.Bilibili" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="3" />
            <line x1="7" y1="3" x2="9" y2="7" />
            <line x1="17" y1="3" x2="15" y2="7" />
            <line x1="8" y1="12" x2="8" y2="14" />
            <line x1="16" y1="12" x2="16" y2="14" />
          </svg>
          哔哩哔哩
        </a>
        <a :href="SOCIAL_LINKS.QQ群" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          QQ 交流群
        </a>
      </div>
    </section>

    <!-- 项目状态 -->
    <section class="widget">
      <h2 class="widget-title">项目状态</h2>
      <p class="widget-note">PidanUI 项目组持续维护中，欢迎加入我们。</p>
    </section>
  </aside>
</template>