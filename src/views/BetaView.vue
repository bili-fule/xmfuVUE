<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
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
  Layout,
  Layers,
  PanelLeft,
  PanelsTopLeft,
  PictureInPicture,
  Box,
  Monitor,
  Component,
  Compass,
  FileText,
  Clock,
  Image as ImageIcon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SiteFooter from '@/components/SiteFooter.vue'
import { getHomePosts } from '@/data/posts'

const posts = getHomePosts()

// ==========================================
// 动漫 OC 融入 UI 架构方案数据 (UI Layout Schemes)
// ==========================================
export interface UiLayoutScheme {
  id: 'sticky-sidebar' | 'cinematic-hero' | 'floating-widget' | 'card-overflow'
  name: string
  titleEn: string
  tag: string
  layoutRatio: string
  ocPlacementTag: string
  icon: any
  summary: string
  pros: string[]
  cons: string[]
  wireframe: {
    hasLeftSidebar: boolean
    hasTopHero: boolean
    hasFloatingWidget: boolean
    hasOverflowCard: boolean
    ocLocationText: string
  }
  specDetails: {
    desktopGrid: string
    mobileBehavior: string
    assetSpecs: string
    styleAesthetic: string
  }
}

const uiSchemes: UiLayoutScheme[] = [
  {
    id: 'sticky-sidebar',
    name: '方案 A：侧边立绘固定展台',
    titleEn: 'Sticky 3:7 Sidebar Architecture',
    tag: '经典二次元双栏',
    layoutRatio: '桌面 3:7 黄金比例双栏 (320px + 1fr)',
    ocPlacementTag: '左侧竖幅立绘常驻展台 (Sticky Top)',
    icon: PanelLeft,
    summary: '在屏幕左侧规划 320px~360px 的独立展台卡片。正文向下滚动时，左侧立绘始终粘性固定（sticky top-20），无论翻到哪一段，角色始终在左侧视线范围内陪伴，极具个人站专属感。',
    pros: [
      '立绘展示面积大，半身甚至全身立绘都能从容展现',
      '长文滚动全程陪伴，品牌辨识度与个人站氛围最浓厚',
      '左侧卡片可一并收纳个人名片、社交图标、分类导航与音乐播放器',
    ],
    cons: [
      '要求桌面屏幕宽度（>=1280px）较充裕，才能完整展开 3:7 双栏',
      '移动端（<768px）受限于竖屏宽度，必须将左栏折叠到底部或移动端抽屉中',
    ],
    wireframe: {
      hasLeftSidebar: true,
      hasTopHero: false,
      hasFloatingWidget: false,
      hasOverflowCard: false,
      ocLocationText: '左侧 320px 竖幅吸顶展台',
    },
    specDetails: {
      desktopGrid: 'grid grid-cols-12 gap-8 (左侧 col-span-4 粘性吸顶，右侧 col-span-8 文章流)',
      mobileBehavior: '移动端自适应折叠为顶部横幅名片或抽屉侧边栏，不挤占竖屏正文空间',
      assetSpecs: '推荐 3:4 或 9:16 高清透明底立绘（PNG / WebP），分辨率建议 800x1200 以上',
      styleAesthetic: '经典日系独立博客风、双栏卡片错落、半透明毛玻璃微底衬',
    },
  },
  {
    id: 'cinematic-hero',
    name: '方案 B：宽屏映画大画幅 Hero',
    titleEn: 'Cinematic Wide Hero Banner',
    tag: '二游官网视觉冲击',
    layoutRatio: '首屏 100% 全宽海报 + 规整卡片网格',
    ocPlacementTag: '首屏全景透明立绘贯穿',
    icon: PanelsTopLeft,
    summary: '借鉴现代二次元游戏（如米哈游、鹰角二游官网）的设计范式。首页首屏为大画幅宽屏视窗（高度约 380px~460px），立绘以大比例贯穿切入；向下滑动后直接进入工整现代的卡片网格。',
    pros: [
      '第一眼视觉冲击力极强，拥有类似动画官网或游戏发布页的高级质感',
      '正文区依然是标准网格卡片，不影响阅读效率与信息排列',
      '进入文章内页后 Hero 自然收起，完全不抢占技术文章阅读空间',
    ],
    cons: [
      '首屏垂直高度占用较大，首屏展示的文章条目较少（需下滚一行）',
      '需要一张高精度、无边缘生硬裁切的大画幅立绘或横版壁纸',
    ],
    wireframe: {
      hasLeftSidebar: false,
      hasTopHero: true,
      hasFloatingWidget: false,
      hasOverflowCard: false,
      ocLocationText: '首屏全宽映画 Hero Banner 贯穿浮动',
    },
    specDetails: {
      desktopGrid: '顶部 h-[420px] 视差横幅 + 底部 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      mobileBehavior: '移动端立绘按比例居中自适应置底，标题文字悬浮上方保持海报质感',
      assetSpecs: '推荐高分辨率横版插画，或大比例透明底半身立绘（分辨率 1920x1080 或 1200x1200+）',
      styleAesthetic: '二游科技机能感、斜切角修饰线、流光弥散光晕与大面积留白',
    },
  },
  {
    id: 'floating-widget',
    name: '方案 C：悬浮微挂件 + 纯净正文',
    titleEn: 'Floating Companion & Clean Feed',
    tag: '克制与沉浸',
    layoutRatio: '单栏居中纯净流 (max-w-4xl) + 悬浮 FAB 挂件',
    ocPlacementTag: '右下角圆形微挂件 + 顶部进度跑酷头像',
    icon: PictureInPicture,
    summary: '最受技术极客推崇的理智克制方案。整个博客 100% 保持严谨、干净的单栏居中排版（max-w-4xl），角色作为常驻右下角的可交互悬浮小挂件，点击可弹出抽屉名片，顶部阅读进度条终点跟随小头像跑酷。',
    pros: [
      '正文阅读 100% 纯净无干扰，长篇代码与技术架构最聚焦',
      '对屏幕尺寸兼容性最好，无论超宽屏还是窄屏手机都能极佳自适应',
      '挂件形式极富趣味性，可集成回到顶部、夜间切换、展开立绘等多种实用工具',
    ],
    cons: [
      '首屏缺乏大立绘的直接视觉震撼，二次元属性相对低调内敛',
      '挂件尺寸较小，无法直接大画幅展示立绘细节（需点击后弹出查看）',
    ],
    wireframe: {
      hasLeftSidebar: false,
      hasTopHero: false,
      hasFloatingWidget: true,
      hasOverflowCard: false,
      ocLocationText: '右下角 FAB 悬浮挂件 + 顶部进度条跑酷小头像',
    },
    specDetails: {
      desktopGrid: 'max-w-4xl mx-auto 单栏居中流 + fixed bottom-6 right-6 悬浮组件',
      mobileBehavior: '移动端自动适配安全边距，尺寸微缩至 44px 不遮挡滑动',
      assetSpecs: '推荐 1 张 Q 版萌系头像/全身像（用于挂件常驻），另备 1 张展开查看的大立绘',
      styleAesthetic: '现代极简 Notion/Linear 极客风 + 萌系微交互点缀',
    },
  },
  {
    id: 'card-overflow',
    name: '方案 D：2.5D 破框立体穿插',
    titleEn: '2.5D Card Header Overflow',
    tag: '打破矩形束缚',
    layoutRatio: '多层网格 + 负边距立体破框 (-mt-12)',
    ocPlacementTag: '立绘上半身突破卡片上边框',
    icon: Box,
    summary: '打破千篇一律的方形盒子桎梏。利用 CSS 负边距（-mt-12）与分层 Z-Index，让 OC 立绘的头部、发梢或武器直接“伸出”卡片上边框，悬浮在背景之上，产生极其抓人眼球的 2.5D 错觉。',
    pros: [
      '设计感极强，打破所有传统模板的单调矩形感，非常前沿新颖',
      '空间利用极其紧凑，不需要牺牲整整一栏空间，在卡片内部就能玩出空间层次',
      '可以在卡片边缘或页面拐角加入“探头（Peeking）”的生动细节',
    ],
    cons: [
      '对立绘素材要求较高：上边界必须是有机发丝轮廓，不能有生硬的横向切边',
      '前端 CSS 定位需要精细调整各断点下的负边距，避免移动端与导航条错位重叠',
    ],
    wireframe: {
      hasLeftSidebar: false,
      hasTopHero: false,
      hasFloatingWidget: false,
      hasOverflowCard: true,
      ocLocationText: '卡片上沿开放式切除，立绘负边距破框向上探出 48px',
    },
    specDetails: {
      desktopGrid: 'grid grid-cols-1 lg:grid-cols-3 gap-6 (破框名片卡 col-span-1)',
      mobileBehavior: '移动端破框负边距自动收敛（-mt-6），避免覆盖上方组件',
      assetSpecs: '必须是透明底 PNG/WebP，且角色头部、头饰、发梢完整无横切线',
      styleAesthetic: '现代轻拟态、弥散景深投影、动态悬浮破框',
    },
  },
]

