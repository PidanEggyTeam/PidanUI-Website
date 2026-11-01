// ============================================================
// 静态产物预览服务器
//
// 为什么不用 `python -m http.server`：它是「文件服务器」，不会把
// `/about` 回退到 `about.html`（GitHub Pages 会）。Nuxt 的产物是
// `about.html` 而不是 `about/index.html`，用 Python 起服务时站内跳转
// 会拿到 404，看起来像页面卡死，属于测试环境问题。
//
// 用法：pnpm preview:static   （默认 http://localhost:4173）
// ============================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../.output/public', import.meta.url));
const port = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function resolveFile(urlPath) {
  const candidates = [
    path.join(root, urlPath),
    path.join(root, `${urlPath}.html`),
    path.join(root, urlPath, 'index.html'),
  ];
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const file = resolveFile(urlPath);

  if (!file) {
    const notFound = path.join(root, '404.html');
    res.writeHead(404, { 'content-type': MIME['.html'] });
    return fs.existsSync(notFound) ? fs.createReadStream(notFound).pipe(res) : res.end('404');
  }

  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, () => {
  if (!fs.existsSync(root)) {
    console.error(`未找到构建产物：${root}\n请先执行 pnpm build`);
    process.exit(1);
  }
  console.log(`静态预览已启动： http://localhost:${port}  （根目录 ${root}）`);
});
