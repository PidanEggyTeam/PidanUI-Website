// ============================================================
// 全站滚动淡入
//   元素进入视口时淡入上移。
// 纯渐进增强：禁用 JS / 不支持 IntersectionObserver / 开启了系统级
// 「减少动态效果」时完全不介入，元素保持默认可见。
// ============================================================

/** 是否开启了系统级「减少动态效果」 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** 需要淡入的「块级元素容器」 */
interface RevealGroup {
  /** 容器选择器 */
  selector: string;
  /** 是否向下穿透 VitePress 的 wrapper，取真正承载块级元素的容器 */
  drill?: boolean;
  /** 子项的逐个延迟（毫秒），用于卡片网格的错落感 */
  stagger?: number;
}

const REVEAL_GROUPS: RevealGroup[] = [
  { selector: '.post-content', drill: true }, // 文章正文
  { selector: '.card-grid', stagger: 45 }, // 列表页卡片
  { selector: '.feature-grid', stagger: 45 }, // 首页特性卡
  { selector: '.accordion', stagger: 45 }, // 下载页版本条目
  { selector: '.post-list', stagger: 30 }, // 归档时间轴
  { selector: '.term-grid', stagger: 40 }, // 分类索引卡片
  { selector: '.about-layout', drill: true, stagger: 40 }, // 关于页卡片（外层还有 main.about-main）
];

/** 容器选择器合集：容器本身不参与淡入，交给它的子项，避免嵌套时双重动画 */
const GROUP_SELECTOR = REVEAL_GROUPS.map((group) => group.selector).join(',');

/**
 * 正文块级元素的容器。
 * VitePress 的 <Content /> 会把渲染结果包进若干层无 class 的 wrapper
 * （实测为 .post-content > div[style] > div > 各块级元素），
 * 直接取 .post-content 的 children 只会拿到 wrapper，导致整篇一起淡入。
 * 这里向下穿透 wrapper，直到当前层直接包含正文块级元素为止。
 */
const BLOCK_TAGS = new Set([
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'P',
  'UL',
  'OL',
  'DL',
  'PRE',
  'TABLE',
  'BLOCKQUOTE',
  'HR',
  'FIGURE',
  'DETAILS',
]);

function hasBlockChild(node: HTMLElement): boolean {
  return Array.from(node.children).some(
    (el) => BLOCK_TAGS.has(el.tagName) || (el as HTMLElement).classList.contains('post-toc'),
  );
}

function resolveBlockContainer(root: HTMLElement): HTMLElement {
  let node = root;
  while (!hasBlockChild(node) && node.children.length === 1) {
    node = node.children[0] as HTMLElement;
  }
  return node;
}

let observer: IntersectionObserver | null = null;
/** 尚未淡入的块（供瞬时跳转后补齐，见 revealPassed） */
let pending: HTMLElement[] = [];
let scrollBound = false;
let safetyTimer: number | null = null;

/**
 * 滚动兜底：任何方式「跳过」中间内容（瞬时锚点定位、浏览器滚动恢复等）都可能
 * 让一批块停在 opacity: 0。IntersectionObserver 只在相交状态变化时回调，管不到
 * 这种情况，因此在滚动容器上再挂一个节流检查（约 120ms 一次，无待显示块时几乎零开销）。
 */
function bindScrollSafety(): void {
  if (scrollBound || typeof window === 'undefined') return;
  const scroller = document.querySelector<HTMLElement>('.site-main');
  if (!scroller) return;
  scrollBound = true;
  scroller.addEventListener(
    'scroll',
    () => {
      if (safetyTimer !== null) return;
      safetyTimer = window.setTimeout(() => {
        safetyTimer = null;
        revealPassed();
      }, 120);
    },
    { passive: true },
  );
}

/** 收集所有需要淡入的块（去重，同一元素只处理一次） */
function collectBlocks(): HTMLElement[] {
  const blocks: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  for (const group of REVEAL_GROUPS) {
    for (const root of Array.from(document.querySelectorAll<HTMLElement>(group.selector))) {
      const container = group.drill ? resolveBlockContainer(root) : root;
      let index = 0;
      for (const child of Array.from(container.children)) {
        if (!(child instanceof HTMLElement) || child.offsetHeight <= 0) continue;
        if (seen.has(child)) continue;
        // 容器本身保持可见，动画交给它的子项（避免「父先淡入、子再淡入」的套娃效果）
        if (child.matches(GROUP_SELECTOR)) continue;
        seen.add(child);
        if (group.stagger) {
          // 卡片网格做轻微错落；上限 5 档，避免长列表越滚越慢
          child.style.transitionDelay = `${Math.min(index, 5) * group.stagger}ms`;
        }
        index += 1;
        blocks.push(child);
      }
    }
  }
  return blocks;
}

/**
 * 挂载滚动淡入（每次路由切换后调用，会重置上一页的观察状态）。
 * 首屏内的元素在同一帧内直接标记为已显示（最终样式与初始一致，不会触发过渡），
 * 因此不会有「加载后闪一下再动画」的问题。
 */
export function setupScrollReveal(): void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
  observer?.disconnect();
  observer = null;
  pending = [];
  if (prefersReducedMotion()) return;

  const scroller = document.querySelector<HTMLElement>('.site-main');
  if (!scroller) return;
  bindScrollSafety();

  const blocks = collectBlocks();
  if (!blocks.length) return;

  const viewportBottom = scroller.getBoundingClientRect().bottom;
  const current = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        current.unobserve(entry.target);
      }
    },
    { root: scroller, rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  observer = current;

  for (const block of blocks) {
    block.classList.add('reveal');
    if (block.getBoundingClientRect().top < viewportBottom) {
      block.classList.add('is-revealed');
    } else {
      pending.push(block);
      current.observe(block);
    }
  }
}

/**
 * 补齐「已经被滚过、但没经过视口」的块。
 * 瞬时定位（初载带 hash、以及布局变化后的校正）会让视口直接跳过去，
 * 中间的块从未与视口相交，IntersectionObserver 不会回调，于是会一直停在
 * opacity: 0。这里把位于视口上方（或已进入视口）的待显示块直接标记为可见。
 */
export function revealPassed(): void {
  if (!pending.length) return;
  const scroller = document.querySelector<HTMLElement>('.site-main');
  if (!scroller) return;
  const viewportBottom = scroller.getBoundingClientRect().bottom;
  const rest: HTMLElement[] = [];
  for (const block of pending) {
    if (block.getBoundingClientRect().top < viewportBottom) {
      block.classList.add('is-revealed');
      observer?.unobserve(block);
    } else {
      rest.push(block);
    }
  }
  pending = rest;
}
