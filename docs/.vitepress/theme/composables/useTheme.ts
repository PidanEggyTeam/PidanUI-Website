import { computed, ref } from 'vue';

// ============================================================
// 主题模式（浅色 / 深色 / 跟随系统）
//
// 通过 <html data-theme> 驱动（见 styles/_base.scss），并用 localStorage
// 持久化用户选择。auto 模式仍走 prefers-color-scheme 跟随系统。
// 首帧防闪烁由 config.mts 的 <head> 内联脚本负责读取同一 storage key。
// ============================================================

export type ThemeMode = 'auto' | 'light' | 'dark';

/** 循环切换顺序 */
export const THEME_MODES: ThemeMode[] = ['auto', 'light', 'dark'];

/** 与 config.mts 内联脚本保持一致 */
const STORAGE_KEY = 'pidanui-theme';

function readStored(): ThemeMode {
  // SSR / Node 环境没有 window，直接回退 auto（同时避免触碰 Node 的 localStorage 警告）
  if (typeof window === 'undefined') return 'auto';
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'auto') return value;
  } catch {
    // localStorage 不可用（隐私模式 / 禁用 Cookie）时回退 auto
  }
  return 'auto';
}

const mode = ref<ThemeMode>(readStored());
const systemDark = ref(false);

/** 当前实际是否为深色（auto 时取系统偏好） */
export const resolvedDark = computed(
  () => mode.value === 'dark' || (mode.value === 'auto' && systemDark.value),
);

type ThemeListener = (dark: boolean) => void;
const listeners = new Set<ThemeListener>();
let bound = false;

function apply(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode.value);
  const dark = resolvedDark.value;
  for (const listener of listeners) listener(dark);
}

function bindSystem(): void {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.value = query.matches;
  query.addEventListener?.('change', (event) => {
    systemDark.value = event.matches;
    // 仅 auto 模式需要响应系统变化，但统一 apply 可让监听者拿到最新值
    apply();
  });
}

/** 初始化：绑定系统监听并落地当前主题（幂等，可在任意组件 setup 调用） */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  bindSystem();
  apply();
}

export function setThemeMode(next: ThemeMode): void {
  mode.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 持久化失败不影响本次切换
  }
  apply();
}

/** 三态循环：auto → light → dark → auto */
export function cycleThemeMode(): void {
  const index = THEME_MODES.indexOf(mode.value);
  setThemeMode(THEME_MODES[(index + 1) % THEME_MODES.length]);
}

/** 订阅主题变化（返回取消订阅函数），供 Mermaid / Giscus 等第三方渲染同步 */
export function onThemeChange(listener: ThemeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  initTheme();
  return {
    mode,
    resolvedDark,
    setMode: setThemeMode,
    cycle: cycleThemeMode,
  };
}
