<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px"
        persistent>
        <v-card>
            <v-card-title class="dialog-title">
                <v-icon left>{{ item ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
                {{ item ? 'Editar Item' : 'Adicionar Item' }}
            </v-card-title>

            <v-card-text>
                <v-form ref="formRef" v-model="isFormValid">
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="form.productId" :items="products" item-title="name" item-value="id"
                                label="Produto *" variant="outlined" prepend-inner-icon="mdi-package-variant"
                                :rules="[rules.required]" no-data-text="Nenhum produto encontrado"></v-select>
                        </v-col>

                        <v-col cols="6">
                            <v-text-field v-model.number="form.quantity" label="Quantidade *" type="number" min="1"
                                variant="outlined" prepend-inner-icon="mdi-numeric"
                                :rules="[rules.required, rules.quantity]"></v-text-field>
                        </v-col>

                        <v-col cols="6">
                            <v-text-field :model-value="calculatedTotal" label="Subtotal" readonly variant="outlined"
                                prepend-inner-icon="mdi-currency-usd"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="$emit('cancel')" variant="text">
                    Cancelar
                </v-btn>
                <v-btn color="primary" @click="handleSave" :disabled="!isFormValid || loading" :loading="loading">
                    {{ item ? 'Salvar' : 'Adicionar' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api, type Product, type OrderItem } from '../services/api'
import { useNotifications } from '../composables/useNotifications'

interface Props {
    modelValue: boolean
    item?: OrderItem | null
    products: Product[]
    loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [data: { productId: string; quantity: number }]
    'cancel': []
}>()

const formRef = ref()
const isFormValid = ref(false)

const form = ref({
    productId: null as number | null,
    quantity: 1
})

const rules = {
    required: (value: any) => !!value || 'Campo obrigatório',
    quantity: (value: number) => (value > 0) || 'Quantidade deve ser maior que zero'
}

const selectedProduct = computed(() => {
    if (!form.value.productId) return null
    return props.products.find(p => p.id === form.value.productId)
})

const calculatedTotal = computed(() => {
    if (!form.value.productId || !form.value.quantity) return 'R$ 0,00'

    const product = selectedProduct.value
    if (!product) return 'R$ 0,00'

    const total = product.price * form.value.quantity
    return `R$ ${total.toFixed(2).replace('.', ',')}`
})

const handleSave = () => {
    if (isFormValid.value && form.value.productId) {

        emit('save', {
            productId: form.value.productId.toString(),
            quantity: form.value.quantity
        })
    }
}

// Watch for item changes to populate form
watch(() => props.item, (newItem) => {
    if (newItem && newItem.product) {
        // Usar o ID do produto diretamente
        const productId = newItem.product.id

        form.value = {
            productId: productId,
            quantity: newItem.quantity
        }

    } else {
        // Resetar formulário para novo item
        form.value = { productId: null, quantity: 1 }
    }
}, { immediate: true, deep: true })
</script>

<style scoped>
.dialog-title {
    background: linear-gradient(45deg, #1976d2, #42a5f5);
    color: white;
}
</style>