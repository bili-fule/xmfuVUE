<script setup lang="ts">
import { ExternalLink, Users, PlusCircle, Sparkles } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { siteConfig } from '@/data/site'

const { friends, site, author } = siteConfig
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-10">
      <!-- 头部介绍 -->
      <div class="space-y-2 border-b pb-6">
        <div class="flex items-center gap-2">
          <h1 class="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            友情链接
          </h1>
          <Badge variant="secondary" class="font-normal text-xs">
            <Users class="size-3 mr-1" />
            {{ friends.length }} 位伙伴
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground md:text-base">
          海内存知己，天涯若比邻。这里收录了志同道合的朋友们。
        </p>
      </div>

      <!-- 友链卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          v-for="friend in friends"
          :key="friend.url"
          :href="friend.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <Card class="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-card/90">
            <CardContent class="p-5 flex items-start gap-4">
              <Avatar class="size-12 shrink-0 border border-border shadow-sm transition-transform duration-300 group-hover:scale-105">
                <AvatarImage :src="friend.avatar" :alt="friend.name" />
                <AvatarFallback class="font-semibold">{{ friend.name.slice(0, 1) }}</AvatarFallback>
              </Avatar>
              <div class="space-y-1.5 min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1">
                  <h3 class="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                    {{ friend.name }}
                  </h3>
                  <ExternalLink class="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {{ friend.description }}
                </p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      <!-- 申请友链说明 -->
      <section class="space-y-4 pt-4">
        <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <PlusCircle class="size-5 text-primary" />
          友链申请
        </h2>
        <Card class="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle class="text-base">欢迎互换友链</CardTitle>
            <CardDescription>
              如果你也拥有自己的独立博客或网站，欢迎按以下格式在下方评论区或通过社交平台联系我。
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium text-foreground text-xs uppercase tracking-wider">本站信息</h4>
              <pre class="p-4 rounded-lg bg-muted text-xs font-mono text-foreground/90 overflow-x-auto border border-border/50"><code>名称：{{ site.title }}
简介：{{ site.description }}
链接：https://blog.fulie.me (或您的当前域名)
头像：{{ author.avatar }}</code></pre>
            </div>

            <div class="space-y-2">
              <h4 class="font-medium text-foreground text-xs uppercase tracking-wider">申请要求</h4>
              <ul class="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>网站支持 HTTPS 访问，内容积极健康，无违规广告及推广</li>
                <li>原创技术或生活分享类独立博客优先</li>
                <li>申请前请先添加本站链接~</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
</template>
