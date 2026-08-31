<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Bot, Calendar, CalendarDays, FileText } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllPosts, formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

const posts = getAllPosts()
const archiveScrollRef = ref<HTMLElement | null>(null)
const timelineRailRef = ref<HTMLElement | null>(null)
const timelineMobileRef = ref<HTMLElement | null>(null)
const timelineMobileRailRef = ref<HTMLElement | null>(null)
const activeYear = ref('')
const activePostSlug = ref('')
const timelineSeeking = ref(false)
const timelineDragging = ref(false)
const DAY_MS = 86_400_000
const ARTICLE_SLOT = 28
const YEAR_BREAK = 12
const RECENCY_SCALE = 22
const MIN_TIME_GAP = 4
const MAX_TIME_GAP = 78
const TIMELINE_PADDING = 18
const MIN_TIMELINE_HEIGHT = 280
const MAX_TIMELINE_HEIGHT = 420
let scrollRaf: number | null = null
let seekResetTimer: number | null = null

type TimelineDirection = 'vertical' | 'horizontal'

interface YearGroup {
  year: string
  posts: Post[]
}

interface TimelineEntry {
  post: Post
  year: string
  timestamp: number
  position: number
  isYearStart: boolean
}

interface TimelineLayout {
  entries: TimelineEntry[]
  height: number
}

function toTimestamp(date: string): number {
  const timestamp = Date.parse(`${date}T00:00:00Z`)
  return Number.isFinite(timestamp) ? timestamp : Number.NaN
}

function timestampToDate(timestamp: number): string {
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : ''
}

const yearGroups = computed<YearGroup[]>(() => {
  const groups: Record<string, Post[]> = {}

  for (const post of posts) {
    const year = post.date ? post.date.substring(0, 4) : '未知年份'
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({
      year,
      posts: groups[year],
    }))
})

const timelinePosts = computed(() => yearGroups.value.flatMap((group) => group.posts))

const timelineBounds = computed(() => {
  const timestamps = timelinePosts.value
    .map((post) => toTimestamp(post.date))
    .filter((timestamp) => Number.isFinite(timestamp))

  if (timestamps.length === 0) {
    return {
      minDate: '',
      maxDate: '',
      minTimestamp: 0,
      maxTimestamp: 1,
    }
  }

  const minTimestamp = Math.min(...timestamps)
  const actualMaxTimestamp = Math.max(...timestamps)

  return {
    minDate: timestampToDate(minTimestamp),
    maxDate: timestampToDate(actualMaxTimestamp),
    minTimestamp,
    maxTimestamp: actualMaxTimestamp === minTimestamp
      ? minTimestamp + DAY_MS
      : actualMaxTimestamp,
  }
})

const timelineLayout = computed<TimelineLayout>(() => {
  const datedPosts = timelinePosts.value
    .map((post) => ({ post, timestamp: toTimestamp(post.date) }))
    .filter((entry) => Number.isFinite(entry.timestamp))

  if (datedPosts.length === 0) {
    return { entries: [], height: 0 }
  }

  const referenceTimestamp = datedPosts[0].timestamp
  const rawEntries: TimelineEntry[] = []
  let rawPosition = 0

  datedPosts.forEach(({ post, timestamp }, index) => {
    const previous = datedPosts[index - 1]
    const year = postYear(post)
    const isYearStart = index === 0 || !previous || postYear(previous.post) !== year

    if (previous) {
      const previousAge = Math.max(0, (referenceTimestamp - previous.timestamp) / DAY_MS)
      const currentAge = Math.max(0, (referenceTimestamp - timestamp) / DAY_MS)
      const timeGap = clamp(
        (Math.log1p(currentAge / 30) - Math.log1p(previousAge / 30)) * RECENCY_SCALE,
        MIN_TIME_GAP,
        MAX_TIME_GAP,
      )

      rawPosition += ARTICLE_SLOT + timeGap + (isYearStart ? YEAR_BREAK : 0)
    }

    rawEntries.push({
      post,
      year,
      timestamp,
      position: rawPosition,
      isYearStart,
    })
  })

  const rawHeight = rawPosition + TIMELINE_PADDING * 2
  const height = clamp(rawHeight, MIN_TIMELINE_HEIGHT, MAX_TIMELINE_HEIGHT)
  const usableRawHeight = Math.max(rawPosition, 1)
  const scale = (height - TIMELINE_PADDING * 2) / usableRawHeight

  return {
    height,
    entries: rawEntries.map((entry) => ({
      ...entry,
      position: TIMELINE_PADDING + entry.position * scale,
    })),
  }
})

