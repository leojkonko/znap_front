<template>
  <div class="orders-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Pedidos</h1>
      <v-btn color="primary" @click="openCreateDialog" prepend-icon="mdi-plus">
        Novo Pedido
      </v-btn>
    </div>

    <!-- Orders Data Table -->
    <v-card elevation="2">
      <v-card-title class="card-header">
        <v-icon left>mdi-cart</v-icon>
        Lista de Pedidos
      </v-card-title>

      <!-- Filtro de Clientes -->
      <v-card-text class="pb-0 mt-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-select v-model="selectedClientFilter" :items="clientFilterOptions" item-title="name" item-value="id"
              label="Filtrar por cliente" prepend-icon="mdi-account-filter" clearable variant="outlined"
              density="compact" @update:model-value="filterOrders">
              <template v-slot:prepend-item>
                <v-list-item title="Todos os clientes" :active="selectedClientFilter === null"
                  @click="clearClientFilter">
                  <template v-slot:prepend>
                    <v-icon>mdi-account-multiple</v-icon>
                  </template>
                </v-list-item>
                <v-divider></v-divider>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="8" class="d-flex align-center">
            <v-chip v-if="selectedClientFilter" color="primary" variant="outlined" closable
              @click:close="clearClientFilter">
              <v-icon start>mdi-filter</v-icon>
              {{ getSelectedClientName() }}
            </v-chip>
            <span v-if="filteredOrders.length !== orders.length" class="text-caption ml-2">
              Mostrando {{ filteredOrders.length }} de {{ orders.length }} pedidos
            </span>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text>
        <OrdersList :orders="filteredOrders" :loading="loading" @view-items="viewOrderItems" @edit="editOrder"
          @delete="deleteOrder" />
      </v-card-text>
    </v-card>

    <!-- Order Form Dialog -->
    <OrderForm v-model="orderDialog" :order="editingOrder" :clients="clients" :products="products" :loading="saving"
      @save="saveOrder" @cancel="closeOrderDialog" @view-items="viewItemsFromForm" />

    <!-- Order Items Modal -->
    <OrderItemsModal v-model="itemsDialog" :order="selectedOrder" @add-item="openCreateItemDialog" @edit-item="editItem"
      @edit-order="editOrderFromModal" @delete-item="deleteItem" @close="closeItemsDialog" />

    <!-- Order Item Form Dialog -->
    <OrderItemForm v-model="itemDialog" :item="editingItem" :products="products" :loading="saving" @save="saveItem"
      @cancel="closeItemDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { orderService, clientService, productService } from '../services/api'
import type { Order, OrderItem, Client, Product } from '../services/api'
import { useNotifications } from '../composables/useNotifications'
import OrdersList from '../components/OrdersList.vue'
import OrderForm from '../components/OrderForm.vue'
import OrderItemsModal from '../components/OrderItemsModal.vue'
import OrderItemForm from '../components/OrderItemForm.vue'

const { showSuccess, showError } = useNotifications()

// Router
const router = useRouter()

// Reactive state
const orders = ref<Order[]>([])
const clients = ref<Client[]>([])
const products = ref<Product[]>([])
const loading = ref(false)
const saving = ref(false)

// Filtro de clientes
const selectedClientFilter = ref<number | null>(null)
const filteredOrders = ref<Order[]>([])

// Dialogs
const orderDialog = ref(false)
const itemsDialog = ref(false)
const itemDialog = ref(false)

// Form states
const editingOrder = ref<Order | null>(null)
const editingItem = ref<OrderItem | null>(null)
const selectedOrder = ref<Order | null>(null)

// Computed properties para o filtro
const clientFilterOptions = computed(() => {
  return clients.value.map(client => ({
    id: client.id,
    name: client.name
  }))
})

// Methods
const filterOrders = () => {
  if (selectedClientFilter.value === null) {
    filteredOrders.value = [...orders.value]
  } else {
    filteredOrders.value = orders.value.filter(order =>
      order.customer?.id === selectedClientFilter.value
    )
  }
}

const clearClientFilter = () => {
  selectedClientFilter.value = null
  filterOrders()
}

const getSelectedClientName = () => {
  if (!selectedClientFilter.value) return ''
  const client = clients.value.find(c => c.id === selectedClientFilter.value)
  return client?.name || ''
}

const loadData = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const [ordersData, clientsData, productsData] = await Promise.all([
      orderService.getAll(),
      clientService.getAll(),
      productService.getAll()
    ])

    orders.value = ordersData || []
    clients.value = clientsData || []
    products.value = productsData || []

    // Aplicar filtro após carregar os dados
    filterOrders()

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    showError('Erro ao carregar dados', 'Não foi possível carregar os dados necessários')
    orders.value = []
    clients.value = []
    products.value = []
    filteredOrders.value = []
  } finally {
    loading.value = false
  }
}

// Order management
const openCreateDialog = () => {
  // Navegar para a rota de criação de pedido
  router.push('/orders/new')
}

const editOrder = (order: Order) => {
  // Navegar para a rota de edição específica do pedido
  router.push(`/orders/${order.id}/edit`)
}

const closeOrderDialog = () => {
  orderDialog.value = false
  editingOrder.value = null
}

