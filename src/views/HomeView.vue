<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import PostCard from '@/components/PostCard.vue'
import { getAllPosts, type Post } from '@/data/posts'

const posts = getAllPosts()
const { width } = useWindowSize()

interface LayoutConfig {
  perPage: number
  topCols: number
  bottomCols: number
}

// 响应式两排布局：窄屏 1+1、中屏 2+2、大屏 3+2（3:2≈1.5，接近黄金比）
const layout = computed<LayoutConfig>(() => {
  if (width.value < 768) return { perPage: 2, topCols: 1, bottomCols: 1 }
  if (width.value < 1280) return { perPage: 4, topCols: 2, bottomCols: 2 }
  return { perPage: 5, topCols: 3, bottomCols: 2 }
})

const topGridClass = computed(() => {
  if (layout.value.topCols === 1) return 'grid-cols-1'
  if (layout.value.topCols === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

const bottomGridClass = computed(() => {
  if (layout.value.bottomCols === 1) return 'grid-cols-1'
  if (layout.value.bottomCols === 2) return 'grid-cols-2'
  return 'grid-cols-3'
})

const pages = computed(() => {
  const perPage = layout.value.perPage
  const result: Post[][] = []
  for (let i = 0; i < posts.length; i += perPage) {
    result.push(posts.slice(i, i + perPage))
  }
  return result
})

const trackRef = ref<HTMLElement | null>(null)
const currentPage = ref(0)

function scrollToIndex(index: number) {
  if (!trackRef.value) return
  const pageWidth = trackRef.value.clientWidth
  const target = Math.max(0, Math.min(index, pages.value.length - 1))
  currentPage.value = target
  trackRef.value.scrollTo({ left: pageWidth * target, behavior: 'smooth' })
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
    <!-- 顶部标题区：精简高度 -->
    <div class="shrink-0 px-4 pt-4 pb-2 md:px-8 md:pt-5 md:pb-3">
      <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
        墨记
      </h1>
      <p class="text-sm text-muted-foreground md:text-base">
        记录前端技术、设计系统与工程化实践的点滴思考。
      </p>
    </div>

    <!-- 横向翻页轨道 -->
    <div
      ref="trackRef"
      class="flex flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-hide"
      @scroll="onScroll"
    >
      <section
        v-for="(page, pageIndex) in pages"
        :key="`${layout.perPage}-${pageIndex}`"
        class="snap-start shrink-0 w-full h-full flex flex-col items-center justify-center gap-4 px-4 py-2 md:px-8 md:py-3"
      >
        <!-- 上排：黄金比中较高的主体区（flex 1.618） -->
        <div
          v-if="page.length > 0"
          class="flex-[1.618] min-h-0 w-full grid gap-4"
          :class="topGridClass"
        >
          <RouterLink
            v-for="post in page.slice(0, layout.topCols)"
            :key="post.slug"
            :to="`/post/${post.slug}`"
            class="group flex min-h-0"
          >
            <PostCard :post="post" />
          </RouterLink>
        </div>

        <!-- 下排：黄金比中较矮的辅助区（flex 1） -->
        <div
          v-if="page.length > layout.topCols"
          class="flex-1 min-h-0 w-full grid gap-4"
          :class="bottomGridClass"
        >
          <RouterLink
            v-for="post in page.slice(layout.topCols)"
            :key="post.slug"
            :to="`/post/${post.slug}`"
            class="group flex min-h-0"
          >
            <PostCard :post="post" compact />
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- 底部分页条 -->
    <nav
      class="shrink-0 flex items-center justify-center gap-2 py-3 md:py-4"
      aria-label="分页"
    >
      <button
        v-for="(_, index) in pages"
        :key="index"
        type="button"
        class="h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="
          index === currentPage
            ? 'w-8 bg-primary'
            : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
        "
        :aria-label="`跳到第 ${index + 1} 页`"
        :aria-current="index === currentPage ? 'page' : undefined"
        @click="scrollToIndex(index)"
      />
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
