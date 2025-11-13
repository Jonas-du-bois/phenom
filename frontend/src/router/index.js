import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/pageTest.vue')
    },
    // Route 404 - DOIT être en dernier
    {
      path: '/:pathMatch(.*)*',
      name: '404-not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

export default router
