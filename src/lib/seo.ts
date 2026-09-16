import type { VueHeadClient } from '@unhead/vue'
import { SITE } from '@/lib/site'

export interface PostMetaInput {
  title: string
  excerpt: string
  slug: string
  noindex?: boolean
}

export interface RouteMetaContext {
  path: string
  name?: string
  post?: PostMetaInput | null
}

const STATIC_PAGE_SEO: Record<string, { title: string; description: string; noindex?: boolean }> = {
  '/': {
    title: `fulieblog - 孚狸的前端技术与生活记录博客`,
    description: `这是孚狸的个人博客，专注于前端开发架构实践、Vue3与TypeScript应用、计算机网络协议、Linux服务器运维与日常思考见解。`,
  },
  '/about': {
    title: `关于孚狸 - fulieblog 个人主页与技术栈介绍`,
    description: `了解孚狸（fulie）的个人简介、技术栈经历、开源项目与联系方式，以及本站知识共享版权许可协议。`,
  },
  '/friends': {
    title: `友情链接 - fulieblog 博客朋友圈与友链申请`,
    description: `孚狸博客的友情链接专页，汇集优秀的独立开发者与技术博客创作者，欢迎互换友链共同交流成长。`,
  },
  '/beta': {
    title: `Beta 实验室 - fulieblog 视觉交互体验预览`,
    description: `博客前沿功能与视觉交互改进对比中心，用于实验性架构与设计的预览评估。`,
    noindex: true,
  },
  '/demo': {
    title: `AI 原稿演示展厅 - fulieblog 视觉与交互改造`,
    description: `AI 原稿视觉与交互改造演示展厅，包含提示词留存与对话回放实验方案。`,
    noindex: true,
  },
}

function normalizePostTitle(rawTitle: string): string {
  const title = rawTitle.trim()
  const baseTitle = `${title} - ${SITE.title}`
  if (baseTitle.length < 15) {
    return `${title} | 孚狸的技术与生活博客 - ${SITE.title}`
  }
  return baseTitle
}

function buildHeadInput(ctx: RouteMetaContext | PostMetaInput | null) {
  const base = SITE.baseUrl.replace(/\/$/, '')

  // 兼容直接传入 PostMetaInput 的旧调用
  const isDirectPost = ctx && 'slug' in ctx && typeof ctx.slug === 'string'
  const post = isDirectPost ? (ctx as PostMetaInput) : ctx && 'post' in ctx ? ctx.post : null
  const path = !isDirectPost && ctx && 'path' in ctx ? ctx.path : ''

  let title = ''
  let description = ''
  let url = ''
  let noindex = false

  if (post) {
    title = normalizePostTitle(post.title)
    description = post.excerpt.trim()
    if (description.length < 40) {
      description = `${post.title}：${description}。分享关于前端、网络技术与服务器运维的实践记录。`
    }
    url = `${base}/post/${encodeURIComponent(post.slug)}`
    noindex = Boolean(post.noindex)
  } else {
    const cleanPath = path ? path.replace(/\/$/, '') || '/' : '/'
    const staticMeta = STATIC_PAGE_SEO[cleanPath] || STATIC_PAGE_SEO['/']

    title = staticMeta.title
    description = staticMeta.description
    url = cleanPath === '/' ? base : `${base}${cleanPath}`
    noindex = Boolean(staticMeta.noindex)
  }

  const metaTags: Array<{ name?: string; property?: string; content: string }> = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
  ]

  if (noindex) {
    metaTags.push({ name: 'robots', content: 'noindex,nofollow' })
  }

  return {
    title,
    meta: metaTags,
  }
}

/**
 * 设置 SEO meta，SSR / 客户端通用（经 @unhead 注入）。
 * SSR 阶段 head.push 的 meta 会被 vite-ssg 的 renderDOMHead 写入静态 HTML；
 * 客户端导航时同样经 head 更新 <head>。
 */
export function applyRouteMeta(head: VueHeadClient, ctx: RouteMetaContext): void {
  head.push(buildHeadInput(ctx))
}

export function applyPostMeta(head: VueHeadClient, post: PostMetaInput | null): void {
  head.push(buildHeadInput(post))
}
