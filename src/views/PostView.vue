<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Calendar, Clock, Folder, ListTree, ArrowUp } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import GiscusComment from '@/components/GiscusComment.vue'
import Lightbox from '@/components/Lightbox.vue'
import { getPostBySlug, formatDate } from '@/data/posts'
import { t } from '@/i18n'

interface Props {
  slug: string
}

const props = defineProps<Props>()
const post = computed(() => getPostBySlug(props.slug))

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

watch(
  () => post.value?.contentHtml,
  () => {
    extractToc()
    nextTick(() => {
      bindImageClicksAndObserve()
    })
  },
  { immediate: true },
)

onMounted(() => {
  nextTick(() => {
    bindImageClicksAndObserve()
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
    class="h-full overflow-y-auto relative scroll-smooth"
    @scroll="handleScroll"
  >
    <div class="mx-auto max-w-5xl px-4 py-6 md:py-10 space-y-8">
      <!-- 顶部返回 -->
      <Button variant="ghost" size="sm" as-child>
        <RouterLink to="/" class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft class="size-4" />
          {{ t('post.back') }}
        </RouterLink>
      </Button>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- 主文章内容区 -->
        <article class="space-y-8" :class="tocItems.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'">
          <header class="space-y-4">
            <div v-if="post.category" class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-xs font-medium text-primary px-2.5 py-1 rounded-full bg-primary/10">
                <Folder class="size-3" />
                {{ post.category }}
              </span>
            </div>

            <h1 class="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl text-foreground">
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

          <!-- 窄屏内嵌目录 (TOC) -->
          <div
            v-if="tocItems.length > 0"
            class="block lg:hidden rounded-xl border bg-card/60 p-4 space-y-2 backdrop-blur-sm"
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
            class="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-6 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:shadow-sm leading-relaxed"
            v-html="post.contentHtml"
          />
        </article>

        <!-- 宽屏侧边栏目录 (TOC) -->
        <aside
          v-if="tocItems.length > 0"
          class="hidden lg:block lg:col-span-4 sticky top-6 space-y-3 rounded-xl border bg-card/50 p-5 backdrop-blur-sm"
        >
          <div class="flex items-center gap-2 font-semibold text-sm text-foreground border-b pb-2.5">
            <ListTree class="size-4 text-primary" />
            <span>{{ t('post.toc') }}</span>
          </div>
          <nav class="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
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

      <!-- 底部评论区 -->
      <section class="space-y-4 pt-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">评论交流</h2>
        <GiscusComment />
      </section>

      <div class="pt-2">
        <Button variant="ghost" size="sm" as-child>
          <RouterLink to="/" class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft class="size-4" />
            {{ t('post.back') }}
          </RouterLink>
        </Button>
      </div>
    </div>

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
