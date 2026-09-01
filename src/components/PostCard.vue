<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, Folder, Bot, MessageSquareText, BookOpenText } from 'lucide-vue-next'
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
    class="group relative flex w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card/85 text-card-foreground shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
  >
    <!-- 移动端优先：图文并茂的响应式排版 -->
    <div class="flex flex-1 flex-col sm:flex-col">
      <!-- 移动端顶部/右侧缩略图区域 -->
      <div
        class="relative overflow-hidden bg-muted/40 transition-all duration-300"
        :class="compact
          ? 'h-36 w-full shrink-0 sm:h-36'
          : 'h-40 w-full shrink-0 sm:h-44'"
      >
        <img
          v-if="isImageCover(post.cover)"
          :src="post.cover"
          :alt="post.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div
          v-else-if="!post.cover"
          class="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground/60 transition-colors group-hover:text-primary/70"
          aria-hidden="true"
        >
          <BookOpenText class="size-10" />
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
      <div class="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div class="space-y-2">
          <!-- AI 原稿标签 -->
          <div v-if="post.origin === 'ai'" class="flex flex-wrap items-center gap-2 text-[11px] font-medium text-primary">
            <span class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
              <Bot class="size-3" />
              {{ t('post.aiOriginal') }}
            </span>
            <span v-if="post.prompt || post.conversation.length > 0" class="inline-flex items-center gap-1 text-muted-foreground">
              <MessageSquareText class="size-3" />
              {{ t('post.conversation') }}
            </span>
          </div>

          <!-- 标题 -->
          <h2
            class="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg"
          >
            {{ post.title }}
          </h2>

          <!-- 摘要 -->
          <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {{ post.excerpt }}
          </p>

          <!-- 标签 -->
          <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 pt-1">
            <Badge
              v-for="tag in post.tags.slice(0, 3)"
              :key="tag"
              variant="secondary"
              class="px-1.5 py-0 text-[10px] font-normal sm:text-xs"
            >
              # {{ tag }}
            </Badge>
          </div>
        </div>

        <!-- 底部发布信息 -->
        <div class="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground sm:text-xs">
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
