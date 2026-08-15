<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getPostBySlug, formatDate } from '@/data/posts'

interface Props {
  slug: string
}

const props = defineProps<Props>()
const post = computed(() => getPostBySlug(props.slug))
const paragraphs = computed(() => post.value?.content.split('\n\n') ?? [])
</script>

<template>
  <div v-if="post" class="space-y-8">
    <Button variant="ghost" size="sm" as-child>
      <RouterLink to="/" class="inline-flex items-center gap-1.5 text-muted-foreground">
        <ArrowLeft class="size-4" />
        返回首页
      </RouterLink>
    </Button>

    <article class="space-y-8">
      <header class="space-y-6">
        <h1 class="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          {{ post.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Avatar class="size-7">
              <AvatarImage :src="post.author.avatar" :alt="post.author.name" />
              <AvatarFallback>{{ post.author.name.slice(0, 1) }}</AvatarFallback>
            </Avatar>
            <span class="font-medium text-foreground">{{ post.author.name }}</span>
          </div>
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          <span>{{ post.readingTime }} 分钟阅读</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <Badge v-for="tag in post.tags" :key="tag" variant="secondary">
            {{ tag }}
          </Badge>
        </div>
      </header>

      <Separator />

      <div class="mx-auto max-w-3xl space-y-6">
        <p
          v-for="(paragraph, index) in paragraphs"
          :key="index"
          class="text-lg leading-relaxed text-foreground"
        >
          {{ paragraph }}
        </p>
      </div>
    </article>

    <Button variant="ghost" size="sm" as-child>
      <RouterLink to="/" class="inline-flex items-center gap-1.5 text-muted-foreground">
        <ArrowLeft class="size-4" />
        返回首页
      </RouterLink>
    </Button>
  </div>

  <div v-else class="space-y-6 text-center">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">文章不存在</h1>
      <p class="text-muted-foreground">你访问的链接可能已经失效，或者文章已被移除。</p>
    </div>
    <Button as-child>
      <RouterLink to="/">回到首页</RouterLink>
    </Button>
  </div>
</template>
