<script setup lang="ts">
import { computed, nextTick, onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import { getHomePosts, type Post } from '@/data/posts'
import { siteConfig } from '@/data/site'

const posts = getHomePosts()
const trackRef = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const jumpInput = ref('')
const mounted = ref(false)
const viewActive = ref(false)
const { width: viewportWidth, height: viewportHeight } = useWindowSize()
const { width: trackWidth, height: trackHeight } = useElementSize(trackRef)

const PAGE_GAP = 16
const PAGE_MAX_WIDTH = 1280
const CARD_MIN_WIDTH = 340
const CARD_MIN_HEIGHT = 248
const HOME_PAGE_STORAGE_KEY = 'fulieblog:home-page-index'

let pageRestored = false
let lastActivePerPage = 0

interface LayoutConfig {
  cols: number
  rows: number
  perPage: number
}

// Derive columns from the actual track width so embedded layouts and
// narrow viewports use the same card sizing rules.
function getPageContentWidth(width: number): number {
  if (!width) return 0
  const padding = width >= 768 ? 64 : 32
  return Math.max(0, Math.min(width, PAGE_MAX_WIDTH) - padding)
}

function getColumnCount(width: number): number {
  const contentWidth = getPageContentWidth(width)
  if (!contentWidth) return 1

  return Math.max(
    1,
    Math.min(3, Math.floor((contentWidth + PAGE_GAP) / (CARD_MIN_WIDTH + PAGE_GAP))),
  )
}

const layout = computed<LayoutConfig>(() => {
  const width = mounted.value ? trackWidth.value || viewportWidth.value : 1280
  const height = mounted.value
    ? trackHeight.value || Math.max(viewportHeight.value - 160, CARD_MIN_HEIGHT)
    : 640
  const cols = getColumnCount(width)
  const rows = height >= CARD_MIN_HEIGHT * 2 + PAGE_GAP ? 2 : 1

  return { cols, rows, perPage: cols * rows }
})

const isVerticalHome = computed(() => layout.value.cols === 1)

// 等宽 Grid 类
const gridColsClass = computed(() => {
  if (layout.value.cols === 1) return 'grid-cols-1'
  if (layout.value.cols === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

// 分页切片计算：
// 严格按容量整页打包（宽屏6、中屏4、窄屏2），满页全部填满，余数仅保留在末页
const pages = computed(() => {
  const result: Post[][] = []
  for (let i = 0; i < posts.length; i += layout.value.perPage) {
    result.push(posts.slice(i, i + layout.value.perPage))
  }
  return result
})

function formatTimelineDate(date: string | undefined): string {
  return date ? date.slice(5).replace('-', '/') : ''
}

const pageTimeline = computed(() => pages.value.map((page, index) => {
  const newestDate = formatTimelineDate(page[0]?.date)
  const oldestDate = formatTimelineDate(page[page.length - 1]?.date)

  return {
    index,
    count: page.length,
    dateRange: newestDate === oldestDate ? newestDate : `${oldestDate} - ${newestDate}`,
  }
}))

const activePageTimeline = computed(() => pageTimeline.value[currentPage.value])

function readStoredPage(): number {
  if (typeof window === 'undefined') return 0

  try {
    const storedPage = Number.parseInt(window.sessionStorage.getItem(HOME_PAGE_STORAGE_KEY) || '', 10)
    return Number.isInteger(storedPage) && storedPage >= 0 ? storedPage : 0
  } catch {
    return 0
  }
}

function storePage(page: number) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(HOME_PAGE_STORAGE_KEY, String(page))
  } catch {
    // Ignore storage restrictions; pagination still works in memory.
  }
}

function getPageElement(index: number): HTMLElement | null {
  return trackRef.value?.querySelector<HTMLElement>(`[data-home-page="${index}"]`) ?? null
}

function getVerticalPageTop(element: HTMLElement, track: HTMLElement): number {
  const trackRect = track.getBoundingClientRect()
  const pageRect = element.getBoundingClientRect()
  return Math.max(0, track.scrollTop + pageRect.top - trackRect.top)
}

// 单页内部行数计算（1 行或 2 行）；一列布局改为纵向页面。
function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
  const track = trackRef.value
  if (!track || pages.value.length === 0) return

  const target = Math.max(0, Math.min(index, pages.value.length - 1))
  const targetElement = isVerticalHome.value ? getPageElement(target) : null
  if (isVerticalHome.value && !targetElement) return

  currentPage.value = target
  const position = isVerticalHome.value && targetElement
    ? getVerticalPageTop(targetElement, track)
    : track.clientWidth * target

  if (behavior === 'auto') {
    // The track has scroll-smooth; override it for state restoration and resize reflow.
    const previousScrollBehavior = track.style.scrollBehavior
    track.style.scrollBehavior = 'auto'
    if (isVerticalHome.value) track.scrollTop = position
    else track.scrollLeft = position
    track.style.scrollBehavior = previousScrollBehavior
    return
  }

  if (isVerticalHome.value) track.scrollTo({ top: position, behavior })
  else track.scrollTo({ left: position, behavior })
}

function restoreStoredPage() {
  if (
    pageRestored
    || !mounted.value
    || !trackRef.value
    || !trackWidth.value
    || !trackHeight.value
  ) return

  pageRestored = true
  lastActivePerPage = layout.value.perPage
  scrollToIndex(readStoredPage(), 'auto')
}

function handlePrev() {
  if (currentPage.value > 0) scrollToIndex(currentPage.value - 1)
}

function handleNext() {
  if (currentPage.value < pages.value.length - 1) scrollToIndex(currentPage.value + 1)
}

function handleDirectJump() {
  const pageNum = parseInt(jumpInput.value, 10)
  if (!Number.isNaN(pageNum)) scrollToIndex(Math.max(1, Math.min(pageNum, pages.value.length)) - 1)
  jumpInput.value = ''
}

function handleTimelineInput(event: Event) {
  const page = Number((event.target as HTMLInputElement).value)
  if (Number.isInteger(page)) scrollToIndex(page, 'auto')
}

// wheel 节流：一次手势只翻一页
let lastWheelTime = 0
const WHEEL_COOLDOWN = 700

function onWheel(e: WheelEvent) {
  if (isVerticalHome.value) return

  // 让水平方向滚轮/触控板横向手势保持原生 snap 滚动
  const track = trackRef.value
  if (!track || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
  if (track.scrollHeight > track.clientHeight + 1) return

  e.preventDefault()
  const now = Date.now()
  if (now - lastWheelTime < WHEEL_COOLDOWN || Math.abs(e.deltaY) < 18) return
  lastWheelTime = now

  if (e.deltaY > 0) handleNext()
  else handlePrev()
}

// 滚动时同步当前页（节流）
let scrollRaf: number | null = null
function onScroll() {
  if (!viewActive.value) return
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    if (!viewActive.value) return
    const track = trackRef.value
    if (!track || pages.value.length === 0) return

    let newPage = 0
    if (isVerticalHome.value) {
      const pageElements = pages.value.map((_, index) => getPageElement(index)).filter((element): element is HTMLElement => Boolean(element))
      const trackTop = track.getBoundingClientRect().top
      const markerTop = trackTop + Math.min(96, track.clientHeight * 0.35)

      pageElements.forEach((element, index) => {
        if (element.getBoundingClientRect().top <= markerTop) newPage = index
      })

      if (track.scrollTop + track.clientHeight >= track.scrollHeight - 2) {
        newPage = pages.value.length - 1
      }
    } else {
      if (!track.clientWidth) return
      newPage = Math.round(track.scrollLeft / track.clientWidth)
    }

    currentPage.value = Math.max(0, Math.min(newPage, pages.value.length - 1))
  })
}

