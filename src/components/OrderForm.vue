<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600px"
        persistent>
        <v-card>
            <v-card-title class="dialog-title">
                <v-icon left>{{ order ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
                {{ order ? 'Editar Dados do Pedido' : 'Novo Pedido' }}
            </v-card-title>

            <v-card-text>
                <!-- Alert para modo de edição -->
                <v-alert v-if="order" type="info" variant="tonal" class="mb-4" icon="mdi-information">
                    Para editar os itens do pedido, use o botão "Ver Itens" na lista principal.
                    Aqui você pode alterar apenas o cliente do pedido.
                </v-alert>

                <v-form ref="formRef" v-model="isFormValid">
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="form.clientId" :items="clients" item-title="name" item-value="id"
                                label="Cliente *" variant="outlined" prepend-inner-icon="mdi-account"
                                :rules="[rules.required]" no-data-text="Nenhum cliente encontrado"></v-select>
                        </v-col>

                        <!-- Campos de produto apenas para criação -->
                        <template v-if="!order">
                            <v-col cols="12">
                                <v-select v-model="form.productId" :items="products" item-title="name" item-value="id"
                                    label="Produto Inicial *" variant="outlined"
                                    prepend-inner-icon="mdi-package-variant" :rules="[rules.required]"
                                    no-data-text="Nenhum produto encontrado"
                                    hint="Produto para o primeiro item do pedido"></v-select>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field v-model.number="form.quantity" label="Quantidade *" type="number" min="1"
                                    variant="outlined" prepend-inner-icon="mdi-numeric"
                                    :rules="[rules.required, rules.quantity]"></v-text-field>
                            </v-col>

                            <v-col cols="6">
                                <v-text-field :model-value="calculatedTotal" label="Valor Inicial" readonly
                                    variant="outlined" prepend-inner-icon="mdi-currency-usd"
                                    hint="Valor do primeiro item"></v-text-field>
                            </v-col>
                        </template>

                        <!-- Resumo para edição -->
                        <template v-else>
                            <v-col cols="12">
                                <v-card variant="outlined" class="order-summary">
                                    <v-card-text>
                                        <v-row>
                                            <v-col cols="6">
                                                <strong>Total de Itens:</strong><br>
                                                {{ order.itemsCount }}
                                            </v-col>
                                            <v-col cols="6">
                                                <strong>Valor Total:</strong><br>
                                                R$ {{ formatCurrency(order.total) }}
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </template>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="$emit('cancel')" variant="text">
                    Cancelar
                </v-btn>

                <!-- Botão para ver itens quando estiver editando -->
                <v-btn v-if="order" color="info" @click="handleViewItems" prepend-icon="mdi-eye">
                    Ver Itens
                </v-btn>

                <v-btn color="primary" @click="handleSave" :disabled="!isFormValid || loading" :loading="loading">
                    {{ order ? 'Salvar Cliente' : 'Criar Pedido' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Order, Client, Product } from '../services/api'

// Props
const props = defineProps<{
    modelValue: boolean
    order?: Order | null
    clients: Client[]
    products: Product[]
    loading?: boolean
}>()

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [data: { clientId: string; productId?: string; quantity?: number }]
    cancel: []
    'view-items': [order: Order]
}>()

const formRef = ref()
const isFormValid = ref(false)

const form = ref({
    clientId: '',
    productId: '',
    quantity: 1
})

const rules = {
    required: (value: any) => !!value || 'Campo obrigatório',
    quantity: (value: number) => (value > 0) || 'Quantidade deve ser maior que zero'
}

const calculatedTotal = computed(() => {
    if (!form.value.productId || !form.value.quantity || props.order) return 'R$ 0,00'

    const product = props.products.find(p => p.id.toString() === form.value.productId.toString())
    if (!product) return 'R$ 0,00'

    const total = product.price * form.value.quantity
    return `R$ ${total.toFixed(2).replace('.', ',')}`
})

const formatCurrency = (value: number) => {
    return value?.toFixed(2).replace('.', ',') || '0,00'
}

const handleSave = () => {
    if (isFormValid.value) {
        if (props.order) {
            // Para edição, enviar apenas o cliente
            emit('save', { clientId: form.value.clientId })
        } else {
            // Para criação, enviar todos os dados
            emit('save', {
                clientId: form.value.clientId,
                productId: form.value.productId,
                quantity: form.value.quantity
            })
        }
    }
}

const handleViewItems = () => {
    if (props.order) {
        emit('view-items', props.order)
    }
}

// Watch for order changes to populate form
watch(() => props.order, (newOrder) => {
    if (newOrder) {
        // Para edição, carregar apenas o cliente
        form.value = {
            clientId: newOrder.customer?.id?.toString() || '',
            productId: '',
            quantity: 1
        }
    } else {
        // Para criação, limpar todos os campos
        form.value = { clientId: '', productId: '', quantity: 1 }
    }
}, { immediate: true })
</script>

<style scoped>
.dialog-title {
    background: linear-gradient(45deg, #1976d2, #42a5f5);
    color: white;
}

.order-summary {
    background-color: #f8f9fa;
}
</style>