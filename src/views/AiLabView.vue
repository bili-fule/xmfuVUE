<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Bot, FileText, MessageSquareText } from 'lucide-vue-next'
import PostCard from '@/components/PostCard.vue'
import { getAiPosts } from '@/data/posts'
import { t } from '@/i18n'

const posts = getAiPosts()
const recordedPosts = computed(() => posts.filter((post) => post.prompt || post.conversation.length > 0))
</script>

<template>
  <div class="h-full min-w-0 overflow-x-clip overflow-y-auto">
    <div class="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <header class="space-y-5 border-b pb-8">
        <div class="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          <Bot class="size-4" />
          <span>{{ t('aiLab.eyebrow') }}</span>
        </div>

        <div class="max-w-3xl space-y-3">
          <h1 class="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            {{ t('aiLab.title') }}
          </h1>
          <p class="text-sm leading-7 text-muted-foreground md:text-base">
            {{ t('aiLab.description') }}
          </p>
        </div>

        <div class="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1.5">
            <FileText class="size-3.5 text-primary" />
            {{ t('aiLab.postCount', { n: posts.length }) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <MessageSquareText class="size-3.5 text-primary" />
            {{ t('aiLab.recordCount', { n: recordedPosts.length }) }}
          </span>
        </div>
      </header>

      <section v-if="posts.length > 0" class="grid min-w-0 grid-cols-1 gap-5 pt-8 md:grid-cols-2">
        <RouterLink
          v-for="post in posts"
          :key="post.slug"
          :to="`/post/${post.slug}`"
          class="group flex min-w-0 max-w-full"
        >
          <PostCard :post="post" class="w-full" />
        </RouterLink>
      </section>

      <div v-else class="py-20 text-center text-muted-foreground">
        <Bot class="mx-auto mb-4 size-10 opacity-40" />
        <p class="text-sm">{{ t('aiLab.empty') }}</p>
        <p class="mt-2 text-xs opacity-75">{{ t('aiLab.emptyHint') }}</p>
      </div>
    </div>
  </div>
</template>
