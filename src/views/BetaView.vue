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
  Terminal,
  Coffee,
  Rocket,
  Cat,
  MessageCircle,
  Calendar,
  Clock,
  Heart,
  Zap,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SiteFooter from '@/components/SiteFooter.vue'
import { getHomePosts } from '@/data/posts'

const posts = getHomePosts()

// ==========================================
// 动漫 OC 风格化方案数据 (OC Stylization Schemes)
// ==========================================
export interface OcScheme {
  id: 'cyber' | 'warm' | 'aurora' | 'minimal'
  name: string
  subtitle: string
  themeBadge: string
  accentName: string
  primaryHex: string
  bgPreview: string
  cardBg: string
  borderClass: string
  icon: any
  ocName: string
  ocRole: string
  ocAvatarEmoji: string
  ocStatus: string
  quote: string
  dialoguePool: string[]
  sampleCardTitle: string
  sampleCardExcerpt: string
  features: string[]
  recommendedFor: string
  assetRequirements: string
}

const ocSchemes: OcScheme[] = [
  {
    id: 'cyber',
    name: '赛博极客终端',
    subtitle: 'Cyber-Terminal // 霓虹冰蓝 · HUD 线框 · AI 虚拟助手',
    themeBadge: '极客科幻感',
    accentName: '霓虹冰蓝 (#00f0ff) & 赛博暗晶',
    primaryHex: '#00f0ff',
    bgPreview: 'bg-[#080d16] text-[#e2f3ff]',
    cardBg: 'bg-[#0e1626]/90',
    borderClass: 'border-[#00f0ff]/40 shadow-[0_0_20px_rgba(0,240,255,0.15)]',
    icon: Terminal,
    ocName: 'Zero-Core (零号核心)',
    ocRole: 'AI 虚拟协作者 / 终端守护者',
    ocAvatarEmoji: '🤖',
    ocStatus: 'ONLINE // 神经元网络握手中 (Ping: 12ms)',
    quote: '[OC CORE 协同校验]：代码 AST 语法树检测完毕，暂未发现内存泄漏风险。',
    dialoguePool: [
      '“终端链路心跳正常！主人今天也在努力攻克新架构呢 (´▽`ʃ♡ƪ)”',
      '“检测到新的访客会话，已为您加载边缘节点缓存数据包。”',
      '“主人写代码太专注啦，零号核心已自动为您调暗屏幕蓝光保护视力！”',
      '“警告：检测到咖啡因摄入不足，建议立即执行补充拿铁协议 ☕”',
    ],
    sampleCardTitle: '基于 Vite-SSG 的客户端增量预渲染与自动化管线实践',
    sampleCardExcerpt: '解析现代静态站点生成器在极客架构下的执行机理，结合 Service Worker 实现零等待离线化体验...',
    features: [
      '背景融入 24px 精细科技网格与微点阵（Cyber Grid）',
      '卡片四角带有科技倒角符号 [+] 与状态码标识',
      'AI 原稿模块与 OC 人设深度绑定，由 OC 署名实验分析日志',
      '日夜模式：白天为浅冷灰 HUD，暗黑模式化身霓虹流光暗晶',
    ],
    recommendedFor: '黑客、科幻、机巧科技、赛博猫耳少女/少年人设',
    assetRequirements: '建议准备：半身发光透明底立绘、科技感方形头像、Q版报错表情包',
  },
  {
    id: 'warm',
    name: '日系温润书社',
    subtitle: 'Warm Anime Sanctuary // 暖木米白 · 柔和圆角 · 伴读看板娘',
    themeBadge: '温柔治愈系',
    accentName: '浅抹茶绿 (#10b981) & 暖木奶茶棕 (#f59e0b)',
    primaryHex: '#10b981',
    bgPreview: 'bg-[#faf8f5] dark:bg-[#1a1816] text-[#2c2621] dark:text-[#ede4db]',
    cardBg: 'bg-white/90 dark:bg-[#24201c]/90',
    borderClass: 'border-[#10b981]/30 shadow-[0_8px_30px_rgba(16,185,129,0.08)]',
    icon: Coffee,
    ocName: '小禾 (Chiyo)',
    ocRole: '伴读看板娘 / 治愈系图书管理员',
    ocAvatarEmoji: '🌸',
    ocStatus: '☕ 冲泡拿铁摸鱼中... 闻到了咖啡与书页的香气',
    quote: '🌸 「今天写代码辛苦啦！读完了就好好伸个懒腰休息一下吧~」',
    dialoguePool: [
      '“咕嘟咕嘟... 累了吗？先喝杯温热的玄米茶吧 (｡♥‿♥｡)”',
      '“今天窗外的阳光真好呢，要不要读完这篇去阳台走走？”',
      '“悄悄往你的代码仓库里塞了一颗甜甜的水果糖 🍬”',
      '“写不出思路的时候不要急，小禾会一直陪在你身边的哦 ฅ^•ﻌ•^ฅ”',
    ],
    sampleCardTitle: '午后随笔：在 Vue 3 的响应式世界里写一封情书',
    sampleCardExcerpt: '从单向数据流到组件生命周期，技术有时候也像生活一样，需要细细梳理每一个细微的状态改变...',
    features: [
      '全站圆润大弧度（rounded-2xl）与漫反射轻柔阴影，温润耐看',
      '文末配有手绘风专属签名印章与治愈小台词',
      '右下角看板娘微挂件，随时可点击吐出暖心互动气泡',
      '日夜模式联动：白天是阳光咖啡馆常态，夜晚切换为戴睡帽抱枕睡眠态',
    ],
    recommendedFor: '日常系软萌妹、图书管理员、咖啡师、魔女学徒等温柔治愈 OC',
    assetRequirements: '建议准备：暖色透明底立绘、Q版喝茶/睡觉表情、手写风格签名字迹',
  },
  {
    id: 'aurora',
    name: '幻彩极光机能',
    subtitle: 'Aero Aurora // 太空银灰 · 极光流光 · 2.5D 破框立绘',
    themeBadge: '未来星芒感',
    accentName: '极光幻彩紫青 (linear-gradient) & 纯净太空银',
    primaryHex: '#8b5cf6',
    bgPreview: 'bg-[#0f172a] text-[#f8fafc]',
    cardBg: 'bg-[#1e293b]/80 backdrop-blur-xl',
    borderClass: 'border-violet-500/40 shadow-[0_0_25px_rgba(139,92,246,0.18)]',
    icon: Rocket,
    ocName: '星穹 (Astraea)',
    ocRole: '空间站领航员 / 星际观测者',
    ocAvatarEmoji: '✨',
    ocStatus: '🛸 空间曲率正常 // 航向标：银河外旋臂 #082',
    quote: '✨ 「航向标已锁定下一个架构跃迁点，保持全速推进。」',
    dialoguePool: [
      '“星图坐标已校准！舰长，接下来要去哪个星系写代码？”',
      '“能量矩阵充能完毕，随时可以执行下一个生产版本发布指令！”',
      '“在刚刚的光年旅途中，捕捉到了一颗为你许愿的流星数据包 🌠”',
      '“星际长途漫漫，但有你的代码作为指引，航向永远不会迷失。”',
    ],
    sampleCardTitle: '星际跃迁：从传统单体架构迈向现代化云原生微前端',
    sampleCardExcerpt: '探索在复杂分布式网络拓扑中，如何构建具备高韧性、低时延的跨行星级前端服务治理体系...',
    features: [
      '高辨识度 2.5D 破框立绘（角色头部探出卡片上边界，立体层次极强）',
      '微光流光边框动画（Shimmer Border），随视线流动',
      '关于页搭载 OC 专属星图能力雷达面板与星际探索日志',
      '适合：高冷神秘、银发白毛、机甲少女/少年、星空神性人设',
    ],
    recommendedFor: '机甲驾驶员、银白发色、星空探索者、高阶宇宙神官型 OC',
    assetRequirements: '建议准备：全身/半身高清立绘（支持破框裁切）、星际徽章 Logo',
  },
  {
    id: 'minimal',
    name: '极简探头微吉祥物',
    subtitle: 'Peeking Mascot // 极致克制 · 现代 Notion · 卡片边缘探头',
    themeBadge: '极客轻量级',
    accentName: '纯净黑白质感 + 单点电光灵动橙 (#f97316)',
    primaryHex: '#f97316',
    bgPreview: 'bg-background text-foreground',
    cardBg: 'bg-card/90',
    borderClass: 'border-border/80 hover:border-orange-500/50 shadow-sm',
    icon: Cat,
    ocName: '小豆 (Bean)',
    ocRole: '代码调试小精灵 / 桌面陪伴吉祥物',
    ocAvatarEmoji: '🐾',
    ocStatus: '🐾 趴在卡片边缘静静看你 Coding (眨了眨眼)',
    quote: '🐾 「没有 Bug 的一天，心情好极了！」',
    dialoguePool: [
      '“( •̀ ω •́ )y 探头探脑，发现了一行优美而高效的代码！”',
      '“瞄——！你正在看这一节吗？小豆也来一起看！”',
      '“（伸出小肉垫蹭了蹭你的光标）继续加油哇，你是最棒的！”',
      '“咕噜咕噜... 趴在屏幕角落睡着了 zzz”',
    ],
    sampleCardTitle: '深入浅出：Vue 3 响应式系统实现原理解析与手写实践',
    sampleCardExcerpt: '从 Proxy 拦截到 WeakMap 依赖收集，彻底搞懂 effect 与 track 的底层设计哲学...',
    features: [
      '100% 保持当前博客严肃、工整、清爽的高水准技术质感',
      '仅在卡片右上角、搜索框或回到顶部按钮边缘灵动探头（Peeking）',
      '零多余花哨干扰，但访客互动时会被瞬间萌到',
      '实施成本极低，只需要一张透明底 Q 版萌系头像即可快速落地',
    ],
    recommendedFor: '注重严肃技术表达、希望低调克制但充满巧思的开发者',
    assetRequirements: '建议准备：Q版探头小头像（透明底 PNG）、一两张眨眼/动耳朵表情',
  },
]

