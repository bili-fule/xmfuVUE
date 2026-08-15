import { posts } from 'virtual:posts'

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

export function getAllPosts(): Post[] {
  return [...posts]
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
