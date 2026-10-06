import { nextTick } from 'vue';
import { initTheme, onThemeChange, resolvedDark } from './useTheme';
import { prefersReducedMotion, revealPassed } from './useScrollReveal';

// ============================================================
// 文章页客户端增强
//   1. [TOC] 目录：读取正文中已渲染的标题 id，生成可跳转目录
//   2. 页内锚点滚动：目录 / 脚注 / 标题锚点跳转时滚动 .site-main
//   3. Mermaid 图表：把 mermaid 代码块交给 mermaid 渲染为 SVG
//      （mermaid 体积约 4MB 且含大量图表引擎 chunk，若参与打包会让构建时间
//        增加 5~6 倍，故改为运行时按需从 CDN 加载，见下方 loadMermaid）
//   4. 代码块复制按钮：VitePress 只输出 <button class="copy">，自定义主题需自行接管
// 滚动淡入见 useScrollReveal.ts（由 Layout 统一驱动，这里只消费其 revealPassed）。
// 以上均依赖渲染后的真实 DOM，只能运行在浏览器端，且都是渐进增强：
// 禁用 JS 时正文（含 mermaid 源码、目录占位）仍可正常阅读。
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
function fillToc(): void {
  if (typeof document === 'undefined') return;
  const placeholders = document.querySelectorAll<HTMLElement>('[data-post-toc]');
  if (!placeholders.length) return;

  const content = document.querySelector('.post-content');
  if (!content) return;

  const headings = Array.from(content.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
  const list = document.createElement('ul');
  list.className = 'post-toc-list';

  for (const heading of headings) {
    const text = (heading.textContent ?? '').replace(/\u200b/g, '').trim();
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
// 本站把 .site-main 作为唯一纵向滚动容器（body 设了 overflow:hidden）。而
// VitePress 内置的锚点跳转走的是 window.scrollTo（见其 client/app/router.js
// 的 scrollTo），window 在本布局下不可滚动，于是目录 / 脚注 / 标题锚点点击后
// 只会更新 hash、页面纹丝不动。这里接管：把目标滚到 .site-main 顶部。
const ANCHOR_OFFSET = 20; // 与 .post-content 内标题的 scroll-margin-top 保持一致
const SETTLE_WINDOW = 2000; // 跳转后多少毫秒内，仍对迟到布局变化做重新对齐

let anchorBound = false;
let settleObserver: ResizeObserver | null = null;
let settleHash = '';
let settleDeadline = 0;

/** 把 hash 指向的元素滚到滚动容器顶部（含偏移）；返回是否成功定位到目标 */
function alignToAnchor(hash: string, smooth: boolean): boolean {
  if (typeof document === 'undefined' || !hash || hash === '#') return false;
  const scroller = document.querySelector<HTMLElement>('.site-main');
  if (!scroller) return false;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // 非法百分号编码时按原样查找
  }
  const target = document.getElementById(id);
  if (!target) return false;
  const top =
    target.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop -
    ANCHOR_OFFSET;
  const behavior = smooth && !prefersReducedMotion() ? 'smooth' : 'auto';
  scroller.scrollTo({ top: Math.max(0, top), behavior });
  // 瞬时定位会直接跳过中间内容，这些块没经过视口，需要立即补齐
  if (behavior === 'auto') revealPassed();
  return true;
}

/**
 * 跳转后的一小段时间内，若正文高度仍有变化（Mermaid 图表、图片等迟到布局），
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
  // VitePress 在 window 的捕获阶段已 preventDefault 并 pushState，这里只需补滚动
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    scrollToAnchor(link.getAttribute('href') ?? '');
  });
  // VitePress 更新 hash 后会派发合成的 hashchange；同时也覆盖浏览器前进/后退
  window.addEventListener('hashchange', () => scrollToAnchor(window.location.hash));
}

// ---- Mermaid 图表 ----
interface MermaidEntry {
  el: HTMLElement;
  source: string;
}

let entries: MermaidEntry[] = [];
let drawnTheme: string | null = null;
let lastRoute = '';
let themeBound = false;

function currentTheme(): string {
  // 读取 useTheme 的解析结果：auto 时取系统偏好，手动切换时取用户选择
  return resolvedDark.value ? 'dark' : 'neutral';
}

/** 首次调用：把 shiki 渲染的 mermaid 代码块替换为纯文本容器，并缓存源码 */
function collectMermaid(): boolean {
  if (entries.length) return true;
  const blocks = Array.from(
    document.querySelectorAll<HTMLElement>('.post-content div.language-mermaid'),
  );
  entries = blocks.map((block) => {
    const source = block.querySelector('code')?.textContent ?? '';
    const holder = document.createElement('div');
    holder.className = 'mermaid-holder';
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = source;
    holder.appendChild(pre);
    block.replaceWith(holder);
    return { el: pre, source };
  });
  return entries.length > 0;
}

/** 还原源码（主题切换后需要重绘） */
function restoreMermaid(): void {
  for (const entry of entries) {
    const holder = entry.el.parentElement;
    holder?.classList.remove('mermaid-rendered');
    const pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = entry.source;
    entry.el.replaceWith(pre);
    entry.el = pre;
  }
}

// ---- Mermaid 运行时按需加载（走 CDN，不参与打包）----
// 版本需与 package.json 保持一致；按顺序尝试多个 CDN，全部失败则降级保留源码文本。
const MERMAID_VERSION = '12.1.0';
const MERMAID_CDNS = [
  `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`,
  `https://unpkg.com/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`,
];

interface MermaidApi {
  initialize(config: Record<string, unknown>): void;
  run(options: { nodes: HTMLElement[] }): Promise<void>;
}

let mermaidPromise: Promise<MermaidApi> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
}

async function loadMermaid(): Promise<MermaidApi> {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = (async () => {
    const injected = (window as unknown as { mermaid?: MermaidApi }).mermaid;
    if (injected) return injected;
    let lastError: unknown;
    for (const src of MERMAID_CDNS) {
      try {
        await loadScript(src);
        const api = (window as unknown as { mermaid?: MermaidApi }).mermaid;
        if (api) return api;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error('Mermaid CDN unavailable');
  })();
  // 加载失败时清空缓存，允许后续（如网络恢复）再次尝试
  mermaidPromise.catch(() => {
    mermaidPromise = null;
  });
  return mermaidPromise;
}

async function renderMermaid(): Promise<void> {
  if (!collectMermaid()) return;
  const theme = currentTheme();
  if (drawnTheme === theme) return;

  restoreMermaid();
  try {
    const mermaid = await loadMermaid();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme,
      fontFamily: 'inherit',
    });
    await mermaid.run({ nodes: entries.map((entry) => entry.el) });
    // 渲染成功后 svg 会写进 <pre>，用类名让样式切换为正常换行
    for (const entry of entries) entry.el.parentElement?.classList.add('mermaid-rendered');
    drawnTheme = theme;
  } catch {
    // 渲染失败时保留源码文本，不影响阅读
  }
}

function bindThemeListener(): void {
  if (themeBound || typeof window === 'undefined') return;
  themeBound = true;
  // 跟随全局主题（含手动切换）：主题变化后重绘 Mermaid
  onThemeChange(() => void renderMermaid());
}

/** 重置缓存（SPA 换页后 DOM 已重建） */
function reset(): void {
  entries = [];
  drawnTheme = null;
}

/**
 * 文章页挂载 / 路由切换后调用。
 * @param routeKey 当前文章标识（如 page.relativePath），变化时重置内部缓存
 */
export async function enhancePost(routeKey: string): Promise<void> {
  if (typeof document === 'undefined') return;
  initTheme();
  bindCopyButtons();
  bindAnchorScroll();
  bindThemeListener();
  if (routeKey !== lastRoute) {
    reset();
    lastRoute = routeKey;
  }
  await nextTick();
  fillToc();
  // 直接带 hash 打开页面时先瞬时定位到锚点（VitePress 的 window.scrollTo 在本布局无效）。
  // 滚动淡入由 Layout 统一驱动（useScrollReveal），瞬时跳过的块它会自动补齐。
  scrollToAnchor(window.location.hash, false);
  await renderMermaid();
  // Mermaid 渲染完成后图表会变高，把锚点目标整体顶下去，这里再校正一次位置
  scrollToAnchor(window.location.hash, false);
}
