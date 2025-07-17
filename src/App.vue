<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark elevation="4">
      <v-app-bar-title class="app-title">
        <v-icon left size="28">mdi-store</v-icon>
        Sistema de Pedidos
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn icon to="/" title="Home">
        <v-icon>mdi-home</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer app permanent width="280" class="nav-drawer">
      <v-list nav class="nav-list">
        <v-list-item
          v-for="route in navigationRoutes"
          :key="route.path"
          :to="route.path"
          :exact="route.exact"
          class="nav-item"
        >
          <template v-slot:prepend>
            <v-icon :color="route.iconColor">{{ route.icon }}</v-icon>
          </template>
          <v-list-item-title class="nav-title">{{ route.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </v-main>

    <!-- Notification System -->
    <NotificationSystem />
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import NotificationSystem from '@/components/NotificationSystem.vue'

// Navigation routes configuration
const navigationRoutes = computed(() => [
  {
    path: '/',
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    iconColor: 'primary',
    exact: true
  },
  {
    path: '/products',
    title: 'Produtos',
    icon: 'mdi-package-variant',
    iconColor: 'blue',
    exact: false
  },
  {
    path: '/clients',
    title: 'Clientes',
    icon: 'mdi-account-group',
    iconColor: 'green',
    exact: false
  },
  {
    path: '/orders',
    title: 'Pedidos',
    icon: 'mdi-cart',
    iconColor: 'orange',
    exact: false
  }
])
</script>

<style scoped>
.app-title {
  font-weight: 500;
  font-size: 1.2rem;
}

.nav-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.nav-list {
  padding-top: 16px;
}

.nav-item {
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.nav-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

.nav-item.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.12);
  color: #1976d2;
}

.nav-title {
  font-weight: 500;
}

.main-content {
  background-color: #f5f5f5;
  height: 100vh;
}

.content-wrapper {
  width: 100%;
  min-height: 100%;
  padding: 24px;
}

@media (max-width: 960px) {
  .content-wrapper {
    padding: 16px;
  }
}
</style>
