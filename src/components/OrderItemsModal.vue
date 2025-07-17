<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1200px"
        persistent>
        <v-card>
            <v-card-title class="dialog-title">
                <v-icon left>mdi-cart</v-icon>
                Itens do Pedido #{{ order?.id }}
                <v-spacer></v-spacer>
            </v-card-title>

            <v-card-text>
                <!-- Order Info Summary -->
                <v-row class="mb-4">
                    <v-col cols="12">
                        <v-card variant="outlined" class="order-summary">
                            <v-card-text>
                                <v-row>
                                    <v-col cols="3">
                                        <strong>Cliente:</strong><br>
                                        {{ order?.customer?.name }}
                                    </v-col>
                                    <v-col cols="3">
                                        <strong>Data:</strong><br>
                                        {{ formatDate(order?.date) }}
                                    </v-col>
                                    <v-col cols="3">
                                        <strong>Total de Itens:</strong><br>
                                        {{ order?.itemsCount }}
                                    </v-col>
                                    <v-col cols="3">
                                        <strong>Valor Total:</strong><br>
                                        R$ {{ formatCurrency(order?.total) }}
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Items Data Table -->
                <v-data-table :headers="headers" :items="order?.items || []" class="elevation-1"
                    no-data-text="Nenhum item encontrado">
                    <template v-slot:[`item.product`]="{ item }">
                        {{ item.product?.name || 'Produto não encontrado' }}
                    </template>

                    <template v-slot:[`item.price`]="{ item }">
                        R$ {{ formatCurrency(item.price) }}
                    </template>

                    <template v-slot:[`item.subtotal`]="{ item }">
                        R$ {{ formatCurrency(item.subtotal) }}
                    </template>

                    <template v-slot:[`item.actions`]="{ item }">
                        <div class="action-buttons">
                            <v-tooltip text="Editar item">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" v-bind="props"
                                        @click="$emit('edit-item', item)"></v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="$emit('close')" color="primary">
                    Fechar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import type { Order, OrderItem } from '../services/api'

interface Props {
    modelValue: boolean
    order?: Order | null
}

defineProps<Props>()

defineEmits<{
    'update:modelValue': [value: boolean]
    'add-item': []
    'edit-item': [item: OrderItem]
    'edit-order': []
    'delete-item': [id: number]
    'close': []
}>()

const headers = [
    { title: 'ID', key: 'id', sortable: true, width: '80px' },
    { title: 'Produto', key: 'product', sortable: true },
    { title: 'Quantidade', key: 'quantity', sortable: true, width: '120px' },
    { title: 'Preço Unit.', key: 'price', sortable: true, width: '120px' },
    { title: 'Subtotal', key: 'subtotal', sortable: true, width: '120px' },
    { title: 'Ações', key: 'actions', sortable: false, width: '120px' }
]

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data inválida'
    try {
        return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
        return 'Data inválida'
    }
}

const formatCurrency = (value: number | undefined) => {
    return value?.toFixed(2).replace('.', ',') || '0,00'
}
</script>

<style scoped>
.dialog-title {
    background: linear-gradient(45deg, #1976d2, #42a5f5);
    color: white;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.order-summary {
    background-color: #f8f9fa;
}
</style>