<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useElementSize, useWindowSize, onClickOutside } from '@vueuse/core'
import {
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Sparkles,
  Layers,
  Calendar,
  History,
  X,
  ChevronDown,
  Check,
} from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { getHomePosts, type Post } from '@/data/posts'
import { siteConfig } from '@/data/site'
import { t } from '@/i18n'

const allPosts = getHomePosts()
const trackRef = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const jumpInput = ref('')
const mounted = ref(false)
const viewActive = ref(false)

// 筛选与抽屉状态
// selectedFilterType: 'all' | 'ai' | 'category'
const selectedFilterType = ref<'all' | 'ai' | 'category'>('all')
const selectedCategory = ref<string>('')
const categoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)
const timelineDrawerOpen = ref(false)

onClickOutside(categoryDropdownRef, () => {
  categoryDropdownOpen.value = false
})

const { width: viewportWidth, height: viewportHeight } = useWindowSize()
const { width: trackWidth, height: trackHeight } = useElementSize(trackRef)

const PAGE_GAP = 16
const PAGE_MAX_WIDTH = 1280
const CARD_MIN_WIDTH = 320
const CARD_MIN_HEIGHT = 240
const HOME_PAGE_STORAGE_KEY = 'fulieblog:home-page-index'

let pageRestored = false
let lastActivePerPage = 0

// 分类统计
const categories = computed(() => {
  const catMap = new Map<string, number>()
  allPosts.forEach((post) => {
    if (post.category) {
      catMap.set(post.category, (catMap.get(post.category) || 0) + 1)
    }
  })
  return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }))
})

const aiPostsCount = computed(() => allPosts.filter(p => p.origin === 'ai').length)

// 年月分组结构（用于快速直达跳转抽屉）
interface MonthArchive {
  month: number
  key: string
  count: number
  firstSlug: string
}

interface YearArchive {
  year: string
  count: number
  months: MonthArchive[]
}

const archiveTimeline = computed<YearArchive[]>(() => {
  const yearMap = new Map<string, Map<number, { count: number, firstSlug: string }>>()

  filteredPosts.value.forEach((post) => {
    if (!post.date) return
    const year = post.date.slice(0, 4)
    const month = Number(post.date.slice(5, 7))

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map())
    }
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) {
      monthMap.set(month, { count: 1, firstSlug: post.slug })
    } else {
      monthMap.get(month)!.count += 1
    }
  })

  return Array.from(yearMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, monthsMap]) => {
      let total = 0
      const months: MonthArchive[] = Array.from(monthsMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([month, data]) => {
          total += data.count
          return {
            month,
            key: `${year}-${String(month).padStart(2, '0')}`,
            count: data.count,
            firstSlug: data.firstSlug,
          }
        })

      return {
        year,
        count: total,
        months,
      }
    })
})

// 根据筛选条件过滤文章
const filteredPosts = computed(() => {
  return allPosts.filter((post) => {
    if (selectedFilterType.value === 'ai') {
      return post.origin === 'ai'
    }
    if (selectedFilterType.value === 'category' && selectedCategory.value) {
      return post.category === selectedCategory.value
    }
    return true
  })
})

// 分类与类型选择切换
function selectAll() {
  selectedFilterType.value = 'all'
  selectedCategory.value = ''
  categoryDropdownOpen.value = false
}

function selectAi() {
  selectedFilterType.value = 'ai'
  selectedCategory.value = ''
  categoryDropdownOpen.value = false
}

function selectSpecificCategory(cat: string) {
  selectedFilterType.value = 'category'
  selectedCategory.value = cat
  categoryDropdownOpen.value = false
}

// 当前分类选择器展示的文本
const currentFilterLabel = computed(() => {
  if (selectedFilterType.value === 'ai') return t('filter.ai')
  if (selectedFilterType.value === 'category' && selectedCategory.value) return selectedCategory.value
  return t('filter.allCategories')
})