const timelineEntries = computed(() => timelineLayout.value.entries)
const timelineHeight = computed(() => timelineLayout.value.height)
const selectedDate = ref(timelineBounds.value.maxDate)
const timelineRangeValue = computed(() => timelinePositionPixels(selectedDate.value))

const timelineMarks = computed(() => {
  const positions = new Map(timelineEntries.value.map((entry) => [entry.post.slug, entry.position]))
  const height = timelineHeight.value || 1

  return yearGroups.value.map((group) => ({
    group,
    position: ((positions.get(group.posts[0]?.slug ?? '') ?? 0) / height) * 100,
  }))
})

const totalPosts = computed(() => posts.length)

function postYear(post: Post): string {
  return post.date ? post.date.substring(0, 4) : '未知年份'
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function timelinePositionPixels(date: string): number {
  const entries = timelineEntries.value
  const timestamp = toTimestamp(date)

  if (entries.length === 0 || !Number.isFinite(timestamp)) return 0
  if (timestamp >= entries[0].timestamp) return entries[0].position

  for (let index = 0; index < entries.length - 1; index += 1) {
    const newer = entries[index]
    const older = entries[index + 1]
    if (timestamp > newer.timestamp || timestamp < older.timestamp) continue

    const timestampRange = newer.timestamp - older.timestamp
    if (timestampRange <= 0) return newer.position

    const progress = (newer.timestamp - timestamp) / timestampRange
    return newer.position + (older.position - newer.position) * progress
  }

  return entries[entries.length - 1].position
}

function timelinePosition(date: string): number {
  const height = timelineHeight.value
  if (!height) return 50
  return clamp((timelinePositionPixels(date) / height) * 100, 0, 100)
}

function findClosestEntry(position: number): TimelineEntry | undefined {
  let closest: TimelineEntry | undefined
  let closestDistance = Number.POSITIVE_INFINITY

  for (const entry of timelineEntries.value) {
    const distance = Math.abs(entry.position - position)
    if (distance < closestDistance) {
      closest = entry
      closestDistance = distance
    }
  }

  return closest
}

function findClosestPost(date: string): Post | undefined {
  const timestamp = toTimestamp(date)
  if (!Number.isFinite(timestamp)) return undefined

  let closest: Post | undefined
  let closestDistance = Number.POSITIVE_INFINITY

  for (const post of timelinePosts.value) {
    const postTimestamp = toTimestamp(post.date)
    if (!Number.isFinite(postTimestamp)) continue

    const distance = Math.abs(postTimestamp - timestamp)
    if (distance < closestDistance) {
      closest = post
      closestDistance = distance
    }
  }

  return closest
}

function scrollToPost(post: Post, behavior: ScrollBehavior = 'smooth', updateDate = true) {
  const element = document.getElementById(`archive-post-${post.slug}`)
  if (!element) return

  if (updateDate) selectedDate.value = post.date
  activeYear.value = postYear(post)
  activePostSlug.value = post.slug
  element.scrollIntoView({ behavior, block: 'start' })
}

function jumpToDate(date: string, behavior: ScrollBehavior = 'smooth') {
  const post = findClosestPost(date)
  if (!post) return
  scrollToPost(post, behavior, false)
}

function scheduleTimelineSeekEnd() {
  timelineSeeking.value = true
  if (seekResetTimer !== null) window.clearTimeout(seekResetTimer)
  seekResetTimer = window.setTimeout(() => {
    seekResetTimer = null
    timelineSeeking.value = false
    jumpToDate(selectedDate.value, 'auto')
    updateActiveTimeline()
  }, 400)
}

function handleTimelineInput(event: Event) {
  const position = Number((event.target as HTMLInputElement).value)
  const entry = findClosestEntry(clamp(position, 0, timelineHeight.value))
  if (!entry) return

  selectedDate.value = entry.post.date
  activePostSlug.value = entry.post.slug
  activeYear.value = entry.year
  scheduleTimelineSeekEnd()
  jumpToDate(selectedDate.value, 'auto')
}

function finishTimelineSeek() {
  if (seekResetTimer !== null) {
    window.clearTimeout(seekResetTimer)
    seekResetTimer = null
  }
  timelineSeeking.value = false
  window.requestAnimationFrame(updateActiveTimeline)
}

function getTimelineRail(direction: TimelineDirection): HTMLElement | null {
  return direction === 'vertical' ? timelineRailRef.value : timelineMobileRailRef.value
}

function updateTimelineFromPointer(clientPosition: number, direction: TimelineDirection) {
  const rail = getTimelineRail(direction)
  if (!rail) return

  const rect = rail.getBoundingClientRect()
  const progress = direction === 'vertical'
    ? clamp((clientPosition - rect.top) / rect.height, 0, 1)
    : clamp((clientPosition - rect.left) / rect.width, 0, 1)
  const position = direction === 'vertical'
    ? progress * timelineHeight.value
    : (1 - progress) * timelineHeight.value
  const entry = findClosestEntry(position)
  if (!entry) return

  selectedDate.value = entry.post.date
  activePostSlug.value = entry.post.slug
  activeYear.value = entry.year
  timelineSeeking.value = true
}

function handleTimelinePointerDown(event: PointerEvent, direction: TimelineDirection) {
  if (event.button !== 0) return

  const target = event.target
  if (target instanceof Element && target.closest('button')) return

  timelineDragging.value = true
  getTimelineRail(direction)?.setPointerCapture(event.pointerId)
  updateTimelineFromPointer(direction === 'vertical' ? event.clientY : event.clientX, direction)
}

function handleTimelinePointerMove(event: PointerEvent, direction: TimelineDirection) {
  if (!timelineDragging.value) return
  updateTimelineFromPointer(direction === 'vertical' ? event.clientY : event.clientX, direction)
}

function finishTimelinePointer(event: PointerEvent, direction: TimelineDirection) {
  if (!timelineDragging.value) return

  timelineDragging.value = false
  const date = selectedDate.value
  finishTimelineSeek()
  const rail = getTimelineRail(direction)
  if (rail?.hasPointerCapture(event.pointerId)) {
    rail.releasePointerCapture(event.pointerId)
  }
  jumpToDate(date, 'auto')
}

function handleDateChange() {
  if (!selectedDate.value) return

  if (seekResetTimer !== null) {
    window.clearTimeout(seekResetTimer)
    seekResetTimer = null
  }

  timelineSeeking.value = true
  jumpToDate(selectedDate.value, 'auto')
  timelineSeeking.value = false
  updateActiveTimeline()
}

function jumpToGroup(group: YearGroup) {
  const post = group.posts[0]
  if (!post) return
  selectedDate.value = post.date
  scrollToPost(post)
}

function getVisiblePost(markerTop: number): Post | undefined {
  let visiblePost: Post | undefined
  let visibleTop = Number.NEGATIVE_INFINITY

  for (const post of timelinePosts.value) {
    const element = document.getElementById(`archive-post-${post.slug}`)
    if (!element) continue

    const top = element.getBoundingClientRect().top
    if (top <= markerTop && top > visibleTop) {
      visiblePost = post
      visibleTop = top
    }
  }

  return visiblePost ?? timelinePosts.value[0]
}

function updateActiveTimeline() {
  const container = archiveScrollRef.value
  if (!container || yearGroups.value.length === 0) return

  const containerTop = container.getBoundingClientRect().top
  const mobileTimelineRect = timelineMobileRef.value?.getBoundingClientRect()
  const isMobileTimelineSticky = mobileTimelineRect
    ? Math.abs(mobileTimelineRect.top - containerTop) <= 1
    : false
  const markerTop = isMobileTimelineSticky && mobileTimelineRect
    ? mobileTimelineRect.bottom + 16
    : containerTop + 36
  const isAtEnd = container.scrollTop + container.clientHeight >= container.scrollHeight - 8
  let visibleYear = isAtEnd
    ? yearGroups.value[yearGroups.value.length - 1].year
    : yearGroups.value[0].year

  if (!isAtEnd) {
    for (const group of yearGroups.value) {
      const section = document.getElementById(`archive-year-${group.year}`)
      if (section && section.getBoundingClientRect().top <= markerTop) {
        visibleYear = group.year
      }
    }
  }

  activeYear.value = visibleYear

  if (!timelineSeeking.value) {
    const visiblePost = isAtEnd
      ? timelinePosts.value[timelinePosts.value.length - 1]
      : getVisiblePost(markerTop)
    if (visiblePost) {
      selectedDate.value = visiblePost.date
      activePostSlug.value = visiblePost.slug
    }
  }
}

function handleArchiveScroll() {
  if (scrollRaf !== null) return

  scrollRaf = window.requestAnimationFrame(() => {
    scrollRaf = null
    updateActiveTimeline()
  })
}

onMounted(async () => {
  await nextTick()
  activeYear.value = yearGroups.value[0]?.year ?? ''
  activePostSlug.value = timelineEntries.value[0]?.post.slug ?? ''
  updateActiveTimeline()
})

onUnmounted(() => {
  if (scrollRaf !== null) window.cancelAnimationFrame(scrollRaf)
  if (seekResetTimer !== null) window.clearTimeout(seekResetTimer)
})
</script>

<template>
  <div
    ref="archiveScrollRef"
    class="h-full min-w-0 overflow-x-clip overflow-y-auto"
    @scroll="handleArchiveScroll"
  >
    <div class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:px-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_10rem] lg:gap-10">
      <div class="min-w-0 space-y-8">
        <!-- 页面头部 -->
        <div class="space-y-2 border-b pb-6">
          <h1 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {{ t('archive.title') }}
          </h1>
          <p class="flex items-center gap-2 text-sm text-muted-foreground md:text-base">
            <FileText class="size-4 text-primary" />
            <span>{{ t('archive.description') || `共收录 ${totalPosts} 篇文章` }}</span>
          </p>
        </div>

        <!-- 小屏保留可拖动和可选日期的时间线控件，避免右侧栏挤压正文 -->
        <div
          ref="timelineMobileRef"
          v-if="timelineBounds.maxDate"
          class="sticky top-0 z-30 -mx-4 border-b bg-background/95 px-4 pb-5 pt-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        >
          <div class="flex items-center justify-between gap-3 text-sm font-medium">
            <span class="inline-flex items-center gap-2 text-foreground">
              <CalendarDays class="size-4 text-primary" />
              {{ t('archive.timeline') }}
            </span>
            <span class="font-mono text-xs text-muted-foreground">{{ activeYear }}</span>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <div
              ref="timelineMobileRailRef"
              class="relative h-6 min-w-0 flex-1 touch-none"
              :class="timelineDragging ? 'cursor-grabbing' : 'cursor-pointer'"
              @pointerdown="handleTimelinePointerDown($event, 'horizontal')"
              @pointermove="handleTimelinePointerMove($event, 'horizontal')"
              @pointerup="finishTimelinePointer($event, 'horizontal')"
              @pointercancel="finishTimelinePointer($event, 'horizontal')"
            >
              <div class="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted">
                <div
                  class="h-full rounded-full bg-primary"
                  :style="{ width: `${100 - timelinePosition(selectedDate)}%` }"
                />
              </div>
              <div
                class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                :style="{ left: `${100 - timelinePosition(selectedDate)}%` }"
              >
                <span class="block size-3 rounded-full bg-primary ring-4 ring-background" />
              </div>
              <input
                type="range"
                min="0"
                :max="timelineHeight"
                step="1"
                :value="timelineRangeValue"
                :aria-label="t('archive.timeline')"
                :aria-valuetext="formatDate(selectedDate)"
                class="archive-timeline-range-mobile"
                @input="handleTimelineInput"
                @change="finishTimelineSeek"
              />
            </div>
            <input
              id="archive-date-mobile"
              v-model="selectedDate"
              type="date"
              :min="timelineBounds.minDate"
              :max="timelineBounds.maxDate"
              :aria-label="t('archive.selectDate')"
              class="h-9 w-[9.5rem] shrink-0 rounded-md border border-border bg-card px-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              @change="handleDateChange"
            />
          </div>
        </div>

        <RouterLink
          to="/archive/ai-lab"
          class="group flex min-w-0 items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.06] sm:p-5"
        >
          <div class="flex min-w-0 items-start gap-3">
            <Bot class="mt-0.5 size-5 shrink-0 text-primary" />
            <div class="min-w-0 space-y-1">
              <h2 class="text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
                {{ t('aiLab.title') }}
              </h2>
              <p class="line-clamp-2 text-xs leading-6 text-muted-foreground sm:text-sm">
                {{ t('aiLab.description') }}
              </p>
            </div>
          </div>
          <ArrowRight class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </RouterLink>

        <!-- 时间轴列表 -->
        <div v-if="yearGroups.length > 0" class="space-y-10">
          <section
            v-for="group in yearGroups"
            :id="`archive-year-${group.year}`"
            :key="group.year"
            class="scroll-mt-28 space-y-4 lg:scroll-mt-6"
          >
            <div class="flex items-center gap-3">
              <h2 class="font-mono text-2xl font-bold tracking-tight text-foreground">
                {{ group.year }}
              </h2>
              <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {{ group.posts.length }}
              </span>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <RouterLink
                v-for="post in group.posts"
                :id="`archive-post-${post.slug}`"
                :key="post.slug"
                :to="`/post/${post.slug}`"
                class="group block min-w-0 max-w-full scroll-mt-28 lg:scroll-mt-6"
              >
                <Card class="w-full max-w-full transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-md">
                  <CardContent class="flex min-w-0 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div class="min-w-0 flex-1 space-y-1.5">
                      <div class="flex min-w-0 items-center gap-2">
                        <span v-if="post.category" class="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {{ post.category }}
                        </span>
                        <h3 class="min-w-0 truncate text-base font-medium text-foreground transition-colors group-hover:text-primary">
                          {{ post.title }}
                        </h3>
                      </div>

                      <p v-if="post.excerpt" class="line-clamp-2 text-sm text-muted-foreground">
                        {{ post.excerpt }}
                      </p>

                      <div v-if="post.tags && post.tags.length > 0" class="flex min-w-0 flex-wrap gap-1.5 pt-0.5">
                        <Badge
                          v-for="tag in post.tags"
                          :key="tag"
                          variant="secondary"
                          class="max-w-full text-[11px] font-normal text-muted-foreground"
                        >
                          #{{ tag }}
                        </Badge>
                      </div>
                    </div>

                    <div class="flex shrink-0 items-center justify-between gap-3 text-xs text-muted-foreground sm:justify-end">
                      <div class="flex items-center gap-1.5 font-mono">
                        <Calendar class="size-3.5 opacity-70" />
                        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                      </div>
                      <ArrowRight class="hidden size-4 -translate-x-2 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block" />
                    </div>
                  </CardContent>
                </Card>
              </RouterLink>
            </div>
          </section>
        </div>

        <!-- 空列表提示 -->
        <div v-else class="py-16 text-center text-muted-foreground">
          <p>{{ t('archive.empty') }}</p>
        </div>
      </div>

      <!-- 桌面端右侧时间线 -->
      <aside v-if="timelineBounds.maxDate" class="hidden min-w-0 lg:block">
        <div class="sticky top-6">
          <div class="mb-3 flex items-start gap-2">
            <CalendarDays class="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p class="text-sm font-semibold text-foreground">{{ t('archive.timeline') }}</p>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">{{ t('archive.timelineHint') }}</p>
            </div>
          </div>

          <nav
            class="rounded-xl border bg-card/70 p-4 shadow-sm"
            :aria-label="t('archive.timeline')"
          >
            <div
              class="relative"
              :style="{ height: `${timelineHeight}px` }"
            >
              <div
                ref="timelineRailRef"
                class="absolute inset-0"
                :class="timelineDragging ? 'cursor-grabbing' : 'cursor-pointer'"
                @pointerdown="handleTimelinePointerDown($event, 'vertical')"
                @pointermove="handleTimelinePointerMove($event, 'vertical')"
                @pointerup="finishTimelinePointer($event, 'vertical')"
                @pointercancel="finishTimelinePointer($event, 'vertical')"
              >
                <div class="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-border" />

                <div
                  class="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                  :style="{ top: `${timelinePosition(selectedDate)}%` }"
                >
                  <span class="block size-3 rounded-full bg-primary ring-4 ring-background" />
                </div>

                <template v-for="entry in timelineEntries" :key="`timeline-post-${entry.post.slug}`">
                  <button
                    v-if="!entry.isYearStart"
                    type="button"
                    class="group absolute left-1/2 z-20 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    :style="{ top: `${(entry.position / timelineHeight) * 100}%` }"
                    :aria-current="activePostSlug === entry.post.slug ? 'location' : undefined"
                    :aria-label="entry.post.title"
                    :title="entry.post.title"
                    @click="scrollToPost(entry.post)"
                  >
                    <span
                      class="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/60 transition-all group-hover:size-2 group-hover:bg-foreground"
                      :class="activePostSlug === entry.post.slug ? 'size-2 bg-primary ring-2 ring-background' : ''"
                    />
                  </button>
                </template>

                <input
                  type="range"
                  min="0"
                  :max="timelineHeight"
                  step="1"
                  :value="timelineRangeValue"
                  :aria-label="t('archive.timeline')"
                  :aria-valuetext="formatDate(selectedDate)"
                  class="archive-timeline-range"
                  @input="handleTimelineInput"
                  @change="finishTimelineSeek"
                />

                <button
                  v-for="mark in timelineMarks"
                  :key="`timeline-${mark.group.year}`"
                  type="button"
                  class="group absolute left-1/2 z-30 flex w-max -translate-y-1/2 items-center rounded-md py-1 pl-3 text-xs font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  :class="activeYear === mark.group.year ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
                  :style="{ top: `${mark.position}%` }"
                  :aria-current="activeYear === mark.group.year ? 'location' : undefined"
                  :aria-label="mark.group.year"
                  @click="jumpToGroup(mark.group)"
                >
                  <span
                    class="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background transition-colors"
                    :class="activeYear === mark.group.year ? 'border-primary bg-primary' : 'border-muted-foreground/50 group-hover:border-foreground'"
                  />
                  <span class="whitespace-nowrap">{{ mark.group.year }}</span>
                </button>
              </div>
            </div>

            <label for="archive-date" class="mt-3 block text-xs font-medium text-muted-foreground">
              {{ t('archive.selectDate') }}
            </label>
            <input
              id="archive-date"
              v-model="selectedDate"
              type="date"
              :min="timelineBounds.minDate"
              :max="timelineBounds.maxDate"
              class="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              @change="handleDateChange"
            />
          </nav>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.archive-timeline-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  outline: none;
}

.archive-timeline-range-mobile {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  outline: none;
}
</style>
