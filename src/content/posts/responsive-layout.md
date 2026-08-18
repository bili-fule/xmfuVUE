---
title: 给这个博客补上一套真正能适应多尺寸的布局
published: 2026-08-18
description: '记录一次博客多尺寸适配改造：从短屏溢出、首页卡片裁剪，到用 dvh、flex 约束和实际容器尺寸把布局重新理顺。'
image: ''
tags: [Vue, Tailwind CSS, 响应式布局, 前端, 博客重构]
category: 技术
draft: false
lang: ''
---

这个博客从 Fuwari 迁移到 Vue 之后，首页看起来已经能用了，但在不同尺寸的窗口里总有一些小问题。

宽屏没什么感觉，窗口一缩就开始暴露：有时候卡片底部被截掉，有时候末页的卡片突然变大，横屏短高度时整个页面被内容撑开，页脚也跟着跑到视口下面。更麻烦的是，这些问题不是某一个尺寸专属的，改完一个断点，另一个断点又会出现新的问题。

这次我没有继续堆媒体查询，而是重新整理了页面的尺寸模型。

## 问题到底出在哪里

之前首页的布局大致是固定的：根据浏览器窗口宽度决定列数，Grid 固定两行，再让页面内容用 `h-full` 填满剩余空间。这个方案在设计稿尺寸下没问题，但它默认了几个并不可靠的前提：

- 浏览器窗口宽度就是内容轨道的宽度；
- 页面一定有足够的高度放下两行卡片；
- `h-full` 的父级总有明确的高度；
- 所有 Flex 子项都会按照预期收缩。

现实里这些条件经常同时不成立。比如浏览器宽度是 1024px，但内容区还有左右内边距；窗口高度只有 320px 时，两行卡片根本放不下；而 Flex 子项默认的 `min-height: auto` 还会把内容的固有高度传回父级。

所以根因不是「少写了一个 `md` 或 `lg`」，而是页面没有明确谁负责撑满视口、谁负责滚动、谁负责根据实际空间调整布局。

## 先固定应用壳的高度

这是最关键的一步。博客是一个带内部滚动区域的应用壳，根节点不应该被正文内容无限撑高。`100dvh` 比 `100vh` 更适合移动端，因为它会跟随动态视口高度变化：

```html
<div class="flex h-dvh min-w-0 flex-col overflow-hidden">
  <header class="shrink-0">...</header>

  <main class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
    <div class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <RouterView />
    </div>
    <footer class="shrink-0">...</footer>
  </main>
</div>
```

这里几个类名缺一不可：

- `h-dvh` 给应用壳一个明确的视口高度；
- `flex-1` 让主体占据页头和页脚之间的空间；
- `min-h-0` 允许 Flex 子项真正收缩；
- `overflow-hidden` 防止路由内容把整个页面撑开。

固定应用壳不代表所有内容都不能滚动。正确的做法是让每个页面自己的内容区负责滚动。文章页滚正文，归档页滚列表，首页滚卡片轨道，页脚则始终留在应用壳里面。

## 不要只看窗口宽度

首页原本用窗口宽度直接判断列数，但真正决定卡片能不能放下的，是首页横向轨道的可用宽度。现在直接读取轨道尺寸，再根据卡片最小宽度计算列数：

```ts
const trackRef = ref<HTMLElement | null>(null)
const { width: trackWidth, height: trackHeight } = useElementSize(trackRef)

function getColumnCount(width: number): number {
  const contentWidth = getPageContentWidth(width)
  return Math.max(
    1,
    Math.min(3, Math.floor((contentWidth + PAGE_GAP) / (CARD_MIN_WIDTH + PAGE_GAP))),
  )
}
```

这样做的好处是，断点不再只和设备类型绑定，而是和实际空间绑定。页面被放进更窄的容器、浏览器出现滚动条、左右内边距发生变化时，列数都能跟着调整。

高度也用同样的思路处理。足够高时显示两行，短屏时退化成一行，并允许轨道纵向滚动：

```ts
const rows = height >= CARD_MIN_HEIGHT * 2 + PAGE_GAP ? 2 : 1

return {
  cols,
  rows,
  perPage: cols * rows,
}
```

这比强行让所有尺寸都塞进两行更可靠。短屏设备不需要被迫维持桌面布局，用户仍然可以正常看到全部卡片。

## 卡片尺寸要有不变量

之前 compact 卡片的封面使用了弹性高度。卡片空间不足时，封面、标题和页脚会互相挤压，最后表现成文字或页脚被裁剪。

现在 compact 卡片使用固定封面高度，并给整张卡片设置最小高度：

```vue
<div class="h-16 shrink-0 overflow-hidden bg-muted/50">
  ...
</div>

<CardFooter class="mt-auto flex shrink-0 items-center justify-between p-3 pt-0">
  ...
</CardFooter>
```

卡片的尺寸策略应该稳定，内容只能在标题、摘要和标签这些区域内做截断，而不能通过压缩页脚来「解决」高度不够的问题。末页也继续使用和满页相同的 compact 尺寸，不能因为文章数量少就切换成另一种卡片规格。

## Resize 时不要把用户送回第一页

响应式布局还有一个容易忽略的交互问题：窗口 resize 后，分页容量会变化。比如宽屏一页 6 篇文章，缩到平板后一页只有 4 篇。如果只保留页码，用户会突然跳到完全不同的位置。

现在在布局变化时记录当前页的第一篇文章，把它换算到新分页中的位置，再自动滚动到对应页面：

```ts
const anchorIndex = currentPage.value * oldPerPage
const targetPage = Math.floor(anchorIndex / perPage)

await nextTick()
scrollToIndex(targetPage, 'auto')
```

这类细节不会出现在设计稿里，但对真实使用体验影响很大。

## 移动端导航也要换一种思路

在 320px 宽度下，Logo、四个导航链接、搜索、语言和主题按钮不可能全部保持桌面形态。继续缩小文字只会让界面变得拥挤，所以移动端改成菜单按钮，导航链接放进展开面板里。

这是响应式设计里比较重要的一点：不是所有桌面元素都要缩小后继续存在，有些元素应该在小屏上切换交互模式。

搜索弹窗也增加了动态视口高度限制和内部滚动，避免短屏设备打开搜索后底部操作区消失。

## 最后怎么验证

我用下面这些尺寸检查了首页、导航、分页和文章页：

- `320×568`：卡片内容和页脚不被裁剪；
- `375×667`、`393×852`：窄屏在一行和两行布局之间正常切换；
- `480×800`、`768×1024`：列数和分页容量正常；
- `1024×768`、`1280×800`、`1440×900`：桌面卡片高度一致；
- `568×320`：横屏短高度可以纵向查看内容，不再强行裁剪。

除了看视觉效果，我还检查了几个容易漏掉的行为：移动菜单开关、英文导航是否溢出、分页按钮、直接跳页，以及 resize 后当前文章位置是否保持。

## 总结

这次改造让我重新确认了一件事：响应式布局不是给几个断点写几组 CSS，而是先把尺寸和滚动的责任分清楚。

应用壳负责锁定视口，页面负责自己的滚动，组件负责稳定尺寸，布局根据真实容器空间计算。这样做以后，桌面、平板、手机和横屏短窗口不再是四套互相打架的规则，而是同一套模型在不同空间里的自然表现。

这也算是之前那篇《从 Fuwari 迁移到 Vue》的后续。迁移框架只是开始，真正决定博客好不好用的，往往是这些看起来不起眼的布局细节。
