<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Sparkles,
  Bot,
  ArrowLeft,
  Copy,
  Check,
  ChevronDown,
  Download,
  FileDown,
  MessageSquareText,
  Terminal,
  Layers,
  PanelRightOpen,
  SlidersHorizontal,
  Folder,
  X,
  Code2,
  Cpu,
  Info,
  ExternalLink,
  Flame,
  FileCode2,
  CornerDownRight,
  ShieldAlert,
  User,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SiteFooter from '@/components/SiteFooter.vue'

// ==========================================
// 模拟真实的 AI 原稿数据
// ==========================================
const mockPost = {
  title: 'AI 原稿分区：把生成过程也留下',
  date: '2026-08-30',
  category: '技术方案',
  tags: ['AI', '博客架构', 'Markdown'],
  slug: 'ai-original-design',
  readingTime: 4,
  origin: 'ai',
  editorialStatus: 'raw',
  model: 'Codex-2026-v2',
  excerpt: '记录一次关于 AI 原稿分区、提示词留存和对话记录展示的博客设计讨论，让读者理解生成脉络。',
  cover: '',
  prompt: `和我讨论一下一个问题，帮我构思网站设计方面的东西，就是我有一个博客，里面有部分文章是纯ai生成的，就是说有点狗屁不通，因此，我觉得这类文章适合单独一个分区，与我人工写的（精修的）文章分开，然后这个ai写的文章可能我会提供下载md的形式，比如说用户可以用于导入ai，让这些文章以更适合人类的方式阅读。`,
  conversationSummary: `用户希望把质量不稳定的 AI 生成文章与人工精修文章分开，并提供 Markdown 下载，让读者可以交给其他 AI 整理。讨论进一步确定：AI 原稿区还应保存初始提示词、模型信息和简要对话记录，使每篇原稿成为可追溯、可复用的生成档案。页面反馈随后明确了三个取舍：移除复制整理指令，把两个下载动作归为一组，并让 AI 原稿在首页出现但保留明显标识。`,
  conversation: [
    {
      role: 'user',
      time: '14:20',
      content: '和我讨论一下一个问题，帮我构思网站设计方面的东西，就是我有一个博客，里面有部分文章是纯ai生成的，就是说有点狗屁不通，因此，我觉得这类文章适合单独一个分区，与我人工写的（精修的）文章分开，然后这个ai写的文章可能我会提供下载md的形式，比如说用户可以用于导入ai，让这些文章以更适合人类的方式阅读。',
    },
    {
      role: 'assistant',
      time: '14:21',
      content: '建议把正式文章与 AI 实验室分开。AI 实验室保存未人工校订的原稿，详情页展示清晰的状态标签，并提供原始 Markdown 和整理指令，让下载与再加工成为主要用途。',
    },
    {
      role: 'user',
      time: '14:23',
      content: '首先，既然是ai写的原稿，ai肯定和我有交流的过程吧，所以我希望比如说留存我的提示词（和简单的记录ai和我的对话），这很合理吧。',
    },
    {
      role: 'assistant',
      time: '14:24',
      content: '这很合理，而且是 AI 原稿区成立的核心。建议公开完整初始提示词、关键对话回合和一段对话摘要；完整聊天记录可以作为可选展开或单独下载，同时需要脱敏私人资料和系统提示词。',
    },
    {
      role: 'user',
      time: '14:26',
      content: 'OK，你设计一下方案吧。然后先执行吧。同时这篇这个对话也写成一篇文章放进去。',
    },
  ],
}

// ==========================================
// 交互状态控制
// ==========================================
// 顶部 Tab: 'post-view' (文章详情页重构) | 'card-view' (首页卡片改造) | 'palette-lab' (配色实验室)
const mainSection = ref<'post-view' | 'card-view' | 'palette-lab'>('post-view')

// 配色主题选择
type PaletteKey = 'purple' | 'cyan' | 'brand' | 'slate'
const activePalette = ref<PaletteKey>('purple')

const paletteThemes: Record<PaletteKey, {
  name: string
  color: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  cardBorder: string
  gradientBg: string
  accentText: string
}> = {
  purple: {
    name: '极光紫 (Cyber Violet)',
    color: '#a855f7',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-600 dark:text-purple-300',
    badgeBorder: 'border-purple-500/30',
    cardBorder: 'border-purple-500/25',
    gradientBg: 'from-purple-500/10 via-indigo-500/5 to-transparent',
    accentText: 'text-purple-500',
  },
  cyan: {
    name: '矩阵青 (Neon Cyan)',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-600 dark:text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    cardBorder: 'border-cyan-500/25',
    gradientBg: 'from-cyan-500/10 via-teal-500/5 to-transparent',
    accentText: 'text-cyan-500',
  },
  brand: {
    name: '博客主色 (Primary Green/Emerald)',
    color: '#10b981',
    badgeBg: 'bg-primary/10 dark:bg-primary/20',
    badgeText: 'text-primary',
    badgeBorder: 'border-primary/30',
    cardBorder: 'border-primary/25',
    gradientBg: 'from-primary/10 via-primary/5 to-transparent',
    accentText: 'text-primary',
  },
  slate: {
    name: '极简银灰 (Monochrome Slate)',
    color: '#64748b',
    badgeBg: 'bg-muted/80',
    badgeText: 'text-foreground',
    badgeBorder: 'border-border',
    cardBorder: 'border-border',
    gradientBg: 'from-muted/40 via-muted/20 to-transparent',
    accentText: 'text-foreground',
  },
}

