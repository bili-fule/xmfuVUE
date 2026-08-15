<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, type Post } from '@/data/posts'

interface Props {
  post: Post
  compact?: boolean
}

const props = defineProps<Props>()

const maxHeightClass = computed(() =>
  props.compact ? 'max-h-[300px]' : 'max-h-[420px]',
)

const coverHeightClass = computed(() =>
  props.compact ? 'h-20 md:h-24 lg:h-24' : 'h-28 md:h-32 lg:h-36',
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
      'flex h-full w-full flex-col overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md',
      maxHeightClass,
    ]"
  >
    <!-- 统一高度的封面区：有图显图，无图用渐变/主题色占位 -->
    <div
      class="relative shrink-0 overflow-hidden"
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
        <span class="text-2xl font-bold text-white/90 drop-shadow">
          {{ post.title.slice(0, 1) }}
        </span>
      </div>
    </div>

    <CardHeader class="min-h-0 flex-1 overflow-hidden">
      <div class="space-y-1.5">
        <CardTitle class="line-clamp-2 text-base leading-snug transition-colors group-hover:text-primary md:text-lg">
          {{ post.title }}
        </CardTitle>
        <CardDescription :class="compact ? 'line-clamp-1' : 'line-clamp-2'">
          {{ post.excerpt }}
        </CardDescription>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <Badge v-for="tag in post.tags.slice(0, compact ? 2 : 3)" :key="tag" variant="secondary" class="text-xs">
          {{ tag }}
        </Badge>
      </div>
    </CardHeader>

    <CardFooter class="mt-auto gap-2 text-xs text-muted-foreground">
      <Avatar class="size-5">
        <AvatarImage :src="post.author.avatar" :alt="post.author.name" />
        <AvatarFallback>{{ post.author.name.slice(0, 1) }}</AvatarFallback>
      </Avatar>
      <span class="truncate font-medium text-foreground">{{ post.author.name }}</span>
      <span class="ml-auto flex shrink-0 items-center gap-1.5">
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
      </span>
    </CardFooter>
  </Card>
</template>
