import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import { getAllPublishedPosts, getPostBySlug } from '@/data/posts'
import { applyPostMeta } from '@/lib/seo'
import './style.css'
import 'highlight.js/styles/github-dark.css'

// vite-ssg 入口：返回 createApp 工厂，客户端自动 createWebHistory，SSR 自动 createMemoryHistory。
// SSR 渲染时 router.afterEach 也会触发，用 @unhead 的 head.push 把每页 <title>/<meta> 注入静态 HTML。
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  ({ app, router, head }) => {
    router.afterEach((to) => {
      if (!head) return
      const post = to.name === 'post' && typeof to.params.slug === 'string'
        ? getPostBySlug(to.params.slug)
        : null
      applyPostMeta(head, post
        ? {
            title: post.title,
            excerpt: post.excerpt,
            slug: post.slug,
            noindex: post.origin === 'ai',
          }
        : null)
    })
  },
)

// SSG 预渲染路由列表：静态路由 + 展开的动态路由 /post/:slug（过滤 draft）。
// 需自行过滤含 ':' / '*' 的路径，避免 Windows 非法文件名与空壳页面。
export function includedRoutes(paths: string[]): string[] {
  const staticPaths = paths.filter((p) => !p.includes(':') && !p.includes('*'))
  const postPaths = getAllPublishedPosts().map((p) => `/post/${p.slug}`)
  return [...staticPaths, ...postPaths]
}
