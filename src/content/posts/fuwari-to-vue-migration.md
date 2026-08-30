---
title: 从Fuwari迁移到Vue：这个博客的重构记录
published: 2026-08-16
description: '记录把这个博客从 Fuwari（Astro）迁移到 Vue + Vite + shadcn-vue 的全过程：为什么迁移、技术栈选型、横向翻页布局、卡片设计、md 编译时构建，以及过程中踩的坑。'
image: ''
tags: [Vue, Vite, shadcn-vue, 博客重构, 迁移]
category: 技术
draft: false
lang: ''
origin: ai
editorialStatus: raw
conversationSummary: 原始生成对话历史未保存。
---

Fuwari 用了挺久，但越用越觉得不顺手。

不是说 Fuwari 不好——它能开箱即用、主题也好看。只是我想改点东西的时候，Astro 的组件语法和我熟悉的 Vue 总是隔着一层，每次想加个交互都得绕。再加上我一直想试试 shadcn-vue 那套设计系统，索性推倒重来，用 Vue + Vite 重新搭一遍。

## 为什么不继续用 Fuwari

Fuwari 是基于 Astro 的，最大的问题是它的「岛屿架构」对交互密集的页面不太友好。我想要的首页是横向翻页、滚轮切换、一屏内完成浏览——这种交互在 Astro 里写起来很别扭，得手动管客户端脚本。

而且我对 Vue 的熟悉程度远高于 Astro，改起来更快。与其在 Astro 里别扭地嵌入 Vue 组件，不如整个迁过来干净。

## 技术栈

- **Vue 3 + Vite**：熟悉的组合
- **shadcn-vue**：设计系统，组件代码直接在项目里，想改就改
- **Tailwind CSS**：配合 shadcn-vue
- **TypeScript**：类型安全
- **markdown-it**：编译时把 md 转成 HTML，打包进产物

技术栈选型的核心就一句话：全部用我最顺手的东西，不给自己找麻烦。

## md 编译时构建

Fuwari 用 Astro 的 content collection，迁移过来后我用了 Vite 的 `import.meta.glob` + `markdown-it`，在编译时把 `src/content/posts/` 下的所有 md 文件读进来、转成 HTML、生成一个虚拟模块 `virtual:posts`。

```ts
// vite.config.ts 核心思路
import { defineConfig } from 'vite'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true })

function postsPlugin() {
  return {
    name: 'posts',
    resolveId(id) {
      if (id === 'virtual:posts') return '\0virtual:posts'
    },
    load(id) {
      if (id !== '\0virtual:posts') return null
      // 读取所有 md，解析 frontmatter，转 HTML，导出 posts 数组
      // ...
    },
  }
}
```

好处是构建产物里直接是渲染好的 HTML，运行时不用再解析 markdown，首屏更快。坏处是加文章得重新构建——但静态博客本来就要构建，无所谓。

## 横向翻页布局

这是重构里花时间最多的部分。我想要的效果：

- 首页一屏，不出现纵向滚动条
- 滚轮上下滚 → 横向翻页
- 每页一个 section，snap 对齐
- 底部分页条，支持页码跳转

实现上用了一个横向 `overflow-x-auto` 的 track 容器，内部每个 section `w-full shrink-0`，靠 `snap-x snap-mandatory` 做对齐。滚轮翻页拦截了 `wheel` 事件，加了 700ms 冷却防止一次手势翻好几页：

```ts
function onWheel(e: WheelEvent) {
  // 让水平方向滚轮/触控板横向手势保持原生 snap 滚动
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
  e.preventDefault()
  const now = Date.now()
  if (now - lastWheelTime < WHEEL_COOLDOWN) return
  if (Math.abs(e.deltaY) < 18) return
  lastWheelTime = now
  if (e.deltaY > 0) scrollToIndex(currentPage.value + 1)
  else scrollToIndex(currentPage.value - 1)
}
```

这里有个坑：`onScroll` 同步当前页码时要节流，不然 snap 滚动过程中页码会乱跳。用了 `requestAnimationFrame` 去抖。

## 卡片布局

卡片设计纠结了很久。最终方案是两排黄金分割：

- 宽屏（≥1280px）：3 列 × 2 行，每页 6 张
- 中屏（768~1279px）：2 列 × 2 行，每页 4 张
- 窄屏（<768px）：1 列 × 2 行，每页 2 张

卡片分 compact 和非 compact 两种：满页双行用 compact（封面矮、文字紧凑），单行用大卡。封面支持图片和渐变色块两种，没图的时候取标题首字当占位。

## 末页卡片大小不一致的坑

这个 bug 折腾了我好几轮。满页时卡片是 compact 尺寸（半页高），但末页内容少时走的是单行布局，卡片变成非 compact 大尺寸——结果末页那几张卡比满页的大一倍，视觉上「一张卡占两排位置」。

最后发现根因：末页不该切到单行布局，应该统一保持 `grid-rows-2 h-full` + compact，让末页卡片和满页一样大，内容靠上填、留白在下。一行注释标记好不变量，免得下次又改回去。

## 从 Fuwari 搬文章

直接把 Fuwari 的 md 文件复制过来，frontmatter 字段做了映射：

- `title` / `published` / `description` / `tags` / `category` / `draft` 基本一致
- 图片字段从 Fuwari 的 `banner` 改成 `image`
- 日期格式统一成 `YYYY-MM-DD`

正文内容不用改，markdown-it 都能渲染。唯一要注意的是 Fuwari 的一些特殊语法（比如它的 callout）得手动转成标准 markdown 的引用块。

## 搜索和 TOC

全文搜索用了 Pagefind，构建后自动扫描产物里的文本生成索引。TOC（目录）是在编译时从 md 提取标题层级生成的，侧边栏高亮当前章节靠 `IntersectionObserver` 监听标题可见性。

## i18n

加了一层简单的 i18n，中英双语。没上 vue-i18n，自己写了个 `t()` 函数 + 字典对象，够用就行。毕竟博客的文案量不大，引入完整 i18n 方案反而增加复杂度。

## 总结

整个迁移大概花了几个晚上。从 Astro 到 Vue，最大的收益不是性能（两者都够快），而是**改起来顺手了**——想加什么交互直接写 Vue 组件，不用再纠结 Astro 的服务端/客户端边界。

shadcn-vue 的组件代码直接在项目里，想改样式直接改源码，不用覆盖库的样式，这点比用现成的 UI 库舒服很多。

如果你也在用 Fuwari 但对 Astro 不太熟，又恰好会 Vue，可以考虑迁移。静态博客的本质就是「md → HTML」，框架只是搬运工具，用顺手的那个就行。