const currentTheme = computed(() => paletteThemes[activePalette.value])

// 一键复制 Prompt 逻辑与 Toast 反馈
const copiedPrompt = ref(false)
function copyPromptText() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(mockPost.prompt)
    copiedPrompt.value = true
    setTimeout(() => {
      copiedPrompt.value = false
    }, 2000)
  }
}

// 方案2（折叠Tab卡片）状态
const scheme2Expanded = ref(true)
const scheme2Tab = ref<'prompt' | 'chat' | 'download'>('prompt')

// 方案3（抽屉式侧边栏）状态
const drawerOpen = ref(false)

// 方案4（极客终端）展开状态
const terminalExpanded = ref(true)

// 用户倾向选择打分记录
const selectedScheme = ref<string | null>(null)
const voteSuccess = ref(false)
function vote(schemeName: string) {
  selectedScheme.value = schemeName
  voteSuccess.value = true
  setTimeout(() => {
    voteSuccess.value = false
  }, 2500)
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="min-h-full sm:h-full min-w-0 flex-1 overflow-y-auto sm:overflow-y-auto bg-background text-foreground pb-20 selection:bg-primary/20 selection:text-primary scroll-smooth">
    <!-- 顶部工作台导航 -->
    <header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft class="size-3.5" />
            <span>返回博客</span>
          </RouterLink>

          <div class="h-4 w-px bg-border/80" />

          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles class="size-3" />
              DEMO LAB
            </span>
            <h1 class="text-sm font-bold tracking-tight text-foreground sm:text-base">
              AI 原稿视觉与交互改造演示展厅
            </h1>
          </div>
        </div>

        <!-- 切换回动漫 OC 方案的快捷入口 -->
        <RouterLink
          to="/beta"
          class="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition"
        >
          <span>看动漫 OC 方案 (Beta)</span>
          <ExternalLink class="size-3 opacity-60" />
        </RouterLink>
      </div>

      <!-- 二级导航栏：板块切换与调色盘 -->
      <div class="border-t border-border/40 bg-muted/20 px-4 py-2 sm:px-6">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <!-- 主板块切换 -->
          <div class="inline-flex rounded-lg border border-border/60 bg-card p-1 shadow-xs">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="mainSection === 'post-view'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'"
              @click="mainSection = 'post-view'"
            >
              <FileCode2 class="size-3.5" />
              <span>1. 文章详情页 4 种方案</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="mainSection === 'card-view'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'"
              @click="mainSection = 'card-view'"
            >
              <Layers class="size-3.5" />
              <span>2. 首页卡片角标改造</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all"
              :class="mainSection === 'palette-lab'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'"
              @click="mainSection = 'palette-lab'"
            >
              <SlidersHorizontal class="size-3.5" />
              <span>3. 配色与风格对比</span>
            </button>
          </div>

          <!-- 实时色彩切换器（全局作用） -->
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="hidden md:inline text-[11px] font-medium">预览主题色：</span>
            <div class="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
              <button
                v-for="(th, key) in paletteThemes"
                :key="key"
                type="button"
                class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition"
                :class="activePalette === key
                  ? 'bg-muted text-foreground font-semibold ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'"
                @click="activePalette = key as PaletteKey"
              >
                <span class="size-2 rounded-full" :style="{ backgroundColor: th.color }" />
                <span>{{ th.name.split(' ')[0] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 复制成功的浮动 Toast 提示 -->
    <Transition name="fade">
      <div
        v-if="copiedPrompt"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md"
      >
        <Check class="size-3.5" />
        <span>Prompt 提示词已成功复制到剪贴板！</span>
      </div>
    </Transition>

    <!-- 投票选择反馈 Toast -->
    <Transition name="fade">
      <div
        v-if="voteSuccess"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-primary/40 bg-card px-4 py-2 text-xs font-medium text-foreground shadow-2xl backdrop-blur-md"
      >
        <Sparkles class="size-4 text-primary" />
        <span>已记录你的偏好：<strong>{{ selectedScheme }}</strong></span>
      </div>
    </Transition>

    <!-- 主展示容器 -->
    <main class="mx-auto max-w-5xl px-4 pt-6 sm:px-6">

      <!-- ================================================================= -->
      <!-- 板块 1：文章详情页（PostView）方案大对比                          -->
      <!-- ================================================================= -->
      <div v-show="mainSection === 'post-view'" class="space-y-12">
        <!-- 导读提示条 -->
        <div class="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <div class="flex items-center gap-2 font-semibold text-foreground mb-1">
            <Info class="size-4 text-primary" />
            <span>核心改进目标：将首屏阅读空间还给正文，消除生硬的 Debug 面板感</span>
          </div>
          下方为你展示了 4 种不同维度的重构方案。你可以直接点击展开、复制 Prompt、体验抽屉滑出或模拟对话回放。
        </div>

        <!-- 方案 0：现状（对照组） -->
        <section class="rounded-2xl border border-red-500/30 bg-card/60 p-5 shadow-xs relative overflow-hidden">
          <div class="absolute top-0 right-0 rounded-bl-xl bg-red-500/10 border-b border-l border-red-500/20 px-3 py-1 text-[11px] font-semibold text-red-500 flex items-center gap-1">
            <ShieldAlert class="size-3" />
            <span>当前现状（对照组）</span>
          </div>

          <div class="mb-4">
            <h2 class="text-base font-bold text-foreground flex items-center gap-2">
              <span class="rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-500 font-mono">00</span>
              现有代码实现样式
            </h2>
            <p class="text-xs text-muted-foreground mt-1">
              问题：大灰框占据半屏，原生 pre 格式生硬，原生 details 对话折叠简陋无气泡感，缺乏现代质感。
            </p>
          </div>

          <!-- 现有样式原样仿真 -->
          <div class="rounded-xl border border-primary/20 bg-primary/[0.03] overflow-hidden">
            <div class="flex flex-col gap-4 border-b border-primary/10 p-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles class="size-4 text-primary" />
                  <span>AI 原稿</span>
                  <span class="rounded-full border border-border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                    未经人工校验
                  </span>
                </div>
                <p class="max-w-xl text-xs leading-5 text-muted-foreground">
                  本文系 AI 大模型生成草稿，未经人工深度润色与校验，仅作归档与参考。
                </p>
              </div>

              <div class="flex flex-col gap-1.5 lg:shrink-0 lg:items-end">
                <span class="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Download class="size-3 text-primary" />
                  原稿资产下载
                </span>
                <div class="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" class="h-7 text-xs">
                    <Download class="size-3 mr-1" />
                    下载 Markdown
                  </Button>
                  <Button variant="outline" size="sm" class="h-7 text-xs">
                    <FileDown class="size-3 mr-1" />
                    下载生成记录
                  </Button>
                </div>
              </div>
            </div>

            <div class="grid min-w-0 md:grid-cols-2">
              <div class="border-b border-primary/10 p-4 md:border-b-0 md:border-r">
                <div class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Sparkles class="size-3 text-primary" />
                  提示词 (Prompt)
                </div>
                <pre class="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/60 p-2.5 text-xs leading-5 text-muted-foreground">{{ mockPost.prompt }}</pre>
              </div>

              <div class="p-4">
                <div class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <MessageSquareText class="size-3 text-primary" />
                  对话与构思概要
                </div>
                <p class="text-xs leading-5 text-muted-foreground line-clamp-4">
                  {{ mockPost.conversationSummary }}
                </p>
                <div class="mt-2 text-[11px] text-muted-foreground/70">
                  生成模型：{{ mockPost.model }} · {{ mockPost.conversation.length }} 轮对话
                </div>
              </div>
            </div>

            <details class="border-t border-primary/10">
              <summary class="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/40">
                <MessageSquareText class="size-3 text-primary" />
                <span>原生折叠：展开完整对话记录 ({{ mockPost.conversation.length }})</span>
              </summary>
              <div class="space-y-3 border-t border-primary/10 p-4">
                <div
                  v-for="(turn, idx) in mockPost.conversation.slice(0, 2)"
                  :key="idx"
                  class="border-l-2 pl-3"
                  :class="turn.role === 'user' ? 'border-foreground/30' : 'border-primary/50'"
                >
                  <div class="text-[11px] font-bold text-muted-foreground">
                    {{ turn.role === 'user' ? '我' : 'AI' }}
                  </div>
                  <p class="text-xs text-muted-foreground/90 mt-0.5">{{ turn.content }}</p>
                </div>
              </div>
            </details>
          </div>
        </section>

        <!-- 方案 1：首屏轻量胶囊条 + 文末生成档案（最推荐 ⭐️） -->
        <section class="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="[currentTheme.badgeBg, currentTheme.badgeText]">
                <Flame class="size-3.5" />
                <span>方案 1（最推荐 ⭐️ 体验最顺畅）</span>
              </div>
              <h2 class="text-lg font-bold text-foreground mt-1">
                首屏轻量悬浮胶囊 + 文末生成实验室档案 (Minimalist Banner + Footer Archive)
              </h2>
              <p class="text-xs text-muted-foreground">
                首屏仅保留 36px 极薄胶囊，完全不遮挡正文。详细的 Prompt 和对话移至文章末尾（阅读完成后的附录）。
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              class="h-8 gap-1.5 text-xs"
              @click="vote('方案 1：轻量胶囊+文末档案')"
            >
              <Check class="size-3.5" />
              <span>选择此方案</span>
            </Button>
          </div>

          <!-- 模拟详情页首屏 -->
          <div class="space-y-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-5">
            <span class="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              [ 模拟详情页首屏头部效果 ]
            </span>

            <!-- 文章标题与元数据 -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium" :class="[currentTheme.badgeBg, currentTheme.badgeText, currentTheme.badgeBorder]">
                  <Sparkles class="size-3" />
                  <span>AI 原稿</span>
                </span>
                <span class="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <Folder class="size-3" />
                  <span>{{ mockPost.category }}</span>
                </span>
              </div>
              <h3 class="text-2xl font-bold tracking-tight text-foreground">
                {{ mockPost.title }}
              </h3>
            </div>

            <!-- 核心改进点：首屏的极简轻量胶囊条 -->
            <div
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 shadow-xs backdrop-blur-md transition-all"
              :class="[currentTheme.cardBorder, `bg-gradient-to-r ${currentTheme.gradientBg}`]"
            >
              <div class="flex items-center gap-2 text-xs">
                <div class="flex size-6 items-center justify-center rounded-full bg-background/80 shadow-xs">
                  <Sparkles class="size-3.5" :class="currentTheme.accentText" />
                </div>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="font-medium text-foreground">本文系 AI 生成原稿</span>
                  <span class="text-muted-foreground/80 hidden sm:inline">· 由 {{ mockPost.model }} 生成</span>
                  <span class="rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border/50">未经人工润色</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-foreground shadow-2xs hover:bg-background transition"
                  @click="copyPromptText"
                >
                  <Copy class="size-3 opacity-70" />
                  <span>复制 Prompt</span>
                </button>

                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs font-medium transition hover:bg-background"
                  :class="currentTheme.accentText"
                  @click="scrollToSection('scheme1-footer-demo')"
                >
                  <span>查看生成档案</span>
                  <CornerDownRight class="size-3" />
                </button>
              </div>
            </div>

            <!-- 正文模拟 -->
            <div class="rounded-lg bg-card p-4 border border-border/60 text-xs leading-relaxed text-muted-foreground">
              <p class="font-medium text-foreground mb-1">【文章正文立即呈现，读者无需下划即可立即阅读】</p>
              这篇文章本身就是一个 AI 原稿样例，记录一次关于博客内容分区的设计讨论。它没有被人工改写成正式文章，而是保留了提示词、关键对话和设计结论，方便读者理解它是怎么生成出来的...
            </div>

            <!-- 文末生成档案卡片模拟 -->
            <div id="scheme1-footer-demo" class="mt-8 pt-4 border-t border-border/80">
              <div class="flex items-center gap-2 text-xs font-semibold text-foreground mb-3">
                <Sparkles class="size-4" :class="currentTheme.accentText" />
                <span>附录：AI 创作生成档案与原始记录 (AI Generation Dossier)</span>
              </div>

              <div class="rounded-xl border bg-card/80 p-5 shadow-xs space-y-4" :class="currentTheme.cardBorder">
                <!-- 提示词卡片 -->
                <div>
                  <div class="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span class="text-muted-foreground flex items-center gap-1.5">
                      <Code2 class="size-3.5 text-foreground" />
                      初始提示词 (Initial Prompt)
                    </span>
                    <button
                      type="button"
                      class="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                      @click="copyPromptText"
                    >
                      <Copy class="size-3" />
                      <span>复制</span>
                    </button>
                  </div>
                  <div class="rounded-lg bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground border border-border/50 select-all">
                    {{ mockPost.prompt }}
                  </div>
                </div>

                <!-- 生成参数与下载 -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <div class="flex items-center gap-4">
                    <span>模型：<strong class="text-foreground">{{ mockPost.model }}</strong></span>
                    <span>对话轮次：<strong class="text-foreground">{{ mockPost.conversation.length }} 轮</strong></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Button variant="outline" size="sm" class="h-7 text-xs">
                      <Download class="size-3 mr-1" />
                      下载 Markdown 原文
                    </Button>
                    <Button variant="outline" size="sm" class="h-7 text-xs">
                      <FileDown class="size-3 mr-1" />
                      下载生成过程
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 方案 2：现代科技风折叠式检查器（Modern Tech Inspector / Tabs & Bubbles） -->
        <section class="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="[currentTheme.badgeBg, currentTheme.badgeText]">
                <Cpu class="size-3.5" />
                <span>方案 2（保留原位，彻底现代化）</span>
              </div>
              <h2 class="text-lg font-bold text-foreground mt-1">
                科技风折叠式检查器 (Modern Tech Inspector with Tabs & Chat Bubbles)
              </h2>
              <p class="text-xs text-muted-foreground">
                依然放在标题下方，但默认收起为 42px 精致条。展开后包含优雅的 Tab 切换，以及**真实微信/ChatGPT 对话气泡**！
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              class="h-8 gap-1.5 text-xs"
              @click="vote('方案 2：现代科技风折叠卡片')"
            >
              <Check class="size-3.5" />
              <span>选择此方案</span>
            </Button>
          </div>

          <!-- 交互卡片本体 -->
          <div
            class="rounded-xl border overflow-hidden transition-all duration-300 shadow-sm"
            :class="[currentTheme.cardBorder, scheme2Expanded ? 'bg-card' : 'bg-muted/30']"
          >
            <!-- 头部折叠控制条 -->
            <div
              class="flex cursor-pointer items-center justify-between px-4 py-3 select-none transition hover:bg-muted/40"
              @click="scheme2Expanded = !scheme2Expanded"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex size-7 items-center justify-center rounded-lg shadow-xs" :class="[currentTheme.badgeBg, currentTheme.badgeText]">
                  <Sparkles class="size-4" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-foreground">AI 创作档案与生成脉络</span>
                    <span class="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">{{ mockPost.model }}</span>
                    <span class="hidden sm:inline text-[11px] text-muted-foreground">· {{ mockPost.conversation.length }} 轮对话</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="hidden sm:inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition"
                  @click.stop="copyPromptText"
                >
                  <Copy class="size-3" />
                  <span>复制 Prompt</span>
                </button>

                <div class="flex items-center gap-1 text-xs font-medium" :class="currentTheme.accentText">
                  <span>{{ scheme2Expanded ? '收起' : '展开' }}</span>
                  <ChevronDown class="size-4 transition-transform duration-200" :class="{ 'rotate-180': scheme2Expanded }" />
                </div>
              </div>
            </div>

            <!-- 展开后的完整内容（Tab 切换系统） -->
            <div v-if="scheme2Expanded" class="border-t border-border/50">
              <!-- Tab Header -->
              <div class="flex border-b border-border/40 bg-muted/20 px-4">
                <button
                  type="button"
                  class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all"
                  :class="scheme2Tab === 'prompt'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'"
                  @click="scheme2Tab = 'prompt'"
                >
                  <Code2 class="size-3.5" />
                  <span>提示词 (Prompt)</span>
                </button>

                <button
                  type="button"
                  class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all"
                  :class="scheme2Tab === 'chat'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'"
                  @click="scheme2Tab = 'chat'"
                >
                  <MessageSquareText class="size-3.5" />
                  <span>对话气泡回溯</span>
                  <span class="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">{{ mockPost.conversation.length }}</span>
                </button>

                <button
                  type="button"
                  class="flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all"
                  :class="scheme2Tab === 'download'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'"
                  @click="scheme2Tab = 'download'"
                >
                  <Download class="size-3.5" />
                  <span>资产下载</span>
                </button>
              </div>

              <!-- Tab 1: Prompt 提示词展示 -->
              <div v-if="scheme2Tab === 'prompt'" class="p-4 sm:p-5 space-y-3">
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>共 {{ mockPost.prompt.length }} 字 · 包含原始需求设定</span>
                  <Button size="sm" variant="outline" class="h-7 text-xs" @click="copyPromptText">
                    <Copy class="size-3 mr-1" />
                    <span>一键复制提示词</span>
                  </Button>
                </div>

                <div class="rounded-xl border border-border/60 bg-muted/40 p-3.5 font-mono text-xs leading-relaxed text-foreground select-all">
                  {{ mockPost.prompt }}
                </div>
              </div>

              <!-- Tab 2: 真实聊天气泡对话回溯 -->
              <div v-if="scheme2Tab === 'chat'" class="p-4 sm:p-5 space-y-4 max-h-80 overflow-y-auto">
                <div
                  v-for="(turn, idx) in mockPost.conversation"
                  :key="idx"
                  class="flex gap-2.5"
                  :class="turn.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
                >
                  <!-- 头像 -->
                  <div
                    class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs shadow-xs"
                    :class="turn.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground ring-1 ring-border'"
                  >
                    <User v-if="turn.role === 'user'" class="size-3.5" />
                    <Bot v-else class="size-3.5" />
                  </div>

                  <!-- 气泡 -->
                  <div
                    class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs"
                    :class="turn.role === 'user'
                      ? 'rounded-tr-xs bg-primary text-primary-foreground'
                      : 'rounded-tl-xs bg-muted/70 text-foreground border border-border/60'"
                  >
                    <div class="flex items-center justify-between gap-4 mb-1 opacity-70 text-[10px]">
                      <span>{{ turn.role === 'user' ? '我' : mockPost.model }}</span>
                      <span>{{ turn.time }}</span>
                    </div>
                    <p class="whitespace-pre-wrap">{{ turn.content }}</p>
                  </div>
                </div>
              </div>

              <!-- Tab 3: 资产下载 -->
              <div v-if="scheme2Tab === 'download'" class="p-5 flex flex-wrap items-center justify-between gap-4 bg-muted/10">
                <div>
                  <div class="text-xs font-semibold text-foreground">提供完整归档资产便于再利用</div>
                  <div class="text-[11px] text-muted-foreground mt-0.5">支持读者下载 Markdown 原始文件并导入其他大模型继续精修润色。</div>
                </div>
                <div class="flex items-center gap-2">
                  <Button size="sm" variant="outline" class="h-8 text-xs">
                    <Download class="size-3 mr-1.5" />
                    下载 .md 原文
                  </Button>
                  <Button size="sm" variant="outline" class="h-8 text-xs">
                    <FileDown class="size-3 mr-1.5" />
                    下载生成记录 (.md)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 方案 3：抽屉式侧边实验室 (Slide-over Drawer) -->
        <section class="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="[currentTheme.badgeBg, currentTheme.badgeText]">
                <PanelRightOpen class="size-3.5" />
                <span>方案 3（极致极客 / 正文 100% 零侵入）</span>
              </div>
              <h2 class="text-lg font-bold text-foreground mt-1">
                抽屉式侧边实验室 (Slide-over Drawer Inspector)
              </h2>
              <p class="text-xs text-muted-foreground">
                正文区域完全不放置任何大盒子！标题旁只提供一个触发按钮，点击从右侧滑出半透明毛玻璃抽屉。
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              class="h-8 gap-1.5 text-xs"
              @click="vote('方案 3：抽屉式侧边实验室')"
            >
              <Check class="size-3.5" />
              <span>选择此方案</span>
            </Button>
          </div>

          <!-- 抽屉触发按钮演示 -->
          <div class="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 flex flex-col items-center justify-center gap-4 text-center">
            <p class="text-xs text-muted-foreground max-w-md">
              正文读者 0 干扰。需要查看提示词或对话的极客读者，只需点击下方按钮即可展开侧边栏：
            </p>

            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-md transition-all hover:scale-105"
              :class="[currentTheme.cardBorder, currentTheme.badgeBg, currentTheme.badgeText]"
              @click="drawerOpen = true"
            >
              <Sparkles class="size-4" />
              <span>点击唤起右侧【AI 生成过程抽屉】</span>
              <PanelRightOpen class="size-4" />
            </button>
          </div>

          <!-- 抽屉蒙层与主体 -->
          <Transition name="fade">
            <div
              v-if="drawerOpen"
              class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
              @click="drawerOpen = false"
            />
          </Transition>

          <div
            class="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl p-6 overflow-y-auto transition-transform duration-300"
            :class="drawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'"
          >
            <div class="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <div class="flex items-center gap-2">
                <Sparkles class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground">AI 原稿档案检查器</h3>
              </div>
              <button
                type="button"
                class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                @click="drawerOpen = false"
              >
                <X class="size-4" />
              </button>
            </div>

            <div class="space-y-4 text-xs">
              <div class="rounded-lg bg-muted/50 p-3">
                <div class="font-semibold text-foreground">生成元信息</div>
                <div class="mt-1 text-muted-foreground space-y-1">
                  <div>模型：{{ mockPost.model }}</div>
                  <div>状态：未经人工校订 (Raw Draft)</div>
                  <div>提示词字数：{{ mockPost.prompt.length }} 字</div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between font-semibold text-foreground mb-1">
                  <span>Prompt 提示词</span>
                  <button type="button" class="text-primary hover:underline text-[11px]" @click="copyPromptText">
                    复制
                  </button>
                </div>
                <div class="rounded-lg bg-muted/40 p-3 font-mono leading-relaxed border border-border/60 text-muted-foreground">
                  {{ mockPost.prompt }}
                </div>
              </div>

              <div>
                <div class="font-semibold text-foreground mb-2">对话脉络 ({{ mockPost.conversation.length }})</div>
                <div class="space-y-2">
                  <div
                    v-for="(turn, idx) in mockPost.conversation"
                    :key="idx"
                    class="rounded-lg border border-border/50 p-2.5 bg-card/60"
                  >
                    <div class="font-bold text-[10px] text-muted-foreground mb-1">
                      {{ turn.role === 'user' ? '用户需求' : 'AI 回复' }}
                    </div>
                    <div class="text-muted-foreground leading-5">{{ turn.content }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 方案 4：极客终端视窗风格 (Geek Terminal CLI Window) -->
        <section class="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="[currentTheme.badgeBg, currentTheme.badgeText]">
                <Terminal class="size-3.5" />
                <span>方案 4（程序员/极客风格）</span>
              </div>
              <h2 class="text-lg font-bold text-foreground mt-1">
                极客终端视窗风格 (Geek Terminal CLI Window)
              </h2>
              <p class="text-xs text-muted-foreground">
                仿 macOS 终端窗口，黑色半透明质感 + 红黄绿三颗小圆点，把 AI 生成记录做成极具酷炫极客感的终端输出。
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              class="h-8 gap-1.5 text-xs"
              @click="vote('方案 4：极客终端窗口')"
            >
              <Check class="size-3.5" />
              <span>选择此方案</span>
            </Button>
          </div>

          <!-- 仿 Mac 终端卡片 -->
          <div class="rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200 shadow-xl overflow-hidden font-mono text-xs">
            <!-- 终端顶部标题栏 -->
            <div class="flex items-center justify-between bg-neutral-900/90 px-4 py-2.5 border-b border-neutral-800">
              <div class="flex items-center gap-2">
                <span class="size-3 rounded-full bg-red-500/80 inline-block" />
                <span class="size-3 rounded-full bg-yellow-500/80 inline-block" />
                <span class="size-3 rounded-full bg-green-500/80 inline-block" />
                <span class="ml-2 text-[11px] text-neutral-400">ai-generation-inspector --raw</span>
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="text-[11px] text-neutral-400 hover:text-neutral-100 transition flex items-center gap-1"
                  @click="copyPromptText"
                >
                  <Copy class="size-3" />
                  <span>copy prompt</span>
                </button>
                <button
                  type="button"
                  class="text-[11px] text-neutral-400 hover:text-neutral-100 transition"
                  @click="terminalExpanded = !terminalExpanded"
                >
                  {{ terminalExpanded ? '[-] minimize' : '[+] expand' }}
                </button>
              </div>
            </div>

            <!-- 终端正文 -->
            <div v-if="terminalExpanded" class="p-4 space-y-3 leading-relaxed">
              <div class="text-neutral-400">
                <span class="text-emerald-400">$</span> model-info --engine <span class="text-yellow-300">"{{ mockPost.model }}"</span> --mode "unreviewed-draft"
              </div>
              <div class="text-neutral-400">
                <span class="text-emerald-400">$</span> cat prompt.txt
              </div>
              <div class="rounded bg-neutral-900/80 p-3 text-neutral-300 border border-neutral-800/80">
                {{ mockPost.prompt }}
              </div>
              <div class="text-neutral-400 pt-1">
                <span class="text-emerald-400">$</span> export-assets --format markdown
                <span class="text-neutral-500"># ready to download</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ================================================================= -->
      <!-- 板块 2：首页文章卡片（PostCard）角标与排版 4 种改造方案          -->
      <!-- ================================================================= -->
      <div v-show="mainSection === 'card-view'" class="space-y-8">
        <div class="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <div class="flex items-center gap-2 font-semibold text-foreground mb-1">
            <Layers class="size-4 text-primary" />
            <span>卡片改进目标：消除普通文章的空白占位，让 AI 标识与封面分类自然对称</span>
          </div>
          当前卡片因为塞了一个独立行放 AI 标签，导致非 AI 文章上方也空出了一块。以下 4 种方案既能消除多余间距，又能让 AI 标识更加优雅。
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 方案 A：封面右上角玻璃拟态角标（推荐） -->
          <div class="rounded-2xl border bg-card p-5 shadow-xs space-y-4" :class="currentTheme.cardBorder">
            <div class="flex items-center justify-between border-b pb-2.5">
              <div>
                <span class="text-xs font-bold text-foreground">样式 A：封面图右上角对称角标（推荐 ⭐️）</span>
                <p class="text-[11px] text-muted-foreground mt-0.5">左上角分类，右上角 AI 原稿，视觉对称，正文无多余空行</p>
              </div>
              <Button size="sm" variant="ghost" class="h-7 text-xs" @click="vote('卡片样式 A：右上角对称角标')">选择</Button>
            </div>

            <!-- 模拟卡片 -->
            <div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div class="relative h-36 bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center">
                <span class="text-2xl font-bold opacity-30">BLOG COVER</span>

                <!-- 左上角分类 -->
                <div class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
                  <Folder class="size-2.5 opacity-70" />
                  <span>技术方案</span>
                </div>

                <!-- 右上角 AI 角标 -->
                <div
                  class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold backdrop-blur-md shadow-xs"
                  :class="[currentTheme.badgeBg, currentTheme.badgeText, currentTheme.badgeBorder, 'border']"
                >
                  <Sparkles class="size-3" />
                  <span>AI 原稿</span>
                </div>
              </div>

              <div class="p-3.5 space-y-2">
                <h4 class="text-sm font-bold text-foreground line-clamp-1">
                  {{ mockPost.title }}
                </h4>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ mockPost.excerpt }}
                </p>
                <div class="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  <span>{{ mockPost.date }}</span>
                  <span>{{ mockPost.readingTime }} 分钟阅读</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 方案 B：标题行内嵌紧凑微标 (Inline Title Chip) -->
          <div class="rounded-2xl border bg-card p-5 shadow-xs space-y-4" :class="currentTheme.cardBorder">
            <div class="flex items-center justify-between border-b pb-2.5">
              <div>
                <span class="text-xs font-bold text-foreground">样式 B：标题行内嵌入微标 (Inline Title Chip)</span>
                <p class="text-[11px] text-muted-foreground mt-0.5">直接跟随在标题文字前，紧凑省空间</p>
              </div>
              <Button size="sm" variant="ghost" class="h-7 text-xs" @click="vote('卡片样式 B：标题行内微标')">选择</Button>
            </div>

            <!-- 模拟卡片 -->
            <div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div class="relative h-36 bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center">
                <span class="text-2xl font-bold opacity-30">BLOG COVER</span>
                <div class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
                  <Folder class="size-2.5 opacity-70" />
                  <span>技术方案</span>
                </div>
              </div>

              <div class="p-3.5 space-y-2">
                <h4 class="text-sm font-bold text-foreground line-clamp-1 flex items-center gap-1.5">
                  <span
                    class="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold"
                    :class="[currentTheme.badgeBg, currentTheme.badgeText]"
                  >
                    <Sparkles class="size-2.5" />
                    AI
                  </span>
                  <span>{{ mockPost.title }}</span>
                </h4>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ mockPost.excerpt }}
                </p>
                <div class="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  <span>{{ mockPost.date }}</span>
                  <span>{{ mockPost.readingTime }} 分钟阅读</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 方案 C：卡片底栏元信息整合 (Footer Meta Tag) -->
          <div class="rounded-2xl border bg-card p-5 shadow-xs space-y-4" :class="currentTheme.cardBorder">
            <div class="flex items-center justify-between border-b pb-2.5">
              <div>
                <span class="text-xs font-bold text-foreground">样式 C：卡片底栏元信息整合 (Footer Meta Tag)</span>
                <p class="text-[11px] text-muted-foreground mt-0.5">正文最干净，将 AI 属性作为底栏附加信息</p>
              </div>
              <Button size="sm" variant="ghost" class="h-7 text-xs" @click="vote('卡片样式 C：底栏整合')">选择</Button>
            </div>

            <!-- 模拟卡片 -->
            <div class="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
              <div class="relative h-36 bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center">
                <span class="text-2xl font-bold opacity-30">BLOG COVER</span>
                <div class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
                  <Folder class="size-2.5 opacity-70" />
                  <span>技术方案</span>
                </div>
              </div>

              <div class="p-3.5 space-y-2">
                <h4 class="text-sm font-bold text-foreground line-clamp-1">
                  {{ mockPost.title }}
                </h4>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ mockPost.excerpt }}
                </p>
                <div class="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  <div class="flex items-center gap-1.5">
                    <span>{{ mockPost.date }}</span>
                    <span>·</span>
                    <span class="inline-flex items-center gap-0.5 font-medium" :class="currentTheme.accentText">
                      <Sparkles class="size-3" />
                      AI 原稿
                    </span>
                  </div>
                  <span>{{ mockPost.readingTime }} 分钟阅读</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 方案 D：微光流线边框卡片 (Glow Border Card) -->
          <div class="rounded-2xl border bg-card p-5 shadow-xs space-y-4" :class="currentTheme.cardBorder">
            <div class="flex items-center justify-between border-b pb-2.5">
              <div>
                <span class="text-xs font-bold text-foreground">样式 D：微光渐变边框卡片 (Glow Accent Card)</span>
                <p class="text-[11px] text-muted-foreground mt-0.5">边框带有微弱渐变光晕，一眼便知与普通人工文章不同</p>
              </div>
              <Button size="sm" variant="ghost" class="h-7 text-xs" @click="vote('卡片样式 D：微光渐变卡片')">选择</Button>
            </div>

            <!-- 模拟卡片 -->
            <div
              class="rounded-xl border overflow-hidden shadow-sm transition-all hover:shadow-md"
              :class="[currentTheme.cardBorder, `bg-gradient-to-b ${currentTheme.gradientBg}`]"
            >
              <div class="relative h-36 bg-muted/40 flex items-center justify-center">
                <span class="text-2xl font-bold opacity-30">BLOG COVER</span>
                <div class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur-md">
                  <Folder class="size-2.5 opacity-70" />
                  <span>技术方案</span>
                </div>
                <div class="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-xs">
                  <Bot class="size-3" />
                  <span>Codex</span>
                </div>
              </div>

              <div class="p-3.5 space-y-2">
                <h4 class="text-sm font-bold text-foreground line-clamp-1">
                  {{ mockPost.title }}
                </h4>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  {{ mockPost.excerpt }}
                </p>
                <div class="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                  <span>{{ mockPost.date }}</span>
                  <span>{{ mockPost.readingTime }} 分钟阅读</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 板块 3：配色与视觉风格实验室                                      -->
      <!-- ================================================================= -->
      <div v-show="mainSection === 'palette-lab'" class="space-y-8">
        <div class="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <div class="flex items-center gap-2 font-semibold text-foreground mb-1">
            <SlidersHorizontal class="size-4 text-primary" />
            <span>色彩质感调校：当前使用的全站统一色彩是绿色/品牌色，AI 可以赋予专属科技质感</span>
          </div>
          你认为“AI 原稿”应该跟博客其他模块一样使用统一主色调，还是使用 OpenAI / Claude 常见的紫罗兰/青蓝微光？以下可实时体验 4 种质感：
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(th, key) in paletteThemes"
            :key="key"
            class="rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.02]"
            :class="activePalette === key ? 'ring-2 ring-primary border-primary bg-muted/40 shadow-md' : 'bg-card border-border/70'"
            @click="activePalette = key as PaletteKey"
          >
            <div class="flex items-center gap-2 mb-3">
              <span class="size-3.5 rounded-full shadow-xs" :style="{ backgroundColor: th.color }" />
              <span class="text-xs font-bold text-foreground">{{ th.name }}</span>
            </div>

            <!-- 小徽标效果预览 -->
            <div class="space-y-2">
              <div class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold" :class="[th.badgeBg, th.badgeText]">
                <Sparkles class="size-3" />
                <span>AI 原稿徽标</span>
              </div>

              <div class="rounded-lg border p-2 text-[11px] text-muted-foreground" :class="th.cardBorder">
                微光边框与文字渲染
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部决策引导面板 -->
      <div class="mt-16 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles class="size-4 text-primary" />
              <span>你的选择：{{ selectedScheme || '尚未点击选择（可点击上方任意方案的按钮）' }}</span>
            </h3>
            <p class="text-xs text-muted-foreground mt-1">
              如果你看中了某个方案（例如：<strong>方案 1 + 样式 A</strong>），直接在对话中告诉我，我会立即为你执行修改！
            </p>
          </div>

          <RouterLink
            to="/"
            class="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-4 py-2 text-xs font-medium text-foreground shadow-xs hover:bg-muted transition"
          >
            <ArrowLeft class="size-3.5" />
            <span>返回博客正式页面</span>
          </RouterLink>
        </div>
      </div>
    </main>

    <SiteFooter class="mt-16" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
