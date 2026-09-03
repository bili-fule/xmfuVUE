<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Clock,
  FileText,
  Layers,
  Palette,
  Columns,
  SquareDashedBottom,
  Eye,
  Terminal,
  Bookmark,
  Calendar,
  Bot,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  BookOpenText,
  ImageOff,
  Image as ImageIcon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PostCard from '@/components/PostCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { getHomePosts, type Post } from '@/data/posts'
import { t } from '@/i18n'

// 无图封面占位设计样式切换：'mono' (等宽 NO IMAGE) | 'editorial' (艺术水印 NO COVER) | 'badge' (极简胶囊 NO PREVIEW)
const noCoverStyle = ref<'mono' | 'editorial' | 'badge'>('mono')

const posts = getHomePosts()
const samplePost = computed<Post>(() => {
  return posts[0] || {
    slug: 'demo-post',
    title: 'Vue 3 + Vite 现代化博客架构改造指南与实践心得',
    excerpt: '在这篇文章中，我们将探讨如何从旧架构迁移到 Vue 3 与 Tailwind CSS v4，并重构卡片布局、SSR 静态生成与移动端全屏滑动体验。',
    contentHtml: '<p>示例内容</p>',
    contentMarkdown: '示例内容',
    date: '2026-08-28',
    tags: ['Vue3', 'Tailwind', '架构'],
    category: '技术',
    draft: false,
    readingTime: 6,
    cover: '',
    origin: 'ai',
    editorialStatus: 'polished',
    model: 'Gemini 2.5 Pro',
    prompt: '如何优化博客前端？',
    conversationSummary: '关于前端重构的深度问答',
    conversation: [],
  }
})

// 对比视图模式：'side-by-side' (并排对比) | 'toggle' (单容器一键切换)
const viewMode = ref<'side-by-side' | 'toggle'>('side-by-side')
const activeToggle = ref<'before' | 'after'>('after')

// 主题强调色 (Accent Palette)
interface AccentColor {
  id: string
  name: string
  label: string
  lightValue: string
  darkValue: string
  previewClass: string
}

const accentColors: AccentColor[] = [
  { id: 'indigo', name: '极客靛青', label: 'Indigo', lightValue: 'oklch(0.55 0.22 265)', darkValue: 'oklch(0.7 0.18 265)', previewClass: 'bg-indigo-500' },
  { id: 'emerald', name: '翡翠极光', label: 'Emerald', lightValue: 'oklch(0.58 0.17 160)', darkValue: 'oklch(0.75 0.16 160)', previewClass: 'bg-emerald-500' },
  { id: 'violet', name: '霓虹幻紫', label: 'Violet', lightValue: 'oklch(0.55 0.24 300)', darkValue: 'oklch(0.72 0.2 300)', previewClass: 'bg-violet-500' },
  { id: 'amber', name: '暖阳琥珀', label: 'Amber', lightValue: 'oklch(0.68 0.19 65)', darkValue: 'oklch(0.8 0.16 65)', previewClass: 'bg-amber-500' },
  { id: 'rose', name: '珊瑚玫瑰', label: 'Rose', lightValue: 'oklch(0.6 0.23 20)', darkValue: 'oklch(0.74 0.19 20)', previewClass: 'bg-rose-500' },
  { id: 'mono', name: '经典单色', label: 'Monochrome', lightValue: 'oklch(0.205 0 0)', darkValue: 'oklch(0.922 0 0)', previewClass: 'bg-zinc-700 dark:bg-zinc-300' },
]

const selectedAccent = ref<AccentColor>(accentColors[0])

function setAccent(color: AccentColor) {
  selectedAccent.value = color
  const isDark = document.documentElement.classList.contains('dark')
  const val = isDark ? color.darkValue : color.lightValue
  document.documentElement.style.setProperty('--primary', val)
}

function resetAccent() {
  document.documentElement.style.removeProperty('--primary')
  selectedAccent.value = accentColors[5] // Mono
}

onUnmounted(() => {
  document.documentElement.style.removeProperty('--primary')
})

