export interface Author {
  name: string
  avatar: string
}

export interface Post {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  tags: string[]
  author: Author
  readingTime: number
  cover: string
}

function createAvatar(initials: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${color}"/><text x="32" y="38" text-anchor="middle" font-size="24" fill="#fff" font-family="sans-serif" font-weight="600">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const authors: Record<string, Author> = {
  linmo: {
    name: '林墨',
    avatar: createAvatar('墨', '#262626'),
  },
  chenjian: {
    name: '陈简',
    avatar: createAvatar('简', '#525252'),
  },
}

const posts: Post[] = [
  {
    slug: 'vue3-composition-api',
    title: '深入 Vue 3 组合式 API：从 setup 到真实项目',
    excerpt: '组合式 API 让逻辑复用变得更自然，但也需要合理的组织方式。这篇文章分享了我在中大型项目里拆分 composables 的心得。',
    content: `Vue 3 的组合式 API 带来了更灵活的代码组织方式，让相关逻辑可以聚合在一起。刚开始接触时，我也担心代码会因此变得松散，但配合合理的目录结构后，反而比选项式 API 更容易维护。

在真实项目中，我会把可复用的逻辑抽离到 composables 目录，并按照功能领域命名，例如 usePermission、useTableScroll。这样做不仅让组件保持简洁，也方便在单元测试里单独验证业务逻辑。

另一个值得注意的点是响应式变量的命名规范。尽量让 ref 和 computed 的命名自解释，避免在模板里出现难以理解的缩写。良好的命名能显著降低团队成员的阅读成本。

最后，建议结合 TypeScript 使用组合式 API。类型推断会让重构更安全，配合 Volar 插件几乎能在编码阶段发现大部分潜在问题。`,
    date: '2026-08-12',
    tags: ['Vue 3', '组合式 API', '前端工程化'],
    author: authors.linmo,
    readingTime: 6,
    cover: 'https://picsum.photos/seed/vue3composition/800/450',
  },
  {
    slug: 'tailwind-v4-upgrade',
    title: 'Tailwind CSS v4 变了什么：一次设计系统的升级',
    excerpt: 'Tailwind v4 使用基于 CSS 的配置方式，构建速度更快。本文聊聊迁移过程中遇到的几个坑与取舍。',
    content: `Tailwind CSS v4 最大的变化是配置方式从 JavaScript 转向了 CSS 原生层。通过 @theme 指令，我们可以直接在样式表里声明颜色、间距和字体变量，这让主题定义变得更直观。

迁移过程中，我遇到最多的问题是自定义插件和旧版 tailwind.config.js 的兼容。部分插件还没有更新到 v4，因此需要先用 @utility 和 @layer 自己实现过渡方案，等生态跟上后再替换。

性能方面，v4 的引擎重写带来了明显的构建提速。在大型项目中，开发热更新时间缩短了一半以上，这对迭代效率的提升非常可观。

如果你正在犹豫是否升级，我建议先从小模块试点，观察自定义工具类与第三方库的兼容性，再决定是否全量迁移。`,
    date: '2026-08-10',
    tags: ['Tailwind CSS', 'CSS', '设计系统'],
    author: authors.chenjian,
    readingTime: 5,
    cover: 'https://picsum.photos/seed/tailwindv4/800/450',
  },
  {
    slug: 'vite-build-performance',
    title: 'Vite 构建性能优化：从慢到快的四个思路',
    excerpt: '构建时间过长会严重影响开发体验。本文整理了我在 Vite 项目中常用的优化手段，从分析到落地。',
    content: `Vite 在开发阶段借助原生 ESM 提供了极快的启动速度，但生产构建仍然可能随着项目规模增长而变慢。首先要做的是分析构建瓶颈，使用 rollup-plugin-visualizer 查看各模块体积，找到真正拖慢速度的部分。

其次，合理拆分代码块。通过 manualChunks 把第三方库和核心框架代码分离，可以利用浏览器缓存，避免每次发版都让用户下载整个应用。

第三，减少不必要的转换。检查 vite.config.ts 中的插件列表，移除对生产包没有贡献的插件，同时把 babel 类的后处理放到 CI 阶段而不是每次构建都执行。

最后，不要忽视图片和字体资源的优化。使用现代格式、按需加载，以及合适的压缩策略，往往能在不改动业务代码的情况下显著降低产物体积。`,
    date: '2026-08-08',
    tags: ['Vite', '构建优化', '工程化'],
    author: authors.linmo,
    readingTime: 7,
    cover: 'https://picsum.photos/seed/viteperf/800/450',
  },
  {
    slug: 'typescript-advanced-types',
    title: 'TypeScript 高级类型：让类型成为你的护城河',
    excerpt: '善用条件类型、模板字面量类型和映射类型，可以在编译期挡住大量错误，同时提升代码可维护性。',
    content: `TypeScript 的类型系统远不止 interface 和 type alias。条件类型让我们可以根据输入类型派生输出类型，模板字面量类型则能把字符串约束到极致，例如限制 CSS 变量名或路由路径。

映射类型是重构时的利器。通过 keyof 和 in 关键字，可以批量为对象添加可选标记、readonly 修饰，或者把属性名转换成 camelCase。只要类型设计得当，很多运行时检查都可以前置到编译阶段。

在实际代码中，我习惯为 API 响应定义清晰的数据契约，再用泛型让工具函数自动推导返回类型。这样前端接口层就会变得非常稳定，后端字段变更也能在第一时间被类型检查捕获。

不过，类型体操也要适度。过于复杂的类型会降低可读性，建议把复杂推导拆分成多个小类型，并配上注释，让同事能轻松理解你的意图。`,
    date: '2026-08-05',
    tags: ['TypeScript', '类型系统', '最佳实践'],
    author: authors.chenjian,
    readingTime: 6,
    cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    slug: 'shadcn-vue-intro',
    title: 'shadcn-vue 初体验：不依赖 UI 框架的设计方案',
    excerpt: 'shadcn-vue 把组件代码直接交到你手中，既保证了自由度，又能快速搭建一致且精致的界面。',
    content: `shadcn-vue 的核心理念是把组件作为源码复制到项目里，而不是通过 npm 包引入。这意味着你可以完全掌控每个按钮、卡片和表单的实现细节，同时享受 New York 风格带来的精致默认样式。

上手过程比我想象中顺利。配合 Vite 和 Tailwind CSS，添加一个组件只需要一条命令，生成的代码结构清晰，依赖也只有 Reka UI 等少数底层库。遇到需要定制的地方，直接修改组件文件即可，不用担心版本冲突。

暗色模式的切换也非常自然。通过给 html 添加 dark 类，所有 shadcn 组件的颜色变量会自动切换，完全不需要额外写媒体查询或覆盖样式。

对于想要快速搭建后台或博客界面的开发者来说，shadcn-vue 是一个很好的起点。它既有设计系统的严谨，又保留了手动调整的灵活性。`,
    date: '2026-08-01',
    tags: ['shadcn-vue', 'UI 设计', 'Vue'],
    author: authors.linmo,
    readingTime: 5,
    cover: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
]

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
