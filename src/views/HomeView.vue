<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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
const { width: viewportWidth, height: viewportHeight } = useWindowSize()
const { width: trackWidth, height: trackHeight } = useElementSize(trackRef)

const PAGE_GAP = 16
const PAGE_MAX_WIDTH = 1280
const CARD_MIN_WIDTH = 340
const CARD_MIN_HEIGHT = 248

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

// 单页内部行数计算（1 行或 2 行）
function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
  if (!trackRef.value || pages.value.length === 0) return

  const target = Math.max(0, Math.min(index, pages.value.length - 1))
  currentPage.value = target
  trackRef.value.scrollTo({
    left: trackRef.value.clientWidth * target,
    behavior,
  })
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

// wheel 节流：一次手势只翻一页
let lastWheelTime = 0
const WHEEL_COOLDOWN = 700

function onWheel(e: WheelEvent) {
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
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    const track = trackRef.value
    if (!track || !track.clientWidth || pages.value.length === 0) return
    const newPage = Math.round(track.scrollLeft / track.clientWidth)
    currentPage.value = Math.max(0, Math.min(newPage, pages.value.length - 1))
  })
}

// 视口宽度变化时重新分页并归位到最近一页
// Keep the first visible post stable when the number of columns or rows changes.
watch(
  [() => layout.value.perPage, trackWidth],
  async ([perPage, nextWidth], [previousPerPage]) => {
    if (!mounted.value || !trackRef.value || !nextWidth) return

    const oldPerPage = previousPerPage || perPage
    const anchorIndex = Math.max(0, Math.min(posts.length - 1, currentPage.value * oldPerPage))
    const targetPage = Math.floor(anchorIndex / perPage)

    await nextTick()
    scrollToIndex(targetPage, 'auto')
  },
)

onMounted(() => {
  mounted.value = true
  trackRef.value?.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
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

    <!-- 横向翻页轨道：section 满宽，确保每次 snap 和 clientWidth 滚动完全等宽对齐 -->
    <div
      ref="trackRef"
      class="home-track min-h-0 flex flex-1 overflow-x-auto overflow-y-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
      @scroll="onScroll"
    >
      <section
        v-for="(page, pageIndex) in pages"
        :key="`${layout.perPage}-${pageIndex}`"
        class="snap-start flex min-h-full h-auto w-full shrink-0 flex-col justify-start"
      >
        <!-- 内部居中限宽容器：justify-start 让 Grid 靠上，留白总是在下方 -->
        <div class="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-start px-4 py-2 md:px-8 md:py-3">
          <div
            class="grid w-full auto-rows-min gap-4 transition-all duration-300"
            :class="[gridColsClass]"
            :style="{ gridTemplateRows: `repeat(${layout.rows}, minmax(${CARD_MIN_HEIGHT}px, auto))` }"
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
      v-if="pages.length > 1"
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
</style>
