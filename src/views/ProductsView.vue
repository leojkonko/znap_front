<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Produtos</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Lista de Produtos
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Novo Produto
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table :headers="headers" :items="products" :loading="loading" class="elevation-1">
              <template v-slot:[`item.price`]="{ item }">
                R$ {{ item.price.toFixed(2) }}
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon size="small" @click="editProduct(item)" class="me-2">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" color="error" @click="deleteProduct(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para criar/editar produto -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="productForm.name" label="Nome do Produto *"
              :placeholder="editingProduct ? 'Digite o nome do produto' : 'Nome do produto'" :rules="[rules.required]"
              required variant="outlined"></v-text-field>

            <v-text-field v-model="productForm.price" label="Preço *" type="number" step="0.01"
              :placeholder="editingProduct ? 'Digite o preço' : 'Preço do produto'"
              :rules="[rules.required, rules.price]" required variant="outlined" prefix="R$"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveProduct" :disabled="!valid">
            {{ editingProduct ? 'Salvar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { productService, type Product } from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

const { showSuccess, showError } = useNotifications()

const products = ref<Product[]>([])
const loading = ref(false)
const dialog = ref(false)
const valid = ref(false)
const editingProduct = ref<Product | null>(null)
const form = ref()

const productForm = ref({
  name: '',
  price: 0
})

watch(dialog, async (newValue) => {
  if (newValue && editingProduct.value) {
    await nextTick()
    productForm.value = {
      name: editingProduct.value.name,
      price: editingProduct.value.price
    }
    if (form.value) {
      form.value.resetValidation()
    }
  }
})

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Preço', key: 'price' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  price: (value: number) => value > 0 || 'Preço deve ser maior que zero'
}

const loadProducts = async () => {
  loading.value = true
  try {
    const data = await productService.getAll()
    products.value = data
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    showError('Erro ao carregar produtos', 'Não foi possível carregar a lista de produtos')
    products.value = []
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingProduct.value = null
  productForm.value = { name: '', price: 0 }
  dialog.value = true
}

const editProduct = async (product: Product) => {
  editingProduct.value = { ...product }

  productForm.value = {
    name: product.name,
    price: Number(product.price)
  }

  dialog.value = true

  await nextTick()
  if (form.value) {
    form.value.resetValidation()
  }
}

const closeDialog = () => {
  dialog.value = false
  editingProduct.value = null
  productForm.value = { name: '', price: 0 }
}

const saveProduct = async () => {
  try {
    const productData = {
      name: productForm.value.name,
      price: Number(productForm.value.price)
    }

    if (editingProduct.value) {
      await productService.update(editingProduct.value.id.toString(), productData)
      showSuccess('Produto atualizado', `Produto "${productForm.value.name}" foi atualizado com sucesso`)
    } else {
      await productService.create(productData)
      showSuccess('Produto criado', `Produto "${productForm.value.name}" foi criado com sucesso`)
    }
    await loadProducts()
    closeDialog()
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    showError(
      editingProduct.value ? 'Erro ao atualizar produto' : 'Erro ao criar produto',
      'Verifique os dados e tente novamente'
    )
  }
}

const deleteProduct = async (id: number) => {
  const product = products.value.find(p => p.id === id)
  const productName = product?.name || 'Produto'

  if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
    try {
      await productService.delete(id.toString())
      showSuccess('Produto excluído', `Produto "${productName}" foi excluído com sucesso`)
      await loadProducts()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      showError('Erro ao excluir produto', 'Não foi possível excluir o produto')
    }
  }
}

onMounted(() => {
  loadProducts()
})
</script>