const saveOrder = async (data: { clientId: string; productId?: string; quantity?: number }) => {
  if (saving.value) return

  try {
    saving.value = true

    if (editingOrder.value) {
      // Para edição, atualizar apenas o cliente (dados básicos do pedido)
      await orderService.update(editingOrder.value.id, { clientId: data.clientId })
      showSuccess('Dados do pedido atualizados', 'Cliente do pedido foi atualizado com sucesso')
    } else {
      // Para criação, usar todos os dados para criar pedido com primeiro item
      if (!data.productId || !data.quantity) {
        showError('Dados incompletos', 'É necessário informar produto e quantidade para criar um pedido')
        return
      }

      // Buscar o preço do produto selecionado
      const selectedProduct = products.value.find(p => p.id === parseInt(data.productId!))
      if (!selectedProduct) {
        showError('Produto não encontrado', 'O produto selecionado não foi encontrado')
        return
      }

      // Formatar dados no formato correto para a API
      const orderData = {
        customerId: parseInt(data.clientId),
        items: [
          {
            productId: parseInt(data.productId),
            quantity: data.quantity,
            price: selectedProduct.price
          }
        ]
      }

      await orderService.create(orderData)
      showSuccess('Pedido criado', 'Pedido foi criado com sucesso')
    }

    await loadData()
    closeOrderDialog()
  } catch (error) {
    console.error('Erro ao salvar pedido:', error)
    showError(
      editingOrder.value ? 'Erro ao atualizar pedido' : 'Erro ao criar pedido',
      'Verifique os dados e tente novamente'
    )
  } finally {
    saving.value = false
  }
}

const deleteOrder = async (id: number) => {
  const order = orders.value.find(o => o.id === id)
  const orderDescription = order ? `Pedido #${order.id}` : 'Pedido'

  if (confirm(`Tem certeza que deseja excluir o ${orderDescription}?`)) {
    try {
      loading.value = true
      await orderService.delete(id.toString())
      showSuccess('Pedido excluído', `${orderDescription} foi excluído com sucesso`)
      await loadData()
    } catch (error) {
      console.error('Erro ao excluir pedido:', error)
      showError('Erro ao excluir pedido', 'Não foi possível excluir o pedido')
    } finally {
      loading.value = false
    }
  }
}

// Order items management
const viewOrderItems = (order: Order) => {
  selectedOrder.value = order
  itemsDialog.value = true
}

const closeItemsDialog = () => {
  itemsDialog.value = false
  selectedOrder.value = null
}

const openCreateItemDialog = () => {
  editingItem.value = null
  itemDialog.value = true
}

const editItem = (item: OrderItem) => {
  // Fechar o modal de itens se estiver aberto
  if (itemsDialog.value) {
    itemsDialog.value = false
  }
  // Redirecionar para a tela de edição do pedido
  if (selectedOrder.value) {
    router.push(`/orders/${selectedOrder.value.id}/edit`)
  }
}

const closeItemDialog = () => {
  itemDialog.value = false
  editingItem.value = null
}

const saveItem = async (data: { productId: string; quantity: number }) => {
  if (saving.value) return

  try {
    saving.value = true

    if (editingItem.value) {
      await orderService.updateItem(selectedOrder.value!.id, editingItem.value.id, data)
      showSuccess('Item atualizado', 'Item foi atualizado com sucesso')
    } else {
      await orderService.createItem(selectedOrder.value!.id, data)
      showSuccess('Item adicionado', 'Item foi adicionado ao pedido com sucesso')
    }

    // Recarregar dados do pedido selecionado
    if (selectedOrder.value) {
      const updatedOrder = await orderService.getById(selectedOrder.value.id)
      selectedOrder.value = updatedOrder

      // Atualizar também na lista principal
      const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value!.id)
      if (orderIndex !== -1) {
        orders.value[orderIndex] = updatedOrder
      }
    }

    closeItemDialog()
  } catch (error) {
    console.error('Erro ao salvar item:', error)
    showError(
      editingItem.value ? 'Erro ao atualizar item' : 'Erro ao adicionar item',
      'Verifique os dados e tente novamente'
    )
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id: number) => {
  const item = selectedOrder.value?.items.find(i => i.id === id)
  const itemDescription = item ? `Item #${item.id}` : 'Item'

  if (confirm(`Tem certeza que deseja excluir o ${itemDescription}?`)) {
    try {
      loading.value = true
      await orderService.deleteItem(selectedOrder.value!.id, id)
      showSuccess('Item excluído', `${itemDescription} foi excluído com sucesso`)

      // Atualizar dados do pedido selecionado
      if (selectedOrder.value) {
        const updatedOrder = await orderService.getById(selectedOrder.value.id)
        selectedOrder.value = updatedOrder

        // Atualizar também na lista principal
        const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value!.id)
        if (orderIndex !== -1) {
          orders.value[orderIndex] = updatedOrder
        }
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error)
      showError('Erro ao excluir item', 'Não foi possível excluir o item')
    } finally {
      loading.value = false
    }
  }
}

// Método para editar pedido a partir do modal de itens
const editOrderFromModal = () => {
  if (selectedOrder.value) {
    // Fechar o modal de itens
    itemsDialog.value = false
    // Navegar para a rota de edição
    router.push(`/orders/${selectedOrder.value.id}/edit`)
  }
}

// Método para abrir modal de itens a partir do formulário de edição
const viewItemsFromForm = () => {
  if (editingOrder.value) {
    selectedOrder.value = editingOrder.value
    orderDialog.value = false  // Fechar o formulário de edição
    itemsDialog.value = true   // Abrir modal de itens
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.orders-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 16px;
}

.page-title {
  font-size: 2rem;
  font-weight: 300;
  color: #1976d2;
  margin: 0;
}

.card-header {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  color: white;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .page-title {
    text-align: center;
    font-size: 1.5rem;
  }
}
</style>