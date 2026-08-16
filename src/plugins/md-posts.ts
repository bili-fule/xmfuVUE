import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js'
import type { Plugin, ViteDevServer } from 'vite'
import { SITE } from '../lib/site'

export { SITE }

export interface Post {
  slug: string
  title: string
  excerpt: string
  contentHtml: string // markdown 编译后的 HTML
  date: string // 'YYYY-MM-DD'（frontmatter 的 published）
  tags: string[]
  category: string
  draft: boolean
  readingTime: number
  cover: string // frontmatter 的 image，可能为 ''
}

const VIRTUAL_ID = 'virtual:posts'
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

function highlightCode(str: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
    } catch {
      // 语言解析失败时回退到普通转义
    }
  }
  return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
}

/** 标题 slug（保留中文，其余非字母数字转 '-'） */
function slugifyHeading(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: highlightCode,
})

// 标题带 id（slug 式），供 TOC 锚点跳转
md.use(anchor, {
  level: [1, 2, 3, 4],
  slugify: slugifyHeading,
})

/** HTML 去标签得到纯文本（用于搜索索引） */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** 计算阅读时长：中文字符约 400 字/分钟，英文单词约 200 词/分钟，最小 1 */
function calcReadingTime(content: string): number {
  const cjk = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) ?? []).length
  const words = (content.match(/[a-zA-Z0-9]+/g) ?? []).length
  return Math.max(1, Math.ceil(cjk / 400 + words / 200))
}

/** 把 frontmatter 的 published（可能是 Date 或 string）归一化为 'YYYY-MM-DD' */
function toDateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

interface Frontmatter {
  title?: string
  published?: string | Date
  description?: string
  image?: string
  tags?: string[] | string
  category?: string
  draft?: boolean
  lang?: string
}

function parsePost(filePath: string): Post {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const fm = data as Frontmatter
  const slug = path.basename(filePath, '.md')
  const title = fm.title || slug
  const description = fm.description || ''
  const image = fm.image || ''
  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : []
  const category = fm.category || ''
  const draft = Boolean(fm.draft)
  const date = toDateString(fm.published)
  const contentHtml = md.render(content)
  return {
    slug,
    title,
    excerpt: description || title,
    contentHtml,
    date,
    tags,
    category,
    draft,
    readingTime: calcReadingTime(content),
    cover: image,
  }
}

function loadPosts(postsDir: string): Post[] {
  if (!fs.existsSync(postsDir)) {
    return []
  }
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => parsePost(path.join(postsDir, file)))
}

function virtualModuleCode(posts: Post[]): string {
  return `export const posts = ${JSON.stringify(posts)}`
}

/**
 * dev 下失效 virtual:posts 模块并触发全页 reload。
 * 文章列表是全局数据（首页、归档、搜索、RSS 都依赖），HMR 局部更新容易状态错位，
 * 全 reload 最可靠。供 configureServer 的 watcher 兜底调用。
 */
function invalidatePostsModule(server: ViteDevServer): void {
  const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)
  if (mod) {
    server.moduleGraph.invalidateModule(mod)
  }
  server.ws.send({ type: 'full-reload' })
}

export interface SearchIndexEntry {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  text: string
}

/** 非草稿文章生成搜索索引条目 */
function buildSearchIndex(posts: Post[]): SearchIndexEntry[] {
  return posts
    .filter((p) => !p.draft)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tags: p.tags,
      text: htmlToText(p.contentHtml),
    }))
}

/** 写入 public/search-index.json（构建产物，供 /search-index.json 静态访问） */
function writeSearchIndex(postsDir: string, publicDir: string): void {
  const posts = loadPosts(postsDir)
  const entries = buildSearchIndex(posts)
  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, 'search-index.json'), JSON.stringify(entries, null, 2), 'utf-8')
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildRss(posts: Post[]): string {
  const base = SITE.baseUrl.replace(/\/$/, '')
  const items = posts
    .map(
      (p) => `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${base}/post/${encodeURI(p.slug)}</link>
    <guid isPermaLink="true">${base}/post/${encodeURI(p.slug)}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${escapeXml(p.excerpt)}</description>
  </item>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${base}</link>
    <description>${escapeXml(SITE.description)}</description>
${items}
  </channel>
</rss>
`
}

function buildSitemap(posts: Post[]): string {
  const base = SITE.baseUrl.replace(/\/$/, '')
  const urls = posts
    .map(
      (p) => `  <url>
    <loc>${base}/post/${encodeURI(p.slug)}</loc>
    <lastmod>${p.date}</lastmod>
  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}</loc>
  </url>
${urls}
</urlset>
`
}

function buildRobots(): string {
  const base = SITE.baseUrl.replace(/\/$/, '')
  return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
}

export function mdPosts(): Plugin {
  let postsDir = ''
  let publicDir = ''

  return {
    name: 'md-posts',
    enforce: 'pre',

    configResolved(config) {
      postsDir = path.resolve(config.root, 'src/content/posts')
      publicDir = config.publicDir
    },

    buildStart() {
      // 构建/启动时生成搜索索引（dev 下也会触发，供 /search-index.json 访问）
      if (publicDir) {
        writeSearchIndex(postsDir, publicDir)
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        const posts = loadPosts(postsDir)
        return virtualModuleCode(posts)
      }
    },

    handleHotUpdate(ctx) {
      // dev 下监听 md 目录变更，失效 virtual:posts 模块并触发其依赖更新
      if (ctx.file.startsWith(postsDir) && ctx.file.endsWith('.md')) {
        // 同时重写搜索索引
        if (publicDir) {
          writeSearchIndex(postsDir, publicDir)
        }
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)
        if (mod) {
          ctx.server.moduleGraph.invalidateModule(mod)
          return [...mod.importers]
        }
      }
    },

    configureServer(server) {
      // 兜底：显式监听 md 目录的 add/unlink（新建/删除文件）。
      // Vite 默认 watcher 对「新建文件」的捕获不稳定——handleHotUpdate 依赖 Vite
      // 已识别该文件才会触发，而新建 .md 首次出现时未必进入 watcher 视野，导致新增文章
      // 不热更新（必须重启 dev）。这里用 chokidar 的 add/unlink 兜底，任何 md 增删都
      // 失效 virtual:posts 并广播 HMR，实现和 Fuwari 一样的「加文章即见」体验。
      // 改动时勿删此块，否则「新增文章不热更新」bug 反弹。
      const onPostsChange = (file: string) => {
        if (file.startsWith(postsDir) && file.endsWith('.md')) {
          if (publicDir) {
            writeSearchIndex(postsDir, publicDir)
          }
          invalidatePostsModule(server)
        }
      }
      server.watcher.on('add', onPostsChange)
      server.watcher.on('unlink', onPostsChange)
      // change 走 handleHotUpdate 即可，这里不重复
    },

    generateBundle() {
      const posts = loadPosts(postsDir)
        .filter((p) => !p.draft)
        .sort((a, b) => b.date.localeCompare(a.date))
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: buildRss(posts) })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(posts) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobots() })
    },
  }
}
