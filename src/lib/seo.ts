import type { VueHeadClient } from '@unhead/vue'
import { SITE } from '@/lib/site'

export interface PostMetaInput {
  title: string
  excerpt: string
  slug: string
}

function buildHeadInput(meta: PostMetaInput | null) {
  const base = SITE.baseUrl.replace(/\/$/, '')
  const title = meta ? meta.title : SITE.title
  const description = meta ? meta.excerpt : SITE.description
  const url = meta ? `${base}/post/${encodeURIComponent(meta.slug)}` : SITE.baseUrl

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
    ],
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
