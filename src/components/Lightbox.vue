<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { X, ZoomIn, ZoomOut } from 'lucide-vue-next'

interface Props {
  src: string
  alt?: string
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const scale = ref(1)

function handleClose() {
  scale.value = 1
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleClose()
  }
}

function toggleZoom(e: MouseEvent) {
  e.stopPropagation()
  scale.value = scale.value === 1 ? 1.75 : 1
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      scale.value = 1
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
    <Transition name="lightbox-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none cursor-zoom-out"
        role="dialog"
        aria-modal="true"
        @click="handleClose"
      >
        <!-- 操作栏 -->
        <div
          class="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/20 backdrop-blur-md border border-white/10 rounded-full p-1.5 text-white"
          @click.stop
        >
          <button
            type="button"
            class="p-2 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white"
            :title="scale === 1 ? '放大' : '还原'"
            @click="toggleZoom"
          >
            <ZoomIn v-if="scale === 1" class="size-4" />
            <ZoomOut v-else class="size-4" />
          </button>
          <button
            type="button"
            class="p-2 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white"
            title="关闭 (Esc)"
            @click="handleClose"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- 图片主体与说明 -->
        <div class="flex flex-col items-center max-w-full max-h-full" @click.stop>
          <div
            class="overflow-hidden rounded-lg transition-transform duration-300 ease-out"
            :class="scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'"
            @click="toggleZoom"
          >
            <img
              :src="src"
              :alt="alt || 'Image Preview'"
              class="max-h-[82vh] max-w-[90vw] object-contain shadow-2xl transition-transform duration-300"
              :style="{ transform: `scale(${scale})` }"
            />
          </div>
          <p
            v-if="alt"
            class="mt-3 text-center text-sm font-medium text-white/80 max-w-xl truncate px-4 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm"
          >
            {{ alt }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
