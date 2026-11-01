import { nextTick } from 'vue';
import { initTheme } from './useTheme';

// ============================================================
// 文章页客户端增强（均已去掉 Mermaid）
//   1. [TOC] 目录：把正文里的 [TOC] 段落换成占位容器，再用标题 id 生成目录
//   2. 页内锚点滚动：目录 / 脚注 / 标题锚点跳转时滚到目标位置
//   3. 代码块复制按钮：Markdown 渲染器只输出 <button class="copy">，需自行接管
// 以上均依赖渲染后的真实 DOM，只能运行在浏览器端，且都是渐进增强：
// 禁用 JS 时正文（含 [TOC] 字面文本）仍可正常阅读。
// ============================================================

// ---- 代码块复制（全站只注册一次） ----
let copyBound = false;

function bindCopyButtons(): void {
  if (copyBound || typeof document === 'undefined') return;
  copyBound = true;
  document.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('button.copy');
    if (!button) return;
    const code = button.closest('div[class*="language-"]')?.querySelector('pre code');
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      button.classList.add('copied');
      window.setTimeout(() => button.classList.remove('copied'), 1600);
    } catch {
      // 剪贴板不可用（非安全上下文 / 无权限）时静默降级
    }
  });
}

// ---- [TOC] 目录 ----

/**
 * `[TOC]` 在 Markdown 里只是一段普通文本（MDC 不允许内联裸 HTML），
 * 这里在客户端把它换成占位容器，再统一填充目录。
 * 刻意「不自动生成」：只有作者显式写了 [TOC] 的文章才出目录，
 * 避免短文章被塞一块没有信息量的目录。
 */
function mountTocPlaceholder(): void {
  if (typeof document === 'undefined') return;
  const content = document.querySelector('.post-content');
  if (!content) return;

  for (const paragraph of Array.from(content.querySelectorAll<HTMLParagraphElement>('p'))) {
    if (paragraph.textContent?.trim() !== '[TOC]') continue;
    const box = document.createElement('div');
    box.className = 'post-toc';
    box.dataset.postToc = '';
    paragraph.replaceWith(box);
  }
}

