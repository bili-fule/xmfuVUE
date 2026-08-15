<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Calendar, Clock, Folder } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import GiscusComment from '@/components/GiscusComment.vue'
import { getPostBySlug, formatDate } from '@/data/posts'

interface Props {
  slug: string
}

const props = defineProps<Props>()
const post = computed(() => getPostBySlug(props.slug))

function isImageCover(cover: string): boolean {
  return /^https?:\/\//.test(cover) || cover.startsWith('/') || cover.startsWith('data:')
}

function coverBackground(cover: string): string {
  return cover || 'linear-gradient(135deg, #262626 0%, #525252 100%)'
}
</script>

<template>
  <div v-if="post" class="h-full overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-6 md:py-10 space-y-8">
      <Button variant="ghost" size="sm" as-child>
        <RouterLink to="/" class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft class="size-4" />
          返回首页
        </RouterLink>
      </Button>

      <article class="space-y-8">
        <header class="space-y-4">
          <div v-if="post.category" class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 text-xs font-medium text-primary px-2.5 py-1 rounded-full bg-primary/10">
              <Folder class="size-3" />
              {{ post.category }}
            </span>
          </div>

          <h1 class="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl text-foreground">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div class="inline-flex items-center gap-1.5">
              <Calendar class="size-4 opacity-70" />
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            </div>
            <div class="inline-flex items-center gap-1.5">
              <Clock class="size-4 opacity-70" />
              <span>{{ post.readingTime }} 分钟阅读</span>
            </div>
          </div>

          <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 pt-1">
            <Badge v-for="tag in post.tags" :key="tag" variant="secondary" class="font-normal">
              # {{ tag }}
            </Badge>
          </div>
        </header>

        <!-- 文章封面：有图显图，渐变作背景，空则省略 -->
        <div
          v-if="post.cover"
          class="h-[32vh] max-h-[420px] min-h-[200px] w-full overflow-hidden rounded-xl md:min-h-[280px] border border-border/50 shadow-sm"
        >
          <img
            v-if="isImageCover(post.cover)"
            :src="post.cover"
            :alt="post.title"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center"
            :style="{ background: coverBackground(post.cover) }"
          >
            <span class="text-5xl font-bold text-white/90 drop-shadow md:text-6xl">
              {{ post.title.slice(0, 1) }}
            </span>
          </div>
        </div>

        <Separator />

        <!-- Markdown 编译后内容 -->
        <div
          class="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-muted/80 prose-pre:text-foreground leading-relaxed"
          v-html="post.contentHtml"
        />
      </article>

      <Separator />

      <!-- 底部评论区 -->
      <section class="space-y-4 pt-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">评论交流</h2>
        <GiscusComment />
      </section>

      <div class="pt-2">
        <Button variant="ghost" size="sm" as-child>
          <RouterLink to="/" class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft class="size-4" />
            返回首页
          </RouterLink>
        </Button>
      </div>
    </div>
  </div>

  <div v-else class="h-full overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-16 md:py-24 space-y-6 text-center">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold">文章不存在</h1>
        <p class="text-muted-foreground">你访问的链接可能已经失效，或者文章已被移除。</p>
      </div>
      <Button as-child>
        <RouterLink to="/">回到首页</RouterLink>
      </Button>
    </div>
  </div>
</template>
