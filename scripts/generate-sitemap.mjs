import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSitemapRoutes } from '../build/post-index.ts';
import { SITE } from '../shared/site.ts';

const PUBLIC_DIR = fileURLToPath(new URL('../.output/public', import.meta.url));

if (!existsSync(PUBLIC_DIR)) {
  console.error('[sitemap] 找不到 .output/public，先跑 nuxi generate');
  process.exit(1);
}

const escapeXml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const urls = buildSitemapRoutes()
  .map(
    (route) =>
      `  <url>\n    <loc>${escapeXml(new URL(route, `${SITE.mainUrl}/`).href)}</loc>\n  </url>`,
  )
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
console.log(`[sitemap] 已生成 ${buildSitemapRoutes().length} 个页面 → .output/public/sitemap.xml`);
