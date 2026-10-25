import tailwindcss from '@tailwindcss/vite';
import { buildRoutes } from './build/post-index';

// ============================================================
// PidanUI 官网 · Nuxt 站点配置
//   - 纯静态站点：`nuxt generate` 产出 .output/public，部署 GitHub Pages
//   - 内容由 @nuxt/content v3 驱动（content/posts/*.md）
//   - 样式为原生 CSS + Tailwind v4（@theme 令牌），沿用 [data-theme] 三态机制
// ============================================================
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: true,
  devtools: { enabled: false },

  modules: ['@nuxt/content', '@nuxt/ui'],

  // ============================================================
  // Nuxt UI 接入策略（渐进式接管）
  //   - 保留样式层自建的 reset 与设计令牌，不引入 Tailwind Preflight
  //     （@nuxt/ui 的 CSS 入口本身不含 preflight，见 main.css 注释）
  //   - 主题三态仍由 useTheme.ts 独占，因此关掉 colorMode，
  //     改由 useTheme 同时写 data-theme 与 .dark class
  //   - 字体由 CDN <link> 提供，关掉 @nuxt/fonts 避免接管
  // ============================================================
  ui: {
    fonts: false,
    colorMode: false,
    theme: {
      // 只生成实际用到的语义色（primary 承载品牌黄），减小产物体积
      colors: ['primary', 'error'],
    },
    experimental: {
      // 按实际使用的组件做 CSS 摇树
      componentDetection: true,
    },
  },

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'author', content: 'PidanUI Team' },
        {
          name: 'keywords',
          content:
            'PidanUI, Pidan UI, 皮蛋UI, EggyUI, Eggy UI, EggyUI-Legacy, EggyUI-RE, OpenEggyUI, OpenPidanUI, 蛋仔UI, 蛋仔美化, 蛋仔风格美化, 蛋仔风格主题, 蛋仔风格壁纸, 蛋仔风格Windows, 主题包下载, 蛋仔派对二创, Rainmeter蛋仔组件, Windows桌面美化',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' },
        // 全站字体（CDN）：HarmonyOS Sans SC（正文）/ Cascadia Code（代码）
        // 图标已全部改为 Nuxt UI 的 Iconify（构建期内联 SVG），不再引 Font Awesome
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' },
        // 实时访客 FeedPulse：右栏组件常驻每一页，hydration 完成即回报
        // track-pixel，组件脚本与 SSE 轮询同源；预连接可省掉每页首次访问
        // 该源的 DNS + TCP + TLS 握手。
        // 不要加 crossorigin：脚本与统计像素都是 no-cors 请求，
        // 带 crossorigin 会另开一条 CORS 连接池，反而复用不上。
        { rel: 'preconnect', href: 'https://feed-pulse.com' },
        { rel: 'dns-prefetch', href: 'https://feed-pulse.com' },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@fontsource/cascadia-code@5.2.3/index.min.css',
        },
        // 界面字体（CDN）：HarmonyOS Sans SC（400 / 500 / 700 三个字重，unicode-range 分片），
        // 与上方约定一致：仓库不保留字体文件
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/harmonyos-sans-sc-webfont-splitted@1.1.0/dist/Regular.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/harmonyos-sans-sc-webfont-splitted@1.1.0/dist/Medium.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/harmonyos-sans-sc-webfont-splitted@1.1.0/dist/Bold.css',
        },
        // Atom feed 自动发现：浏览器 / RSS 阅读器可通过这个 link 自动订阅
        {
          rel: 'alternate',
          type: 'application/atom+xml',
          title: 'PidanUI 新闻订阅',
          href: '/atom.xml',
        },
      ],
      script: [
        // 首帧同步脚本（关键）：在首次绘制前把用户选择的主题写入 <html data-theme>，
        // 同时给 <html> 加 .dark / .light —— Nuxt UI 的 --ui-* 语义变量按 class 切换，
        // 两套标记必须同时落地，否则深色用户首帧会闪白。
        // storage key 与 useTheme.ts 保持一致。
        {
          innerHTML:
            'try{var m=localStorage.getItem("pidanui-theme")||"auto";var d=m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",m);r.classList.toggle("dark",d);r.classList.toggle("light",!d)}catch(e){var r=document.documentElement;r.setAttribute("data-theme","auto");r.classList.add("light")}',
          tagPriority: 'critical',
        },
        // 首帧同步脚本：DOM 解析时立即给 <html> 加 .js。
        // 禁用 JS 时此脚本不执行，所有 html:not(.js) 的降级 CSS 规则自动生效。
        {
          innerHTML: 'document.documentElement.classList.add("js");',
          tagPriority: 'critical',
        },
      ],
    },
    // 保住 .page-enter-from / .page-leave-to 等类名（见 animation.css）
    pageTransition: { name: 'page', mode: 'out-in', appear: true },
  },

  css: ['katex/dist/katex.min.css', '~/assets/styles/main.css'],

  // 组件按文件名注册（<ListView> / <PostCard> …），模板保持零改动
  components: [{ path: '~/components', pathPrefix: false }],

  // 图标：只用本地 @iconify-json 集合，构建期直接内联 SVG。
  // 不配置时 @nuxt/icon 会在渲染期向 Iconify API 取图 —— 静态站点必须离线可用。
  icon: {
    serverBundle: { collections: ['lucide', 'simple-icons'] },
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
      // scan 认不出动态绑定的图标（:name="item.icon" / :name="link.icon"），
      // 这些必须显式列出，否则会退化成运行时向 Iconify API 取图。
      // 新增动态图标时同步这里。
      icons: [
        'lucide:activity',
        'lucide:arrow-left',
        'lucide:arrow-right',
        'lucide:arrow-up',
        'lucide:calendar-days',
        'lucide:chevron-down',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:download',
        'lucide:file-text',
        'lucide:folder',
        'lucide:globe',
        'lucide:hash',
        'lucide:house',
        'lucide:image',
        'lucide:image-off',
        'lucide:info',
        'lucide:link-2-off',
        'lucide:menu',
        'lucide:monitor',
        'lucide:moon',
        'lucide:newspaper',
        'lucide:panel-right',
        'lucide:rotate-ccw',
        'lucide:rss',
        'lucide:search',
        'lucide:sun',
        'lucide:tag',
        'lucide:triangle-alert',
        'simple-icons:bilibili',
        'simple-icons:github',
        'simple-icons:tencentqq',
      ],
    },
  },

  vite: {
    // Tailwind CSS v4：只提供 @theme 令牌与工具类，样式主体仍是原生 CSS
    // （分层与顺序约定见 app/assets/styles/index.css 顶部注释）
    plugins: [tailwindcss()],
    build: {
      // CSS 压缩目标锁定在 Tailwind v4 的官方支持矩阵：
      // v4 产物本身要求 Chrome 111 / Safari 16.4 / Firefox 128 起，
      // 更低内核拿不到能跑的样式，因此不再为媒体查询范围语法把 target 降到 103。
      // 若日后调整此矩阵，必须同步 useMobileDrawer 的 matchMedia 断点（960px）。
      cssTarget: ['chrome111', 'edge111', 'firefox128', 'safari16.4', 'ios16.4'],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: false, // 路由由 buildRoutes() 全量枚举，不依赖爬虫
      failOnError: true, // 缺页必须让 CI 失败
      autoSubfolderIndex: false, // /about → about.html，保持现有 URL 形态（无尾斜杠）
    },
  },

  hooks: {
    // 唯一的路由枚举入口：内容库就绪之后、预渲染之前
    'prerender:routes'(ctx) {
      for (const route of buildRoutes()) ctx.routes.add(route);
    },
  },

  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          // 键名必须是 light / dark：产物才是 --shiki-light / --shiki-dark，
          // 与 post.css 里自行应用的双主题规则对齐；default 是类型要求的基础主题
          theme: { default: 'github-light', light: 'github-light', dark: 'github-dark' },
          langs: [
            'bash',
            'shell',
            'sh',
            'json',
            'js',
            'ts',
            'html',
            'css',
            'scss',
            'vue',
            'md',
            'yaml',
            'powershell',
            'ini',
            'diff',
          ],
        },
        remarkPlugins: { 'remark-math': {} },
        rehypePlugins: { 'rehype-katex': { output: 'htmlAndMathml' } },
      },
    },
    renderer: {
      // 标题锚点由自定义 ProseH2/H3 输出 .header-anchor，这里关掉默认实现
      anchorLinks: false,
    },
  },

  experimental: {
    // 首屏 payload 内联，客户端导航读预渲染的 _payload.json
    payloadExtraction: 'client',
  },
});
