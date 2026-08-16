import * as fs from 'node:fs'
import * as http from 'node:http'
import * as path from 'node:path'
import matter from 'gray-matter'
import type { Plugin, ResolvedConfig } from 'vite'

/**
 * SSG 预渲染插件
 *
 * 背景：项目用 vue-router 的 createWebHistory（HTML5 history 模式），vite build 产物
 * 只有根 index.html。静态服务器收到 /archive、/post/<slug> 等深链接时找不到对应文件
 * 就返回 404，导致直接访问（或刷新）非主页路由打不开。
 *
 * 方案：build 结束后（closeBundle 钩子）启动一个带 SPA fallback 的本地静态服务器，
 * 用 puppeteer 逐个访问每个路由，等应用挂载 + SEO meta 注入完成后，把渲染出的完整
 * DOM 序列化为对应路径的 index.html（如 dist/archive/index.html、
 * dist/post/<slug>/index.html）。这样每个路由都有独立 HTML 文件，任何静态服务器
 * 都能直接服务，无需配置 fallback；且 <title>/<meta>/正文均在构建时定型，SEO 友好。
 *
 * 客户端 JS 加载后 createApp().mount() 会接管渲染（非 hydration，会重绘一次），
 * 对内容博客可接受——爬虫拿到的是预渲染的完整 HTML，用户看到的内容与之一致。
 */

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

export interface PrerenderOptions {
  /** 额外静态路由（始终包含 '/'） */
  staticRoutes?: string[]
  /** 每页渲染后额外等待毫秒，确保 afterEach 的 meta 注入完成 */
  waitFor?: number
}

export function prerender(options: PrerenderOptions = {}): Plugin {
  let config: ResolvedConfig
  let server: http.Server | null = null

  return {
    name: 'prerender',
    apply: 'build',
    enforce: 'post',
    configResolved(c) {
      config = c
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir)
      const indexHtmlPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(indexHtmlPath)) {
        this.warn('[prerender] 未找到 dist/index.html，跳过预渲染')
        return
      }

      // 收集所有需要预渲染的路由
      const staticRoutes = options.staticRoutes ?? ['/archive', '/friends', '/about']
      const slugs = collectPostSlugs(config.root)
      const routes: string[] = ['/', ...staticRoutes, ...slugs.map((s) => `/post/${s}`)]

      // 启动带 SPA fallback 的静态服务器，让深链接也能加载到 index.html 供 JS 接管
      const port = await startStaticServer(outDir)

      let browser: import('puppeteer').Browser
      try {
        const puppeteer = (await import('puppeteer')) as typeof import('puppeteer')
        const launch = puppeteer.default?.launch ?? puppeteer.launch
        browser = await launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      } catch (e) {
        this.warn('[prerender] 无法启动 puppeteer，跳过预渲染。请确认已安装: npm i -D puppeteer')
        await stopServer()
        return
      }

      const page = await browser.newPage()
      const waitFor = options.waitFor ?? 250
      let count = 0
      try {
        for (const route of routes) {
          const url = `http://127.0.0.1:${port}${route}`
          try {
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
          } catch {
            // 某些资源（如分析脚本）可能永不空闲，回退到 domcontentloaded
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
          }
          // 等待 #app 挂载出内容
          await page
            .waitForFunction(
              () => (document.querySelector('#app') as HTMLElement | null)?.children?.length,
              { timeout: 8000 },
            )
            .catch(() => {})
          // 给 router.afterEach 的 SEO meta 注入留出时间
          await new Promise((r) => setTimeout(r, waitFor))

          const html = await page.content()
          const full = '<!doctype html>\n' + html
          const relPath = route === '/' ? 'index.html' : route.replace(/^\//, '') + '/index.html'
          const absPath = path.join(outDir, relPath)
          fs.mkdirSync(path.dirname(absPath), { recursive: true })
          fs.writeFileSync(absPath, full, 'utf-8')
          count++
        }
      } finally {
        await page.close().catch(() => {})
        await browser.close().catch(() => {})
        await stopServer()
      }
      this.warn(`[prerender] 已预渲染 ${count}/${routes.length} 个页面`)
    },
  }

  /** 启动本地静态服务器，找不到的路径 fallback 到 index.html（供 SPA 路由加载） */
  function startStaticServer(root: string): Promise<number> {
    const indexHtml = path.join(root, 'index.html')
    return new Promise((resolve, reject) => {
      server = http.createServer((req, res) => {
        try {
          const raw = (req.url ?? '/').split('?')[0]
          const urlPath = decodeURIComponent(raw)
          // 去前导斜杠并阻止路径穿越
          let safe = urlPath.replace(/^[/\\]+/, '')
          if (safe.includes('..')) safe = ''
          const filePath = path.join(root, safe)

          let resolved: string
          if (filePath === root || !fs.existsSync(filePath)) {
            // SPA 路由 → 返回 index.html
            resolved = indexHtml
          } else if (fs.statSync(filePath).isDirectory()) {
            const idx = path.join(filePath, 'index.html')
            resolved = fs.existsSync(idx) ? idx : indexHtml
          } else {
            resolved = filePath
          }
          const ext = path.extname(resolved)
          res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' })
          fs.createReadStream(resolved).pipe(res)
        } catch {
          res.writeHead(404)
          res.end('Not Found')
        }
      })
      server.on('error', reject)
      server.listen(0, '127.0.0.1', () => {
        const addr = server!.address()
        if (addr && typeof addr === 'object') resolve(addr.port)
        else reject(new Error('无法启动预渲染服务器'))
      })
    })
  }

  function stopServer(): Promise<void> {
    return new Promise((resolve) => {
      if (!server) return resolve()
      const s = server
      server = null
      s.close(() => resolve())
    })
  }
}

/** 读取 src/content/posts 下所有非草稿文章的 slug（文件名去 .md） */
function collectPostSlugs(root: string): string[] {
  const postsDir = path.resolve(root, 'src/content/posts')
  if (!fs.existsSync(postsDir)) return []
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = path.basename(f, '.md')
      try {
        const { data } = matter(fs.readFileSync(path.join(postsDir, f), 'utf-8'))
        if (data?.draft) return null
        return slug
      } catch {
        return slug
      }
    })
    .filter((s): s is string => Boolean(s))
}
