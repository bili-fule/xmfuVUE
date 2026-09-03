<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Download,
  FileDown,
  Folder,
  ListTree,
  MessageSquareText,
  Sparkles,
  User,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
// import GiscusComment from '@/components/GiscusComment.vue'
import Lightbox from '@/components/Lightbox.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { getAllPublishedPosts, getPostBySlug, formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

interface Props {
  slug: string
}

const props = defineProps<Props>()
const post = computed(() => getPostBySlug(props.slug))
const allPosts = computed(() => getAllPublishedPosts())
const currentIndex = computed(() => allPosts.value.findIndex((p) => p.slug === props.slug))
// 左侧：越靠近现在、更新的文章（Newer post，即 index - 1）
const newerPost = computed<Post | null>(() => (currentIndex.value > 0 ? allPosts.value[currentIndex.value - 1] || null : null))
// 右侧：越往以前、更古老的历史文章（Older post，即 index + 1）
const olderPost = computed<Post | null>(() => (currentIndex.value >= 0 && currentIndex.value < allPosts.value.length - 1 ? allPosts.value[currentIndex.value + 1] || null : null))
const backPath = '/'
const backLabel = computed(() => t('post.back'))
const downloadBase = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/downloads`
const markdownDownloadUrl = computed(() => post.value ? `${downloadBase}/${encodeURIComponent(post.value.slug)}.md` : '')
const recordDownloadUrl = computed(() => post.value ? `${downloadBase}/${encodeURIComponent(post.value.slug)}-generation-record.md` : '')

// AI 原稿现代折叠检查器状态（方案 2）
const aiInspectorExpanded = ref(true)
const aiInspectorTab = ref<'prompt' | 'chat' | 'download'>('prompt')
const copiedPrompt = ref(false)

function copyPrompt() {
  if (post.value?.prompt && typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(post.value.prompt)
    copiedPrompt.value = true
    setTimeout(() => {
      copiedPrompt.value = false
    }, 2000)
  }
}

// 容器与回到顶部
const scrollContainerRef = ref<HTMLDivElement | null>(null)
const showBackToTop = ref(false)

function handleScroll() {
  if (!scrollContainerRef.value) return
  showBackToTop.value = scrollContainerRef.value.scrollTop > 350
}

function scrollToTop() {
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// 图片灯箱状态
const lightboxOpen = ref(false)
const lightboxSrc = ref('')
const lightboxAlt = ref('')

function openLightbox(src: string, alt: string) {
  lightboxSrc.value = src
  lightboxAlt.value = alt
  lightboxOpen.value = true
}

// 文章目录 (TOC)
interface TocItem {
  id: string
  text: string
  level: number
}

const tocItems = ref<TocItem[]>([])
const activeHeadingId = ref('')
const contentContainerRef = ref<HTMLDivElement | null>(null)

function extractToc() {
  if (!post.value?.contentHtml) {
    tocItems.value = []
    return
  }

  // SSR 无 DOMParser；TOC 在客户端挂载后由 watch/onMounted 重新触发提取
  if (typeof DOMParser === 'undefined') return

  const parser = new DOMParser()
  const doc = parser.parseFromString(post.value.contentHtml, 'text/html')
  const headings = doc.querySelectorAll('h2, h3')
  const items: TocItem[] = []

  headings.forEach((heading, idx) => {
    const text = heading.textContent?.trim() || ''
    // 若标题没有 id，兜底生成与 anchor 插件兼容的 id
    const id = heading.id || `heading-${idx}`
    const level = heading.tagName.toLowerCase() === 'h2' ? 2 : 3
    if (text) {
      items.push({ id, text, level })
    }
  })

  tocItems.value = items
}

function scrollToHeading(id: string) {
  if (!scrollContainerRef.value) return
  const target = scrollContainerRef.value.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeadingId.value = id
  }
}

// 绑定正文内图片点击事件 & 监听当前高亮标题
let headingObserver: IntersectionObserver | null = null

function bindImageClicksAndObserve() {
  if (!contentContainerRef.value) return

  // 1. 绑定图片点击灯箱
  const imgs = contentContainerRef.value.querySelectorAll('img')
  imgs.forEach((img) => {
    img.style.cursor = 'zoom-in'
    img.onclick = () => {
      openLightbox(img.getAttribute('src') || '', img.getAttribute('alt') || '')
    }
  })

  // 2. 标题 IntersectionObserver
  if (headingObserver) {
    headingObserver.disconnect()
  }

  headingObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length > 0) {
        activeHeadingId.value = visible[0].target.id
      }
    },
    {
      root: scrollContainerRef.value,
      rootMargin: '0px 0px -70% 0px',
      threshold: 0.1,
    },
  )

  const headings = contentContainerRef.value.querySelectorAll('h2, h3')
  headings.forEach((h) => headingObserver?.observe(h))
}

function enhanceCodeBlocks() {
  if (!contentContainerRef.value) return
  const preElements = contentContainerRef.value.querySelectorAll('pre')
  preElements.forEach((pre) => {
    if (pre.getAttribute('data-enhanced') === 'true') return
    pre.setAttribute('data-enhanced', 'true')

    const code = pre.querySelector('code')
    let lang = ''
    if (code) {
      const langClass = Array.from(code.classList).find((c) => c.startsWith('language-'))
      if (langClass) {
        lang = langClass.replace('language-', '').toUpperCase()
      }
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper my-6 overflow-hidden rounded-xl border border-border/80 bg-[#0d1117] shadow-lg'

    const header = document.createElement('div')
    header.className = 'flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4 py-2 text-xs select-none'

    const left = document.createElement('div')
    left.className = 'flex items-center gap-2'
    left.innerHTML = `
      <div class="flex items-center gap-1.5">
        <span class="size-3 rounded-full bg-[#ff5f56] inline-block"></span>
        <span class="size-3 rounded-full bg-[#ffbd2e] inline-block"></span>
        <span class="size-3 rounded-full bg-[#27c93f] inline-block"></span>
      </div>
      ${lang ? `<span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider pl-2">${lang}</span>` : ''}
    `

    const copyBtn = document.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'inline-flex items-center gap-1 rounded bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors cursor-pointer'
    copyBtn.innerHTML = `
      <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>复制</span>
    `

    copyBtn.addEventListener('click', async () => {
      const codeText = code ? code.innerText : pre.innerText
      try {
        await navigator.clipboard.writeText(codeText)
        copyBtn.innerHTML = `
          <svg class="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span class="text-emerald-400 font-semibold">已复制</span>
        `
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span>复制</span>
          `
        }, 2000)
      } catch (err) {
        console.error('Failed to copy code: ', err)
      }
    })

    header.appendChild(left)
    header.appendChild(copyBtn)

    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(header)
    wrapper.appendChild(pre)
    pre.className = 'p-4 text-xs font-mono text-zinc-200 overflow-x-auto bg-[#0d1117] leading-relaxed m-0 rounded-none'
  })
}

