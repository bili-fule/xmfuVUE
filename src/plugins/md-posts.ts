import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import type { Plugin } from 'vite'

// ===== 站点常量（可按需修改）=====
const SITE = {
  title: 'fulieblog',
  description: '这是孚狸的博客，分享关于前端开发、网络技术、服务器部署和生活感悟的见解',
  // 域名占位，用户可改
  baseUrl: 'https://blog.xmfu.cn/',
}

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

const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: highlightCode,
})

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

  return {
    name: 'md-posts',
    enforce: 'pre',

    configResolved(config) {
      postsDir = path.resolve(config.root, 'src/content/posts')
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
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)
        if (mod) {
          ctx.server.moduleGraph.invalidateModule(mod)
          return [...mod.importers]
        }
      }
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
