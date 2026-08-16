import HomeView from '@/views/HomeView.vue'
import PostView from '@/views/PostView.vue'
import type { RouteRecordRaw } from 'vue-router'

// 仅导出路由表。router 实例由 vite-ssg 的 ViteSSG 内部创建
// （客户端 createWebHistory，SSR 端 createMemoryHistory）。
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/post/:slug',
    name: 'post',
    component: PostView,
    props: true,
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/ArchiveView.vue'),
  },
  {
    path: '/friends',
    name: 'friends',
    component: () => import('@/views/FriendsView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
