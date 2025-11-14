import { createRouter, createWebHistory } from 'vue-router'

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth route (public)
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/test_AuthPage.vue'),
      meta: { requiresAuth: false }
    },

    // Main app routes (protected)
    {
      path: '/',
      component: () => import('../components/test_AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/feed'
        },
        {
          path: 'feed',
          name: 'feed',
          component: () => import('../views/test_FeedView.vue')
        },
        {
          path: 'map',
          name: 'map',
          component: () => import('../views/test_MapView.vue')
        },
        {
          path: 'create',
          name: 'create',
          component: () => import('../views/test_CreateObservationView.vue')
        },
        {
          path: 'observations/:id',
          name: 'observation-detail',
          component: () => import('../views/test_ObservationDetailView.vue')
        },
        {
          path: 'profile/:userId?',
          name: 'profile',
          component: () => import('../views/test_UserProfileView.vue')
        }
      ]
    },

    // Old routes (keep for compatibility)
    {
      path: '/home',
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

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const userIsAuthenticated = isAuthenticated()

  if (requiresAuth && !userIsAuthenticated) {
    // Redirect to auth if not authenticated
    next('/auth')
  } else if (to.path === '/auth' && userIsAuthenticated) {
    // Redirect to feed if already authenticated
    next('/feed')
  } else {
    next()
  }
})

export default router
