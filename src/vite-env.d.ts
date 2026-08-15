/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:posts' {
  export interface Post {
    slug: string
    title: string
    excerpt: string
    contentHtml: string
    date: string
    tags: string[]
    category: string
    draft: boolean
    readingTime: number
    cover: string
  }

  export const posts: Post[]
}
