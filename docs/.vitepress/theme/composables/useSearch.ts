import { ref } from 'vue';

/**
 * 全站共享的新闻搜索关键词。
 *
 * 新闻页顶部与搜索页共用同一个搜索框组件（NewsSearchBox），二者通过这份
 * 模块级状态同步，从而避免「在搜索页输入时再次 router.go 到同一路径」
 * 造成的组件重建与输入框失焦。
 */
export const searchKeyword = ref('');

/** 从地址栏 ?q= 同步关键词（仅浏览器端生效；无该参数时清空） */
export function syncKeywordFromUrl(): void {
  if (typeof window === 'undefined') return;
  searchKeyword.value = new URLSearchParams(window.location.search).get('q') ?? '';
}

/**
 * 把关键词写回地址栏，保持 /search/?q= 的链接契约。
 * 使用 replaceState：不产生历史记录、不触发路由跳转，输入框不会失焦。
 */
export function writeKeywordToUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const q = searchKeyword.value.trim();
  if (q) url.searchParams.set('q', q);
  else url.searchParams.delete('q');
  window.history.replaceState(null, '', url);
}