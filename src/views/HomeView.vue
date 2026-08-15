<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAllPosts, formatDate } from '@/data/posts'

const posts = getAllPosts()
const { width } = useWindowSize()

// 响应式每页卡片数：小屏 1 张、中屏 2 张、大屏 3 张
const cardsPerPage = computed(() => {
  if (width.value < 768) return 1
  if (width.value < 1280) return 2
  return 3
})

const pages = computed(() => {
  const perPage = cardsPerPage.value
  const result: typeof posts[] = []
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
        :key="`${cardsPerPage}-${pageIndex}`"
        class="snap-start shrink-0 w-full h-full flex items-stretch px-4 py-2 md:px-8 md:py-3"
      >
        <div
          class="grid w-full h-full gap-4"
          :class="{
            'grid-cols-1': cardsPerPage === 1,
            'grid-cols-2': cardsPerPage === 2,
            'grid-cols-3': cardsPerPage === 3,
          }"
        >
          <RouterLink
            v-for="post in page"
            :key="post.slug"
            :to="`/post/${post.slug}`"
            class="group block min-h-0"
          >
            <Card class="h-full flex flex-col transition-all duration-200 hover:border-primary/30 hover:shadow-md">
              <CardHeader class="gap-3 flex-1 min-h-0 overflow-hidden">
                <div class="space-y-2">
                  <CardTitle class="text-lg leading-snug transition-colors group-hover:text-primary md:text-xl">
                    {{ post.title }}
                  </CardTitle>
                  <CardDescription class="line-clamp-2 md:line-clamp-3">
                    {{ post.excerpt }}
                  </CardDescription>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="tag in post.tags.slice(0, 3)" :key="tag" variant="secondary" class="text-xs">
                    {{ tag }}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter class="mt-auto gap-3 text-xs text-muted-foreground md:text-sm">
                <Avatar class="size-5 md:size-6">
                  <AvatarImage :src="post.author.avatar" :alt="post.author.name" />
                  <AvatarFallback>{{ post.author.name.slice(0, 1) }}</AvatarFallback>
                </Avatar>
                <span class="font-medium text-foreground">{{ post.author.name }}</span>
                <span class="ml-auto flex items-center gap-1.5 md:gap-2">
                  <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                  <span>·</span>
                  <span>{{ post.readingTime }} 分钟</span>
                </span>
              </CardFooter>
            </Card>
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
