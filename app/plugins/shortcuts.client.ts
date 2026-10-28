import { openSearchDialog, searchDialogOpen } from '~/composables/useSearch';

// ============================================================
// 全站快捷键：Ctrl / ⌘ + K 打开搜索
// ------------------------------------------------------------
// 「/」已移除：中文输入法下与顿号 / 斜杠键入冲突，也常和浏览器的
// 「快速查找」抢键。Ctrl/⌘+K 是编辑器与文档站的通行约定。
// 不劫持的情况：
//   - 输入法组合中（isComposing），避免中文输入把 k 当快捷键
//   - 按着 Alt / Shift：留给浏览器与系统自己的组合键
// 故意的：**不排除输入框内**。用户在任何位置按 Ctrl+K 都想唤起搜索，
// 弹窗打开后由 NewsSearchBox 的 autofocus 接管焦点。
// ============================================================
export default defineNuxtPlugin(() => {
  function onKeydown(event: KeyboardEvent): void {
    if (event.isComposing || event.altKey || event.shiftKey) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() !== 'k') return;
    // 抢在 Chrome「聚焦地址栏」之前
    event.preventDefault();
    if (!searchDialogOpen.value) openSearchDialog();
  }

  document.addEventListener('keydown', onKeydown);
});
