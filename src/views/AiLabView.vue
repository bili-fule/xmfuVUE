<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Bot, Calendar, FileText, MessageSquareText } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAiPosts, formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

const posts = getAiPosts()
const recordedPosts = computed(() => posts.filter((post) => post.prompt || post.conversation.length > 0))

interface YearGroup {
  year: string
  posts: Post[]
}

const yearGroups = computed<YearGroup[]>(() => {
  const groups: Record<string, Post[]> = {}

  for (const post of posts) {
    const year = post.date ? post.date.substring(0, 4) : '未知年份'
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({
      year,
      posts: groups[year],
    }))
})
</script>

<template>
  <div class="h-full min-w-0 overflow-x-clip overflow-y-auto">
    <div class="mx-auto max-w-4xl space-y-8 px-4 py-8 md:py-12">
      <!-- 页面头部 -->
      <div class="space-y-2 border-b pb-6">
        <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          <Bot class="size-4" />
          <span>{{ t('aiLab.eyebrow') }}</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {{ t('aiLab.title') }}
        </h1>
        <p class="flex items-center gap-2 text-sm text-muted-foreground md:text-base">
          <FileText class="size-4 shrink-0 text-primary" />
          <span>{{ t('aiLab.description') }}</span>
        </p>
        <div class="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1.5">
            <FileText class="size-3.5 text-primary" />
            {{ t('aiLab.postCount', { n: posts.length }) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <MessageSquareText class="size-3.5 text-primary" />
            {{ t('aiLab.recordCount', { n: recordedPosts.length }) }}
          </span>
        </div>
      </div>

      <div v-if="yearGroups.length > 0" class="space-y-10">
        <section
          v-for="group in yearGroups"
          :key="group.year"
          class="space-y-4"
        >
          <div class="flex items-center gap-3">
            <h2 class="font-mono text-2xl font-bold tracking-tight text-foreground">
              {{ group.year }}
            </h2>
            <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {{ group.posts.length }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <RouterLink
              v-for="post in group.posts"
              :key="post.slug"
              :to="`/post/${post.slug}`"
              class="group block min-w-0 max-w-full"
            >
              <Card class="w-full max-w-full transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-md">
                <CardContent class="flex min-w-0 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                  <div class="min-w-0 flex-1 space-y-1.5">
                    <div class="flex min-w-0 flex-wrap items-center gap-2">
                      <span class="inline-flex shrink-0 items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Bot class="size-3" />
                        {{ t('post.aiOriginal') }}
                      </span>
                      <span v-if="post.category" class="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {{ post.category }}
                      </span>
                      <h3 class="min-w-0 flex-1 truncate text-base font-medium text-foreground transition-colors group-hover:text-primary">
                        {{ post.title }}
                      </h3>
                    </div>

                    <p v-if="post.excerpt" class="line-clamp-2 text-sm text-muted-foreground">
                      {{ post.excerpt }}
                    </p>

                    <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">
                      <div v-if="post.tags && post.tags.length > 0" class="flex min-w-0 flex-wrap gap-1.5">
                        <Badge
                          v-for="tag in post.tags"
                          :key="tag"
                          variant="secondary"
                          class="max-w-full text-[11px] font-normal text-muted-foreground"
                        >
                          #{{ tag }}
                        </Badge>
                      </div>
                      <span v-if="post.prompt || post.conversation.length > 0" class="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquareText class="size-3.5 text-primary" />
                        {{ t('post.conversation') }}
                      </span>
                    </div>
                  </div>

                  <div class="flex shrink-0 items-center justify-between gap-3 text-xs text-muted-foreground sm:justify-end">
                    <div class="flex items-center gap-1.5 font-mono">
                      <Calendar class="size-3.5 opacity-70" />
                      <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                    </div>
                    <ArrowRight class="hidden size-4 -translate-x-2 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block" />
                  </div>
                </CardContent>
              </Card>
            </RouterLink>
          </div>
        </section>
      </div>

      <div v-else class="py-16 text-center text-muted-foreground">
        <Bot class="mx-auto mb-4 size-10 opacity-40" />
        <p class="text-sm">{{ t('aiLab.empty') }}</p>
        <p class="mt-2 text-xs opacity-75">{{ t('aiLab.emptyHint') }}</p>
      </div>
    </div>
  </div>
</template>
