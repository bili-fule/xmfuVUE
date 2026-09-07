<script setup lang="ts">
import { siteConfig } from '@/data/site'
import { t } from '@/i18n'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="w-full shrink-0 border-t bg-background/80 px-4 py-2 text-center text-[11px] text-muted-foreground backdrop-blur-xs sm:text-xs">
    <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1 sm:flex-row">
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
        <p>© {{ currentYear }} {{ siteConfig.site.title }}. {{ t('footer.copyright') || 'All rights reserved.' }}</p>
        <a
          v-if="siteConfig.icp"
          :href="siteConfig.icp.url || 'https://beian.miit.gov.cn/'"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-primary"
        >
          {{ siteConfig.icp.number }}
        </a>
      </div>
      <a
        :href="siteConfig.license.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 transition-colors hover:text-primary"
      >
        {{ siteConfig.license.name }}
      </a>
    </div>
  </footer>
</template>
