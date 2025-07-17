<template>
    <div class="order-edit-page">
        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-3"></v-btn>
                <div>
                    <h1 class="page-title">{{ isCreating ? 'Criar Novo Pedido' : `Editar Pedido #${order?.id}` }}</h1>
                    <p class="page-subtitle" v-if="isCreating || order">
                        Cliente: {{ selectedClientName || (order?.customer?.name) }} |
                        {{ localItems.length }} {{ localItems.length === 1 ? 'item' : 'itens' }} |
                        Total: R$ {{ formatCurrency(calculateLocalTotal()) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4">{{ isCreating ? 'Carregando dados...' : 'Carregando dados do pedido...' }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <h3 class="mt-4">{{ isCreating ? 'Erro ao carregar dados' : 'Erro ao carregar pedido' }}</h3>
            <p>{{ error }}</p>
            <v-btn color="primary" @click="loadData" class="mt-4">
                Tentar novamente
            </v-btn>
        </div>

        <!-- Main Content -->
        <div v-else-if="isCreating || order">
            <v-form ref="orderFormRef" v-model="isOrderFormValid">
                <v-row>
                    <!-- Order Info Card -->
                    <v-col cols="12" md="4">
                        <v-card class="mb-4">
                            <v-card-title class="card-header">
                                <v-icon left>mdi-information</v-icon>
                                Dados do Pedido
                            </v-card-title>
                            <v-card-text>
                                <v-select v-model="editOrderForm.clientId" :items="clients" item-title="name"
                                    item-value="id" label="Cliente *" variant="outlined"
                                    prepend-inner-icon="mdi-account" :rules="[rules.required]" class="mb-3" clearable>
                                </v-select>

                                <v-text-field 
                                    :model-value="isCreating ? formatDate(new Date().toISOString()) : (order ? formatDate(order.date) : '')" 
                                    label="Data do Pedido"
                                    readonly variant="outlined" prepend-inner-icon="mdi-calendar" class="mb-4">
                                </v-text-field>

                                <!-- Botão Salvar Pedido -->
                                <v-btn color="success" size="large" @click="saveCompleteOrder" :loading="saving"
                                    :disabled="!isOrderFormValid || localItems.length === 0"
                                    prepend-icon="mdi-content-save" class="w-100" block>
                                    {{ isCreating ? 'Criar Pedido' : 'Salvar Pedido' }}
                                </v-btn>
                            </v-card-text>
                        </v-card>

                        <!-- Order Summary -->
                        <v-card>
                            <v-card-title class="card-header">
                                <v-icon left>mdi-chart-box</v-icon>
                                Resumo
                            </v-card-title>
                            <v-card-text>
                                <div class="summary-item">
                                    <strong>Total de Itens:</strong>
                                    <span>{{ localItems.length }}</span>
                                </div>
                                <div class="summary-item">
                                    <strong>Valor Total:</strong>
                                    <span>R$ {{ formatCurrency(calculateLocalTotal()) }}</span>
                                </div>
                                <div class="summary-item">
                                    <strong>{{ isCreating ? 'Data' : 'Última Atualização' }}:</strong>
                                    <span>{{ isCreating ? formatDate(new Date().toISOString()) : (order ? formatDate(order.date) : '') }}</span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <!-- Items Management -->
                    <v-col cols="12" md="8">
                        <v-card>
                            <v-card-title class="card-header">
                                <v-icon left>mdi-cart</v-icon>
                                Itens do Pedido
                                <v-spacer></v-spacer>
                                <v-btn color="white" variant="outlined" @click="openCreateItemDialog"
                                    prepend-icon="mdi-plus">
                                    Adicionar Item
                                </v-btn>
                            </v-card-title>

                            <v-card-text>
                                <v-data-table :headers="itemsHeaders" :items="localItems" class="elevation-1"
                                    no-data-text="Nenhum item encontrado">
                                    <template v-slot:[`item.product`]="{ item }">
                                        {{ item.product?.name || getProductName(item.product?.id) }}
                                    </template>

                                    <template v-slot:[`item.price`]="{ item }">
                                        R$ {{ formatCurrency(item.price || getProductPrice(item.product?.id)) }}
                                    </template>

                                    <template v-slot:[`item.subtotal`]="{ item }">
                                        R$ {{ formatCurrency((item.price || getProductPrice(item.product?.id)) *
                                            item.quantity) }}
                                    </template>

                                    <template v-slot:[`item.actions`]="{ item, index }">
                                        <div class="action-buttons">
                                            <v-tooltip text="Editar item">
                                                <template v-slot:activator="{ props }">
                                                    <v-btn icon="mdi-pencil" size="small" color="primary" variant="text"
                                                        v-bind="props" @click="editLocalItem(item, index)"></v-btn>
                                                </template>
                                            </v-tooltip>

                                            <v-tooltip text="Excluir item">
                                                <template v-slot:activator="{ props }">
                                                    <v-btn icon="mdi-delete" size="small" color="error" variant="text"
                                                        v-bind="props" @click="deleteLocalItem(index)"></v-btn>
                                                </template>
                                            </v-tooltip>
                                        </div>
                                    </template>
                                </v-data-table>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-form>
        </div>

        <!-- Item Form Dialog -->
        <OrderItemForm v-model="itemDialog" :item="editingItem" :products="products" :loading="saving" @save="saveItem"
            @cancel="closeItemDialog" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService, clientService, productService } from '@/services/api'
import type { Order, OrderItem, Client, Product } from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import OrderItemForm from '@/components/OrderItemForm.vue'

const route = useRoute()
const router = useRouter()
const { showSuccess, showError } = useNotifications()

// Reactive state
const order = ref<Order | null>(null)
const clients = ref<Client[]>([])
const products = ref<Product[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

// Form states
const itemDialog = ref(false)
const editingItem = ref<OrderItem | null>(null)
const editingItemIndex = ref<number>(-1)
const isOrderFormValid = ref(false)

// Estado local dos itens (para edição antes de salvar)
const localItems = ref<OrderItem[]>([])

const editOrderForm = ref({
    clientId: null as number | null
})

// Table headers
const itemsHeaders = [
    { title: 'ID', key: 'id', sortable: true, width: '80px' },
    { title: 'Produto', key: 'product', sortable: true },
    { title: 'Quantidade', key: 'quantity', sortable: true, width: '120px' },
    { title: 'Preço Unit.', key: 'price', sortable: true, width: '120px' },
    { title: 'Subtotal', key: 'subtotal', sortable: true, width: '120px' },
    { title: 'Ações', key: 'actions', sortable: false, width: '120px' }
]

// Validation rules
const rules = {
    required: (value: any) => !!value || 'Campo obrigatório'
}

// Computed
const orderId = computed(() => route.params.id as string)
const isCreating = computed(() => !orderId.value || orderId.value === 'new')

const selectedClientName = computed(() => {
    if (!editOrderForm.value.clientId) return ''
    const client = clients.value.find(c => c.id === editOrderForm.value.clientId)
    return client ? client.name : ''
})

// Helper functions
const formatCurrency = (value: number) => {
    return value?.toFixed(2).replace('.', ',') || '0,00'
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'Data inválida'
    try {
        return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
        return 'Data inválida'
    }
}

// Methods
const loadData = async () => {
    if (isCreating.value) {
        await loadBasicData()
    } else {
        await loadOrderData()
    }
}

const loadBasicData = async () => {
    loading.value = true
    error.value = null

    try {
        const [clientsData, productsData] = await Promise.all([
            clientService.getAll(),
            productService.getAll()
        ])

        clients.value = clientsData || []
        products.value = productsData || []
        
        // Initialize empty form for creation
        editOrderForm.value.clientId = null
        localItems.value = []

    } catch (err) {
        console.error('Erro ao carregar dados:', err)
        error.value = 'Não foi possível carregar os dados necessários'
        showError('Erro ao carregar dados', 'Não foi possível carregar os dados necessários')
    } finally {
        loading.value = false
    }
}

const loadOrderData = async () => {
    loading.value = true
    error.value = null

    try {
        const [orderData, clientsData, productsData] = await Promise.all([
            orderService.getById(orderId.value),
            clientService.getAll(),
            productService.getAll()
        ])

        order.value = orderData
        clients.value = clientsData || []
        products.value = productsData || []

        // Populate form with order data
        if (orderData) {
            // Manter o clientId como number para corresponder aos IDs da lista
            const clientId = orderData.customer?.id
            editOrderForm.value.clientId = clientId || null

            localItems.value = orderData.items.map(item => ({
                ...item
            }))
        }

    } catch (err) {
        console.error('Erro ao carregar dados do pedido:', err)
        error.value = 'Não foi possível carregar os dados do pedido'
        showError('Erro ao carregar pedido', 'Não foi possível carregar os dados do pedido')
    } finally {
        loading.value = false
    }
}

// Item management
const openCreateItemDialog = () => {
    editingItem.value = null
    itemDialog.value = true
}

const closeItemDialog = () => {
    itemDialog.value = false
    editingItem.value = null
}

const editLocalItem = (item: any, index: number) => {
    // Usar apenas item.product.id para obter o ID do produto
    const productId = item.product?.id
    const product = products.value.find(p => p.id === productId)

    editingItem.value = {
        id: item.id,
        product: {
            id: productId,
            name: item.product?.name || getProductName(productId)
        },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
    }
    editingItemIndex.value = index

    itemDialog.value = true
}

const deleteLocalItem = (index: number) => {
    const item = localItems.value[index]
    const productId = item.product?.id
    const itemDescription = `Item ${item.product?.name || getProductName(productId)}`

    if (confirm(`Tem certeza que deseja excluir o ${itemDescription}?`)) {
        localItems.value.splice(index, 1)
        showSuccess('Item removido', `${itemDescription} foi removido da lista`)
    }
}

const saveItem = async (data: { productId: string; quantity: number }) => {
    try {
        saving.value = true

        if (editingItemIndex.value >= 0) {
            // Editando item existente - fazer requisição imediata à API
            const item = localItems.value[editingItemIndex.value]
            const productId = parseInt(data.productId)
            const product = products.value.find(p => p.id === productId)

            if (product && order.value) {
                // Atualizar item local primeiro
                const updatedItem = {
                    ...item,
                    product: { id: productId, name: product.name },
                    quantity: data.quantity,
                    price: product.price,
                    subtotal: product.price * data.quantity
                }

                localItems.value[editingItemIndex.value] = updatedItem

                // Preparar dados para envio à API (todos os itens atualizados)
                const updateData = {
                    date: order.value.date,
                    customerId: editOrderForm.value.clientId!,
                    items: localItems.value.map(localItem => ({
                        productId: localItem.product?.id || 0,
                        quantity: localItem.quantity,
                        price: localItem.price || 0
                    }))
                }

                // Fazer requisição à API
                await orderService.update(order.value.id, updateData)

                showSuccess('Item atualizado', 'Item foi atualizado e salvo na API com sucesso')

                // Recarregar dados para manter sincronizado
                await loadOrderData()
            }
        } else {
            // Adicionando novo item - verificar se já existe o mesmo produto
            const productId = parseInt(data.productId)
            const product = products.value.find(p => p.id === productId)

            if (product) {
                // Verificar se já existe um item com o mesmo produto
                const existingItemIndex = localItems.value.findIndex(item => 
                    item.product?.id === productId
                )

                if (existingItemIndex >= 0) {
                    // Produto já existe - aumentar a quantidade
                    const existingItem = localItems.value[existingItemIndex]
                    const newQuantity = existingItem.quantity + data.quantity
                    
                    localItems.value[existingItemIndex] = {
                        ...existingItem,
                        quantity: newQuantity,
                        subtotal: product.price * newQuantity
                    }
                    
                    showSuccess('Quantidade atualizada', `Quantidade do produto ${product.name} foi aumentada para ${newQuantity}`)
                } else {
                    // Produto não existe - criar novo item
                    const newItem = {
                        id: Date.now(), // ID temporário para novos itens
                        product: { id: productId, name: product.name },
                        quantity: data.quantity,
                        price: product.price,
                        subtotal: product.price * data.quantity
                    }
                    localItems.value.push(newItem)
                    showSuccess('Item adicionado', 'Item foi adicionado à lista (salve o pedido para confirmar)')
                }
            }
        }

        editingItemIndex.value = -1
        closeItemDialog()
    } catch (error) {
        console.error('Erro ao salvar item:', error)
        showError('Erro ao salvar item', 'Não foi possível salvar as alterações do item')
    } finally {
        saving.value = false
    }
}

const saveCompleteOrder = async () => {
    if (saving.value || localItems.value.length === 0 || !editOrderForm.value.clientId) return

    try {
        saving.value = true

        const orderData = {
            date: new Date().toISOString(),
            customerId: editOrderForm.value.clientId,
            items: localItems.value.map(item => ({
                productId: item.product?.id || 0,
                quantity: item.quantity,
                price: item.price || getProductPrice(item.product?.id)
            }))
        }

        if (isCreating.value) {
            // Criar novo pedido
            const createdOrder = await orderService.create(orderData)
            showSuccess('Pedido criado', 'Pedido foi criado com sucesso')
            
            // Redirecionar para a listagem de pedidos
            router.push('/orders')
        } else {
            // Atualizar pedido existente
            await orderService.update(order.value!.id, orderData)
            showSuccess('Pedido salvo', 'Dados do pedido e todos os itens foram salvos com sucesso')
            
            // Recarregar dados para obter estado atualizado
            await loadOrderData()
        }
    } catch (error) {
        console.error('Erro ao salvar pedido:', error)
        const action = isCreating.value ? 'criar' : 'salvar'
        showError(`Erro ao ${action} pedido`, `Não foi possível ${action} o pedido`)
    } finally {
        saving.value = false
    }
}

const goBack = () => {
    router.push('/orders')
}

// New helper methods for local item management
const calculateLocalTotal = () => {
    return localItems.value.reduce((total, item) => {
        // Usar item.price se disponível, senão buscar pelo ID
        const price = item.price || getProductPrice(item.product?.id)
        return total + (price * item.quantity)
    }, 0)
}

const getProductName = (productId?: string | number) => {
    if (!productId) return 'Produto não encontrado'
    const id = typeof productId === 'string' ? parseInt(productId) : productId
    const product = products.value.find(p => p.id === id)
    return product ? product.name : 'Produto não encontrado'
}

const getProductPrice = (productId?: string | number) => {
    if (!productId) return 0
    const id = typeof productId === 'string' ? parseInt(productId) : productId
    const product = products.value.find(p => p.id === id)
    return product ? product.price : 0
}

// Lifecycle
onMounted(() => {
    loadData()
})
</script>

<style scoped>
.order-edit-page {
    padding: 0;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 0 16px;
}

.header-left {
    display: flex;
    align-items: center;
}

.page-title {
    font-size: 2rem;
    font-weight: 300;
    color: #1976d2;
    margin: 0;
}

.page-subtitle {
    font-size: 0.9rem;
    color: #666;
    margin: 4px 0 0 0;
}

.card-header {
    background: linear-gradient(45deg, #1976d2, #42a5f5);
    color: white;
    display: flex;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.summary-item:last-child {
    border-bottom: none;
}

.v-card-title+.v-card-text,
.v-card-title+.v-card-actions {
    padding-top: 1rem;
}

.save-card {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
    border: 2px solid #4caf50;
}

.save-button {
    width: 100%;
    max-width: 400px;
    padding: 16px;
    font-size: 1.125rem;
    font-weight: 600;
    text-transform: none;
    height: 100% !important;
}

@media (max-width: 960px) {
    .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }

    .header-left {
        width: 100%;
    }

    .page-title {
        font-size: 1.5rem;
    }
}
</style>