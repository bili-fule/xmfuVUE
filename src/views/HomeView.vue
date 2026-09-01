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
const activeTimelineKey = ref(posts[0] ? getTimelineKey(posts[0].date) : '')
const activeTimelineDate = ref(posts[0]?.date ?? '')
const selectedTimelineDate = ref(posts[0]?.date ?? '')
const selectedTimelineYear = ref(posts[0]?.date?.slice(0, 4) ?? '')
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

// 文章按布局容量分组；移动端的时间导航使用独立的年月分组。
const pages = computed(() => {
  const result: Post[][] = []
  for (let i = 0; i < posts.length; i += layout.value.perPage) {
    result.push(posts.slice(i, i + layout.value.perPage))
  }
  return result
})

interface TimelineMonthGroup {
  key: string
  year: string
  month: number
  count: number
  posts: Post[]
  newestDate: string
  oldestDate: string
}

interface TimelineSegment {
  group: TimelineMonthGroup
  width: number
  center: number
}

function getTimelineKey(date: string): string {
  return date.slice(0, 7)
}

function formatFullDate(date: string | undefined): string {
  if (!date) return ''

  const [year, month, day] = date.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

function getDateTimestamp(date: string): number {
  const timestamp = Date.parse(`${date}T00:00:00Z`)
  return Number.isFinite(timestamp) ? timestamp : Number.NaN
}

const timelineGroups = computed<TimelineMonthGroup[]>(() => {
  const grouped = new Map<string, Post[]>()

  posts.forEach((post) => {
    const key = getTimelineKey(post.date)
    const groupPosts = grouped.get(key) ?? []
    groupPosts.push(post)
    grouped.set(key, groupPosts)
  })

  return Array.from(grouped.entries()).map(([key, groupPosts]) => ({
    key,
    year: key.slice(0, 4),
    month: Number(key.slice(5, 7)),
    count: groupPosts.length,
    posts: groupPosts,
    newestDate: groupPosts[0]?.date ?? '',
    oldestDate: groupPosts[groupPosts.length - 1]?.date ?? '',
  }))
})

const timelineGroupBySlug = computed(() => {
  const groups = new Map<string, TimelineMonthGroup>()

  timelineGroups.value.forEach((group) => {
    group.posts.forEach((post) => groups.set(post.slug, group))
  })

  return groups
})

const timelineYears = computed(() => Array.from(
  new Set(timelineGroups.value.map((group) => group.year)),
))

const activeTimelineGroup = computed(() =>
  timelineGroups.value.find((group) => group.key === activeTimelineKey.value)
  ?? timelineGroups.value[0],
)

const visibleTimelineGroups = computed(() => {
  const year = selectedTimelineYear.value || activeTimelineGroup.value?.year
  return timelineGroups.value.filter((group) => group.year === year)
})

const timelineSegments = computed<TimelineSegment[]>(() => {
  const groups = visibleTimelineGroups.value
  if (groups.length === 0) return []

  const weights = groups.map((group, index) => {
    const newerGroup = groups[index - 1]
    const gapDays = newerGroup
      ? Math.abs(getDateTimestamp(newerGroup.newestDate) - getDateTimestamp(group.newestDate)) / 86_400_000
      : 30
    const timeWeight = Number.isFinite(gapDays) ? Math.min(3, Math.log1p(Math.max(gapDays, 1) / 30)) : 1
    const articleWeight = Math.min(2, Math.log1p(group.count))
    return 1 + timeWeight * 0.45 + articleWeight * 0.35
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

  let offset = 0
  return groups.map((group, index) => {
    const width = (weights[index] / totalWeight) * 100
    const segment = { group, width, center: offset + width / 2 }
    offset += width
    return segment
  })
})

const activeTimelinePosition = computed(() => {
  const segment = timelineSegments.value.find(({ group }) => group.key === activeTimelineKey.value)
  return segment?.center ?? 50
})

const timelineMinDate = computed(() => posts[posts.length - 1]?.date ?? '')
const timelineMaxDate = computed(() => posts[0]?.date ?? '')

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

function getPostElement(slug: string): HTMLElement | null {
  return Array.from(trackRef.value?.querySelectorAll<HTMLElement>('[data-home-post]') ?? [])
    .find((element) => element.dataset.homePost === slug) ?? null
}

function getVerticalElementTop(element: HTMLElement, track: HTMLElement): number {
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
    ? getVerticalElementTop(targetElement, track)
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
  const position = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(position) || timelineSegments.value.length === 0) return

  const target = timelineSegments.value.reduce((closest, segment) =>
    Math.abs(segment.center - position) < Math.abs(closest.center - position) ? segment : closest,
  )
  scrollToTimelineGroup(target.group, 'auto')
}

function findClosestPost(date: string): Post | undefined {
  const firstPost = posts[0]
  if (!firstPost) return undefined

  const targetTimestamp = getDateTimestamp(date)
  if (!Number.isFinite(targetTimestamp)) return firstPost

  return posts.reduce((closest, post) => {
    const closestDistance = Math.abs(getDateTimestamp(closest.date) - targetTimestamp)
    const postDistance = Math.abs(getDateTimestamp(post.date) - targetTimestamp)
    return postDistance < closestDistance ? post : closest
  }, firstPost)
}

function scrollToTimelinePost(post: Post, behavior: ScrollBehavior = 'smooth') {
  const track = trackRef.value
  const element = getPostElement(post.slug)
  if (!track || !element || !isVerticalHome.value) return

  const pageElement = element.closest<HTMLElement>('[data-home-page]')
  const pageIndex = Number(pageElement?.dataset.homePage ?? '')
  if (Number.isInteger(pageIndex)) currentPage.value = pageIndex

  const group = timelineGroupBySlug.value.get(post.slug)
  if (group) {
    activeTimelineKey.value = group.key
    activeTimelineDate.value = post.date
    selectedTimelineDate.value = post.date
    selectedTimelineYear.value = group.year
  }

  const position = getVerticalElementTop(element, track)
  if (behavior === 'auto') {
    const previousScrollBehavior = track.style.scrollBehavior
    track.style.scrollBehavior = 'auto'
    track.scrollTop = position
    track.style.scrollBehavior = previousScrollBehavior
    return
  }

  track.scrollTo({ top: position, behavior })
}

function scrollToTimelineGroup(group: TimelineMonthGroup, behavior: ScrollBehavior = 'smooth') {
  const post = group.posts[0]
  if (post) scrollToTimelinePost(post, behavior)
}

function handleTimelineYearChange() {
  const group = timelineGroups.value.find(({ year }) => year === selectedTimelineYear.value)
  if (group) scrollToTimelineGroup(group)
}

function handleTimelineDateChange() {
  const post = findClosestPost(selectedTimelineDate.value)
  if (post) scrollToTimelinePost(post)
}

function updateTimelineFromScroll(track: HTMLElement, markerTop: number) {
  const postElements = Array.from(track.querySelectorAll<HTMLElement>('[data-home-post]'))
  if (postElements.length === 0) return

  let visiblePostElement = postElements[0]
  postElements.forEach((element) => {
    if (element.getBoundingClientRect().top <= markerTop) visiblePostElement = element
  })

  if (track.scrollTop + track.clientHeight >= track.scrollHeight - 2) {
    visiblePostElement = postElements[postElements.length - 1]
  }

  const slug = visiblePostElement.dataset.homePost
  const group = slug ? timelineGroupBySlug.value.get(slug) : undefined
  const post = slug ? posts.find((item) => item.slug === slug) : undefined
  if (!group || !post) return

  activeTimelineKey.value = group.key
  activeTimelineDate.value = post.date
  selectedTimelineDate.value = post.date
  selectedTimelineYear.value = group.year
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

      updateTimelineFromScroll(track, markerTop)
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

  nextTick(() => {
    restoreStoredPage()
    const track = trackRef.value
    if (track && isVerticalHome.value) {
      const markerTop = track.getBoundingClientRect().top + Math.min(96, track.clientHeight * 0.35)
      updateTimelineFromScroll(track, markerTop)
    }
  })
})

onActivated(() => {
  viewActive.value = true
  nextTick(() => {
    const track = trackRef.value
    if (track && isVerticalHome.value) {
      const markerTop = track.getBoundingClientRect().top + Math.min(96, track.clientHeight * 0.35)
      updateTimelineFromScroll(track, markerTop)
    }
  })
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

    <!-- 一列布局：文章区域连续滚动，时间导航固定在滚动容器上方 -->
    <nav
      v-if="isVerticalHome && timelineGroups.length > 0"
      class="home-mobile-timeline shrink-0 border-y bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      aria-label="首页时间导航"
    >
      <div class="mx-auto w-full max-w-7xl">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-baseline gap-2 text-xs">
            <span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <time
              :datetime="activeTimelineDate"
              class="truncate text-sm font-semibold tracking-tight text-foreground"
            >
              {{ formatFullDate(activeTimelineDate) }}
            </time>
            <span class="shrink-0 text-muted-foreground">{{ activeTimelineGroup?.count }} 篇</span>
          </div>
          <span class="shrink-0 text-[10px] text-muted-foreground">共 {{ posts.length }} 篇</span>
        </div>

        <div class="mt-1.5 flex items-center gap-2">
          <select
            v-model="selectedTimelineYear"
            class="h-8 w-[6.5rem] shrink-0 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="选择年份"
            @change="handleTimelineYearChange"
          >
            <option
              v-for="year in timelineYears"
              :key="year"
              :value="year"
            >
              {{ year }}年
            </option>
          </select>
          <input
            v-model="selectedTimelineDate"
            type="date"
            :min="timelineMinDate"
            :max="timelineMaxDate"
            aria-label="按日期定位"
            class="h-8 min-w-0 flex-1 rounded-md border border-border bg-card px-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            @change="handleTimelineDateChange"
          />
        </div>

        <div class="relative mt-1.5 h-6 px-0.5">
          <div class="pointer-events-none absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted-foreground/15">
            <span
              v-for="segment in timelineSegments"
              :key="`timeline-segment-${segment.group.key}`"
              class="h-full shrink-0 transition-colors duration-200"
              :class="segment.group.key === activeTimelineKey ? 'bg-primary' : 'bg-muted-foreground/25'"
              :style="{ width: `${segment.width}%` }"
            />
          </div>
          <div
            class="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background transition-[left] duration-200"
            :style="{ left: `${activeTimelinePosition}%` }"
          />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="activeTimelinePosition"
            aria-label="在时间轴上定位"
            :aria-valuetext="formatFullDate(activeTimelineDate)"
            class="home-page-range"
            @input="handleTimelineInput"
          />
        </div>

        <div class="mt-0.5 flex items-start gap-1 overflow-hidden text-[10px] text-muted-foreground">
          <button
            v-for="segment in timelineSegments"
            :key="`timeline-label-${segment.group.key}`"
            type="button"
            class="min-w-0 truncate text-center transition-colors hover:text-foreground focus:outline-none focus-visible:text-primary"
            :class="segment.group.key === activeTimelineKey ? 'font-semibold text-primary' : ''"
            :style="{ width: `${segment.width}%` }"
            :aria-current="segment.group.key === activeTimelineKey ? 'location' : undefined"
            :aria-label="`${segment.group.year}年${segment.group.month}月，共 ${segment.group.count} 篇`"
            @click="scrollToTimelineGroup(segment.group)"
          >
            {{ segment.group.month }}月 · {{ segment.group.count }}
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
              :data-home-post="post.slug"
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
