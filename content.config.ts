import { defineCollection, defineContentConfig, z } from '@nuxt/content';

// ============================================================
// 内容集合：文章
//   - 源文件在 content/posts/*.md（唯一内容源）
//   - path 由「prefix + 去掉 include 静态前缀的相对路径」得到 → /posts/<slug>
//   - 分类 / 标签不是 content 文档：它们是文章 frontmatter 上的字段，
//     由前端过滤生成列表页（与迁移前的做法一致）
// ============================================================
export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'posts/*.md',
      schema: z.object({
        title: z.string(),
        // YAML 1.2 不会把 `2026-10-20 22:00:00` 解析成 Date，统一按字符串接收，
        // 再由 shared/utils/date.ts 的 parsePostDate() 显式按 UTC 解释
        date: z.string(),
        description: z.string().optional(),
        // 文章作者：frontmatter 未定义时由 toBasePost / usePostSeo 回退到 SITE.author
        author: z.string().optional(),
        cover: z.string().optional(),
        categories: z.array(z.string()).default(() => []),
        tags: z.array(z.string()).default(() => []),
        stickypost: z.boolean().default(false),
      }),
    }),
  },
});
