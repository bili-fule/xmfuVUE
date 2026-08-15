<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sun } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
    <header class="shrink-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <RouterLink to="/" class="group flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            墨
          </span>
          <span class="transition-colors group-hover:text-primary">墨记</span>
        </RouterLink>

        <Button
          variant="ghost"
          size="icon"
          aria-label="切换主题"
          @click="toggleDark()"
        >
          <Sun v-if="!isDark" class="size-5" />
          <Moon v-else class="size-5" />
        </Button>
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