function fillToc(): void {
  if (typeof document === 'undefined') return;

  mountTocPlaceholder();

  const placeholders = document.querySelectorAll<HTMLElement>('[data-post-toc]');
  if (!placeholders.length) return;

  const content = document.querySelector('.post-content');
  if (!content) return;

  const headings = Array.from(content.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
  const list = document.createElement('ul');
  list.className = 'post-toc-list';

  for (const heading of headings) {
    // 标题里现在多了一个空的 .header-anchor，取文本时排除它
    const clone = heading.cloneNode(true) as HTMLElement;
    clone.querySelector('.header-anchor')?.remove();
    const text = (clone.textContent ?? '').replace(/\u200b/g, '').trim();
    if (!text) continue;
    const item = document.createElement('li');
    item.className = `post-toc-item level-${heading.tagName.slice(1)}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = text;
    item.appendChild(link);
    list.appendChild(item);
  }

  for (const placeholder of placeholders) {
    placeholder.replaceChildren(list.cloneNode(true));
  }
}

// ---- 页内锚点滚动 ----
// 自定义滚动容器已移除，滚动权在 window。这里仍然接管锚点，原因不是滚动
// 目标，而是「时机」：跨页 hash 跳转时目标 DOM 可能还没渲染出来，需要有
// 一个在 page:finish 之后执行的钩子来兜底对齐。
// 偏移量交给 CSS 的 scroll-margin-top（见 prose.css），与 html 的
// scroll-padding-top 同源，避免 JS / CSS 两处各写一个魔法数字。

/** 尊重系统「减少动态效果」：为 true 时不使用平滑滚动 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
const SETTLE_WINDOW = 2000; // 跳转后多少毫秒内，仍对迟到布局变化做重新对齐

let anchorBound = false;
/** 自建 hash 跳转后的抑制窗口：避免 replaceState/默认跳转引发二次滚动 */
let suppressHashChangeUntil = 0;
let settleObserver: ResizeObserver | null = null;
let settleHash = '';
let settleDeadline = 0;

/** 把 hash 指向的元素滚到滚动容器顶部（含偏移）；返回是否成功定位到目标 */
function alignToAnchor(hash: string, smooth: boolean): boolean {
  if (typeof document === 'undefined' || !hash || hash === '#') return false;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // 非法百分号编码时按原样查找
  }
  const target = document.getElementById(id);
  if (!target) return false;
  const behavior = smooth && !prefersReducedMotion() ? 'smooth' : 'auto';
  // 纵向偏移由目标元素的 scroll-margin-top 提供（顶栏高度 + 呼吸空间）
  target.scrollIntoView({ behavior, block: 'start' });
  return true;
}

/**
 * 跳转后的一小段时间内，若正文高度仍有变化（图片等迟到布局），
 * 目标会被顶偏，这里重新对齐一次。
 * 用 ResizeObserver 而不是定时器：只在正文尺寸真的变化时触发，
 * 因此不会干扰用户自己的滚动。
 */
function watchAnchorSettle(hash: string): void {
  settleObserver?.disconnect();
  settleObserver = null;
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
  const root = document.querySelector<HTMLElement>('.post-content');
  if (!root) return;
  settleHash = hash;
  settleDeadline = Date.now() + SETTLE_WINDOW;
  let lastHeight = root.offsetHeight;
  const observer = new ResizeObserver(() => {
    const height = root.offsetHeight;
    if (height === lastHeight) return;
    lastHeight = height;
    if (Date.now() > settleDeadline) {
      observer.disconnect();
      return;
    }
    alignToAnchor(settleHash, false);
  });
  settleObserver = observer;
  observer.observe(root);
}

function scrollToAnchor(hash: string, smooth = true): void {
  if (!alignToAnchor(hash, smooth)) return;
  watchAnchorSettle(hash);
}

function bindAnchorScroll(): void {
  if (anchorBound || typeof window === 'undefined') return;
  anchorBound = true;
  // 目录 / 标题锚点 / 脚注：拦截点击，自己滚
  document.addEventListener('click', (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href') ?? '';
    if (!hash || hash === '#') return;

    // 先挡掉浏览器默认的 hash 跳转：它会把滚动容器直接对到元素顶部（无偏移），
    // 紧接着我们按固定偏移再滚一次，两次叠加就是「内容容器整体偏移」。
    event.preventDefault();
    suppressHashChangeUntil = performance.now() + 150;
    try {
      // 必须带上 router 的 state：裸 replaceState 会把它整块覆盖，
      // vue-router 之后读不到自己写入的 position/scroll 信息（R0121 警告）
      history.replaceState({ ...history.state }, '', hash);
    } catch {
      // history 不可用时仍继续手动滚动
    }
    scrollToAnchor(hash);
  });
  // 浏览器前进 / 后退改变 hash 时（跳过我们自己 replaceState 引起的那次）
  window.addEventListener('hashchange', () => {
    if (performance.now() < suppressHashChangeUntil) return;
    scrollToAnchor(window.location.hash);
  });
  // 跨页带 hash 的导航：vue-router 不会派发 hashchange，由 layout 的 page:finish 转发
  document.addEventListener('pidan:anchor', (event) => {
    const hash = (event as CustomEvent<string>).detail ?? '';
    scrollToAnchor(hash, false);
  });
}

/**
 * 文章页挂载 / 路由切换后调用。
 * @param routeKey 当前文章标识（如 route.path）；内部状态都是查询 DOM 得到的，
 *                 换页后重新扫描即可，不需要按 routeKey 做缓存
 */
export async function enhancePost(_routeKey: string): Promise<void> {
  if (typeof document === 'undefined') return;
  initTheme();
  bindCopyButtons();
  bindAnchorScroll();
  await nextTick();
  fillToc();
  // 直接带 hash 打开页面时先瞬时定位到锚点
  scrollToAnchor(window.location.hash, false);
}
