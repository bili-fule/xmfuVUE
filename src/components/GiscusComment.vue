<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
  mapping?: string
  reactionsEnabled?: string
  emitMetadata?: string
  inputPosition?: 'top' | 'bottom'
  lang?: string
}

const props = withDefaults(defineProps<Props>(), {
  repo: 'bili-fule/website-discussion',
  repoId: 'R_kgDOPMSUTg',
  category: 'Announcements',
  categoryId: 'DIC_kwDOPMSUTs4Cs7hv',
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  lang: 'zh-CN',
})

const containerRef = ref<HTMLDivElement | null>(null)
let observer: MutationObserver | null = null

function getCurrentTheme(): string {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function updateGiscusTheme() {
  const giscusFrame = containerRef.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
    ?? document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  if (giscusFrame && giscusFrame.contentWindow) {
    giscusFrame.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: getCurrentTheme(),
          },
        },
      },
      'https://giscus.app',
    )
  }
}

onMounted(() => {
  if (!containerRef.value) return

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', props.repo)
  script.setAttribute('data-repo-id', props.repoId)
  script.setAttribute('data-category', props.category)
  script.setAttribute('data-category-id', props.categoryId)
  script.setAttribute('data-mapping', props.mapping)
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', props.reactionsEnabled)
  script.setAttribute('data-emit-metadata', props.emitMetadata)
  script.setAttribute('data-input-position', props.inputPosition)
  script.setAttribute('data-theme', getCurrentTheme())
  script.setAttribute('data-lang', props.lang)
  script.setAttribute('data-loading', 'lazy')
  script.crossOrigin = 'anonymous'
  script.async = true

  containerRef.value.appendChild(script)

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateGiscusTheme()
        break
      }
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="w-full pt-4">
    <div ref="containerRef" class="giscus-container min-h-[160px] w-full" />
  </div>
</template>
