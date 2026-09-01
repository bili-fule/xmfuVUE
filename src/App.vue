<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sun, Home, Users, User, Search, Menu, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SearchModal from '@/components/SearchModal.vue'
import { siteConfig } from '@/data/site'
import { locale, setLocale, t } from '@/i18n'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const route = useRoute()
const searchOpen = ref(false)
const mobileMenuOpen = ref(false)
const searchShortcut = ref('Ctrl K')

const navItems = computed(() => [
  { name: t('nav.home') || '首页', path: '/', icon: Home },
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

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchOpen.value = true
  }
}

function getSearchShortcut(): string {
  const platform = `${navigator.platform} ${navigator.userAgent}`
  return /Mac|iPhone|iPad|iPod/.test(platform) ? '⌘K' : 'Ctrl K'
}

onMounted(() => {
  searchShortcut.value = getSearchShortcut()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

</script>

<template>
  <div class="flex min-h-dvh sm:h-dvh min-w-0 flex-col sm:overflow-hidden bg-background text-foreground transition-colors duration-300">
    <!-- 顶部导航栏：在移动端吸顶，跟随页面自然滚动 -->
    <header class="sticky top-0 z-50 w-full shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 w-full max-w-5xl min-w-0 items-center gap-3 px-3 sm:px-6">
        <!-- Logo -->
        <RouterLink to="/" class="group flex min-w-0 shrink-0 items-center gap-2 text-base font-semibold tracking-tight sm:gap-2.5 sm:text-lg">
          <img
            :src="siteConfig.author.avatar"
            :alt="siteConfig.site.title"
            class="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-1 ring-border transition-transform duration-300 group-hover:scale-105 shadow-sm"
            loading="eager"
          />
          <span class="transition-colors group-hover:text-primary font-bold tracking-tight text-foreground text-sm sm:text-base">
            {{ siteConfig.site.title }}
          </span>
        </RouterLink>

        <!-- 导航与操作组 -->
        <nav class="hidden min-w-0 flex-1 items-center justify-end gap-0.5 sm:flex sm:gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="relative flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 sm:gap-1.5 sm:px-3 sm:text-sm"
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

        <div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div class="hidden h-4 w-px bg-border sm:block" />

          <!-- 搜索唤起按钮 -->
          <Button
            variant="ghost"
            size="sm"
            class="h-8 shrink-0 px-2 text-muted-foreground hover:text-foreground sm:h-9 sm:px-2.5"
            :aria-label="t('nav.search') || '搜索'"
            @click="searchOpen = true"
          >
            <Search class="size-4" />
            <kbd class="hidden md:inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {{ searchShortcut }}
            </kbd>
          </Button>

          <!-- 语言切换按钮 -->
          <Button
            variant="ghost"
            size="icon"
            class="size-8 shrink-0 rounded-md font-mono text-xs font-semibold sm:size-9"
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
            class="size-8 shrink-0 rounded-md sm:size-9"
            :aria-label="t('theme.toggle') || '切换主题'"
            @click="toggleDark()"
          >
            <Sun v-if="!isDark" class="size-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
            <Moon v-else class="size-4 text-blue-400 transition-transform duration-300 hover:-rotate-12" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="size-8 shrink-0 rounded-md sm:hidden"
            :aria-label="mobileMenuOpen ? 'Close navigation' : 'Open navigation'"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <X v-if="mobileMenuOpen" class="size-4" />
            <Menu v-else class="size-4" />
          </Button>
        </div>
      </div>

      <Transition name="mobile-menu">
        <div
          v-if="mobileMenuOpen"
          class="absolute inset-x-0 top-14 border-b bg-background/95 p-3 shadow-lg backdrop-blur sm:hidden"
        >
          <nav class="mx-auto grid max-w-5xl gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors"
              :class="[
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              ]"
              @click="closeMobileMenu"
            >
              <component :is="item.icon" class="size-4" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </nav>
        </div>
      </Transition>
    </header>

    <!-- 视图路由主体 -->
    <main class="relative flex min-w-0 flex-1 flex-col sm:min-h-0 sm:overflow-hidden">
      <div class="relative flex min-w-0 flex-1 flex-col sm:min-h-0 sm:overflow-hidden">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <KeepAlive include="HomeView">
              <component :is="Component" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </div>

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