// 代码块复制状态管理
const copied = ref(false)
const sampleCode = `// src/composables/useReadingProgress.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useReadingProgress(targetElementRef: any) {
  const progress = ref(0)

  const update = () => {
    const el = targetElementRef.value
    if (!el) return
    const total = el.scrollHeight - el.clientHeight
    progress.value = total > 0 ? Math.min(100, Math.round((el.scrollTop / total) * 100)) : 0
  }

  onMounted(() => targetElementRef.value?.addEventListener('scroll', update))
  onUnmounted(() => targetElementRef.value?.removeEventListener('scroll', update))

  return { progress }
}`

async function copySampleCode() {
  try {
    await navigator.clipboard.writeText(sampleCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Copy failed', e)
  }
}

// 模拟滚动区域与进度条
const demoScrollContainer = ref<HTMLDivElement | null>(null)
const demoScrollProgress = ref(35)

function handleDemoScroll(e: Event) {
  const el = e.target as HTMLElement
  const total = el.scrollHeight - el.clientHeight
  if (total > 0) {
    demoScrollProgress.value = Math.min(100, Math.round((el.scrollTop / total) * 100))
  }
}

// 分类 Pills 状态
const selectedPill = ref('全部')
const sampleCategories = [
  { name: '全部', count: posts.length },
  { name: 'Vue实践', count: 4 },
  { name: '网络运维', count: 6 },
  { name: 'AI探索', count: 3 },
  { name: '生活随笔', count: 2 },
]
</script>

<template>
  <div class="min-h-full sm:h-full min-w-0 sm:overflow-y-auto bg-background text-foreground transition-colors duration-300">
    <!-- 顶部横幅 Banner -->
    <div class="border-b bg-muted/40 backdrop-blur-sm">
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles class="size-3.5" />
                UI/UX 改进对比中心
              </span>
              <span class="text-xs text-muted-foreground">Beta Preview v1.0</span>
            </div>
            <h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-foreground">
              博客交互与视觉体验进化预览
            </h1>
            <p class="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              这里集中展示了针对博客提出的一系列设计优化。您可以通过下方控制台实时切换对比模式或调色盘，直观体验各项改动的前后差异。
            </p>
          </div>

          <!-- 控制面板浮动栏 -->
          <div class="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm shrink-0">
            <div class="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
              <span class="flex items-center gap-1.5">
                <Columns class="size-3.5" />
                对比视图模式
              </span>
              <div class="flex items-center rounded-lg bg-muted p-0.5">
                <button
                  type="button"
                  class="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                  :class="viewMode === 'side-by-side' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'"
                  @click="viewMode = 'side-by-side'"
                >
                  并排对比
                </button>
                <button
                  type="button"
                  class="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                  :class="viewMode === 'toggle' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'"
                  @click="viewMode = 'toggle'"
                >
                  一键切换
                </button>
              </div>
            </div>

            <!-- 一键切换模式下的 Before/After 开关 -->
            <div v-if="viewMode === 'toggle'" class="flex items-center justify-between gap-2 border-t pt-2">
              <span class="text-xs text-muted-foreground">当前显示：</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-md px-3 py-1 text-xs font-semibold transition-all"
                  :class="activeToggle === 'before' ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' : 'text-muted-foreground hover:bg-muted'"
                  @click="activeToggle = 'before'"
                >
                  原版设计 (Before)
                </button>
                <button
                  type="button"
                  class="rounded-md px-3 py-1 text-xs font-semibold transition-all"
                  :class="activeToggle === 'after' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground hover:bg-muted'"
                  @click="activeToggle = 'after'"
                >
                  Beta 优化版 (After)
                </button>
              </div>
            </div>

            <!-- 实时品牌强调色调色盘 -->
            <div class="border-t pt-3 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Palette class="size-3.5" />
                  品牌强调色 (Accent)
                </span>
                <span class="text-[11px] font-semibold text-primary">{{ selectedAccent.name }}</span>
              </div>
              <div class="flex items-center gap-2 pt-0.5">
                <button
                  v-for="color in accentColors"
                  :key="color.id"
                  type="button"
                  class="size-6 rounded-full transition-all hover:scale-110 flex items-center justify-center relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  :class="[color.previewClass, selectedAccent.id === color.id ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-80 hover:opacity-100']"
                  :title="`${color.name} (${color.label})`"
                  @click="setAccent(color)"
                >
                  <Check v-if="selectedAccent.id === color.id" class="size-3 text-white stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体对比区域 -->
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-16">

      <!-- ============================================================ -->
      <!-- 模块 1：文章卡片（PostCard）对比 -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers class="size-5 text-primary" />
              1. 文章卡片（PostCard）进化对比
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground">
              增加了<strong>预估阅读时间、字数统计、更具质感的封面微渐变与微光悬浮景深</strong>，提升卡片信息密度与视觉吸引力。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            卡片核心展示
          </span>
        </div>

        <!-- 卡片对比展示区 -->
        <div
          class="grid gap-6 items-start"
          :class="viewMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
        >
          <!-- Before：当前线上卡片 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'before'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                当前线上设计 (Before)
              </span>
              <span class="text-xs text-muted-foreground">旧书本图标 / 无阅读时长</span>
            </div>
            <!-- 使用原版书本图标的原型进行严格对比 -->
            <div class="p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20">
              <article class="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card/85 text-card-foreground shadow-xs">
                <div class="relative h-28 sm:h-32 w-full overflow-hidden bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                  <BookOpenText class="size-10" />
                  <div class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-md shadow-xs">
                    <Bookmark class="size-2.5 opacity-70" />
                    <span>{{ samplePost.category }}</span>
                  </div>
                </div>
                <div class="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                  <div class="space-y-1.5">
                    <h3 class="line-clamp-1 text-base font-semibold">{{ samplePost.title }}</h3>
                    <p class="line-clamp-2 text-xs text-muted-foreground">{{ samplePost.excerpt }}</p>
                  </div>
                  <div class="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                    <span>{{ samplePost.date }}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- After：Beta 优化后卡片 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'after'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Sparkles class="size-3" />
                Beta 优化设计 (After)
              </span>
              <span class="text-xs text-primary font-medium">✨ 微光悬浮 + 阅读时长 + 英文 NO IMAGE</span>
            </div>

            <div class="p-4 rounded-2xl border border-primary/20 bg-primary/[0.02]">
              <!-- 增强版卡片组件原型 -->
              <article
                class="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/50 cursor-pointer"
              >
                <!-- 封面图区域（带微光遮罩与动态英文无图占位） -->
                <div class="relative h-36 w-full overflow-hidden bg-gradient-to-br from-primary/5 via-muted to-muted/50 transition-all duration-500 group-hover:scale-[1.02]">
                  <!-- 方案 1. Geek Mono: NO IMAGE -->
                  <div v-if="noCoverStyle === 'mono'" class="absolute inset-0 flex flex-col items-center justify-center gap-1 select-none bg-muted/35">
                    <div class="flex items-center gap-1.5 rounded-md border border-border/80 bg-background/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-foreground shadow-xs backdrop-blur-md transition-transform group-hover:scale-105 group-hover:border-primary/50">
                      <ImageOff class="size-3.5 text-primary" />
                      <span class="font-bold uppercase">NO IMAGE</span>
                    </div>
                    <span class="font-mono text-[9px] tracking-widest text-muted-foreground/60 uppercase">Image not provided</span>
                  </div>

                  <!-- 方案 2. Editorial: NO COVER -->
                  <div v-else-if="noCoverStyle === 'editorial'" class="absolute inset-0 flex items-center justify-center select-none overflow-hidden bg-muted/30">
                    <span class="absolute text-5xl font-black tracking-widest uppercase text-foreground/[0.04] dark:text-white/[0.05] pointer-events-none scale-125">
                      NO COVER
                    </span>
                    <div class="z-10 flex flex-col items-center gap-1 text-muted-foreground/70 transition-transform group-hover:scale-105">
                      <ImageIcon class="size-6 stroke-[1.5] text-primary/60" />
                      <span class="text-[11px] font-semibold tracking-widest uppercase">NO COVER</span>
                    </div>
                  </div>

                  <!-- 方案 3. Clean Badge: NO PREVIEW -->
                  <div v-else class="absolute inset-0 flex items-center justify-center select-none bg-muted/30">
                    <div class="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md shadow-xs transition-transform group-hover:scale-105 group-hover:border-primary/40 group-hover:text-foreground">
                      <ImageOff class="size-3.5 text-primary/70" />
                      <span>No Preview Available</span>
                    </div>
                  </div>

                  <div class="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
                  
                  <!-- 顶部浮标：分类与 AI 徽章 -->
                  <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span class="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-foreground border border-border/60 shadow-xs">
                      <Bookmark class="size-3 text-primary" />
                      {{ samplePost.category }}
                    </span>
                    <span v-if="samplePost.origin === 'ai'" class="inline-flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold shadow-xs">
                      <Bot class="size-3" />
                      AI 原稿
                    </span>
                  </div>

                  <!-- 封面右下角预估时长浮标 -->
                  <div class="absolute bottom-2.5 right-3 flex items-center gap-2">
                    <span class="inline-flex items-center gap-1 rounded-md bg-background/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/50 shadow-xs">
                      <Clock class="size-3 text-primary" />
                      {{ samplePost.readingTime }} 分钟阅读
                    </span>
                  </div>
                </div>

                <!-- 内容区 -->
                <div class="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
                  <div class="space-y-2">
                    <h3 class="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                      {{ samplePost.title }}
                    </h3>
                    <p class="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {{ samplePost.excerpt }}
                    </p>

                    <!-- 标签流式胶囊 -->
                    <div class="flex flex-wrap items-center gap-1.5 pt-1">
                      <span
                        v-for="tag in samplePost.tags"
                        :key="tag"
                        class="inline-flex items-center rounded-md bg-muted/60 hover:bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors border border-border/40"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                  </div>

                  <!-- 卡片底栏 -->
                  <div class="flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                    <div class="flex items-center gap-3">
                      <span class="inline-flex items-center gap-1">
                        <Calendar class="size-3.5 opacity-70" />
                        {{ samplePost.date }}
                      </span>
                      <span class="inline-flex items-center gap-1">
                        <FileText class="size-3.5 opacity-70" />
                        约 1,840 字
                      </span>
                    </div>
                    <span class="inline-flex items-center gap-1 font-medium text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      阅读
                      <ArrowRight class="size-3" />
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- 模块 2：无图封面英文占位设计专项对比 -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ImageOff class="size-5 text-primary" />
              2. 无图封面英文占位设计专项对比（No Cover Placeholder）
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground">
              为无配图文章专门设计的<strong>英文占位版式方案</strong>。点击下方任意卡片，可直接将上方完整卡片的封面动态切换为此样式。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            用户提议专属对比
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 原版旧方案 -->
          <div class="flex flex-col justify-between rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 space-y-3">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">原版 (Before)</span>
                <span class="text-[10px] text-muted-foreground">旧版书本图标</span>
              </div>
              <p class="text-xs text-muted-foreground">纯书本图标，信息较模糊，不易区分是纯文本还是配图失效。</p>
            </div>
            
            <div class="h-28 rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center text-muted-foreground/60 shadow-inner">
              <BookOpenText class="size-8" />
            </div>

            <div class="text-[11px] text-muted-foreground text-center py-1">
              当前线上历史样式
            </div>
          </div>

          <!-- 方案 A: 极客工程风 (Geek Mono) -->
          <div
            class="group flex flex-col justify-between rounded-xl border p-4 space-y-3 transition-all duration-300 cursor-pointer"
            :class="noCoverStyle === 'mono' ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03] shadow-md' : 'border-border/80 bg-card hover:border-primary/50'"
            @click="noCoverStyle = 'mono'"
          >
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">方案 A (推荐)</span>
                <Check v-if="noCoverStyle === 'mono'" class="size-4 text-primary" />
              </div>
              <p class="text-xs text-foreground font-medium">极客等宽芯片 · NO IMAGE</p>
              <p class="text-[11px] text-muted-foreground">等宽字符 + 边框徽章 + 状态提示，浓郁开发者风格。</p>
            </div>

            <div class="h-28 rounded-lg border border-border/70 bg-muted/30 flex flex-col items-center justify-center gap-1 shadow-inner select-none transition-transform group-hover:scale-[1.02]">
              <div class="flex items-center gap-1.5 rounded-md border border-border/80 bg-background/90 px-2.5 py-1 font-mono text-[11px] tracking-widest text-foreground shadow-xs">
                <ImageOff class="size-3.5 text-primary" />
                <span class="font-bold uppercase">NO IMAGE</span>
              </div>
              <span class="font-mono text-[9px] tracking-widest text-muted-foreground/60 uppercase">Image not provided</span>
            </div>

            <button
              type="button"
              class="w-full rounded-md py-1.5 text-xs font-medium transition-all"
              :class="noCoverStyle === 'mono' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted text-foreground hover:bg-muted/80'"
            >
              {{ noCoverStyle === 'mono' ? '✓ 当前已选演示中' : '点击应用此样式' }}
            </button>
          </div>

          <!-- 方案 B: 杂志艺术水印 (Editorial Watermark) -->
          <div
            class="group flex flex-col justify-between rounded-xl border p-4 space-y-3 transition-all duration-300 cursor-pointer"
            :class="noCoverStyle === 'editorial' ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03] shadow-md' : 'border-border/80 bg-card hover:border-primary/50'"
            @click="noCoverStyle = 'editorial'"
          >
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">方案 B</span>
                <Check v-if="noCoverStyle === 'editorial'" class="size-4 text-primary" />
              </div>
              <p class="text-xs text-foreground font-medium">杂志艺术水印 · NO COVER</p>
              <p class="text-[11px] text-muted-foreground">大号极淡艺术字底纹，排版通透，颇具设计感。</p>
            </div>

            <div class="h-28 rounded-lg border border-border/70 bg-muted/30 relative flex items-center justify-center overflow-hidden shadow-inner select-none transition-transform group-hover:scale-[1.02]">
              <span class="absolute text-4xl font-black tracking-widest uppercase text-foreground/[0.05] dark:text-white/[0.06] pointer-events-none scale-125">
                NO COVER
              </span>
              <div class="z-10 flex flex-col items-center gap-1 text-muted-foreground/80">
                <ImageIcon class="size-5 stroke-[1.5] text-primary/70" />
                <span class="text-[10px] font-semibold tracking-widest uppercase">NO COVER</span>
              </div>
            </div>

            <button
              type="button"
              class="w-full rounded-md py-1.5 text-xs font-medium transition-all"
              :class="noCoverStyle === 'editorial' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted text-foreground hover:bg-muted/80'"
            >
              {{ noCoverStyle === 'editorial' ? '✓ 当前已选演示中' : '点击应用此样式' }}
            </button>
          </div>

          <!-- 方案 C: 现代极简胶囊 (Clean Badge) -->
          <div
            class="group flex flex-col justify-between rounded-xl border p-4 space-y-3 transition-all duration-300 cursor-pointer"
            :class="noCoverStyle === 'badge' ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03] shadow-md' : 'border-border/80 bg-card hover:border-primary/50'"
            @click="noCoverStyle = 'badge'"
          >
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">方案 C</span>
                <Check v-if="noCoverStyle === 'badge'" class="size-4 text-primary" />
              </div>
              <p class="text-xs text-foreground font-medium">极简毛玻璃胶囊 · NO PREVIEW</p>
              <p class="text-[11px] text-muted-foreground">类似现代 Notion/Linear 风格，浮动圆角轻量胶囊。</p>
            </div>

            <div class="h-28 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-center shadow-inner select-none transition-transform group-hover:scale-[1.02]">
              <div class="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
                <ImageOff class="size-3 text-primary/70" />
                <span>No Preview</span>
              </div>
            </div>

            <button
              type="button"
              class="w-full rounded-md py-1.5 text-xs font-medium transition-all"
              :class="noCoverStyle === 'badge' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted text-foreground hover:bg-muted/80'"
            >
              {{ noCoverStyle === 'badge' ? '✓ 当前已选演示中' : '点击应用此样式' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- 模块 3：技术代码块（Code Block）对比 -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Terminal class="size-5 text-primary" />
              3. 极客代码块（Code Block）增强对比
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground">
              技术文章最重要的代码展示区：增加<strong>macOS 控制条、语言标识徽章、一键复制代码（带反馈）与暗黑高级毛玻璃质感</strong>。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            代码阅读核心体验
          </span>
        </div>

        <div
          class="grid gap-6 items-start"
          :class="viewMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
        >
          <!-- Before：原生代码块 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'before'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                当前线上设计 (Before)
              </span>
              <span class="text-xs text-muted-foreground">纯黑框 / 无语言 / 无法一键复制</span>
            </div>

            <div class="rounded-xl border bg-[#0d1117] p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
              <pre class="leading-relaxed"><code><span class="text-zinc-500">// src/composables/useReadingProgress.ts</span>
<span class="text-purple-400">import</span> { ref, onMounted, onUnmounted } <span class="text-purple-400">from</span> <span class="text-green-300">'vue'</span>

<span class="text-purple-400">export function</span> <span class="text-blue-400">useReadingProgress</span>(targetElementRef: <span class="text-yellow-300">any</span>) {
  <span class="text-purple-400">const</span> progress = <span class="text-blue-400">ref</span>(<span class="text-orange-400">0</span>)
  <span class="text-purple-400">return</span> { progress }
}</code></pre>
            </div>
          </div>

          <!-- After：Beta 增强代码块 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'after'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Sparkles class="size-3" />
                Beta 优化设计 (After)
              </span>
              <span class="text-xs text-primary font-medium">✨ 终端顶栏 + 语言徽章 + 一键复制</span>
            </div>

            <!-- 增强代码块盒子 -->
            <div class="overflow-hidden rounded-xl border border-border/80 bg-[#0d1117] shadow-lg">
              <!-- macOS 风格顶栏 -->
              <div class="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4 py-2 text-xs select-none">
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1.5">
                    <span class="size-3 rounded-full bg-[#ff5f56] inline-block" />
                    <span class="size-3 rounded-full bg-[#ffbd2e] inline-block" />
                    <span class="size-3 rounded-full bg-[#27c93f] inline-block" />
                  </div>
                  <span class="text-[11px] font-mono text-zinc-400 pl-2">useReadingProgress.ts</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                    TypeScript
                  </span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded bg-zinc-800/80 hover:bg-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300 transition-colors cursor-pointer"
                    @click="copySampleCode"
                  >
                    <Check v-if="copied" class="size-3 text-emerald-400" />
                    <Copy v-else class="size-3" />
                    <span>{{ copied ? '已复制' : '复制' }}</span>
                  </button>
                </div>
              </div>

              <!-- 代码高亮正文 -->
              <div class="p-4 text-xs font-mono text-zinc-200 overflow-x-auto">
                <pre class="leading-relaxed"><code><span class="text-zinc-500">// src/composables/useReadingProgress.ts</span>
<span class="text-purple-400">import</span> { ref, onMounted, onUnmounted } <span class="text-purple-400">from</span> <span class="text-green-300">'vue'</span>

<span class="text-purple-400">export function</span> <span class="text-blue-400">useReadingProgress</span>(targetElementRef: <span class="text-yellow-300">any</span>) {
  <span class="text-purple-400">const</span> progress = <span class="text-blue-400">ref</span>(<span class="text-orange-400">0</span>)
  <span class="text-purple-400">const</span> update = () => {
    <span class="text-purple-400">const</span> el = targetElementRef.value
    <span class="text-purple-400">if</span> (!el) <span class="text-purple-400">return</span>
    <span class="text-purple-400">const</span> total = el.scrollHeight - el.clientHeight
    progress.value = total &gt; <span class="text-orange-400">0</span> ? Math.<span class="text-blue-400">round</span>((el.scrollTop / total) * <span class="text-orange-400">100</span>) : <span class="text-orange-400">0</span>
  }
  <span class="text-purple-400">return</span> { progress }
}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- 模块 4：文章阅读进度条（Reading Progress） -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Eye class="size-5 text-primary" />
              4. 文章阅读进度条（Reading Progress Bar）
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground">
              在文章页顶部导航栏下方嵌入<strong>动态渐变阅读进度条</strong>，让读者清晰感知长篇大论的阅读位置。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            长文沉浸体验
          </span>
        </div>

        <div class="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-foreground">模拟正文滚动测试器（请在下方框内滚动鼠标）</span>
            <span class="font-mono font-bold text-primary">{{ demoScrollProgress }}% 已读</span>
          </div>

          <!-- 模拟导航栏与吸顶进度条 -->
          <div class="overflow-hidden rounded-xl border border-border shadow-sm">
            <div class="relative bg-muted/70 px-4 py-2.5 flex items-center justify-between text-xs border-b">
              <span class="font-semibold text-foreground">文章：Vue 3 + Vite 现代化博客架构实践</span>
              <span class="text-muted-foreground text-[11px]">滚动时观察底边流动进度</span>

              <!-- 顶部 2.5px 流光渐变进度条 -->
              <div class="absolute bottom-0 left-0 right-0 h-[2.5px] bg-border/40">
                <div
                  class="h-full bg-primary transition-all duration-150 ease-out shadow-[0_0_8px_var(--primary)]"
                  :style="{ width: `${demoScrollProgress}%` }"
                />
              </div>
            </div>

            <!-- 可滚动的模拟文章正文区 -->
            <div
              ref="demoScrollContainer"
              class="h-44 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed text-muted-foreground bg-card"
              @scroll="handleDemoScroll"
            >
              <p class="text-foreground font-semibold">第一章：从旧架构迁移的背景与思考</p>
              <p>随着技术的快速演进，早期的静态博客生成器在面对日益增长的高交互需求（例如深色模式平滑过渡、即时客户端全文检索、移动端手势翻页卡片布局）时，显得捉襟见肘...</p>
              <p>在本文中，我们以 Vue 3 全新的 Composition API 与 Vite-SSG 为核心基石，彻底拆解重构了整套页面骨架。</p>
              <p class="text-foreground font-semibold">第二章：卡片网格响应式自动换行策略</p>
              <p>为了让不同分辨率的显示器和手机设备都能获得最佳呈现效果，我们编写了动态列数与行高计算公式，采用 CSS Grid 1fr 统一拉伸，彻底杜绝了不同文章摘要长短不一导致的参差错位。</p>
              <p class="text-foreground font-semibold">第三章：总结与展望</p>
              <p>恭喜您已经滑到了文章末尾！阅读进度条此时已显示为 100%。是不是比没有进度条的长文更加心中有数？</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- 模块 5：文章末尾「上一篇 / 下一篇」关联卡片 -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <SquareDashedBottom class="size-5 text-primary" />
              5. 文末「上一篇 / 下一篇」推荐导航
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground">
              读者阅读到底部后，提供<strong>直观的承接导航卡片</strong>，增加停留时长与内容探索度。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            连贯阅读体验
          </span>
        </div>

        <div
          class="grid gap-6 items-start"
          :class="viewMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
        >
          <!-- Before：无文末导航 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'before'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                当前线上设计 (Before)
              </span>
              <span class="text-xs text-muted-foreground">到底即终点，缺少跳转</span>
            </div>

            <div class="rounded-xl border border-dashed border-border/80 bg-muted/30 p-8 text-center text-xs text-muted-foreground">
              <p>（文章内容结束）</p>
              <p class="mt-2 text-[11px] text-muted-foreground/70">读者读完后只能点浏览器的后退或滚回顶部，极易流失。</p>
            </div>
          </div>

          <!-- After：Beta 推荐卡片 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'after'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Sparkles class="size-3" />
                Beta 优化设计 (After)
              </span>
              <span class="text-xs text-primary font-medium">✨ 双向卡片引导探索</span>
            </div>

            <!-- 左右推荐卡片原型 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- 上一篇 -->
              <div class="group flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer">
                <div class="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                  <ArrowLeft class="size-3 transition-transform group-hover:-translate-x-1" />
                  <span>上一篇</span>
                </div>
                <h4 class="mt-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  从 Folia 迁移至 Fabric 实践心得
                </h4>
                <p class="mt-1 text-[10px] text-muted-foreground">2026-08-20 · 服务器运维</p>
              </div>

              <!-- 下一篇 -->
              <div class="group flex flex-col justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 text-right cursor-pointer">
                <div class="flex items-center justify-end gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                  <span>下一篇</span>
                  <ArrowRight class="size-3 transition-transform group-hover:translate-x-1" />
                </div>
                <h4 class="mt-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  免费 AI 实用工具合集与工作流提效
                </h4>
                <p class="mt-1 text-[10px] text-muted-foreground">2026-09-01 · AI探索</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- 模块 6：分类筛选导航 Pills 胶囊化 -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bookmark class="size-5 text-primary" />
              6. 分类筛选导航 Pills 胶囊化
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground">
              将传统收纳在下拉菜单中的分类，升级为<strong>横向流动式胶囊芯片（Chips/Pills）</strong>，一目了然且点击效率更高。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            筛选导航体验
          </span>
        </div>

        <div
          class="grid gap-6 items-start"
          :class="viewMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'"
        >
          <!-- Before：下拉菜单形式 -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'before'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                当前线上设计 (Before)
              </span>
              <span class="text-xs text-muted-foreground">折叠在小下拉菜单中</span>
            </div>

            <div class="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 flex items-center gap-2">
              <button class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>全部文章</span>
              </button>
              <button class="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <span>分类筛选</span>
                <ChevronDown class="size-3" />
              </button>
            </div>
          </div>

          <!-- After：流动胶囊 Pills -->
          <div v-if="viewMode === 'side-by-side' || activeToggle === 'after'" class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Sparkles class="size-3" />
                Beta 优化设计 (After)
              </span>
              <span class="text-xs text-primary font-medium">✨ 直观平铺 + 计数徽章</span>
            </div>

            <div class="rounded-xl border border-primary/20 bg-primary/[0.02] p-4">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="cat in sampleCategories"
                  :key="cat.name"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer"
                  :class="[
                    selectedPill === cat.name
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  ]"
                  @click="selectedPill = cat.name"
                >
                  <span>{{ cat.name }}</span>
                  <span
                    class="rounded-full px-1.5 py-0.2 text-[10px]"
                    :class="selectedPill === cat.name ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'"
                  >
                    {{ cat.count }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部结语与快捷返回 -->
      <div class="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 text-center space-y-4">
        <h3 class="text-lg font-bold text-foreground">您觉得这套 Beta 体验如何？</h3>
        <p class="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
          您可以随时在对话中告诉我您的偏好（例如：“我喜欢这个代码块样式”、“把品牌强调色设为靛蓝”、“把卡片的阅读时长应用到正式首页”等），我将为您逐步合入正式页面！
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <RouterLink to="/" class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity">
            <ArrowLeft class="size-3.5" />
            返回正式首页
          </RouterLink>
          <Button variant="outline" size="sm" @click="resetAccent">
            <RefreshCw class="size-3.5 mr-1" />
            重置强调色
          </Button>
        </div>
      </div>

    </div>

    <SiteFooter />
  </div>
</template>
