<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Sparkles,
  ArrowLeft,
  Check,
  Palette,
  Columns,
  Eye,
  Bookmark,
  ChevronDown,
  RefreshCw,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SiteFooter from '@/components/SiteFooter.vue'
import { getHomePosts } from '@/data/posts'

const posts = getHomePosts()

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
      <!-- 模块 1：文章阅读进度条（Reading Progress） -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Eye class="size-5 text-primary" />
              1. 文章阅读进度条（Reading Progress Bar）
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
      <!-- 待定项 2：分类筛选导航 Pills 胶囊化 -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bookmark class="size-5 text-primary" />
              2. 分类筛选导航 Pills 胶囊化（待定项）
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
