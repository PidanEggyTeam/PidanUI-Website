<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter, withBase } from 'vitepress';
import { searchKeyword, syncKeywordFromUrl, writeKeywordToUrl } from '@/composables/useSearch';

/**
 * 全站共享的新闻搜索框（已移除搜索按钮）。
 * - 新闻页顶部：输入后（防抖）用 Router 跳到 /search/?q=…，客户端渲染、不刷新页面
 * - 搜索页：输入即时过滤，仅用 replaceState 同步地址栏（同页不跳转，避免失焦）
 * - 禁用 JavaScript 时通过 <noscript> 显示降级提示，搜索框隐藏
 */
const props = withDefaults(
  defineProps<{
    /** 输入后是否跳转到搜索结果页（新闻页传 true，搜索页保持 false） */
    navigateOnInput?: boolean;
    /** 输入防抖毫秒数，避免逐字符触发跳转 */
    debounce?: number;
    /** 挂载后自动聚焦输入框（搜索页使用） */
    autofocus?: boolean;
  }>(),
  { navigateOnInput: false, debounce: 350, autofocus: false },
);

const router = useRouter();
const inputEl = ref<HTMLInputElement | null>(null);
const value = searchKeyword;
// 挂载前（SSR / 禁用 JS）不渲染输入框，仅保留 <noscript> 降级提示
const mounted = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

/** 用 Router 跳转到搜索结果页（携带关键词，空关键词则回到搜索页） */
function goSearch() {
  const q = value.value.trim();
  router.go(withBase('/search/') + (q ? `?q=${encodeURIComponent(q)}` : ''));
}

function onInput(event: Event) {
  value.value = (event.target as HTMLInputElement).value;
  if (props.navigateOnInput) {
    clearTimeout(timer);
    timer = setTimeout(goSearch, props.debounce);
  } else {
    writeKeywordToUrl();
  }
}

function onSubmit() {
  clearTimeout(timer);
  if (props.navigateOnInput) goSearch();
  else writeKeywordToUrl();
}

onMounted(() => {
  mounted.value = true;
  // 直接访问 /search/?q=xxx 或从新闻页跳转过来时，回填关键词
  syncKeywordFromUrl();
  if (props.autofocus) inputEl.value?.focus({ preventScroll: true });
});

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <form class="news-search" data-js="required" role="search" @submit.prevent="onSubmit">
    <noscript class="news-search-noscript">
      本站搜索需要启用 JavaScript。你可以使用 <a :href="withBase('/atom.xml')">RSS 订阅</a> 获取最新新闻。
    </noscript>
    <template v-if="mounted">
      <span class="news-search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        ref="inputEl"
        :value="value"
        type="search"
        name="q"
        placeholder="搜索新闻标题与正文..."
        aria-label="搜索新闻"
        autocomplete="off"
        @input="onInput"
      />
    </template>
  </form>
</template>

<style scoped lang="scss">
@use 'variables' as *;

.news-search {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 0 18px;

  // 禁用 JS 时 Vue 模板 <template v-if="mounted"> 不会渲染，此时整个
  // <form> 里只剩 <noscript> 降级提示，用 .no-js 把它的 padding 收窄成段落。
  .news-search-noscript {
    padding: 0 2px;
    font-size: 14px;
    color: $ink-2;
    text-align: center;

    a {
      color: $brand-deep;
      text-decoration: underline;
    }
  }

  .news-search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    display: flex;
    color: $ink-3;
    pointer-events: none;
    transform: translateY(-50%);

    svg {
      width: 18px;
      height: 18px;
    }
  }

  input {
    width: 100%;
    padding: 12px 18px 12px 46px;
    font-size: 15px;
    color: $ink;
    background: $card;
    border: 1px solid $line;
    border-radius: 40px;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &::placeholder {
      color: $ink-3;
    }

    &:focus {
      border-color: $brand-deep;
      box-shadow: 0 0 0 4px rgba(255, 159, 26, 0.14);
    }
  }
}

// 禁用 JS 时的搜索框降级：隐藏表单控件，只显示 <noscript> 文本
// 顶层 html 选择器 Vue scoped 不会加 data-v-xxx 前缀，仍能命中
html:not(.js) {
  .news-search {
    display: block;
    padding: 0;
    background: transparent;
    border: none;
  }

  .news-search-icon,
  .news-search input {
    display: none !important;
  }
}
</style>
