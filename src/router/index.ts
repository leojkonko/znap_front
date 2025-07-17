import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Route Components
import HomeView from '../views/HomeView.vue'

// Route definitions with metadata
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: HomeView,
    meta: {
      title: 'Dashboard',
      icon: 'mdi-view-dashboard',
      showInNav: true,
      requiresAuth: false
    }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('../views/ProductsView.vue'),
    meta: {
      title: 'Produtos',
      icon: 'mdi-package-variant',
      showInNav: true,
      requiresAuth: false
    }
  },
  {
    path: '/clients',
    name: 'clients',
    component: () => import('../views/ClientsView.vue'),
    meta: {
      title: 'Clientes',
      icon: 'mdi-account-group',
      showInNav: true,
      requiresAuth: false
    }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/OrdersView.vue'),
    meta: {
      title: 'Pedidos',
      icon: 'mdi-cart',
      showInNav: true,
      requiresAuth: false
    }
  },
  {
    path: '/orders/new',
    name: 'order-create',
    component: () => import('../views/OrderEditView.vue'),
    meta: {
      title: 'Novo Pedido',
      icon: 'mdi-cart-plus',
      showInNav: false,
      requiresAuth: false
    }
  },
  {
    path: '/orders/:id/edit',
    name: 'order-edit',
    component: () => import('../views/OrderEditView.vue'),
    meta: {
      title: 'Editar Pedido',
      icon: 'mdi-cart-edit',
      showInNav: false,
      requiresAuth: false
    }
  },
  // Catch-all route for 404s
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Página não encontrada',
      showInNav: false,
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta?.title 
    ? `${to.meta.title} - Sistema de Pedidos` 
    : 'Sistema de Pedidos'
  
  next()
})

export default router

// Export routes for use in navigation components
export { routes }
