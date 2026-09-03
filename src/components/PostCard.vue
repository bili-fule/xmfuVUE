<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, Folder, Bot, MessageSquareText, Image as ImageIcon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

interface Props {
  post: Post
  compact?: boolean
}

const props = defineProps<Props>()

function isImageCover(cover: string): boolean {
  return /^https?:\/\//.test(cover) || cover.startsWith('/') || cover.startsWith('data:')
}

function coverBackground(cover: string): string {
  return cover || 'linear-gradient(135deg, #262626 0%, #525252 100%)'
}
</script>

<template>
  <article
    class="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card/90 text-card-foreground shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
  >
    <!-- 移动端优先：图文并茂的响应式排版 -->
    <div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <!-- 移动端顶部/右侧缩略图区域 -->
      <div
        class="relative overflow-hidden bg-muted/40 transition-all duration-300"
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
        <!-- 杂志艺术水印风格英文 NO IMAGE 占位 -->
        <div
          v-else-if="!post.cover"
          class="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-muted/50 via-muted/30 to-muted/60 select-none"
          aria-hidden="true"
        >
          <span class="absolute font-black tracking-widest uppercase text-foreground/[0.04] dark:text-white/[0.05] pointer-events-none scale-125 select-none text-4xl sm:text-5xl">
            NO IMAGE
          </span>
          <div class="z-10 flex flex-col items-center gap-1 text-muted-foreground/75 transition-transform duration-300 group-hover:scale-105">
            <ImageIcon class="size-6 stroke-[1.5] text-primary/70 transition-colors group-hover:text-primary" />
            <span class="text-[11px] font-semibold tracking-widest uppercase text-foreground/70">NO IMAGE</span>
          </div>
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

        <!-- 分类角标（吸附在图片左上角） -->
        <div
          v-if="post.category"
          class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-md shadow-xs"
        >
          <Folder class="size-2.5 opacity-70" />
          <span>{{ post.category }}</span>
        </div>
      </div>

      <!-- 内容正文区 -->
      <div class="flex min-h-0 flex-1 flex-col justify-between overflow-hidden p-3.5 sm:p-4">
        <div class="min-h-0 space-y-1.5 overflow-hidden">
          <!-- AI 原稿标签（固定高度占位，确保有无 AI 原稿卡片高度完全一致） -->
          <div class="flex h-5 items-center gap-2 text-[11px] font-medium">
            <template v-if="post.origin === 'ai'">
              <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                <Bot class="size-3" />
                {{ t('post.aiOriginal') }}
              </span>
              <span v-if="post.prompt || post.conversation.length > 0" class="inline-flex items-center gap-1 text-muted-foreground">
                <MessageSquareText class="size-3" />
                {{ t('post.conversation') }}
              </span>
            </template>
          </div>

          <!-- 标题 -->
          <h2
            class="text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg"
            :class="compact ? 'line-clamp-1' : 'line-clamp-2'"
          >
            {{ post.title }}
          </h2>

          <!-- 摘要 -->
          <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {{ post.excerpt }}
          </p>

          <!-- 标签（固定高度占位，防止换行或有无标签导致高度不一致） -->
          <div class="flex h-5 items-center gap-1.5 overflow-hidden pt-0.5">
            <template v-if="post.tags && post.tags.length > 0">
              <Badge
                v-for="tag in post.tags.slice(0, 2)"
                :key="tag"
                variant="secondary"
                class="shrink-0 px-1.5 py-0 text-[10px] font-normal sm:text-xs"
              >
                # {{ tag }}
              </Badge>
            </template>
          </div>
        </div>

        <!-- 底部发布信息 -->
        <div class="mt-2 flex shrink-0 items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground sm:text-xs">
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
</template>