// 移动端精准直达跳转定位
function jumpToPost(slug: string) {
  timelineDrawerOpen.value = false
  nextTick(() => {
    const el = document.getElementById(`post-${slug}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

interface LayoutConfig {
  cols: number
  rows: number
  perPage: number
}

function getPageContentWidth(width: number): number {
  if (!width) return 0
  const padding = width >= 768 ? 64 : 32
  return Math.max(0, Math.min(width, PAGE_MAX_WIDTH) - padding)
}

function getColumnCount(width: number): number {
  const contentWidth = getPageContentWidth(width)
  if (!contentWidth) return 1

  const calculatedCols = Math.floor((contentWidth + PAGE_GAP) / (CARD_MIN_WIDTH + PAGE_GAP))
  return Math.max(1, Math.min(3, calculatedCols))
}

const layout = computed<LayoutConfig>(() => {
  const width = mounted.value ? trackWidth.value || viewportWidth.value : 1280
  const height = mounted.value
    ? trackHeight.value || Math.max(viewportHeight.value - 160, CARD_MIN_HEIGHT)
    : 640
  const cols = getColumnCount(width)
  // 如果可视区可用高度放不下两行完整卡片与间距，则自动收缩为 1 行；如果只剩 1 列也切为 1 行
  const rows = cols === 1 ? 1 : height >= CARD_MIN_HEIGHT * 2 + PAGE_GAP ? 2 : 1

  return { cols, rows, perPage: cols * rows }
})

const isVerticalHome = computed(() => layout.value.cols === 1)

// 等宽 Grid 类
const gridColsClass = computed(() => {
  if (layout.value.cols === 1) return 'grid-cols-1'
  if (layout.value.cols === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

// 文章按布局容量分页
const pages = computed(() => {
  const result: Post[][] = []
  const list = filteredPosts.value
  for (let i = 0; i < list.length; i += layout.value.perPage) {
    result.push(list.slice(i, i + layout.value.perPage))
  }
  return result
})

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
    // Ignore storage restrictions
  }
}

function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
  const track = trackRef.value
  if (!track || pages.value.length === 0) return

  const target = Math.max(0, Math.min(index, pages.value.length - 1))
  currentPage.value = target

  if (!isVerticalHome.value) {
    const position = track.clientWidth * target
    if (behavior === 'auto') {
      const previousScrollBehavior = track.style.scrollBehavior
      track.style.scrollBehavior = 'auto'
      track.scrollLeft = position
      track.style.scrollBehavior = previousScrollBehavior
      return
    }
    track.scrollTo({ left: position, behavior })
  }
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
  if (!isVerticalHome.value) {
    scrollToIndex(readStoredPage(), 'auto')
  }
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

// 筛选重置回到首位
function resetPage() {
  currentPage.value = 0
  if (trackRef.value) {
    if (isVerticalHome.value) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      trackRef.value.scrollLeft = 0
    }
  }
}

watch([selectedFilterType, selectedCategory], () => {
  resetPage()
})

// 桌面端横向滚动滚轮翻页
let lastWheelTime = 0
const WHEEL_COOLDOWN = 600

function onWheel(e: WheelEvent) {
  if (isVerticalHome.value) return

  const track = trackRef.value
  if (!track) return

  // 只要有纵向滚动量且不是在水平触摸板滚动
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) >= 15) {
    e.preventDefault()
    const now = Date.now()
    if (now - lastWheelTime < WHEEL_COOLDOWN) return
    lastWheelTime = now

    if (e.deltaY > 0) handleNext()
    else handlePrev()
  }
}

// 桌面端同步当前页码
let scrollRaf: number | null = null
function onScroll() {
  if (!viewActive.value || isVerticalHome.value) return
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    if (!viewActive.value) return
    const currentTrack = trackRef.value
    if (!currentTrack || pages.value.length === 0 || !currentTrack.clientWidth) return

    const newPage = Math.round(currentTrack.scrollLeft / currentTrack.clientWidth)
    currentPage.value = Math.max(0, Math.min(newPage, pages.value.length - 1))
  })
}

// 视口大小变化处理
watch(
  [() => layout.value.perPage, () => isVerticalHome.value, trackWidth],
  async ([perPage, , nextWidth]) => {
    if (!mounted.value || !viewActive.value || !pageRestored || !trackRef.value || !nextWidth) return

    const oldPerPage = lastActivePerPage || perPage
    const anchorIndex = Math.max(0, Math.min(filteredPosts.value.length - 1, currentPage.value * oldPerPage))
    const targetPage = Math.floor(anchorIndex / perPage)

    await nextTick()
    if (!viewActive.value || !trackRef.value) return
    lastActivePerPage = perPage
    if (!isVerticalHome.value) {
      scrollToIndex(targetPage, 'auto')
    }
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
  })
})

onUnmounted(() => {
  storePage(currentPage.value)
  trackRef.value?.removeEventListener('wheel', onWheel)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- 桌面端标题 -->
    <div
      v-if="!isVerticalHome"
      class="mx-auto w-full max-w-7xl shrink-0 px-4 pt-4 pb-2 md:px-8 md:pt-5 md:pb-3"
    >
      <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
        {{ siteConfig.site.title }}
      </h1>
      <p class="text-sm text-muted-foreground md:text-base">
        {{ siteConfig.site.description }}
      </p>
    </div>

    <!-- 移动端：轻量紧凑的筛选胶囊栏 + 自定义分类/类型浮层 + 归档直达抽屉按钮 -->
    <div
      v-if="isVerticalHome"
      class="sticky top-14 z-30 shrink-0 border-b bg-background/95 px-3 py-2.5 backdrop-blur-md"
    >
      <div class="flex items-center gap-2">
        <!-- 自定义分类下拉选择菜单（包含 全部、AI原稿 以及 真实分类） -->
        <div ref="categoryDropdownRef" class="relative shrink-0">
          <button
            type="button"
            class="inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all select-none"
            :class="selectedFilterType !== 'all'
              ? 'border-primary/50 bg-primary/10 text-primary font-semibold shadow-xs'
              : 'border-border/80 bg-muted/60 text-foreground hover:bg-muted'"
            @click="categoryDropdownOpen = !categoryDropdownOpen"
          >
            <Sparkles v-if="selectedFilterType === 'ai'" class="size-3.5 text-primary shrink-0" />
            <Layers v-else class="size-3.5 text-muted-foreground shrink-0" />
            <span class="max-w-[120px] truncate">{{ currentFilterLabel }}</span>
            <ChevronDown class="size-3 opacity-60 transition-transform duration-200" :class="{ 'rotate-180': categoryDropdownOpen }" />
          </button>

          <!-- 自定义 Dropdown 菜单 -->
          <Transition name="dropdown">
            <div
              v-if="categoryDropdownOpen"
              class="absolute left-0 top-full mt-1.5 z-40 w-48 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl backdrop-blur-md ring-1 ring-black/5"
            >
              <!-- 全部分类选项 -->
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                :class="selectedFilterType === 'all'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:bg-muted'"
                @click="selectAll"
              >
                <span>{{ t('filter.allCategories') }}</span>
                <div class="flex items-center gap-1">
                  <span class="text-[11px] font-mono text-muted-foreground">({{ allPosts.length }})</span>
                  <Check v-if="selectedFilterType === 'all'" class="size-3.5 text-primary" />
                </div>
              </button>

              <div class="my-1 h-px bg-border/60" />

              <!-- AI 原稿特别分类 -->
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                :class="selectedFilterType === 'ai'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:bg-muted'"
                @click="selectAi"
              >
                <div class="flex items-center gap-1.5">
                  <Sparkles class="size-3.5 text-primary" />
                  <span>{{ t('filter.ai') }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[11px] font-mono text-muted-foreground">({{ aiPostsCount }})</span>
                  <Check v-if="selectedFilterType === 'ai'" class="size-3.5 text-primary" />
                </div>
              </button>

              <div v-if="categories.length > 0" class="my-1 h-px bg-border/60" />

              <!-- 各普通分类列表 -->
              <div v-if="categories.length > 0" class="max-h-48 overflow-y-auto space-y-0.5">
                <button
                  v-for="cat in categories"
                  :key="cat.name"
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                  :class="selectedFilterType === 'category' && selectedCategory === cat.name
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted'"
                  @click="selectSpecificCategory(cat.name)"
                >
                  <span class="truncate pr-2">{{ cat.name }}</span>
                  <div class="flex items-center gap-1 shrink-0">
                    <span class="text-[11px] font-mono text-muted-foreground">({{ cat.count }})</span>
                    <Check v-if="selectedFilterType === 'category' && selectedCategory === cat.name" class="size-3.5 text-primary" />
                  </div>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 快速清空筛选/显示当前筛选状态提示 -->
        <div v-if="selectedFilterType !== 'all'" class="flex items-center">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            @click="selectAll"
          >
            <span>重置</span>
            <X class="size-3" />
          </button>
        </div>

        <div class="flex-1" />

        <!-- 归档直达按钮（点击唤起年月抽屉） -->
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted select-none"
          @click="timelineDrawerOpen = true"
        >
          <Calendar class="size-3.5 text-primary" />
          <span>{{ t('filter.timeline') }}</span>
        </button>
      </div>
    </div>

    <!-- 滚动容器：移动端为原生纵向流畅滚动（利用 window/body 滚动），桌面端为横向分页滚动 -->
    <div
      ref="trackRef"
      class="home-track min-h-0 flex flex-1 scrollbar-hide"
      :class="isVerticalHome
        ? 'flex-col sm:overflow-y-auto'
        : 'overflow-x-auto overflow-y-auto snap-x snap-mandatory scroll-smooth'"
      @scroll="onScroll"
    >
      <!-- 移动端文章列表流（支持精准定位滚动） -->
      <div
        v-if="isVerticalHome"
        class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3"
      >
        <div v-if="filteredPosts.length === 0" class="py-16 text-center text-sm text-muted-foreground">
          {{ t('search.noResults') }}
        </div>
        <RouterLink
          v-for="post in filteredPosts"
          :id="`post-${post.slug}`"
          :key="post.slug"
          :to="`/post/${post.slug}`"
          class="block w-full scroll-mt-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <PostCard :post="post" />
        </RouterLink>
      </div>

      <!-- 桌面端分页网格 -->
      <template v-else>
        <section
          v-for="(page, pageIndex) in pages"
          :key="`${layout.perPage}-${pageIndex}`"
          :data-home-page="pageIndex"
          class="flex h-auto w-full shrink-0 snap-start min-h-full flex-col justify-start"
        >
          <div class="mx-auto flex w-full max-w-7xl min-h-full flex-col justify-start px-4 py-2 md:px-8 md:py-3">
            <div
              class="grid w-full auto-rows-fr gap-4 transition-all duration-300"
              :class="[gridColsClass]"
              :style="{ gridTemplateRows: `repeat(${layout.rows}, minmax(${CARD_MIN_HEIGHT}px, 1fr))` }"
            >
              <RouterLink
                v-for="post in page"
                :key="post.slug"
                :to="`/post/${post.slug}`"
                class="group flex h-full min-h-0 col-span-1 min-w-0 max-w-full"
              >
                <PostCard :post="post" compact class="h-full w-full" />
              </RouterLink>
            </div>
          </div>
        </section>
      </template>

      <!-- 移动端页脚跟随在列表末尾 -->
      <SiteFooter v-if="isVerticalHome" />
    </div>

    <!-- 桌面端底部分页条 -->
    <nav
      v-if="pages.length > 1 && !isVerticalHome"
      class="shrink-0 flex items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 sm:py-3 px-4 select-none"
      aria-label="分页导航"
    >
      <button
        type="button"
        class="inline-flex size-7 sm:size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-30 cursor-pointer shadow-xs"
        :disabled="currentPage === 0"
        aria-label="上一页"
        @click="handlePrev"
      >
        <ChevronLeft class="size-3.5 sm:size-4" />
      </button>

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

      <button
        type="button"
        class="inline-flex size-7 sm:size-8 items-center justify-center rounded-md border border-border bg-card text-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-30 cursor-pointer shadow-xs"
        :disabled="currentPage === pages.length - 1"
        aria-label="下一页"
        @click="handleNext"
      >
        <ChevronRight class="size-3.5 sm:size-4" />
      </button>

      <div class="h-4 w-[1px] bg-border mx-0.5" />

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

    <SiteFooter v-if="!isVerticalHome" />

    <!-- 移动端：直达年月时间轴抽屉 (Bottom Sheet) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="timelineDrawerOpen"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          @click="timelineDrawerOpen = false"
        />
      </Transition>

      <Transition name="drawer">
        <div
          v-if="timelineDrawerOpen"
          class="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] flex flex-col rounded-t-2xl border-t border-border bg-background shadow-2xl transition-transform"
        >
          <!-- 抽屉头部 -->
          <div class="flex items-center justify-between border-b px-4 py-3">
            <div class="flex items-center gap-2 font-semibold text-sm text-foreground">
              <History class="size-4 text-primary" />
              <span>{{ t('filter.timeline') }}</span>
              <span class="text-xs text-muted-foreground">({{ filteredPosts.length }} 篇)</span>
            </div>
            <button
              type="button"
              class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
              @click="timelineDrawerOpen = false"
            >
              <X class="size-5" />
            </button>
          </div>

          <!-- 年月分组直达列表 -->
          <div class="overflow-y-auto p-4 space-y-5">
            <div
              v-for="yearGroup in archiveTimeline"
              :key="yearGroup.year"
              class="space-y-2.5"
            >
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-foreground">{{ yearGroup.year }} 年</span>
                <span class="text-[11px] text-muted-foreground">({{ yearGroup.count }} 篇)</span>
                <div class="h-px flex-1 bg-border/60" />
              </div>

              <!-- 月份网格按钮，点击立即直达 -->
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="monthGroup in yearGroup.months"
                  :key="monthGroup.key"
                  type="button"
                  class="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card p-2.5 text-xs transition-all hover:border-primary hover:bg-primary/5 active:scale-95 shadow-xs"
                  @click="jumpToPost(monthGroup.firstSlug)"
                >
                  <span class="font-semibold text-foreground">{{ monthGroup.month }} 月</span>
                  <span class="text-[10px] text-muted-foreground">{{ monthGroup.count }} 篇文章</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 抽屉弹出动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}

/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
