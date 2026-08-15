<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loader2, FileText, ArrowRight, X, Command } from 'lucide-vue-next'
import { searchPosts } from '@/lib/search'
import { t } from '@/i18n'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const query = ref('')
const loading = ref(false)
const results = ref<Array<{ slug: string; title: string; excerpt: string; tags: string[] }>>([])
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

async function doSearch() {
  const trimmed = query.value.trim()
  if (!trimmed) {
    results.value = []
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res = await searchPosts(trimmed)
    results.value = res || []
    activeIndex.value = 0
  } catch (err) {
    console.error('Search error:', err)
    results.value = []
  } finally {
    loading.value = false
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    doSearch()
  }, 200)
})

function handleClose() {
  query.value = ''
  results.value = []
  emit('close')
}

function selectPost(slug: string) {
  router.push(`/post/${slug}`)
  handleClose()
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.open) return

  if (e.key === 'Escape') {
    handleClose()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (results.value.length > 0) {
      activeIndex.value = (activeIndex.value + 1) % results.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (results.value.length > 0) {
      activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (results.value[activeIndex.value]) {
      selectPost(results.value[activeIndex.value].slug)
    }
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        inputRef.value?.focus()
      })
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[90] flex items-start justify-center bg-background/80 backdrop-blur-sm p-4 pt-16 sm:pt-24"
        role="dialog"
        aria-modal="true"
        @click="handleClose"
      >
        <div
          class="relative w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl transition-all"
          @click.stop
        >
          <!-- 搜索输入框 -->
          <div class="flex items-center border-b px-4 py-3">
            <Search class="mr-3 size-5 shrink-0 text-muted-foreground" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              :placeholder="t('search.placeholder')"
            />
            <Loader2 v-if="loading" class="size-4 animate-spin text-muted-foreground mr-2" />
            <button
              v-if="query"
              type="button"
              class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-1"
              @click="query = ''"
            >
              <X class="size-4" />
            </button>
            <kbd class="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          <!-- 搜索结果列表 / 状态展示 -->
          <div class="max-h-[60vh] overflow-y-auto p-2">
            <!-- 初始空提示 -->
            <div
              v-if="!query.trim()"
              class="py-12 text-center text-sm text-muted-foreground space-y-1"
            >
              <FileText class="size-8 mx-auto opacity-40 mb-2" />
              <p>{{ t('search.hint') || t('search.empty') }}</p>
            </div>

            <!-- 无搜索结果 -->
            <div
              v-else-if="!loading && results.length === 0"
              class="py-12 text-center text-sm text-muted-foreground space-y-1"
            >
              <p>{{ t('search.noResults') }}</p>
            </div>

            <!-- 结果列表 -->
            <div v-else class="space-y-1">
              <button
                v-for="(item, idx) in results"
                :key="item.slug"
                type="button"
                class="w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors text-foreground"
                :class="idx === activeIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60'"
                @click="selectPost(item.slug)"
                @mouseenter="activeIndex = idx"
              >
                <FileText class="size-4 shrink-0 mt-1 opacity-70" />
                <div class="flex-1 min-w-0 space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <h4 class="font-medium text-sm truncate">{{ item.title }}</h4>
                    <ArrowRight class="size-3.5 opacity-50 shrink-0" />
                  </div>
                  <p class="text-xs text-muted-foreground line-clamp-1">
                    {{ item.excerpt }}
                  </p>
                  <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 pt-1">
                    <span
                      v-for="tag in item.tags"
                      :key="tag"
                      class="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- 底部键盘导航指引 -->
          <div class="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <kbd class="rounded border bg-background px-1 py-0.5 font-mono">↑</kbd>
                <kbd class="rounded border bg-background px-1 py-0.5 font-mono">↓</kbd>
                选择
              </span>
              <span class="flex items-center gap-1">
                <kbd class="rounded border bg-background px-1 py-0.5 font-mono">↵</kbd>
                打开
              </span>
            </div>
            <span>{{ results.length }} 个结果</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
