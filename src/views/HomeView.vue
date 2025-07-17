<template>
  <div class="dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Visão geral do sistema</p>
    </div>

    <!-- Stats Cards -->
    <v-row class="stats-section">
      <v-col cols="12" sm="6" md="4" v-for="stat in statsCards" :key="stat.key">
        <v-card :color="stat.color" dark class="stat-card" elevation="4" hover>
          <v-card-text>
            <div class="stat-card-content">
              <div class="stat-icon">
                <v-icon size="40">{{ stat.icon }}</v-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">
                  <span v-if="loading">-</span>
                  <span v-else>{{ stats[stat.key] || 0 }}</span>
                </div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="actions-section">
      <v-col cols="12">
        <v-card elevation="2" class="actions-card">
          <v-card-title class="actions-title">
            <v-icon left>mdi-flash</v-icon>
            Ações Rápidas
          </v-card-title>
          <v-card-text class="actions-content">
            <v-row>
              <v-col cols="12" sm="6" md="4" v-for="action in quickActions" :key="action.route">
                <v-btn :color="action.color" :to="action.route" block size="large" elevation="2" class="action-btn">
                  <v-icon left>{{ action.icon }}</v-icon>
                  {{ action.label }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { productService, clientService, orderService } from '@/services/api' // Ajuste o caminho conforme necessário

// Reactive state
const stats = ref({
  products: 0,
  clients: 0,
  orders: 0
})

const loading = ref(true)

// Computed properties
const statsCards = computed(() => [
  {
    key: 'products' as keyof typeof stats.value,
    icon: 'mdi-package-variant',
    label: 'Produtos Cadastrados',
    color: 'primary'
  },
  {
    key: 'clients' as keyof typeof stats.value,
    icon: 'mdi-account-group',
    label: 'Clientes Cadastrados',
    color: 'success'
  },
  {
    key: 'orders' as keyof typeof stats.value,
    icon: 'mdi-cart',
    label: 'Pedidos Realizados',
    color: 'warning'
  }
])

const quickActions = computed(() => [
  {
    label: 'Novo Produto',
    icon: 'mdi-plus-circle',
    route: '/products',
    color: 'primary'
  },
  {
    label: 'Novo Cliente',
    icon: 'mdi-account-plus',
    route: '/clients',
    color: 'success'
  },
  {
    label: 'Novo Pedido',
    icon: 'mdi-cart-plus',
    route: '/orders',
    color: 'warning'
  }
])

// Methods
const loadStats = async () => {
  try {
    loading.value = true
    
    // Conectar com API real
    const [products, clients, orders] = await Promise.all([
      productService.getAll(),
      clientService.getAll(),
      orderService.getAll()
    ])
    
    stats.value = {
      products: products.length,
      clients: clients.length,
      orders: orders.length
    }
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    // Valores padrão em caso de erro
    stats.value = {
      products: 0,
      clients: 0,
      orders: 0
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
  width: 100%;
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 32px;
  text-align: center;
  padding: 16px 0;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: #1976d2;
  margin-bottom: 8px;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.actions-content {
  padding: 20px;
}

.stats-section {
  margin-bottom: 32px;
  padding: 0 16px;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.actions-section {
  margin-bottom: 32px;
  padding: 0 16px;
}

.actions-card {
  border-radius: 12px;
}

.actions-title {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  color: white;
  border-radius: 12px 12px 0 0;
}

.action-btn {
  height: 60px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.action-btn i {
  margin-right: 0.5rem;
}

.action-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .dashboard {
    padding: 0;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .stat-card-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .stats-section {
    padding: 0 8px;
  }

  .actions-section {
    padding: 0 8px;
  }
}
</style>
