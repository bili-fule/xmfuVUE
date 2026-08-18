<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, Folder } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

interface Props {
  post: Post
  compact?: boolean
}

const props = defineProps<Props>()

const coverHeightClass = computed(() =>
  props.compact ? 'h-16 shrink-0' : 'min-h-32 shrink-0',
)

function isImageCover(cover: string): boolean {
  return /^https?:\/\//.test(cover) || cover.startsWith('/') || cover.startsWith('data:')
}

function coverBackground(cover: string): string {
  return cover || 'linear-gradient(135deg, #262626 0%, #525252 100%)'
}
</script>

<template>
  <Card
    :class="[
      'flex h-full w-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg bg-card/90 backdrop-blur-sm',
      compact ? 'min-h-[15.5rem] gap-3 py-4' : '',
    ]"
  >
    <!-- 封面区：compact 时 flex-1 弹性吸收剩余高度（min/max 约束），避免挤压文本区 -->
    <div
      class="relative overflow-hidden bg-muted/50"
      :class="coverHeightClass"
    >
      <img
        v-if="isImageCover(post.cover)"
        :src="post.cover"
        :alt="post.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center"
        :style="{ background: coverBackground(post.cover) }"
      >
        <span class="text-3xl font-bold text-white/90 drop-shadow">
          {{ post.title.slice(0, 1) }}
        </span>
      </div>

      <!-- 分类角标 -->
      <div
        v-if="post.category"
        class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-md shadow-sm"
      >
        <Folder class="size-2.5 opacity-70" />
        <span>{{ post.category }}</span>
      </div>
    </div>

    <CardHeader :class="compact ? 'shrink-0 p-3' : 'shrink-0 p-4 sm:p-5'">
      <div class="space-y-1.5">
        <CardTitle
          :class="compact
            ? 'line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-base'
            : 'line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary md:text-lg'"
        >
          {{ post.title }}
        </CardTitle>
        <CardDescription :class="compact ? 'line-clamp-1 text-xs' : 'line-clamp-2 text-sm'">
          {{ post.excerpt }}
        </CardDescription>
      </div>
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 pt-2">
        <Badge
          v-for="tag in post.tags.slice(0, compact ? 2 : 3)"
          :key="tag"
          variant="secondary"
          class="text-xs font-normal"
        >
          # {{ tag }}
        </Badge>
      </div>
    </CardHeader>

    <CardFooter
      :class="compact
        ? 'mt-auto flex items-center justify-between p-3 pt-0 text-[11px] text-muted-foreground'
        : 'mt-auto flex items-center justify-between p-4 pt-0 text-xs text-muted-foreground sm:p-5 sm:pt-0'"
    >
      <div class="flex items-center gap-1.5">
        <Calendar class="size-3.5 opacity-70" />
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
      </div>
      <div class="flex items-center gap-1.5">
        <Clock class="size-3.5 opacity-70" />
        <span>{{ t('post.readingTime', { n: post.readingTime }) }}</span>
      </div>
    </CardFooter>
  </Card>
</template>
