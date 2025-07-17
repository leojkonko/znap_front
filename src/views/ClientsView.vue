<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Clientes</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Lista de Clientes
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon left>mdi-plus</v-icon>
              Novo Cliente
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table :headers="headers" :items="clients" :loading="loading" class="elevation-1">
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon size="small" @click="editClient(item)" class="me-2">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" color="error" @click="deleteClient(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para criar/editar cliente -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingClient ? 'Editar Cliente' : 'Novo Cliente' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="clientForm.name" label="Nome do Cliente" :rules="[rules.required]"
              required></v-text-field>

            <v-text-field v-model="clientForm.email" label="E-mail" type="email" :rules="[rules.required, rules.email]"
              required></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveClient" :disabled="!valid">
            {{ editingClient ? 'Salvar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientService, type Client } from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

const { showSuccess, showError } = useNotifications()

const clients = ref<Client[]>([])
const loading = ref(false)
const dialog = ref(false)
const valid = ref(false)
const editingClient = ref<Client | null>(null)

const clientForm = ref({
  name: '',
  email: ''
})

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'E-mail', key: 'email' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'E-mail inválido'
  }
}

const loadClients = async () => {
  loading.value = true
  try {
    const data = await clientService.getAll()
    clients.value = data
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    showError('Erro ao carregar clientes', 'Não foi possível carregar a lista de clientes')
    clients.value = []
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingClient.value = null
  clientForm.value = { name: '', email: '' }
  dialog.value = true
}

const editClient = (client: Client) => {
  editingClient.value = client
  clientForm.value = {
    name: client.name,
    email: client.email
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingClient.value = null
}

const saveClient = async () => {
  try {
    if (editingClient.value) {
      await clientService.update(editingClient.value.id, clientForm.value)
      showSuccess('Cliente atualizado', `Cliente "${clientForm.value.name}" foi atualizado com sucesso`)
    } else {
      await clientService.create(clientForm.value)
      showSuccess('Cliente criado', `Cliente "${clientForm.value.name}" foi criado com sucesso`)
    }
    await loadClients()
    closeDialog()
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    showError(
      editingClient.value ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente',
      'Verifique os dados e tente novamente'
    )
  }
}

const deleteClient = async (id: string) => {
  const client = clients.value.find(c => c.id === id)
  const clientName = client?.name || 'Cliente'

  if (confirm(`Tem certeza que deseja excluir o cliente "${clientName}"?`)) {
    try {
      await clientService.delete(id)
      showSuccess('Cliente excluído', `Cliente "${clientName}" foi excluído com sucesso`)
      await loadClients()
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      showError('Erro ao excluir cliente', 'Não foi possível excluir o cliente')
    }
  }
}

onMounted(() => {
  loadClients()
})
</script>