const activeUiIndex = ref(0)
const currentUiScheme = computed(() => uiSchemes[activeUiIndex.value])

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
      <!-- 重点板块：动漫 OC 融入 UI 架构方案工坊 (UI Architecture Studio) -->
      <!-- ============================================================ -->
      <section class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary font-semibold px-2.5 py-0.5 text-xs">
                <Layout class="size-3" />
                UI 排版与架构范式
              </span>
              <span class="text-xs text-muted-foreground">动漫 OC 与现代化博客深度融合</span>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Layers class="size-6 text-primary" />
              动漫 OC 融入博客 UI 架构设计方案
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              为解决“动漫 OC 放在网页哪个位置、如何与文章排版共存、避免破坏技术阅读体验”的核心问题，我们设计了 4 套纯粹的 <strong>UI 栅格与视觉空间架构方案</strong>。
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium">
            4 种布局线框直观对比
          </span>
        </div>

        <!-- 4 种 UI 架构方案切换 Tab -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            v-for="(scheme, index) in uiSchemes"
            :key="scheme.id"
            type="button"
            class="group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer"
            :class="[
              activeUiIndex === index
                ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.04] shadow-md scale-[1.01]'
                : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30'
            ]"
            @click="activeUiIndex = index"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="activeUiIndex === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
                >
                  {{ scheme.tag }}
                </span>
                <span class="text-xs font-semibold text-primary">
                  <component :is="scheme.icon" class="size-4" />
                </span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {{ scheme.name }}
              </h3>
              <p class="text-[11px] text-muted-foreground font-mono">
                {{ scheme.titleEn }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span class="text-muted-foreground truncate max-w-[120px]">{{ scheme.layoutRatio }}</span>
              <span
                class="font-semibold shrink-0"
                :class="activeUiIndex === index ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground'"
              >
                {{ activeUiIndex === index ? '当前查看' : '查看线框 →' }}
              </span>
            </div>
          </button>
        </div>

        <!-- 交互可视化沙盒：线框示意 + 真实局部排版 + 技术参数 -->
        <div class="rounded-3xl border border-border/90 bg-card shadow-sm overflow-hidden space-y-6 p-5 sm:p-7">
          <!-- 头部方案速览摘要 -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-lg font-extrabold text-foreground">{{ currentUiScheme.name }}</span>
                <span class="rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                  {{ currentUiScheme.ocPlacementTag }}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {{ currentUiScheme.summary }}
              </p>
            </div>
            <div class="shrink-0 flex items-center gap-2">
              <span class="rounded-lg bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground border border-border/70">
                栅格比例：{{ currentUiScheme.layoutRatio }}
              </span>
            </div>
          </div>

          <!-- 核心对比层：可视化微缩线框图 vs 真实 1:1 组件模拟 -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- [左] 可视化全站架构线框图 (Mini Browser Wireframe Blueprint) -->
            <div class="lg:col-span-6 space-y-2">
              <div class="flex items-center justify-between text-xs px-1 font-semibold text-foreground">
                <span class="flex items-center gap-1.5">
                  <Monitor class="size-3.5 text-primary" />
                  整站空间布局线框示意 (Layout Blueprint)
                </span>
                <span class="text-[11px] text-primary font-mono font-normal">
                  {{ currentUiScheme.wireframe.ocLocationText }}
                </span>
              </div>

              <!-- 拟真浏览器线框视窗 -->
              <div class="rounded-2xl border border-border bg-muted/40 p-3.5 space-y-2 shadow-inner">
                <!-- 浏览器窗体小红黄绿点 -->
                <div class="flex items-center justify-between border-b border-border/60 pb-2 px-1 text-[11px] text-muted-foreground">
                  <div class="flex items-center gap-1.5">
                    <span class="size-2.5 rounded-full bg-red-400" />
                    <span class="size-2.5 rounded-full bg-yellow-400" />
                    <span class="size-2.5 rounded-full bg-green-400" />
                  </div>
                  <span class="font-mono text-[10px] bg-background/80 rounded px-3 py-0.5 border border-border/50">
                    https://blog.example.com/layout-preview
                  </span>
                  <span class="text-[10px] font-mono">1440 × 900</span>
                </div>

                <!-- 页面线框栅格动态渲染 -->
                <div class="h-64 sm:h-72 rounded-xl border border-dashed border-border/80 bg-background/60 p-3 flex flex-col gap-2 overflow-hidden relative">
                  
                  <!-- 顶栏 Header -->
                  <div class="h-7 w-full rounded border border-border bg-muted/60 flex items-center justify-between px-3 text-[10px] shrink-0 text-muted-foreground">
                    <div class="flex items-center gap-2">
                      <div class="size-3.5 rounded bg-primary/30" />
                      <span class="font-bold">LOGO / NAV</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span>文章</span>
                      <span>分类</span>
                      <span>关于</span>
                    </div>
                  </div>

                  <!-- 顶部全宽 Hero（仅方案 B 激活） -->
                  <div
                    v-if="currentUiScheme.wireframe.hasTopHero"
                    class="h-24 w-full rounded-lg border-2 border-primary bg-primary/10 p-3 flex items-center justify-between shrink-0 relative overflow-hidden"
                  >
                    <div class="space-y-1 z-10">
                      <span class="text-[10px] font-bold text-primary block">CINEMATIC WIDE HERO BANNER</span>
                      <span class="text-[9px] text-muted-foreground block">标题宣言与引言文字浮动区域</span>
                    </div>
                    <!-- 立绘大画幅插槽示意 -->
                    <div class="h-full w-32 rounded bg-primary/25 border border-primary/50 flex flex-col items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      <span>[ 大画幅立绘 ]</span>
                      <span class="text-[8px] font-mono opacity-75">贯穿首屏海报</span>
                    </div>
                  </div>

                  <!-- 下部主体内容容器 -->
                  <div class="flex-1 min-h-0 flex gap-2">
                    
                    <!-- 方案 A：左侧 3:7 独立吸顶立绘展台 -->
                    <div
                      v-if="currentUiScheme.wireframe.hasLeftSidebar"
                      class="w-36 rounded-lg border-2 border-primary bg-primary/10 p-2 flex flex-col justify-between shrink-0 text-center"
                    >
                      <div class="h-28 rounded border border-primary/50 bg-primary/20 flex flex-col items-center justify-center text-[10px] font-bold text-primary">
                        <span>[ 竖幅立绘 ]</span>
                        <span class="text-[8px] opacity-75">320px 独立卡片</span>
                      </div>
                      <div class="space-y-1 text-[9px] text-muted-foreground">
                        <div class="h-2 rounded bg-muted w-3/4 mx-auto" />
                        <div class="h-2 rounded bg-muted w-1/2 mx-auto" />
                      </div>
                    </div>

                    <!-- 主文章流 (通用) -->
                    <div class="flex-1 rounded-lg border border-border/70 bg-card p-2 flex flex-col gap-2 overflow-hidden">
                      <div class="flex items-center justify-between text-[9px] text-muted-foreground border-b border-border/40 pb-1">
                        <span>POSTS STREAM (文章流)</span>
                        <span>GRID 1FR</span>
                      </div>
                      <div class="grid grid-cols-2 gap-1.5 flex-1">
                        <div class="rounded border border-border/50 bg-muted/30 p-1.5 flex flex-col justify-between">
                          <div class="h-6 rounded bg-muted/60 w-full" />
                          <div class="h-1.5 rounded bg-muted w-3/4" />
                        </div>
                        <div class="rounded border border-border/50 bg-muted/30 p-1.5 flex flex-col justify-between">
                          <div class="h-6 rounded bg-muted/60 w-full" />
                          <div class="h-1.5 rounded bg-muted w-3/4" />
                        </div>
                      </div>
                    </div>

                    <!-- 方案 D：破框卡片示意 -->
                    <div
                      v-if="currentUiScheme.wireframe.hasOverflowCard"
                      class="w-36 rounded-lg border-2 border-primary bg-primary/10 p-2 flex flex-col justify-between shrink-0 relative"
                    >
                      <!-- 破框立绘浮动块 -->
                      <div class="absolute -top-3 left-4 right-4 h-12 rounded-t-lg bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-md">
                        ▲ 破框探出 -mt-6
                      </div>
                      <div class="pt-10 text-[9px] text-center font-bold text-primary">
                        2.5D 破框卡片
                      </div>
                      <div class="h-2 rounded bg-muted w-3/4 mx-auto" />
                    </div>

                  </div>

                  <!-- 方案 C：右下角常驻悬浮挂件示意 -->
                  <div
                    v-if="currentUiScheme.wireframe.hasFloatingWidget"
                    class="absolute bottom-4 right-4 size-10 rounded-full border-2 border-primary bg-primary text-primary-foreground flex flex-col items-center justify-center text-[8px] font-bold shadow-lg animate-bounce"
                  >
                    <span>FAB</span>
                    <span>挂件</span>
                  </div>

                </div>
              </div>
            </div>

            <!-- [右] 方案真实高保真组件局部实景 (1:1 High-Fidelity Mockup) -->
            <div class="lg:col-span-6 space-y-2">
              <div class="flex items-center justify-between text-xs px-1 font-semibold text-foreground">
                <span class="flex items-center gap-1.5">
                  <Component class="size-3.5 text-primary" />
                  高保真实景预览 (High-Fidelity Mockup)
                </span>
                <span class="text-[11px] text-muted-foreground">观察真实尺寸与留白比例</span>
              </div>

              <!-- 根据选中的方案渲染对应的 1:1 组件模型 -->
              <div class="rounded-2xl border border-border bg-muted/20 p-4 min-h-[310px] flex flex-col justify-center">
                
                <!-- 方案 A 实景：左侧独立立绘名片 + 右侧双文章 -->
                <div v-if="activeUiIndex === 0" class="grid grid-cols-12 gap-3 items-stretch">
                  <div class="col-span-5 rounded-xl border border-primary/40 bg-card p-3 flex flex-col justify-between space-y-2 shadow-xs">
                    <div class="h-32 rounded-lg bg-gradient-to-b from-primary/15 via-primary/5 to-transparent border border-dashed border-primary/40 flex flex-col items-center justify-center text-center p-2">
                      <ImageIcon class="size-6 text-primary mb-1" />
                      <span class="text-xs font-bold text-primary">竖版透明立绘插槽</span>
                      <span class="text-[10px] text-muted-foreground">320 × 480 px (Sticky)</span>
                    </div>
                    <div class="space-y-1 text-center">
                      <h5 class="text-xs font-bold text-foreground">站长 & 伴读 OC</h5>
                      <p class="text-[10px] text-muted-foreground">常驻视线左侧，随滚动吸顶</p>
                    </div>
                  </div>
                  <div class="col-span-7 space-y-2">
                    <div class="rounded-xl border border-border bg-card p-3 space-y-1.5 shadow-xs">
                      <span class="text-[10px] text-primary font-semibold">技术实践 · 6 min</span>
                      <h5 class="text-xs font-bold text-foreground line-clamp-1">Vue 3 静态博客架构解析</h5>
                      <p class="text-[11px] text-muted-foreground line-clamp-2">正文滚动时，左侧立绘始终优雅在场，不打扰正文阅读，陪伴感最佳。</p>
                    </div>
                    <div class="rounded-xl border border-border bg-card p-3 space-y-1.5 shadow-xs">
                      <span class="text-[10px] text-primary font-semibold">服务器运维 · 8 min</span>
                      <h5 class="text-xs font-bold text-foreground line-clamp-1">从单体到分布式集群架构</h5>
                      <p class="text-[11px] text-muted-foreground line-clamp-2">经典二次元博客最成熟的排版范式，适合内容量丰沛的站点。</p>
                    </div>
                  </div>
                </div>

                <!-- 方案 B 实景：宽屏映画 Hero 海报 -->
                <div v-else-if="activeUiIndex === 1" class="space-y-3">
                  <div class="rounded-xl border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-primary/20 p-4 flex items-center justify-between overflow-hidden relative shadow-sm">
                    <div class="space-y-1.5 max-w-[65%] z-10">
                      <span class="text-[10px] font-bold text-primary uppercase tracking-wider">Cinematic Hero Banner</span>
                      <h4 class="text-base font-extrabold text-foreground">欢迎探索我的数字花园与个人世界观</h4>
                      <p class="text-xs text-muted-foreground line-clamp-2">以二游官网的沉浸映画作为第一眼视觉入口，下滚即达规整技术卡片。</p>
                    </div>
                    <div class="h-28 w-28 rounded-lg bg-primary/20 border border-primary/50 flex flex-col items-center justify-center text-center text-primary p-2 shrink-0">
                      <span class="text-xs font-bold">大幅立绘</span>
                      <span class="text-[10px] opacity-80">贯穿首屏</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="rounded-lg border border-border bg-card p-2.5 text-xs text-muted-foreground">
                      <span class="font-bold text-foreground block mb-0.5">文章卡片 01</span>
                      <span class="text-[11px]">保持标准网格排列，不失实用性</span>
                    </div>
                    <div class="rounded-lg border border-border bg-card p-2.5 text-xs text-muted-foreground">
                      <span class="font-bold text-foreground block mb-0.5">文章卡片 02</span>
                      <span class="text-[11px]">海报视觉冲击与阅读效率两全</span>
                    </div>
                  </div>
                </div>

                <!-- 方案 C 实景：纯净单栏 + 右下角悬浮微挂件 -->
                <div v-else-if="activeUiIndex === 2" class="space-y-3 relative p-2">
                  <div class="rounded-xl border border-border bg-card p-4 space-y-2 max-w-sm mx-auto shadow-xs">
                    <div class="flex items-center justify-between text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">纯净居中单栏模式 (max-w-4xl)</span>
                      <span>沉浸长文</span>
                    </div>
                    <p class="text-xs text-muted-foreground leading-relaxed">
                      正文主体采用 100% 干净单栏，绝无多余大图分散视线，极其适合专业技术深度长文阅读。
                    </p>
                    <div class="h-1.5 rounded-full bg-muted overflow-hidden flex">
                      <div class="h-full bg-primary w-2/3" />
                      <div class="size-2 -mt-0.25 rounded-full bg-primary ring-2 ring-background shrink-0" title="小头像跑酷" />
                    </div>
                  </div>

                  <!-- 右下角悬浮 FAB 挂件实景 -->
                  <div class="flex items-center justify-end pt-2">
                    <div class="flex items-center gap-2 rounded-full border border-primary/40 bg-card p-1.5 pr-3 shadow-lg">
                      <div class="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                        OC
                      </div>
                      <div class="text-[10px] text-foreground font-medium">
                        <span>点击展开看板娘名片</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 方案 D 实景：2.5D 破框立体穿插 -->
                <div v-else-if="activeUiIndex === 3" class="pt-8 px-2 pb-2">
                  <div class="relative rounded-2xl border border-primary/40 bg-card p-4 pt-6 shadow-md">
                    <!-- 破框延伸出的立绘上半身示意 -->
                    <div class="absolute -top-7 left-6 h-14 w-28 rounded-t-xl bg-gradient-to-t from-primary/80 to-primary text-white text-[11px] font-bold flex flex-col items-center justify-center shadow-lg">
                      <span>▲ 2.5D 破框立绘</span>
                      <span class="text-[9px] opacity-80">-mt-8 探出上沿</span>
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between pl-32">
                        <span class="text-xs font-bold text-foreground">打破传统单调矩形框</span>
                        <span class="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">突破边界</span>
                      </div>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        利用 CSS 负边距与层叠上下文，角色宛如站在卡片后方探出半身，在视觉上形成强烈的 2.5D 错层与浮空感，灵动且极具设计趣味。
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- 底部：方案对比参数矩阵 (Pros / Cons / Specs) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-5 text-xs">
            <!-- 优势 -->
            <div class="space-y-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5">
              <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check class="size-4" />
                UI 核心优势
              </span>
              <ul class="space-y-1 text-muted-foreground leading-relaxed text-[11px]">
                <li v-for="pro in currentUiScheme.pros" :key="pro" class="flex items-start gap-1">
                  <span class="text-emerald-500 font-bold">+</span>
                  <span>{{ pro }}</span>
                </li>
              </ul>
            </div>

            <!-- 考量 -->
            <div class="space-y-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3.5">
              <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Compass class="size-4" />
                实现与场景考量
              </span>
              <ul class="space-y-1 text-muted-foreground leading-relaxed text-[11px]">
                <li v-for="con in currentUiScheme.cons" :key="con" class="flex items-start gap-1">
                  <span class="text-amber-500 font-bold">·</span>
                  <span>{{ con }}</span>
                </li>
              </ul>
            </div>

            <!-- 美术资产与技术规格 -->
            <div class="space-y-2 rounded-xl bg-muted/40 border border-border/70 p-3.5">
              <span class="font-bold text-foreground flex items-center gap-1.5">
                <FileText class="size-4 text-primary" />
                建议立绘素材规格
              </span>
              <div class="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
                <p><strong class="text-foreground">🎨 美术素材：</strong>{{ currentUiScheme.specDetails.assetSpecs }}</p>
                <p><strong class="text-foreground">📱 移动端表现：</strong>{{ currentUiScheme.specDetails.mobileBehavior }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- 待定项 1：文章阅读进度条（Reading Progress） -->
      <!-- ============================================================ -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div class="space-y-1">
            <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Eye class="size-5 text-primary" />
              待定项 1：文章阅读进度条（Reading Progress Bar）
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
