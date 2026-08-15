<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sun, Home, Archive, Users, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/data/site'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const route = useRoute()

const navItems = [
  { name: '首页', path: '/', icon: Home },
  { name: '归档', path: '/archive', icon: Archive },
  { name: '友链', path: '/friends', icon: Users },
  { name: '关于', path: '/about', icon: User },
]

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
    <header class="shrink-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <!-- Logo -->
        <RouterLink to="/" class="group flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <img
            :src="siteConfig.author.avatar"
            :alt="siteConfig.site.title"
            class="h-8 w-8 rounded-full object-cover ring-1 ring-border transition-transform duration-300 group-hover:scale-105 shadow-sm"
            loading="eager"
          />
          <span class="transition-colors group-hover:text-primary font-bold tracking-tight text-foreground">
            {{ siteConfig.site.title }}
          </span>
        </RouterLink>

        <!-- 导航菜单与主题切换 -->
        <div class="flex items-center gap-1 sm:gap-2">
          <nav class="flex items-center gap-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
              :class="[
                isActive(item.path)
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              ]"
            >
              <component :is="item.icon" class="size-4" />
              <span>{{ item.name }}</span>
            </RouterLink>
          </nav>

          <div class="h-4 w-[1px] bg-border mx-1" />

          <Button
            variant="ghost"
            size="icon"
            aria-label="切换主题"
            class="size-9 rounded-md"
            @click="toggleDark()"
          >
            <Sun v-if="!isDark" class="size-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
            <Moon v-else class="size-4 text-blue-400 transition-transform duration-300 hover:-rotate-12" />
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-hidden relative">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
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
