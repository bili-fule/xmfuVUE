<script setup lang="ts">
import { ExternalLink, Users, PlusCircle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { siteConfig } from '@/data/site'
import { SITE } from '@/lib/site'
import { t } from '@/i18n'

const { friends, site, author } = siteConfig
</script>

<template>
  <div class="h-full min-w-0 overflow-x-clip overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-10">
      <!-- 头部介绍 -->
      <div class="space-y-2 border-b pb-6">
        <div class="flex items-center gap-2">
          <h1 class="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            {{ t('friends.title') }}
          </h1>
          <Badge variant="secondary" class="font-normal text-xs">
            <Users class="size-3 mr-1" />
            {{ friends.length }}
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground md:text-base">
          {{ t('friends.description') }}
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
          class="group block h-full min-w-0 max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        >
          <Card class="h-full w-full max-w-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-card/90">
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
          {{ t('friends.applyTitle') }}
        </h2>
        <Card class="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle class="text-base">{{ t('friends.formatTitle') || t('friends.applyTitle') }}</CardTitle>
            <CardDescription>
              {{ t('friends.formatHint') || '欢迎互换友链，请按以下格式留言或联系我。' }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium text-foreground text-xs uppercase tracking-wider">
                {{ t('friends.formatTitle') || '本站信息' }}
              </h4>
              <pre class="p-4 rounded-lg bg-muted text-xs font-mono text-foreground/90 overflow-x-auto border border-border/50"><code>name: {{ site.title }}
desc: {{ site.description }}
link: {{ SITE.baseUrl }}
avatar: {{ author.avatar }}</code></pre>
            </div>

            <div class="space-y-2">
              <h4 class="font-medium text-foreground text-xs uppercase tracking-wider">
                {{ t('friends.requirementsTitle') || '申请要求' }}
              </h4>
              <ul class="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>{{ t('friends.requirements.1') || '网站支持 HTTPS 访问，内容积极健康，无违规广告及推广' }}</li>
                <li>{{ t('friends.requirements.2') || '原创技术或生活分享类独立博客优先' }}</li>
                <li>{{ t('friends.requirements.3') || '申请前请先添加本站链接~' }}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
</template>
