<script setup lang="ts">
import { Calendar, Clock, Folder, Sparkles } from 'lucide-vue-next'
import { formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

export type PostLayoutMode = 'ghost' | 'editorial' | 'index'

interface Props {
  post: Post
  compact?: boolean
  layoutMode?: PostLayoutMode
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  layoutMode: 'ghost',
})

function isImageCover(cover: string): boolean {
  return /^https?:\/\//.test(cover) || cover.startsWith('/') || cover.startsWith('data:')
}

function coverBackground(cover: string): string {
  return cover || 'linear-gradient(135deg, #262626 0%, #525252 100%)'
}
</script>

<template>
  <!-- ============================================================= -->
  <!-- 模式 1：微弱化幽灵卡片 (Ghost / Surface-less Card) -->
  <!-- 特点：保留网格比例，完全剔除硬实体边框与厚重实心底色，留白呼吸感，微光悬停 -->
  <!-- ============================================================= -->
  <article
    v-if="layoutMode === 'ghost'"
    class="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-2 transition-all duration-300 hover:bg-muted/40 dark:hover:bg-white/[0.04]"
  >
    <div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <!-- 封面图：具有微圆角且浮于容器内的纯粹视觉块 -->
      <div
        class="relative overflow-hidden rounded-xl bg-muted/40 transition-all duration-300"
        :class="compact
          ? 'h-28 w-full shrink-0 sm:h-32'
          : 'h-40 w-full shrink-0 sm:h-44'"
      >
        <img
          v-if="isImageCover(post.cover)"
          :src="post.cover"
          :alt="post.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <!-- 杂志水印风格英文占位 -->
        <div
          v-else-if="!post.cover"
          class="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-muted/50 via-muted/30 to-muted/60 select-none"
          aria-hidden="true"
        >
          <span class="absolute font-black tracking-widest uppercase text-foreground/[0.04] dark:text-white/[0.05] pointer-events-none scale-125 select-none text-4xl sm:text-5xl transition-transform duration-500 group-hover:scale-130">
            NO IMAGE
          </span>
        </div>
        <div
          v-else
          class="flex h-full w-full items-center justify-center"
          :style="{ background: coverBackground(post.cover) }"
        >
          <span class="text-3xl font-bold text-white/90 drop-shadow">
            {{ post.title.slice(0, 1) }}
          </span>
        </div>

        <!-- 分类角标（极简半透明微底衬） -->
        <div
          v-if="post.category"
          class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-md shadow-2xs border border-black/5 dark:border-white/10"
        >
          <Folder class="size-2.5 opacity-70" />
          <span>{{ post.category }}</span>
        </div>
      </div>

      <!-- 内容正文区 -->
      <div class="flex min-h-0 flex-1 flex-col justify-between overflow-hidden px-1 pt-3 pb-1">
        <div class="min-h-0 space-y-1.5">
          <!-- 标题 -->
          <div class="flex items-start gap-1.5 min-w-0">
            <span
              v-if="post.origin === 'ai'"
              class="inline-flex shrink-0 items-center gap-0.5 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary mt-0.5 shadow-2xs select-none"
            >
              <Sparkles class="size-2.5" />
              <span>AI</span>
            </span>
            <h2
              class="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base"
              :class="compact ? 'line-clamp-1' : 'line-clamp-2'"
            >
              {{ post.title }}
            </h2>
          </div>

          <!-- 摘要 -->
          <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {{ post.excerpt }}
          </p>

          <!-- 标签 -->
          <div class="flex h-5 items-center gap-1.5 overflow-hidden pt-0.5">
            <template v-if="post.tags && post.tags.length > 0">
              <span
                v-for="tag in post.tags.slice(0, 2)"
                :key="tag"
                class="inline-flex items-center text-[10px] text-muted-foreground/75 hover:text-foreground transition-colors"
              >
                #{{ tag }}
              </span>
            </template>
          </div>
        </div>

        <!-- 底部发布信息：纯净留白，无实线割裂 -->
        <div class="mt-2.5 flex shrink-0 items-center justify-between text-[11px] text-muted-foreground/80">
          <div class="inline-flex items-center gap-1.5">
            <Calendar class="size-3.5 opacity-70" />
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          </div>
          <div class="inline-flex items-center gap-1.5">
            <Clock class="size-3.5 opacity-70" />
            <span>{{ t('post.readingTime', { n: post.readingTime }) }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- ============================================================= -->
  <!-- 模式 2：杂志式无框图文流 (Borderless Editorial Stream) -->
  <!-- 特点：彻底打破方盒束缚，左文右图（无图则自适应全宽），发丝细线分隔，高阅读沉浸感 -->
  <!-- ============================================================= -->
  <article
    v-else-if="layoutMode === 'editorial'"
    class="group relative flex w-full flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 py-5 border-b border-border/35 transition-colors"
  >
    <!-- 左侧排版文本区 -->
    <div class="flex flex-1 flex-col min-w-0 space-y-2">
      <!-- 顶部元数据：分类 · 日期 · 时长 -->
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span v-if="post.category" class="font-medium text-foreground/85">
          {{ post.category }}
        </span>
        <span v-if="post.category" class="text-border/80">·</span>
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span class="text-border/80">·</span>
        <span>{{ t('post.readingTime', { n: post.readingTime }) }}</span>
      </div>

      <!-- 标题 -->
      <div class="flex items-start gap-1.5 min-w-0">
        <span
          v-if="post.origin === 'ai'"
          class="inline-flex shrink-0 items-center gap-0.5 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary mt-0.5 shadow-2xs select-none"
        >
          <Sparkles class="size-2.5" />
          <span>AI</span>
        </span>
        <h2 class="text-base sm:text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary leading-snug">
          {{ post.title }}
        </h2>
      </div>

      <!-- 摘要 -->
      <p class="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {{ post.excerpt }}
      </p>

      <!-- 底部微标签 -->
      <div v-if="post.tags && post.tags.length > 0" class="flex items-center gap-2 pt-0.5">
        <span
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag"
          class="text-[11px] text-muted-foreground/70"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- 右侧缩略图（有封面才渲染，无封面则文本自适应全宽） -->
    <div
      v-if="post.cover"
      class="relative h-28 w-full sm:h-28 sm:w-44 shrink-0 overflow-hidden rounded-xl bg-muted/40 transition-transform duration-500 group-hover:scale-[1.02]"
    >
      <img
        v-if="isImageCover(post.cover)"
        :src="post.cover"
        :alt="post.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-xl font-bold text-white/90"
        :style="{ background: coverBackground(post.cover) }"
      >
        {{ post.title.slice(0, 1) }}
      </div>
    </div>
  </article>

  <!-- ============================================================= -->
  <!-- 模式 3：极简高密度字符索引 (Minimalist Typographic Index) -->
  <!-- 特点：极致精简，单行等宽时间对齐，最高信噪比与扫描效率 -->
  <!-- ============================================================= -->
  <article
    v-else-if="layoutMode === 'index'"
    class="group relative flex w-full items-center justify-between gap-3 py-2.5 px-3 rounded-lg border-b border-border/20 transition-all hover:bg-muted/40 select-none"
  >
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <time
        :datetime="post.date"
        class="font-mono text-xs text-muted-foreground/75 shrink-0 w-20 sm:w-24"
      >
        {{ post.date }}
      </time>

      <span
        v-if="post.origin === 'ai'"
        class="inline-flex shrink-0 items-center gap-0.5 rounded border border-primary/25 bg-primary/10 px-1 py-0.2 text-[9px] font-semibold text-primary select-none"
      >
        AI
      </span>

      <h2 class="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
        {{ post.title }}
      </h2>
    </div>

    <div class="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
      <span v-if="post.category" class="hidden sm:inline-block px-1.5 py-0.5 rounded bg-muted/60 text-[11px]">
        {{ post.category }}
      </span>
      <span class="font-mono text-[11px] opacity-70">
        {{ post.readingTime }}m
      </span>
    </div>
  </article>
</template>
