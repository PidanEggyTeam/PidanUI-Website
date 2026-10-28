// ============================================================
// 关键词片段切分（搜索结果高亮用）
//
// 用 indexOf 而不是 RegExp：用户输入 `(` `*` `[` 都不需要转义，也不会抛错；
// 返回 [{ text, hit }]，由组件渲染 <mark>，全程不碰 v-html。
// ============================================================

export interface HighlightPart {
  text: string;
  hit: boolean;
}

/** 把文本按命中的关键词切成片段（大小写不敏感，多关键词取并集） */
export function splitHighlight(text: string, terms: readonly string[]): HighlightPart[] {
  const plain: HighlightPart[] = [{ text, hit: false }];
  if (!text) return plain;

  const needles = [...new Set(terms.map((term) => term.trim().toLowerCase()).filter(Boolean))];
  if (!needles.length) return plain;

  const source = text.toLowerCase();
  const ranges: [number, number][] = [];

  for (const needle of needles) {
    let from = 0;
    for (;;) {
      const at = source.indexOf(needle, from);
      if (at < 0) break;
      ranges.push([at, at + needle.length]);
      from = at + needle.length;
    }
  }

  if (!ranges.length) return plain;

  // 合并重叠区间（多个关键词命中同一段时只算一次）
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([range[0], range[1]]);
    }
  }

  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), hit: false });
    parts.push({ text: text.slice(start, end), hit: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });

  return parts;
}
