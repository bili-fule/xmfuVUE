import MiniSearch from 'minisearch'

export interface SearchResult {
  slug: string
  title: string
  excerpt: string
  tags: string[]
}

interface SearchDoc extends SearchResult {
  text: string
}

let indexPromise: Promise<MiniSearch<SearchDoc> | null> | null = null

async function loadIndex(): Promise<MiniSearch<SearchDoc> | null> {
  try {
    const res = await fetch('/search-index.json')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const docs = (await res.json()) as SearchDoc[]
    const miniSearch = new MiniSearch<SearchDoc>({
      fields: ['title', 'excerpt', 'tags', 'text'],
      idField: 'slug',
      storeFields: ['slug', 'title', 'excerpt', 'tags'],
      searchOptions: {
        boost: { title: 3, excerpt: 2, tags: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    })
    miniSearch.addAll(docs)
    return miniSearch
  } catch (err) {
    console.warn('[search] 加载搜索索引失败，搜索功能不可用', err)
    return null
  }
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) {
    return []
  }
  if (!indexPromise) {
    indexPromise = loadIndex()
  }
  const miniSearch = await indexPromise
  if (!miniSearch) {
    return []
  }
  const results = miniSearch.search(q)
  return results.slice(0, 10).map((r) => ({
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt as string,
    tags: (r.tags as string[]) ?? [],
  }))
}
