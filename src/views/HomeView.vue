<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAllPosts, formatDate } from '@/data/posts'

const posts = getAllPosts()
</script>

<template>
  <div class="space-y-10">
    <div class="space-y-3">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl">
        墨记
      </h1>
      <p class="text-lg text-muted-foreground">
        记录前端技术、设计系统与工程化实践的点滴思考。
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <RouterLink
        v-for="post in posts"
        :key="post.slug"
        :to="`/post/${post.slug}`"
        class="group block"
      >
        <Card class="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-md">
          <CardHeader class="gap-4">
            <div class="space-y-2">
              <CardTitle class="text-xl leading-snug transition-colors group-hover:text-primary">
                {{ post.title }}
              </CardTitle>
              <CardDescription class="line-clamp-2">
                {{ post.excerpt }}
              </CardDescription>
            </div>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="tag in post.tags" :key="tag" variant="secondary">
                {{ tag }}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter class="mt-auto gap-3 text-sm text-muted-foreground">
            <Avatar class="size-6">
              <AvatarImage :src="post.author.avatar" :alt="post.author.name" />
              <AvatarFallback>{{ post.author.name.slice(0, 1) }}</AvatarFallback>
            </Avatar>
            <span class="font-medium text-foreground">{{ post.author.name }}</span>
            <span class="ml-auto flex items-center gap-2">
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
              <span>·</span>
              <span>{{ post.readingTime }} 分钟阅读</span>
            </span>
          </CardFooter>
        </Card>
      </RouterLink>
    </div>
  </div>
</template>
