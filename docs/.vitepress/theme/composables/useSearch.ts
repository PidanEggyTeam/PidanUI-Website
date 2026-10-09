import { ref } from 'vue';

/**
 * 全站共享的新闻搜索关键词。
 *
 * 搜索对话框与 /search/ 直达页通过这份模块级状态共享关键词。
 */
export const searchKeyword = ref('');
export const searchDialogOpen = ref(false);

let searchDialogOpener: HTMLElement | null = null;

export function openSearchDialog(opener?: HTMLElement): void {
  if (!searchDialogOpen.value && typeof document !== 'undefined') {
    searchDialogOpener = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  }
  searchDialogOpen.value = true;
}

export function closeSearchDialog(): void {
  searchDialogOpen.value = false;
}

export function clearSearchKeyword(): void {
  searchKeyword.value = '';
  writeKeywordToUrl();
}

export function restoreSearchDialogFocus(): void {
  const opener = searchDialogOpener;
  searchDialogOpener = null;
  if (opener?.isConnected) opener.focus({ preventScroll: true });
}

/** 从地址栏 ?q= 同步关键词（仅浏览器端生效；无该参数时清空） */
export function syncKeywordFromUrl(): void {
  if (typeof window === 'undefined') return;
  searchKeyword.value = new URLSearchParams(window.location.search).get('q') ?? '';
}

/**
 * 把关键词写回当前地址栏的 ?q= 参数，不触发路由跳转。
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