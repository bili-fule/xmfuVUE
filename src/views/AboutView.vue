<script setup lang="ts">
import { ExternalLink, Github, Tv, ShieldCheck, Sparkles, Terminal } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SiteFooter from '@/components/SiteFooter.vue'
import { siteConfig } from '@/data/site'
import { t } from '@/i18n'

const { author, site, license } = siteConfig
</script>

<template>
  <div class="h-full min-w-0 overflow-y-auto">
    <div class="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-10">
      <!-- 个人主卡片 -->
      <Card class="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent class="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <Avatar class="size-28 md:size-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
            <AvatarImage :src="author.avatar" :alt="author.name" />
            <AvatarFallback class="text-2xl font-bold">{{ author.name.slice(0, 2) }}</AvatarFallback>
          </Avatar>

          <div class="space-y-4 flex-1">
            <div class="space-y-1.5">
              <div class="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ author.name }}</h1>
                <Badge variant="outline" class="border-primary/40 text-primary">
                  <Sparkles class="size-3 mr-1" />
                  {{ t('about.role') || 'Frontend & Network' }}
                </Badge>
              </div>
              <p class="text-sm font-medium text-muted-foreground">
                {{ site.title }} · {{ t('about.siteSubtitle') || '个人技术记录' }}
              </p>
            </div>

            <p class="text-base text-foreground/90 italic leading-relaxed bg-muted/30 p-3 rounded-lg border-l-2 border-primary">
              “{{ author.bio }}”
            </p>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              <Button
                v-for="link in author.links"
                :key="link.name"
                variant="outline"
                size="sm"
                as-child
                class="hover:border-primary hover:text-primary transition-colors"
              >
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5">
                  <Tv v-if="link.name.toLowerCase().includes('bilibili')" class="size-4 text-pink-500" />
                  <Github v-else-if="link.name.toLowerCase().includes('github')" class="size-4" />
                  <ExternalLink v-else class="size-4" />
                  <span>{{ link.name }}</span>
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 博客介绍 -->
      <section class="space-y-4">
        <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Terminal class="size-5 text-primary" />
          {{ t('about.techTitle') || '关于本站' }}
        </h2>
        <Card>
          <CardContent class="p-6 space-y-4 text-foreground/90 leading-relaxed">
            <p>
              {{ site.description }}
            </p>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground pt-1">
              <li class="flex items-center gap-2 bg-muted/40 p-2.5 rounded-md">
                <span class="size-2 rounded-full bg-primary" />
                <span>{{ t('about.tech.1') || '前端开发架构、Vue3/Vite/TypeScript 实践' }}</span>
              </li>
              <li class="flex items-center gap-2 bg-muted/40 p-2.5 rounded-md">
                <span class="size-2 rounded-full bg-primary" />
                <span>{{ t('about.tech.2') || '计算机网络协议、代理路由与网络调优' }}</span>
              </li>
              <li class="flex items-center gap-2 bg-muted/40 p-2.5 rounded-md">
                <span class="size-2 rounded-full bg-primary" />
                <span>{{ t('about.tech.3') || 'Linux 服务器运维、Docker 容器化与部署' }}</span>
              </li>
              <li class="flex items-center gap-2 bg-muted/40 p-2.5 rounded-md">
                <span class="size-2 rounded-full bg-primary" />
                <span>{{ t('about.tech.4') || '日常生活中的所思所想与踩坑心得' }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <!-- 版权说明 -->
      <section class="space-y-4">
        <h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck class="size-5 text-primary" />
          {{ t('about.licenseTitle') || '版权与许可' }}
        </h2>
        <Card>
          <CardContent class="p-6 space-y-3">
            <p class="text-sm text-foreground/90 leading-relaxed">
              {{ t('about.licenseDesc') || '本站所有原创内容在无特别声明的情况下，均采用' }}
              <a
                :href="license.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-primary hover:underline inline-flex items-center gap-1 ml-1"
              >
                {{ license.name }}
                <ExternalLink class="size-3" />
              </a>
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t('about.licenseNote') || '转载请注明出处，署名原作者，且不得用于商业用途，衍生作品需以相同许可共享。' }}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>

    <SiteFooter />
  </div>
</template>
