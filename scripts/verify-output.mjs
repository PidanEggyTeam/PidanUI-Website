/**
 * 产物级断言（与 OpenPidanUI 官网同款思路）。
 *
 * `prerender.failOnError: true` 只能抓「枚举了但渲染报错」，抓不到「该枚举却漏了」——
 * 漏页在线上就是 404，而构建会显示成功。所以在 nuxi generate 之后逐条对账。
 * 另外把本次改版的几个硬约束也在这里兜住：静态预设、字体自包含。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutes, buildSitemapRoutes } from '../build/post-index.ts';
import { SITE } from '../shared/site.ts';

const PUBLIC_DIR = fileURLToPath(new URL('../.output/public', import.meta.url));

/**
 * autoSubfolderIndex: false：
 *   /posts/xxx            → posts/xxx.html
 *   /posts/               → posts/index.html（带尾斜杠的索引页）
 *   /categories/公告       → categories/公告.html（中文不预先编码）
 *   /atom.xml、/404.html  → 原样
 */
function toFile(route) {
  const decoded = decodeURIComponent(route);
  if (decoded === '/') return 'index.html';
  if (/\.(html|json|xml|txt|ico|svg)$/.test(decoded)) return decoded.slice(1);
  if (decoded.endsWith('/')) return `${decoded.slice(1)}index.html`;
  return `${decoded.slice(1)}.html`;
}

if (!existsSync(PUBLIC_DIR)) {
  console.error('[verify] 找不到 .output/public，先跑 nuxi generate');
  process.exit(1);
}

const failures = [];
const routes = buildRoutes();
const missing = routes.filter((route) => !existsSync(join(PUBLIC_DIR, toFile(route))));
if (missing.length) {
  failures.push(`${missing.length} 条路由没有产物：`);
  for (const route of missing) failures.push(`  - ${route}  (期望 ${toFile(route)})`);
}

const sitemapFile = join(PUBLIC_DIR, 'sitemap.xml');
if (!existsSync(sitemapFile)) {
  failures.push('缺少 sitemap.xml：构建期网站地图没有生成');
} else {
  const sitemap = readFileSync(sitemapFile, 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
  const expectedUrls = buildSitemapRoutes().map((route) => new URL(route, `${SITE.mainUrl}/`).href);
  if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    failures.push('sitemap.xml 缺少 sitemap.org 标准 urlset 根节点');
  }
  if (
    urls.length !== expectedUrls.length ||
    urls.some((url, index) => url !== expectedUrls[index])
  ) {
    failures.push('sitemap.xml 中的页面地址与可收录路由不一致');
  }
}

// assets-only Worker 的产物里不该有服务端入口，否则 wrangler deploy 会失败
for (const stale of ['server', '_worker.js']) {
  if (existsSync(join(PUBLIC_DIR, stale))) {
    failures.push(`产物里出现了 ${stale}：说明 Nitro 没用 static 预设`);
  }
}

// 字体自包含：sync-fonts.mjs 必须产出本地样式表，且页面不能再引用字体 CDN
if (!existsSync(join(PUBLIC_DIR, 'fonts', 'harmonyos.css'))) {
  failures.push('缺少 fonts/harmonyos.css：sync-fonts.mjs 没有执行或执行失败');
}
const homeFile = join(PUBLIC_DIR, 'index.html');
if (existsSync(homeFile)) {
  const home = readFileSync(homeFile, 'utf8');
  if (home.includes('cdn.jsdelivr.net')) {
    failures.push('首页仍在引用字体 CDN，字体没有真正自包含');
  }
  if (!home.includes('/fonts/harmonyos.css')) {
    failures.push('首页没有引用 /fonts/harmonyos.css');
  }
}

if (failures.length) {
  console.error('[verify] 产物校验失败：');
  for (const line of failures) console.error(line);
  process.exit(1);
}

console.log(
  `[verify] ${routes.length} 条路由全部有产物 ✓ sitemap ${buildSitemapRoutes().length} 页 ✓ 字体自包含 / 静态预设`,
);
