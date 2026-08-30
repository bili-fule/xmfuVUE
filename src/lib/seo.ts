import type { VueHeadClient } from '@unhead/vue'
import { SITE } from '@/lib/site'

export interface PostMetaInput {
  title: string
  excerpt: string
  slug: string
  noindex?: boolean
}

function buildHeadInput(post: PostMetaInput | null) {
  const base = SITE.baseUrl.replace(/\/$/, '')
  const title = post ? post.title : SITE.title
  const description = post ? post.excerpt : SITE.description
  const url = post ? `${base}/post/${encodeURIComponent(post.slug)}` : SITE.baseUrl

  const metaTags: Array<{ name?: string; property?: string; content: string }> = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
  ]

  if (post?.noindex) {
    metaTags.push({ name: 'robots', content: 'noindex,follow' })
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
 * 传 null 时回退到站点默认。
 */
export function applyPostMeta(head: VueHeadClient, post: PostMetaInput | null): void {
  head.push(buildHeadInput(post))
}
