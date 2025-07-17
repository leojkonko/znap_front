<template>
    <v-data-table :headers="headers" :items="orders" :loading="loading" class="elevation-1"
        no-data-text="Nenhum pedido encontrado" loading-text="Carregando pedidos...">
        <template v-slot:[`item.customer`]="{ item }">
            {{ item.customer?.name || 'Cliente não encontrado' }}
        </template>

        <template v-slot:[`item.itemsCount`]="{ item }">
            <v-chip color="info" size="small" variant="flat">
                {{ item.itemsCount }} {{ item.itemsCount === 1 ? 'item' : 'itens' }}
            </v-chip>
        </template>

        <template v-slot:[`item.total`]="{ item }">
            R$ {{ formatCurrency(item.total) }}
        </template>

        <template v-slot:[`item.date`]="{ item }">
            {{ formatDate(item.date) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
            <div class="action-buttons">
                <v-tooltip text="Ver itens do pedido">
                    <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-eye" size="small" color="info" variant="text" v-bind="props"
                            @click="$emit('view-items', item)"></v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Editar pedido">
                    <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" v-bind="props"
                            @click="$emit('edit', item)"></v-btn>
                    </template>
                </v-tooltip>

                <v-tooltip text="Excluir pedido">
                    <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-delete" size="small" color="error" variant="text" v-bind="props"
                            @click="$emit('delete', item.id)"></v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import type { Order } from '../services/api'

interface Props {
    orders: Order[]
    loading: boolean
}

defineProps<Props>()

defineEmits<{
    'view-items': [order: Order]
    'edit': [order: Order]
    'delete': [id: number]
}>()

const headers = [
    { title: 'ID', key: 'id', sortable: true, width: '80px' },
    { title: 'Cliente', key: 'customer', sortable: true },
    { title: 'Itens', key: 'itemsCount', sortable: true, width: '120px' },
    { title: 'Total', key: 'total', sortable: true, width: '120px' },
    { title: 'Data', key: 'date', sortable: true, width: '120px' },
    { title: 'Ações', key: 'actions', sortable: false, width: '150px' }
]

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
</script>

<style scoped>
.action-buttons {
    display: flex;
    gap: 4px;
}
</style>