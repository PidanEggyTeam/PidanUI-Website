import { nextTick } from 'vue';

// ============================================================
// 文章页客户端增强
//   1. [TOC] 目录：读取正文中已渲染的标题 id，生成可跳转目录
//   2. Mermaid 图表：把 mermaid 代码块交给 mermaid 渲染为 SVG
//   3. 代码块复制按钮：VitePress 只输出 <button class="copy">，自定义主题需自行接管
// 三者都依赖渲染后的真实 DOM，只能运行在浏览器端，且均为渐进增强：
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
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'neutral';
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

async function renderMermaid(): Promise<void> {
  if (!collectMermaid()) return;
  const theme = currentTheme();
  if (drawnTheme === theme) return;

  restoreMermaid();
  try {
    const mermaid = (await import('mermaid')).default;
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
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener?.('change', () => void renderMermaid());
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
  bindCopyButtons();
  bindThemeListener();
  if (routeKey !== lastRoute) {
    reset();
    lastRoute = routeKey;
  }
  await nextTick();
  fillToc();
  await renderMermaid();
}
