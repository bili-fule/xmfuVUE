<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Bot, Calendar, FileText } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllPosts, formatDate, type Post } from '@/data/posts'
import { t } from '@/i18n'

const posts = getAllPosts()

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

const totalPosts = computed(() => posts.length)
</script>

<template>
  <div class="h-full min-w-0 overflow-x-clip overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8">
      <!-- 页面头部 -->
      <div class="space-y-2 border-b pb-6">
        <h1 class="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
          {{ t('archive.title') }}
        </h1>
        <p class="text-sm text-muted-foreground md:text-base flex items-center gap-2">
          <FileText class="size-4 text-primary" />
          <span>{{ t('archive.description') || `共收录 ${totalPosts} 篇文章` }}</span>
        </p>
      </div>

      <RouterLink
        to="/archive/ai-lab"
        class="group flex min-w-0 items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.06] sm:p-5"
      >
        <div class="flex min-w-0 items-start gap-3">
          <Bot class="mt-0.5 size-5 shrink-0 text-primary" />
          <div class="min-w-0 space-y-1">
            <h2 class="text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
              {{ t('aiLab.title') }}
            </h2>
            <p class="line-clamp-2 text-xs leading-6 text-muted-foreground sm:text-sm">
              {{ t('aiLab.description') }}
            </p>
          </div>
        </div>
        <ArrowRight class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </RouterLink>

      <!-- 时间轴列表 -->
      <div v-if="yearGroups.length > 0" class="space-y-10">
        <section v-for="group in yearGroups" :key="group.year" class="space-y-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold tracking-tight text-foreground font-mono">
              {{ group.year }}
            </h2>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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
              <Card class="w-full max-w-full transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:bg-muted/40">
                <CardContent class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div class="space-y-1.5 min-w-0 flex-1">
                    <div class="flex items-center gap-2 min-w-0">
                      <span v-if="post.category" class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {{ post.category }}
                      </span>
                      <h3 class="font-medium text-base text-foreground group-hover:text-primary transition-colors min-w-0 truncate">
                        {{ post.title }}
                      </h3>
                    </div>

                    <p v-if="post.excerpt" class="line-clamp-2 text-sm text-muted-foreground">
                      {{ post.excerpt }}
                    </p>

                    <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 pt-0.5 min-w-0">
                      <Badge
                        v-for="tag in post.tags"
                        :key="tag"
                        variant="secondary"
                        class="max-w-full text-[11px] font-normal text-muted-foreground"
                      >
                        #{{ tag }}
                      </Badge>
                    </div>
                  </div>

                  <div class="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground shrink-0">
                    <div class="flex items-center gap-1.5 font-mono">
                      <Calendar class="size-3.5 opacity-70" />
                      <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                    </div>
                    <ArrowRight class="size-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-primary hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            </RouterLink>
          </div>
        </section>
      </div>

      <!-- 空列表提示 -->
      <div v-else class="py-16 text-center text-muted-foreground">
        <p>{{ t('archive.empty') }}</p>
      </div>
    </div>
  </div>
</template>
