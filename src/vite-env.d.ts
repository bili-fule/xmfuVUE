/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:posts' {
  export type PostOrigin = 'human' | 'ai' | 'mixed'
  export type EditorialStatus = 'polished' | 'raw' | 'edited'

  export interface ConversationTurn {
    role: 'user' | 'assistant'
    content: string
  }

  export interface Post {
    slug: string
    title: string
    excerpt: string
    contentHtml: string
    contentMarkdown: string
    date: string
    tags: string[]
    category: string
    draft: boolean
    readingTime: number
    cover: string
    origin: PostOrigin
    editorialStatus: EditorialStatus
    model: string
    prompt: string
    conversationSummary: string
    conversation: ConversationTurn[]
  }

  export const posts: Post[]
}
