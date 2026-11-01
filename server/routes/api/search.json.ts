import { queryCollection } from '@nuxt/content/server';
import { byDateDesc, toBasePost } from '#shared/utils/post';
import { mdcToText } from '#shared/utils/mdc';

// 本地检索语料：构建期查询全部文章 → 纯文本正文（截断 3000 字）
// 该路由会被预渲染成 /api/search.json，客户端只在打开搜索时按需拉取。
const CONTENT_LIMIT = 3000;

export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, 'posts').all();

  return docs
    .map((doc) => ({
      ...toBasePost(doc as never),
      content: mdcToText(doc.body as never)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, CONTENT_LIMIT),
    }))
    .sort(byDateDesc);
});
