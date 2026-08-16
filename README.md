# fulieblog

孚狸的个人博客，基于 Vue 3 + Vite + shadcn-vue 构建。从 Fuwari（Astro）迁移而来。

## 技术栈

- **Vue 3 + Vite** — 核心框架与构建工具
- **shadcn-vue + Tailwind CSS v4** — 设计系统与样式
- **TypeScript** — 类型安全
- **markdown-it** — 编译时将 md 转为 HTML，打包进产物
- **Pagefind / MiniSearch** — 全文搜索
- **Giscus** — GitHub Discussions 驱动的评论

## 功能

- **横向翻页首页** — 滚轮切换页面，一屏内完成浏览，底部分页条支持页码跳转
- **卡片两排黄金分割布局** — 响应式列数（宽屏 3 列 / 中屏 2 列 / 窄屏 1 列），有图/无图自适应封面
- **md 编译时构建** — `src/content/posts/` 下的 md 在构建时解析为 HTML，dev 下新增/修改文章自动热更新
- **全文搜索** — 构建时生成搜索索引，客户端即时检索
- **TOC 目录** — 文章页侧边栏，`IntersectionObserver` 高亮当前章节
- **i18n** — 中英双语，自实现轻量 `t()` 函数
- **SEO** — 动态 meta 标签、JSON-LD 结构化数据、sitemap.xml、rss.xml、robots.txt
- **归档 / 关于 / 友链** — 独立页面
- **Giscus 评论** — 跟随站点主题亮/暗自适应

## 目录结构

```
src/
├── components/          # Vue 组件（PostCard、ui/ shadcn-vue 组件等）
├── content/posts/       # 文章 md 源文件
├── data/                # 站点配置、文章数据接口
├── lib/                 # 站点常量
├── plugins/md-posts.ts  # Vite 插件：md 编译时构建 + 搜索索引 + RSS/sitemap
├── views/               # 页面（Home/Post/Archive/About/Friends）
├── i18n/                # 中英文字典 + t() 函数
└── router/              # vue-router 路由
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动 dev server（新增/修改文章自动热更新）
npm run dev

# 构建生产产物
npm run build

# 预览构建产物
npm run preview
```

## 写文章

在 `src/content/posts/` 下新建 `.md` 文件，frontmatter 格式：

```yaml
---
title: 文章标题
published: 2026-08-16          # YYYY-MM-DD
description: 文章描述
image: ''                       # 封面图 URL，留空则用标题首字占位
tags: [标签1, 标签2]
category: 技术
draft: false
lang: ''                        # 留空即可
---

正文内容（markdown）...
```

dev server 会自动热更新，构建时自动生成搜索索引、RSS、sitemap。

## 部署

构建产物在 `dist/`，纯静态文件，可部署到任意静态托管：

- **Cloudflare Workers** — 配合 `wrangler.jsonc` 指向 `./dist`
- **Vercel / Netlify** — 直接连接 GitHub 仓库
- **任意静态服务器** — 把 `dist/` 上传即可

## 许可

文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。