const activeSchemeIndex = ref(0)
const currentDialogueIndex = ref(0)
const isDialoguePopping = ref(false)

const currentScheme = computed(() => ocSchemes[activeSchemeIndex.value])

function triggerOcDialogue() {
  isDialoguePopping.value = true
  const pool = currentScheme.value.dialoguePool
  currentDialogueIndex.value = (currentDialogueIndex.value + 1) % pool.length
  setTimeout(() => {
    isDialoguePopping.value = false
  }, 250)
}

function selectScheme(index: number) {
  activeSchemeIndex.value = index
  currentDialogueIndex.value = 0
}

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
      <!-- 重点板块：动漫 OC 风格化方案探索实验室 (OC Theme Studio) -->
      <!-- ============================================================ -->
      <section class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 rounded-full bg-pink-500/10 text-pink-500 font-semibold px-2.5 py-0.5 text-xs">
                <Heart class="size-3 fill-current" />
                OC 风格化灵感工坊
              </span>
              <span class="text-xs text-muted-foreground">专属角色世界观塑造</span>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Sparkles class="size-6 text-primary" />
              动漫 OC 风格化方案探索实验室
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              为您的动漫原创角色（OC）量身定制了 4 套截然不同的视觉与交互风格。点击下方方案卡片，即可在<strong>全景沙盒中实时体验色彩、立绘名片、状态栏、气泡对话互动与文章卡片质感</strong>！
            </p>
          </div>
          <span class="shrink-0 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium">
            4 种设计范式一键切换
          </span>
        </div>

        <!-- 方案切换 Tab 卡片网格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            v-for="(scheme, index) in ocSchemes"
            :key="scheme.id"
            type="button"
            class="group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer"
            :class="[
              activeSchemeIndex === index
                ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.04] shadow-md scale-[1.01]'
                : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30'
            ]"
            @click="selectScheme(index)"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="activeSchemeIndex === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
                >
                  方案 0{{ index + 1 }}
                </span>
                <span class="text-xs font-semibold text-primary flex items-center gap-1">
                  <component :is="scheme.icon" class="size-4" />
                </span>
              </div>
              <h3 class="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {{ scheme.name }}
              </h3>
              <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {{ scheme.subtitle }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span class="text-muted-foreground font-medium">{{ scheme.themeBadge }}</span>
              <span
                class="font-semibold transition-colors"
                :class="activeSchemeIndex === index ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground'"
              >
                {{ activeSchemeIndex === index ? '正在沙盒预览' : '点击切换预览 →' }}
              </span>
            </div>
          </button>
        </div>

        <!-- 拟真实景沙盒（Themed Sandbox Live Preview） -->
        <div
          class="rounded-3xl border overflow-hidden transition-all duration-500 shadow-xl"
          :class="currentScheme.borderClass"
        >
          <!-- 沙盒顶栏控制条 -->
          <div class="border-b bg-muted/80 backdrop-blur-md px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="size-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span class="font-bold text-foreground">实时拟真沙盒：{{ currentScheme.name }}</span>
              <span class="hidden sm:inline text-muted-foreground">|</span>
              <span class="text-muted-foreground text-[11px] hidden sm:inline">基调色彩：{{ currentScheme.accentName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-muted-foreground">角色：</span>
              <span class="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[11px]">
                {{ currentScheme.ocName }}
              </span>
            </div>
          </div>

          <!-- 沙盒内容主体 -->
          <div class="p-6 sm:p-8 space-y-8" :class="currentScheme.cardBg">
            <!-- 模块 A：OC 角色名片与动态状态栏 -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <!-- 左侧：立绘/头像与状态气泡 -->
              <div class="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <!-- 头像外圈 -->
                <div class="relative shrink-0">
                  <div class="size-20 sm:size-24 rounded-2xl flex items-center justify-center text-4xl shadow-lg border-2 border-primary/50 bg-background/90 transition-transform duration-300 hover:scale-105">
                    {{ currentScheme.ocAvatarEmoji }}
                  </div>
                  <!-- 右下角在线角标 -->
                  <span class="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 ring-2 ring-background flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>

                <!-- 角色说明与可交互气泡 -->
                <div class="space-y-2 flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="text-lg font-extrabold tracking-tight text-foreground">
                      {{ currentScheme.ocName }}
                    </h4>
                    <span class="rounded-md bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-semibold">
                      {{ currentScheme.ocRole }}
                    </span>
                  </div>

                  <!-- 实时状态 -->
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Zap class="size-3.5 text-amber-500 shrink-0" />
                    <span class="truncate">{{ currentScheme.ocStatus }}</span>
                  </div>

                  <!-- 可点击互动气泡 (Clickable Interactive Dialogue) -->
                  <div
                    class="relative mt-2 p-3 rounded-xl border border-primary/30 bg-primary/[0.06] text-xs text-foreground cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md"
                    :class="isDialoguePopping ? 'scale-95' : 'scale-100'"
                    @click="triggerOcDialogue"
                    title="点击切换台词"
                  >
                    <div class="flex items-center justify-between text-[10px] text-muted-foreground/80 pb-1">
                      <span class="flex items-center gap-1 text-primary font-semibold">
                        <MessageCircle class="size-3" />
                        互动台词（点击气泡切换）
                      </span>
                      <span>{{ currentDialogueIndex + 1 }} / {{ currentScheme.dialoguePool.length }}</span>
                    </div>
                    <p class="font-medium leading-relaxed italic">
                      {{ currentScheme.dialoguePool[currentDialogueIndex] }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 右侧：AI 原稿协同 / 文末专属落款印章预览 -->
              <div class="lg:col-span-5 rounded-2xl border border-border/70 bg-muted/40 p-4 space-y-2.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-foreground flex items-center gap-1.5">
                    <Bookmark class="size-3.5 text-primary" />
                    文末专属落款印章预览
                  </span>
                  <span class="text-[10px] text-muted-foreground">沉浸陪伴感</span>
                </div>
                <div class="p-3 rounded-xl border border-dashed border-primary/40 bg-background/80 text-xs text-muted-foreground leading-relaxed">
                  {{ currentScheme.quote }}
                </div>
                <p class="text-[11px] text-muted-foreground/80 text-right">
                  —— 放置在每篇文章文末或 AI 原稿上方
                </p>
              </div>
            </div>

            <!-- 模块 B：该风格下的文章卡片渲染实景 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs border-t pt-5">
                <span class="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles class="size-3.5 text-primary" />
                  当前风格下的文章卡片实景效果
                </span>
                <span class="text-muted-foreground">观察卡片边框质感与角色呼应</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 模拟文章卡片 1 -->
                <div class="group relative rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-sm hover:border-primary/60 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center justify-between text-xs text-muted-foreground">
                    <span class="inline-flex items-center gap-1 text-primary font-medium">
                      <component :is="currentScheme.icon" class="size-3.5" />
                      {{ currentScheme.themeBadge }}
                    </span>
                    <span class="text-[11px]">2026-09-02</span>
                  </div>
                  <h4 class="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {{ currentScheme.sampleCardTitle }}
                  </h4>
                  <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {{ currentScheme.sampleCardExcerpt }}
                  </p>
                  <div class="flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Clock class="size-3 text-primary/70" />
                      6 分钟阅读 · 1.8k 字
                    </span>
                    <span class="font-medium text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      阅读全文 →
                    </span>
                  </div>
                </div>

                <!-- 方案核心设计要点分析 -->
                <div class="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-3 flex flex-col justify-between text-xs">
                  <div class="space-y-2">
                    <span class="font-bold text-foreground">💡 方案设计亮点与视觉特征：</span>
                    <ul class="space-y-1.5 text-muted-foreground leading-relaxed">
                      <li v-for="feat in currentScheme.features" :key="feat" class="flex items-start gap-1.5">
                        <span class="text-primary font-bold">·</span>
                        <span>{{ feat }}</span>
                      </li>
                    </ul>
                  </div>

                  <div class="border-t border-border/40 pt-3 space-y-1 text-[11px]">
                    <p class="text-foreground font-semibold">
                      🎨 美术素材建议：
                      <span class="font-normal text-muted-foreground">{{ currentScheme.assetRequirements }}</span>
                    </p>
                    <p class="text-foreground font-semibold">
                      🎯 契合人设类型：
                      <span class="font-normal text-muted-foreground">{{ currentScheme.recommendedFor }}</span>
                    </p>
                  </div>
                </div>
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
