import { SITE } from '@/lib/site'

export interface PostMetaInput {
  title: string
  excerpt: string
  slug: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function applyMeta(meta: PostMetaInput | null): void {
  const base = SITE.baseUrl.replace(/\/$/, '')
  const title = meta ? meta.title : SITE.title
  const description = meta ? meta.excerpt : SITE.description
  const url = meta ? `${base}/post/${encodeURIComponent(meta.slug)}` : SITE.baseUrl

  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
}

/** 设置文章页 SEO meta；传 null 时回退到站点默认 */
export function applyPostMeta(post: PostMetaInput | null): void {
  applyMeta(post)
}

/** 设置站点默认 SEO meta */
export function applyDefaultMeta(): void {
  applyMeta(null)
}
