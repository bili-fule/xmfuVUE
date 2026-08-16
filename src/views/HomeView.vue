<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import { getAllPosts, type Post } from '@/data/posts'
import { siteConfig } from '@/data/site'

const posts = getAllPosts()
const { width } = useWindowSize()

interface LayoutConfig {
  cols: number
  maxRows: number
  perPage: number
}

// 响应式列数与容量配置：
// - 窄屏 (< 768px): 1 列，每页最多 2 行（perPage = 2）
// - 中屏 (768px ~ 1279px): 2 列，每页最多 2 行（perPage = 4）
// - 宽屏 (>= 1280px): 3 列，每页最多 2 行（perPage = 6）
const layout = computed<LayoutConfig>(() => {
  if (width.value < 768) {
    return { cols: 1, maxRows: 2, perPage: 2 }
  }
  if (width.value < 1280) {
    return { cols: 2, maxRows: 2, perPage: 4 }
  }
  return { cols: 3, maxRows: 2, perPage: 6 }
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
  const total = posts.length
  if (total === 0) return []

  const maxPerPage = layout.value.perPage
  const result: Post[][] = []
  for (let i = 0; i < total; i += maxPerPage) {
    result.push(posts.slice(i, i + maxPerPage))
  }
  return result
})

// 单页内部行数计算（1 行或 2 行）
function getPageRows(pageLength: number, cols: number): number {
  return Math.max(1, Math.ceil(pageLength / cols))
}

const trackRef = ref<HTMLElement | null>(null)
const currentPage = ref(0)
const jumpInput = ref('')

function scrollToIndex(index: number) {
  if (!trackRef.value) return
  const pageWidth = trackRef.value.clientWidth
  const target = Math.max(0, Math.min(index, pages.value.length - 1))
  currentPage.value = target
  trackRef.value.scrollTo({ left: pageWidth * target, behavior: 'smooth' })
}

function handlePrev() {
  if (currentPage.value > 0) {
    scrollToIndex(currentPage.value - 1)
  }
}

function handleNext() {
  if (currentPage.value < pages.value.length - 1) {
    scrollToIndex(currentPage.value + 1)
  }
}

function handleDirectJump() {
  const pageNum = parseInt(jumpInput.value, 10)
  if (!isNaN(pageNum)) {
    const target = Math.max(1, Math.min(pageNum, pages.value.length)) - 1
    scrollToIndex(target)
  }
  jumpInput.value = ''
}

// wheel 节流：一次手势只翻一页
let lastWheelTime = 0
const WHEEL_COOLDOWN = 700

function onWheel(e: WheelEvent) {
  // 让水平方向滚轮/触控板横向手势保持原生 snap 滚动
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return

  e.preventDefault()

  const now = Date.now()
  if (now - lastWheelTime < WHEEL_COOLDOWN) return
  if (Math.abs(e.deltaY) < 18) return

  lastWheelTime = now

  if (e.deltaY > 0) {
    if (currentPage.value < pages.value.length - 1) {
      scrollToIndex(currentPage.value + 1)
    }
  } else if (e.deltaY < 0) {
    if (currentPage.value > 0) {
      scrollToIndex(currentPage.value - 1)
    }
  }
}

// 滚动时同步当前页（节流）
let scrollRaf: number | null = null
function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    if (!trackRef.value) return
    const pageWidth = trackRef.value.clientWidth
    const newPage = Math.round(trackRef.value.scrollLeft / pageWidth)
    currentPage.value = Math.max(0, Math.min(newPage, pages.value.length - 1))
  })
}

// 视口宽度变化时重新分页并归位到最近一页
watch(width, () => {
  nextTick(() => {
    if (!trackRef.value) return
    const pageWidth = trackRef.value.clientWidth
    const nearestPage = Math.round(trackRef.value.scrollLeft / pageWidth)
    currentPage.value = Math.max(0, Math.min(nearestPage, pages.value.length - 1))
    scrollToIndex(currentPage.value)
  })
})

onMounted(() => {
  trackRef.value?.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  trackRef.value?.removeEventListener('wheel', onWheel)
})
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
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
      class="flex flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-hide"
      @scroll="onScroll"
    >
      <section
        v-for="(page, pageIndex) in pages"
        :key="`${layout.perPage}-${pageIndex}`"
        class="snap-start shrink-0 w-full h-full flex flex-col justify-start"
      >
        <!-- 内部居中限宽容器：justify-start 让 Grid 靠上，留白总是在下方 -->
        <div class="mx-auto w-full max-w-7xl h-full flex flex-col justify-start px-4 py-2 md:px-8 md:py-3">
          <!--
            Grid 行高与卡片尺寸策略（修复「末页卡片占两排位置 / 大小不一致」bug）：
            - 统一 grid-rows-2 + h-full：所有页（满页和末页）的 Grid 行高一致 = 半页高。
              末页内容少时只填前几行，剩余行空置 → 卡片靠上、留白在下，且卡片高度恒为半页。
              勿对末页改用 grid-rows-1：那样末页卡片会变成非 compact 大尺寸（封面 min-h-32），
              与满页 compact 卡片（半页高）大小不一致，视觉上「末页卡片占两排位置」。
            - 统一 compact：末页卡片也用 compact 尺寸（与满页一致），勿基于 getPageRows 切换，
              否则末页单行会退回非 compact 大卡片，破坏尺寸一致性。
            改动时务必保持「所有页统一 grid-rows-2 h-full + compact」，否则 bug 反弹。
          -->
          <div
            class="grid w-full gap-4 transition-all duration-300 grid-rows-2 h-full"
            :class="[gridColsClass]"
          >
            <RouterLink
              v-for="post in page"
              :key="post.slug"
              :to="`/post/${post.slug}`"
              class="group flex min-h-0 col-span-1"
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
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
