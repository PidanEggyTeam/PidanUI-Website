<script setup lang="ts">
// ============================================================
// 自定义 ProsePre：代码块顶部信息栏
//   <div class="code-block language-x">
//     <div class="code-head">   ← sticky，语言标签在栏内（不再是左上角角标）
//       <span class="lang">x</span>
//       <button class="copy" />
//     </div>
//     <pre class="shiki">…</pre>
//   </div>
//
// 保留 .copy 类名与 div[class*="language-"] 外层，usePostEnhance 里的复制逻辑
// （按 button.copy + div[class*="language-"] pre code 取文本）无需改动。
// ============================================================
const props = defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  class?: string | null;
}>();

/** text / plaintext 视为「无语言」：信息栏只留复制按钮 */
const lang = computed(() => {
  const value = props.language ?? '';
  return value === 'text' || value === 'plaintext' ? '' : value;
});

/** 语言展示名：常用缩写归一为大写全称 */
const langLabel = computed(() => {
  if (!lang.value) return '';
  const alias: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    md: 'markdown',
    sh: 'shell',
    yml: 'yaml',
  };
  return (alias[lang.value] ?? lang.value).toUpperCase();
});
</script>

<template>
  <div :class="['code-block', `language-${lang || 'text'}`]">
    <div class="code-head">
      <span class="lang">{{ langLabel }}</span>
      <button class="copy" type="button" title="复制代码" aria-label="复制代码"></button>
    </div>
    <pre :class="props.class"><slot /></pre>
  </div>
</template>
