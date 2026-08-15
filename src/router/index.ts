import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PostView from '@/views/PostView.vue'
import { getPostBySlug } from '@/data/posts'
import { applyPostMeta, applyDefaultMeta } from '@/lib/seo'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
  ],
})

router.afterEach((to) => {
  if (to.name === 'post' && typeof to.params.slug === 'string') {
    const post = getPostBySlug(to.params.slug)
    applyPostMeta(post ? { title: post.title, excerpt: post.excerpt, slug: post.slug } : null)
  } else {
    applyDefaultMeta()
  }
})

export { router }
