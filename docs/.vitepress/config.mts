import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import deflist from 'markdown-it-deflist';
import footnote from 'markdown-it-footnote';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import taskLists from 'markdown-it-task-lists';
import { createContentLoader, defineConfig, type HeadConfig } from 'vitepress';
import { SITE } from './theme/config';

// ============================================================
// 部署路径（base）
//   本官网部署于用户主页域名 pidanui.eggycore.top，根路径发布。
// ============================================================
const BASE = '/';

const SITE_TITLE = 'PidanUI';
const SITE_DESC =
  'PidanUI 是一款专为 Windows 系统打造的蛋仔风格桌面美化项目，提供主题包、Rainmeter 小组件与系统镜像。';

/** Atom feed 收录条数（对齐 hexo-generator-feed 默认 limit: 20） */
const FEED_LIMIT = 20;

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 由页面相对路径推导线上绝对地址（VitePress 默认 cleanUrls=false，非 index 页以 .html 结尾） */
function absolutePageUrl(relativePath: string): string {
  const route = relativePath.replace(/index\.md$/, '').replace(/\.md$/, '.html');
  return new URL(route, `${SITE.newsUrl}/`).href;
}

/** 站内相对 / 绝对图片地址 → 线上绝对地址（外链与 data URI 原样返回） */
function absoluteAssetUrl(src: string | undefined): string | null {
  if (!src) return null;
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith('data:')) return src;
  return new URL(src.startsWith('/') ? src : `/${src}`, `${SITE.newsUrl}/`).href;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: SITE_TITLE,
  description: SITE_DESC,
  // 将新闻列表页（docs/news/ 源目录）映射到 /posts/ URL 路径。
  // 这样：
  //   docs/news/index.md        → /posts/
  //   docs/news/page/[page].md  → /posts/page/[page].html
  // 正文文章 docs/posts/*.md 的 URL 仍为 /posts/<slug>.html，
  // 两者因形式不同（目录 vs. 具体文件）不会互相冲突。
  rewrites: {
    // 静态首页：news/index.md 的源路径映射到 posts/index.md
    'news/index.md': 'posts/index.md',
    // 动态分页：VitePress rewrites 用 path-to-regexp 风格的命名参数
    'news/page/:page.md': 'posts/page/:page.md',
  },
  head: [
    // <head> 同步脚本：在首帧渲染前把用户选择的主题写入 <html data-theme>，
    // 避免「先浅后深」的闪烁（FOUC）。storage key 与 useTheme.ts 保持一致。
    [
      'script',
      {},
      'try{var t=localStorage.getItem("pidanui-theme")||"auto";document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","auto")}',
    ],
    // <head> 同步脚本：在 DOM 解析时立即给 <html> 加 .js 标记。
    // - 浏览器禁用 JS 时：此脚本完全不执行，.js 永远不会被加上，
    //   所有 html:not(.js) { ... } 的降级 CSS 规则自动生效
    // - 启用 JS 时：.js 被加上，降级规则失效，Vue 正常接管
    ['script', {}, 'document.documentElement.classList.add("js");'],
    ['meta', { name: 'author', content: SITE.author }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'PidanUI,蛋仔派对美化,Windows美化,蛋仔风格主题,PidanUI下载,蛋仔UI,桌面美化',
      },
    ],
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${BASE}images/favicon.ico` }],
    // Atom feed 自动发现：浏览器 / RSS 阅读器可通过这个 link 自动订阅
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/atom+xml',
        title: `${SITE_TITLE} 新闻订阅`,
        href: `${BASE}atom.xml`,
      },
    ],
  ],
  base: BASE,
  cleanUrls: false,
  // Markdown 扩展：脚注 / 任务列表 / 上下标 / 高亮 / 定义列表 / 数学公式 / [TOC]。
  // 其余语法（表格、Shiki 代码高亮、标题锚点、emoji、容器等）VitePress 已内置。
  markdown: {
    // 构建期由 markdown-it-mathjax3 渲染公式为静态 SVG，无客户端运行时开销
    math: true,
    config(md) {
      md.use(footnote)
        .use(taskLists, { labelAfter: true })
        .use(sub)
        .use(sup)
        .use(mark)
        .use(deflist)
        .use((m) => {
          // [TOC] → 目录占位容器；真实目录由 usePostEnhance 在客户端按渲染后的
          // 标题 id 生成，避免与标题锚点的 slugify 规则不一致而跳转失效
          m.core.ruler.push('toc_placeholder', (state) => {
            const tokens = state.tokens;
            for (let i = 0; i < tokens.length; i++) {
              const open = tokens[i];
              const inline = tokens[i + 1];
              const close = tokens[i + 2];
              if (
                open.type === 'paragraph_open' &&
                inline?.type === 'inline' &&
                inline.content.trim() === '[TOC]' &&
                close?.type === 'paragraph_close'
              ) {
                open.type = 'html_block';
                open.tag = '';
                open.nesting = 0;
                open.content = '<div class="post-toc" data-post-toc></div>';
                open.children = [];
                tokens.splice(i + 1, 2);
              }
            }
            return true;
          });
        });
    },
  },
  // 动态路由页面标题在构建期细化，利于 SEO
  transformPageData(pageData) {
    const params = (pageData as { params?: Record<string, string> }).params;
    if (!params) return;
    const layout = pageData.frontmatter?.layout;
    if (layout === 'category' && params.category) {
      pageData.title = `分类：${params.category}`;
    } else if (layout === 'tag' && params.tag) {
      pageData.title = `标签：${params.tag}`;
    }
    if (params.page && Number(params.page) > 1) {
      pageData.title = `${pageData.title ?? SITE_TITLE} · 第 ${params.page} 页`;
    }
  },
  // 浏览器阅读模式（Firefox Reader View / Safari 阅读器）会读取 Open Graph、
  // article:* 元数据与 JSON-LD；这里为文章页补齐标题 / 作者 / 发布时间 / 封面等信息。
  transformHead({ pageData, title, description }) {
    const frontmatter = (pageData.frontmatter ?? {}) as Record<string, any>;
    const isPost = pageData.relativePath.startsWith('posts/');
    const url = absolutePageUrl(pageData.relativePath);
    const pageTitle = (isPost ? frontmatter.title : undefined) || title;

    const head: HeadConfig[] = [
      ['meta', { property: 'og:site_name', content: SITE_TITLE }],
      ['meta', { property: 'og:type', content: isPost ? 'article' : 'website' }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
    ];
    if (description) {
      head.push(['meta', { property: 'og:description', content: description }]);
      head.push(['meta', { name: 'twitter:description', content: description }]);
    }

    if (!isPost) return head;

    const published = frontmatter.date ? new Date(frontmatter.date) : null;
    const publishedISO =
      published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined;
    const cover =
      absoluteAssetUrl(frontmatter.cover) ?? absoluteAssetUrl('/images/default_cover.png');

    if (publishedISO) {
      head.push(['meta', { property: 'article:published_time', content: publishedISO }]);
    }
    head.push(['meta', { property: 'article:author', content: SITE.author }]);
    const tags: string[] = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : frontmatter.tags
        ? [frontmatter.tags]
        : [];
    for (const tag of tags) {
      head.push(['meta', { property: 'article:tag', content: tag }]);
    }
    if (cover) head.push(['meta', { property: 'og:image', content: cover }]);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: frontmatter.title ?? title,
      description: frontmatter.description ?? description ?? '',
      mainEntityOfPage: url,
      inLanguage: 'zh-CN',
      author: { '@type': 'Organization', name: SITE.author, url: SITE.mainUrl },
      publisher: {
        '@type': 'Organization',
        name: SITE.brand,
        url: SITE.mainUrl,
        logo: { '@type': 'ImageObject', url: absoluteAssetUrl('/images/logo.png') },
      },
      ...(publishedISO ? { datePublished: publishedISO, dateModified: publishedISO } : {}),
      ...(cover ? { image: [cover] } : {}),
    };
    head.push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)]);

    return head;
  },
  vite: {
    // 使用 Sass 现代 JS API（Vite 5.4+），避免 Dart Sass 2.0 移除 legacy API 后构建失败
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          // 让 .vue 里的 scoped <style lang="scss"> 也能直接
          // @use 'variables' / @use 'mixins'，无需写相对路径
          loadPaths: [fileURLToPath(new URL('./theme/styles', import.meta.url))],
        },
      },
    },
    // ------------------------------------------------------------
    // CSS 压缩目标（关键）：Vite 用 LightningCSS 压缩 CSS，
    // 若未设置 cssTarget，会按最新浏览器把媒体查询重写为范围语法
    // `width<=820px`，导致旧内核（Chrome/Edge <104、Safari/iOS <16.4）
    // 整块丢弃媒体查询、响应式失效。以下取值低于范围语法支持门槛。
    // ------------------------------------------------------------
    build: {
      cssTarget: ['chrome103', 'edge103', 'firefox101', 'safari16.3', 'ios16.3'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./theme', import.meta.url)),
      },
    },
  },
  async buildEnd(siteConfig) {
    // ----------------------------------------------------------------
    // 构建期生成 Atom feed（/atom.xml）——对齐 hexo-generator-feed 的
    // 输出格式。订阅者用 RSS 阅读器或浏览器的 feed 扩展即可收到推送。
    // 说明：由于本站与 newsUrl 同域，atom.xml 被写到 outDir 根目录。
    // ----------------------------------------------------------------
    const posts = await createContentLoader('posts/*.md', { render: true }).load();

    const entries = posts
      .map((post) => ({
        url: post.url,
        html: post.html ?? '',
        frontmatter: post.frontmatter as Record<string, any>,
      }))
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
      .slice(0, FEED_LIMIT);

    const absolute = (route: string) => new URL(route, SITE.newsUrl).href;
    const updated = entries[0]
      ? new Date(entries[0].frontmatter.date).toISOString()
      : new Date().toISOString();

    const items = entries
      .map((entry) => {
        const link = absolute(entry.url);
        const lines = [
          '  <entry>',
          `    <title>${xmlEscape(entry.frontmatter.title)}</title>`,
          `    <link href="${xmlEscape(link)}" />`,
          `    <id>${xmlEscape(link)}</id>`,
          `    <updated>${new Date(entry.frontmatter.date).toISOString()}</updated>`,
        ];
        if (entry.frontmatter.description) {
          lines.push(`    <summary>${xmlEscape(entry.frontmatter.description)}</summary>`);
        }
        lines.push(`    <content type="html">${xmlEscape(entry.html)}</content>`);
        lines.push('  </entry>');
        return lines.join('\n');
      })
      .join('\n');

    const feed = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom">',
      `  <title>${xmlEscape(SITE_TITLE)}</title>`,
      `  <subtitle>${xmlEscape(SITE_DESC)}</subtitle>`,
      `  <link href="${xmlEscape(absolute('/atom.xml'))}" rel="self" />`,
      `  <link href="${xmlEscape(SITE.newsUrl)}" />`,
      `  <id>${xmlEscape(SITE.newsUrl)}</id>`,
      `  <updated>${updated}</updated>`,
      `  <author><name>${xmlEscape(SITE.author)}</name></author>`,
      `  <icon>${xmlEscape(absolute('/images/logo.png'))}</icon>`,
      items,
      '</feed>',
      '',
    ].join('\n');

    fs.writeFileSync(path.join(siteConfig.outDir, 'atom.xml'), feed, 'utf-8');
  },
});