// 视口宽度变化时重新分页并归位到最近一页
// Keep the first visible post stable when the number of columns or rows changes.
watch(
  [() => layout.value.perPage, () => isVerticalHome.value, trackWidth],
  async ([perPage, , nextWidth]) => {
    if (!mounted.value || !viewActive.value || !pageRestored || !trackRef.value || !nextWidth) return

    const oldPerPage = lastActivePerPage || perPage
    const anchorIndex = Math.max(0, Math.min(posts.length - 1, currentPage.value * oldPerPage))
    const targetPage = Math.floor(anchorIndex / perPage)

    await nextTick()
    if (!viewActive.value || !trackRef.value) return
    lastActivePerPage = perPage
    scrollToIndex(targetPage, 'auto')
  },
)

watch(
  [trackWidth, trackHeight],
  async ([nextWidth, nextHeight]) => {
    if (!nextWidth || !nextHeight) return
    await nextTick()
    restoreStoredPage()
  },
  { flush: 'post' },
)

watch(currentPage, (page) => {
  if (mounted.value) storePage(page)
})

onMounted(() => {
  mounted.value = true
  viewActive.value = true
  trackRef.value?.addEventListener('wheel', onWheel, { passive: false })

  nextTick(restoreStoredPage)
})

onActivated(() => {
  viewActive.value = true
})

