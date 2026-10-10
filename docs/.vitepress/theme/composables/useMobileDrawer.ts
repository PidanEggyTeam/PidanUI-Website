import { ref } from 'vue';

export type MobileDrawer = 'left' | 'right';

export const activeMobileDrawer = ref<MobileDrawer | null>(null);

function setScrollLock(lock: boolean): void {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = lock ? 'hidden' : '';
}

export function toggleMobileDrawer(drawer: MobileDrawer): void {
  if (activeMobileDrawer.value === drawer) {
    closeMobileDrawer();
    return;
  }

  activeMobileDrawer.value = drawer;
  setScrollLock(true);
}

export function closeMobileDrawer(): void {
  activeMobileDrawer.value = null;
  setScrollLock(false);
}
