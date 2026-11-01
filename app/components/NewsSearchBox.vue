<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { searchKeyword, syncKeywordFromUrl, writeKeywordToUrl } from '~/composables/useSearch';

/**
 * 全站共享的新闻搜索框。
 * - 搜索对话框与 /search/ 直达页共用关键词并即时过滤
 * - 输入只用 replaceState 同步当前地址栏，不触发路由重建
 * - 禁用 JavaScript 时显示降级提示（由 CSS 依据 <html> 上的 .js 标记控制显隐）
 */
const props = withDefaults(defineProps<{ autofocus?: boolean }>(), { autofocus: false });

const inputEl = ref<HTMLInputElement | null>(null);
const value = searchKeyword;
// 挂载前（SSR / 禁用 JS）不渲染输入框，仅保留降级提示
const mounted = ref(false);

function onInput(event: Event) {
  value.value = (event.target as HTMLInputElement).value;
  writeKeywordToUrl();
}

function onSubmit() {
  writeKeywordToUrl();
}

onMounted(() => {
  mounted.value = true;
  // 直接访问 /search/?q=xxx 或打开带 ?q= 的搜索对话框时，回填关键词
  syncKeywordFromUrl();
  if (props.autofocus) inputEl.value?.focus({ preventScroll: true });
});
</script>

<template>
  <form
    class="relative mb-[18px] flex items-center"
    data-js="required"
    role="search"
    @submit.prevent="onSubmit"
  >
    <!-- 降级提示：用普通元素而非 <noscript>。
         <noscript> 在 JS 启用时会被浏览器按「原始文本」解析，其内部标签不会成为
         真实节点，与 SSR 输出的 DOM 结构不一致，从而触发
         "Hydration completed but contains mismatches"。改为普通 <p> 后
         SSR 与客户端结构一致，再由 CSS 依据 <html> 的 .js 标记控制显隐。 -->
    <p class="news-search-noscript hidden w-full px-0.5 text-center text-sm text-toned">
      本站搜索需要启用 JavaScript。你可以使用
      <a class="text-brand-600 underline" :href="withBase('/atom.xml')">RSS 订阅</a> 获取最新新闻。
    </p>
    <template v-if="mounted">
      <UIcon
        name="i-lucide-search"
        class="pointer-events-none absolute top-1/2 left-[18px] -translate-y-1/2 text-dimmed"
        aria-hidden="true"
      />
      <input
        ref="inputEl"
        :value="value"
        type="search"
        name="q"
        placeholder="搜索新闻标题与正文..."
        aria-label="搜索新闻"
        autocomplete="off"
        class="w-full rounded-full border border-default bg-default py-3 pr-[18px] pl-[46px] text-[15px] text-default outline-none transition-[border-color,box-shadow] placeholder:text-dimmed focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(255,159,26,0.14)]"
        @input="onInput"
      />
    </template>
  </form>
</template>
