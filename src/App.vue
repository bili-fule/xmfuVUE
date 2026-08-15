<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sun, Home, Archive, Users, User, Search, Languages } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SearchModal from '@/components/SearchModal.vue'
import { siteConfig } from '@/data/site'
import { locale, setLocale, t } from '@/i18n'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const route = useRoute()
const searchOpen = ref(false)

const navItems = computed(() => [
  { name: t('nav.home') || '首页', path: '/', icon: Home },
  { name: t('nav.archive') || '归档', path: '/archive', icon: Archive },
  { name: t('nav.friends') || '友链', path: '/friends', icon: Users },
  { name: t('nav.about') || '关于', path: '/about', icon: User },
])

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

function toggleLanguage() {
  const nextLocale = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(nextLocale)
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
    <!-- 顶部导航栏 -->
    <header class="shrink-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-6">
        <!-- Logo -->
        <RouterLink to="/" class="group flex items-center gap-2.5 text-base sm:text-lg font-semibold tracking-tight">
          <img
            :src="siteConfig.author.avatar"
            :alt="siteConfig.site.title"
            class="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-1 ring-border transition-transform duration-300 group-hover:scale-105 shadow-sm"
            loading="eager"
          />
          <span class="transition-colors group-hover:text-primary font-bold tracking-tight text-foreground hidden sm:inline-block">
            {{ siteConfig.site.title }}
          </span>
        </RouterLink>

        <!-- 导航与操作组 -->
        <div class="flex items-center gap-1 sm:gap-2">
          <nav class="flex items-center gap-0.5 sm:gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200"
              :class="[
                isActive(item.path)
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              ]"
            >
              <component :is="item.icon" class="size-3.5 sm:size-4" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </nav>

          <div class="h-4 w-[1px] bg-border mx-0.5 sm:mx-1" />

          <!-- 搜索唤起按钮 -->
          <Button
            variant="ghost"
            size="sm"
            class="h-8 sm:h-9 px-2 sm:px-2.5 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            :aria-label="t('nav.search') || '搜索'"
            @click="searchOpen = true"
          >
            <Search class="size-4" />
            <kbd class="hidden md:inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <!-- 语言切换按钮 -->
          <Button
            variant="ghost"
            size="icon"
            class="size-8 sm:size-9 rounded-md font-mono text-xs font-semibold"
            :aria-label="locale === 'zh' ? 'Switch to English' : '切换为中文'"
            @click="toggleLanguage"
          >
            <span v-if="locale === 'zh'" class="text-xs">EN</span>
            <span v-else class="text-xs">中</span>
          </Button>

          <!-- 主题切换按钮 -->
          <Button
            variant="ghost"
            size="icon"
            class="size-8 sm:size-9 rounded-md"
            :aria-label="t('theme.toggle') || '切换主题'"
            @click="toggleDark()"
          >
            <Sun v-if="!isDark" class="size-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
            <Moon v-else class="size-4 text-blue-400 transition-transform duration-300 hover:-rotate-12" />
          </Button>
        </div>
      </div>
    </header>

    <!-- 视图路由主体 -->
    <main class="flex-1 overflow-hidden relative flex flex-col">
      <div class="flex-1 overflow-hidden relative">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>

      <!-- 全局轻量页脚（与各视图滚动区自然融合） -->
      <footer class="shrink-0 border-t bg-background/80 backdrop-blur-xs py-2 px-4 text-center text-[11px] sm:text-xs text-muted-foreground z-10">
        <div class="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-1">
          <p>© {{ currentYear }} {{ siteConfig.site.title }}. {{ t('footer.copyright') || 'All rights reserved.' }}</p>
          <a
            :href="siteConfig.license.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            {{ siteConfig.license.name }}
          </a>
        </div>
      </footer>
    </main>

    <!-- 全局搜索弹窗 -->
    <SearchModal
      :open="searchOpen"
      @close="searchOpen = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