function resetScrollPosition() {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.style.scrollBehavior = 'auto'
    scrollContainerRef.value.scrollTop = 0
    nextTick(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.scrollTop = 0
        scrollContainerRef.value.style.scrollBehavior = ''
      }
    })
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}

watch(
  () => props.slug,
  () => {
    resetScrollPosition()
  },
)

watch(
  () => post.value?.contentHtml,
  () => {
    resetScrollPosition()
    extractToc()
    nextTick(() => {
      bindImageClicksAndObserve()
      enhanceCodeBlocks()
    })
  },
  { immediate: true },
)

onMounted(() => {
  resetScrollPosition()
  nextTick(() => {
    resetScrollPosition()
    bindImageClicksAndObserve()
    enhanceCodeBlocks()
  })
})

onUnmounted(() => {
  if (headingObserver) {
    headingObserver.disconnect()
    headingObserver = null
  }
})

function isImageCover(cover: string): boolean {
  return /^https?:\/\//.test(cover) || cover.startsWith('/') || cover.startsWith('data:')
}

function coverBackground(cover: string): string {
  return cover || 'linear-gradient(135deg, #262626 0%, #525252 100%)'
}

</script>

<template>
  <div
    v-if="post"
    ref="scrollContainerRef"
    class="min-h-full sm:h-full min-w-0 sm:overflow-y-auto relative scroll-smooth"
    @scroll="handleScroll"
  >
    <div class="mx-auto max-w-5xl px-4 py-6 md:py-10 space-y-8">
      <!-- 顶部返回 -->
      <Button variant="ghost" size="sm" as-child>
        <RouterLink :to="backPath" class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft class="size-4" />
          {{ backLabel }}
        </RouterLink>
      </Button>

      <div class="grid min-w-0 grid-cols-1 items-start gap-8 xl:grid-cols-12">
          <!-- 主文章内容区 -->
          <article class="min-w-0 space-y-8" :class="tocItems.length > 0 ? 'xl:col-span-8' : 'xl:col-span-12'">
            <header class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-if="post.origin === 'ai'"
                  class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20 shadow-2xs"
                >
                  <Sparkles class="size-3" />
                  {{ t('post.aiOriginal') }}
                </span>
                <span v-if="post.category" class="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/60">
                  <Folder class="size-3" />
                  {{ post.category }}
                </span>
              </div>

            <h1
              class="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl"
              :class="post.origin === 'ai' ? 'lg:text-4xl' : 'lg:text-5xl'"
            >
              {{ post.title }}
            </h1>

            <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div class="inline-flex items-center gap-1.5">
                <Calendar class="size-4 opacity-70" />
                <time :datetime="post.date">{{ formatDate(post.date) }}</time>
              </div>
              <div class="inline-flex items-center gap-1.5">
                <Clock class="size-4 opacity-70" />
                <span>{{ t('post.readingTime', { n: post.readingTime }) }}</span>
              </div>
            </div>

            <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 pt-1">
              <Badge v-for="tag in post.tags" :key="tag" variant="secondary" class="font-normal">
                # {{ tag }}
              </Badge>
            </div>
          </header>

          <!-- AI 原稿现代折叠检查器（方案 2：Tabs 选项卡 + 气泡回放） -->
          <section
            v-if="post.origin === 'ai'"
            class="overflow-hidden rounded-xl border border-primary/25 bg-card shadow-xs transition-all duration-300"
          >
            <!-- 头部折叠控制条 -->
            <div
              class="flex cursor-pointer items-center justify-between px-4 py-3 select-none transition hover:bg-muted/40"
              @click="aiInspectorExpanded = !aiInspectorExpanded"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
                  <Sparkles class="size-4" />
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-semibold text-foreground">{{ t('post.aiOriginal') }} 档案与脉络</span>
                    <span v-if="post.model" class="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">{{ post.model }}</span>
                    <span v-if="post.conversation && post.conversation.length > 0" class="hidden sm:inline text-[11px] text-muted-foreground">· {{ t('post.conversationCount', { n: post.conversation.length }) }}</span>
                    <span class="rounded bg-primary/5 px-1.5 py-0.2 text-[10px] text-primary/90 border border-primary/20">{{ t('post.aiUnreviewed') }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  v-if="post.prompt"
                  type="button"
                  class="hidden sm:inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition"
                  @click.stop="copyPrompt"
                >
                  <Check v-if="copiedPrompt" class="size-3 text-emerald-500" />
                  <Copy v-else class="size-3" />
                  <span>{{ copiedPrompt ? '已复制' : '复制 Prompt' }}</span>
                </button>

                <div class="flex items-center gap-1 text-xs font-medium text-primary">
                  <span>{{ aiInspectorExpanded ? '收起' : '展开' }}</span>
                  <ChevronDown class="size-4 transition-transform duration-200" :class="{ 'rotate-180': aiInspectorExpanded }" />
                </div>
              </div>
            </div>

            <!-- 展开区域：Tab 选项卡系统 -->
            <div v-if="aiInspectorExpanded" class="border-t border-border/50">
              <!-- Tab Header -->
              <div class="flex border-b border-border/40 bg-muted/20 px-4">
                <button
                  type="button"
                  class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all"
                  :class="aiInspectorTab === 'prompt'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'"
                  @click="aiInspectorTab = 'prompt'"
                >
                  <Code2 class="size-3.5" />
                  <span>{{ t('post.prompt') }}</span>
                </button>

                <button
                  v-if="post.conversation && post.conversation.length > 0"
                  type="button"
                  class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all"
                  :class="aiInspectorTab === 'chat'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'"
                  @click="aiInspectorTab = 'chat'"
                >
                  <MessageSquareText class="size-3.5" />
                  <span>{{ t('post.conversation') }}</span>
                  <span class="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">{{ post.conversation.length }}</span>
                </button>

                <button
                  type="button"
                  class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all"
                  :class="aiInspectorTab === 'download'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'"
                  @click="aiInspectorTab = 'download'"
                >
                  <Download class="size-3.5" />
                  <span>{{ t('post.downloadGroup') }}</span>
                </button>
              </div>

              <!-- Tab 1: Prompt 提示词 -->
              <div v-if="aiInspectorTab === 'prompt'" class="p-4 sm:p-5 space-y-3">
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span v-if="post.prompt">共 {{ post.prompt.length }} 字 · 原始生成需求</span>
                  <span v-else>{{ t('post.noPrompt') }}</span>
                  <Button v-if="post.prompt" size="sm" variant="outline" class="h-7 text-xs" @click="copyPrompt">
                    <Check v-if="copiedPrompt" class="size-3 mr-1 text-emerald-500" />
                    <Copy v-else class="size-3 mr-1" />
                    <span>{{ copiedPrompt ? '已复制到剪贴板' : '一键复制提示词' }}</span>
                  </Button>
                </div>

                <div class="rounded-xl border border-border/60 bg-muted/40 p-3.5 font-mono text-xs leading-relaxed text-foreground select-all whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  {{ post.prompt || t('post.noPrompt') }}
                </div>
              </div>

              <!-- Tab 2: 对话回溯（现代聊天气泡） -->
              <div v-if="aiInspectorTab === 'chat' && post.conversation && post.conversation.length > 0" class="p-4 sm:p-5 space-y-4 max-h-80 overflow-y-auto">
                <div
                  v-for="(turn, idx) in post.conversation"
                  :key="`${turn.role}-${idx}`"
                  class="flex gap-2.5"
                  :class="turn.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
                >
                  <!-- 头像 -->
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs shadow-2xs"
                    :class="turn.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground ring-1 ring-border'"
                  >
                    <User v-if="turn.role === 'user'" class="size-3.5" />
                    <Bot v-else class="size-3.5" />
                  </div>

                  <!-- 气泡 -->
                  <div
                    class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs"
                    :class="turn.role === 'user'
                      ? 'rounded-tr-xs bg-primary text-primary-foreground'
                      : 'rounded-tl-xs bg-muted/70 text-foreground border border-border/60'"
                  >
                    <div class="flex items-center justify-between gap-4 mb-1 opacity-70 text-[10px]">
                      <span>{{ turn.role === 'user' ? '提问者' : (post.model || 'AI') }}</span>
                    </div>
                    <p class="whitespace-pre-wrap break-words leading-relaxed">{{ turn.content }}</p>
                  </div>
                </div>
              </div>

              <!-- Tab 3: 资产下载 -->
              <div v-if="aiInspectorTab === 'download'" class="p-5 flex flex-wrap items-center justify-between gap-4 bg-muted/10">
                <div>
                  <div class="text-xs font-semibold text-foreground">{{ t('post.downloadGroup') }}</div>
                  <div class="text-[11px] text-muted-foreground mt-0.5">
                    {{ t('post.aiNotice') }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Button variant="outline" size="sm" class="h-8 text-xs" as-child>
                    <a :href="markdownDownloadUrl" :download="`${post.slug}.md`">
                      <Download class="size-3 mr-1.5" />
                      {{ t('post.downloadMarkdown') }}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" class="h-8 text-xs" as-child>
                    <a :href="recordDownloadUrl" :download="`${post.slug}-generation-record.md`">
                      <FileDown class="size-3 mr-1.5" />
                      {{ t('post.downloadRecord') }}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <!-- 窄屏内嵌目录 (TOC) -->
          <div
            v-if="tocItems.length > 0"
            class="block rounded-xl border bg-card/60 p-4 space-y-2 backdrop-blur-sm xl:hidden"
          >
            <div class="flex items-center gap-1.5 font-semibold text-sm text-foreground">
              <ListTree class="size-4 text-primary" />
              <span>{{ t('post.toc') }}</span>
            </div>
            <nav class="space-y-1 text-sm pt-1">
              <button
                v-for="item in tocItems"
                :key="item.id"
                type="button"
                class="block w-full text-left py-1 text-xs transition-colors rounded hover:text-primary"
                :class="[
                  item.level === 3 ? 'pl-4 text-muted-foreground' : 'font-medium text-foreground/90',
                  activeHeadingId === item.id ? 'text-primary font-semibold' : ''
                ]"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </button>
            </nav>
          </div>

          <!-- 文章封面 -->
          <div
            v-if="post.cover"
            class="h-[30vh] max-h-[400px] min-h-[200px] w-full overflow-hidden rounded-xl md:min-h-[260px] border border-border/50 shadow-sm"
          >
            <img
              v-if="isImageCover(post.cover)"
              :src="post.cover"
              :alt="post.title"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center"
              :style="{ background: coverBackground(post.cover) }"
            >
              <span class="text-5xl font-bold text-white/90 drop-shadow md:text-6xl">
                {{ post.title.slice(0, 1) }}
              </span>
            </div>
          </div>

          <Separator />

          <!-- Markdown 编译后内容 -->
          <div
            ref="contentContainerRef"
            class="prose prose-neutral dark:prose-invert min-w-0 max-w-none prose-headings:scroll-mt-6 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:shadow-sm leading-relaxed"
            v-html="post.contentHtml"
          />
        </article>

        <!-- 宽屏侧边栏目录 (TOC) -->
        <aside
          v-if="tocItems.length > 0"
          class="sticky top-6 hidden space-y-3 rounded-xl border bg-card/50 p-5 backdrop-blur-sm xl:col-span-4 xl:block"
        >
          <div class="flex items-center gap-2 font-semibold text-sm text-foreground border-b pb-2.5">
            <ListTree class="size-4 text-primary" />
            <span>{{ t('post.toc') }}</span>
          </div>
          <nav class="max-h-[calc(100dvh-14rem)] space-y-1 overflow-y-auto pr-1">
            <button
              v-for="item in tocItems"
              :key="item.id"
              type="button"
              class="block w-full text-left py-1.5 text-xs transition-colors rounded hover:text-primary leading-relaxed"
              :class="[
                item.level === 3 ? 'pl-4 text-muted-foreground' : 'font-medium text-foreground/80',
                activeHeadingId === item.id ? 'text-primary font-semibold pl-2 border-l-2 border-primary bg-primary/5' : ''
              ]"
              @click="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </button>
          </nav>
        </aside>
      </div>

      <Separator />

      <!-- 文末延伸阅读：左侧较新文章（回到现在）与 右侧较旧文章（探索历史） -->
      <nav
        v-if="newerPost || olderPost"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none"
        aria-label="前后文章导航"
      >
        <!-- 左侧：较新文章（更靠近现在） -->
        <RouterLink
          v-if="newerPost"
          :to="`/post/${newerPost.slug}`"
          class="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card/70 hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
        >
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>{{ t('post.newer') }}</span>
          </div>
          <div class="mt-2 space-y-1">
            <h4 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {{ newerPost.title }}
            </h4>
            <p class="text-[11px] text-muted-foreground">
              {{ formatDate(newerPost.date) }} · {{ newerPost.category || '默认' }}
            </p>
          </div>
        </RouterLink>
        <div v-else class="hidden sm:block" />

        <!-- 右侧：较旧文章（探索历史深处） -->
        <RouterLink
          v-if="olderPost"
          :to="`/post/${olderPost.slug}`"
          class="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card/70 hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 text-right"
          :class="{ 'sm:col-start-2': !newerPost }"
        >
          <div class="flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            <span>{{ t('post.older') }}</span>
            <ArrowRight class="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
          <div class="mt-2 space-y-1">
            <h4 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {{ olderPost.title }}
            </h4>
            <p class="text-[11px] text-muted-foreground">
              {{ formatDate(olderPost.date) }} · {{ olderPost.category || '默认' }}
            </p>
          </div>
        </RouterLink>
      </nav>

      <!--
      <section class="space-y-4 pt-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">评论交流</h2>
        <GiscusComment />
      </section>
      -->

      <div class="pt-2">
        <Button variant="ghost" size="sm" as-child>
          <RouterLink :to="backPath" class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft class="size-4" />
            {{ backLabel }}
          </RouterLink>
        </Button>
      </div>
    </div>

    <SiteFooter />

    <!-- 回到顶部悬浮按钮 -->
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        type="button"
        class="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        :title="t('footer.backToTop')"
        aria-label="Back to top"
        @click="scrollToTop"
      >
        <ArrowUp class="size-5" />
      </button>
    </Transition>

    <!-- 图片灯箱模态 -->
    <Lightbox
      :open="lightboxOpen"
      :src="lightboxSrc"
      :alt="lightboxAlt"
      @close="lightboxOpen = false"
    />
  </div>

  <!-- 404 文章不存在 -->
  <div v-else class="h-full overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-16 md:py-24 space-y-6 text-center">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold">{{ t('post.notFound') }}</h1>
        <p class="text-muted-foreground">{{ t('post.notFoundDesc') }}</p>
      </div>
      <Button as-child>
        <RouterLink to="/">{{ t('post.backHome') }}</RouterLink>
      </Button>
    </div>
    <SiteFooter />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