onDeactivated(() => {
  viewActive.value = false
})

onUnmounted(() => {
  storePage(currentPage.value)
  trackRef.value?.removeEventListener('wheel', onWheel)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- 顶部标题区 -->
    <div class="shrink-0 px-4 pt-4 pb-2 md:px-8 md:pt-5 md:pb-3 max-w-7xl mx-auto w-full">
      <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
        {{ siteConfig.site.title }}
      </h1>
      <p class="text-sm text-muted-foreground md:text-base">
        {{ siteConfig.site.description }}
      </p>
    </div>

    <!-- 一列布局：页面区域纵向滚动，选择条固定在滚动容器上方 -->
    <nav
      v-if="isVerticalHome && pages.length > 1"
      class="home-mobile-timeline shrink-0 border-y bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      aria-label="首页页面导航"
    >
      <div class="mx-auto w-full max-w-7xl">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2 text-xs">
            <span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span class="truncate font-medium text-foreground">{{ activePageTimeline?.dateRange }}</span>
            <span class="shrink-0 text-muted-foreground">{{ activePageTimeline?.count }} 篇</span>
          </div>
          <span class="shrink-0 font-mono text-xs font-semibold text-primary">
            {{ currentPage + 1 }}<span class="px-0.5 text-muted-foreground/60">/</span>{{ pages.length }}
          </span>
        </div>

        <div class="relative mt-2 h-6 px-0.5">
          <div class="pointer-events-none absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 gap-1">
            <span
              v-for="page in pageTimeline"
              :key="`timeline-bar-${page.index}`"
              class="min-w-0 flex-1 rounded-full transition-colors duration-200"
              :class="page.index <= currentPage ? 'bg-primary' : 'bg-muted-foreground/20'"
            />
          </div>
          <input
            type="range"
            min="0"
            :max="pages.length - 1"
            step="1"
            :value="currentPage"
            aria-label="选择首页页面"
            :aria-valuetext="`第 ${currentPage + 1} 页，共 ${pages.length} 页`"
            class="home-page-range"
            @input="handleTimelineInput"
          />
        </div>

        <div class="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <button
            type="button"
            class="min-w-0 truncate text-left transition-colors hover:text-foreground focus:outline-none focus-visible:text-primary"
            :aria-label="`第 1 页，${pageTimeline[0]?.dateRange ?? ''}`"
            @click="scrollToIndex(0)"
          >
            {{ pageTimeline[0]?.dateRange }}
          </button>
          <span class="shrink-0">页面</span>
          <button
            type="button"
            class="min-w-0 truncate text-right transition-colors hover:text-foreground focus:outline-none focus-visible:text-primary"
            :aria-label="`第 ${pages.length} 页，${pageTimeline[pages.length - 1]?.dateRange ?? ''}`"
            @click="scrollToIndex(pages.length - 1)"
          >
            {{ pageTimeline[pages.length - 1]?.dateRange }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 多列横向分页；一列布局切换为上下滚动 -->
    <div
      ref="trackRef"
      class="home-track min-h-0 flex flex-1 scroll-smooth scrollbar-hide"
      :class="isVerticalHome
        ? 'flex-col overflow-x-hidden overflow-y-auto snap-none touch-pan-y'
        : 'overflow-x-auto overflow-y-auto snap-x snap-mandatory'"
      @scroll="onScroll"
    >
      <section
        v-for="(page, pageIndex) in pages"
        :key="`${layout.perPage}-${pageIndex}`"
        :data-home-page="pageIndex"
        class="flex h-auto w-full shrink-0 flex-col justify-start"
        :class="isVerticalHome ? 'min-h-0' : 'snap-start min-h-full'"
      >
        <!-- 内部居中限宽容器：justify-start 让 Grid 靠上，留白总是在下方 -->
        <div
          class="mx-auto flex w-full max-w-7xl flex-col justify-start px-4 py-2 md:px-8 md:py-3"
          :class="isVerticalHome ? 'min-h-0' : 'min-h-full'"
        >
          <div
            class="grid w-full auto-rows-min gap-4 transition-all duration-300"
            :class="[gridColsClass]"
            :style="isVerticalHome
              ? undefined
              : { gridTemplateRows: `repeat(${layout.rows}, minmax(${CARD_MIN_HEIGHT}px, auto))` }"
          >
            <RouterLink
              v-for="post in page"
              :key="post.slug"
              :to="`/post/${post.slug}`"
              class="group flex min-h-0 col-span-1 min-w-0 max-w-full"
            >
              <PostCard
                :post="post"
                compact
                class="w-full"
              />
            </RouterLink>
          </div>
        </div>
      </section>
    </div>

    <!-- 底部分页条：页码数字按钮 + 前后步进 + 快速跳转输入框 -->
    <nav
      v-if="pages.length > 1 && !isVerticalHome"
      class="shrink-0 flex items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-4 select-none"
      aria-label="分页导航"
    >
      <!-- 上一页 -->
      <button
        type="button"
        class="inline-flex size-7 sm:size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-30 cursor-pointer shadow-xs"
        :disabled="currentPage === 0"
        aria-label="上一页"
        @click="handlePrev"
      >
        <ChevronLeft class="size-3.5 sm:size-4" />
      </button>

      <!-- 中/宽屏：数字按钮列表 -->
      <div class="hidden sm:flex items-center gap-1">
        <button
          v-for="(_, index) in pages"
          :key="index"
          type="button"
          class="inline-flex size-7 sm:size-8 items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          :class="[
            index === currentPage
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          ]"
          :aria-label="`第 ${index + 1} 页`"
          :aria-current="index === currentPage ? 'page' : undefined"
          @click="scrollToIndex(index)"
        >
          {{ index + 1 }}
        </button>
      </div>

      <!-- 窄屏：紧凑当前页/总页显示 -->
      <div class="flex sm:hidden items-center px-2 py-1 rounded-md border border-border bg-card text-xs font-medium font-mono text-foreground shadow-xs">
        <span class="text-primary font-semibold">{{ currentPage + 1 }}</span>
        <span class="mx-1 text-muted-foreground/60">/</span>
        <span class="text-muted-foreground">{{ pages.length }}</span>
      </div>

      <!-- 下一页 -->
      <button
        type="button"
        class="inline-flex size-7 sm:size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-30 cursor-pointer shadow-xs"
        :disabled="currentPage === pages.length - 1"
        aria-label="下一页"
        @click="handleNext"
      >
        <ChevronRight class="size-3.5 sm:size-4" />
      </button>

      <!-- 分隔线 -->
      <div class="h-4 w-[1px] bg-border mx-0.5" />

      <!-- 直接跳转输入框 -->
      <form
        class="flex items-center gap-1"
        @submit.prevent="handleDirectJump"
      >
        <div class="relative flex items-center">
          <input
            v-model="jumpInput"
            type="number"
            min="1"
            :max="pages.length"
            :placeholder="`${currentPage + 1}`"
            class="h-7 sm:h-8 w-11 sm:w-14 rounded-md border border-border bg-card px-1.5 sm:px-2 text-center text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-xs"
            aria-label="跳转到指定页"
          />
        </div>
        <button
          type="submit"
          class="inline-flex size-7 sm:size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-xs"
          title="跳转"
          aria-label="确认跳转"
        >
          <CornerDownLeft class="size-3 sm:size-3.5" />
        </button>
      </form>
    </nav>
  </div>
</template>

<style scoped>
.home-track {
  overscroll-behavior: contain;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.home-page-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: grab;
  opacity: 0;
  outline: none;
}

.home-page-range:active {
  cursor: grabbing;
}

.home-page-range:focus-visible {
  border-radius: 9999px;
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
</style>
