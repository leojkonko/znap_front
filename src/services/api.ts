import axios from 'axios'

// Configuração da API usando variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Log da URL para debug em desenvolvimento
// if (import.meta.env.DEV) {
//   console.log('API Base URL:', API_BASE_URL)
// }

// Interfaces para tipagem
export interface Product {
  id: number  // Corrigido: API retorna number
  name: string
  price: number
  description?: string
  createdAt?: string  // Adicionado: API retorna estes campos
  updatedAt?: string  // Adicionado: API retorna estes campos
}

export interface Client {
  id: number  // Corrigido: API retorna number
  name: string
  email: string
  phone?: string
}

export interface OrderItem {
  id: number
  product: {
    id: number
    name: string
  }
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number  // Corrigido: API retorna number
  date: string
  customer: {
    id: number
    name: string
    email: string
  }
  itemsCount: number
  total: number
  items: OrderItem[]
}

export interface CreateProductData {
  name: string
  price: number
  description?: string
}

export interface CreateClientData {
  name: string
  email: string
  phone?: string
}

export interface CreateOrderData {
  customerId: number
  items: {
    productId: number
    quantity: number
    price: number
  }[]
}

export interface UpdateOrderData {
  clientId: string
  items: {
    id?: number // Para itens existentes
    productId: string
    quantity: number
  }[]
}

export interface CreateOrderItemData {
  orderId: number
  productId: number
  quantity: number
}

export interface UpdateOrderItemData {
  productId: number
  quantity: number
}

// Serviços de Produtos
export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products')
    return response.data // Corrigido: API retorna array direto
  },

  async create(data: CreateProductData): Promise<Product> {
    const response = await api.post('/products', data)
    return response.data // Assumindo que retorna o produto direto
  },

  async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data)
    return response.data // Assumindo que retorna o produto direto
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  }
}

// Serviços de Clientes
export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await api.get('/clients')
    return response.data.clients  // Corrigido: API retorna {clients: Array, pagination: {}}
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`)
    return response.data.client || response.data  // Tentativa de suporte a ambos formatos
  },

  async create(data: CreateClientData): Promise<Client> {
    const response = await api.post('/clients', data)
    return response.data.client || response.data  // Tentativa de suporte a ambos formatos
  },

  async update(id: string, data: Partial<CreateClientData>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data)
    return response.data.client || response.data  // Tentativa de suporte a ambos formatos
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`)
  }
}

// Serviços de Pedidos
export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await api.get('/orders')
    return response.data.orders
  },

  async getById(id: string | number): Promise<Order> {
    const response = await api.get(`/orders/${id}`)
    return response.data.order
  },

  async create(data: CreateOrderData): Promise<Order> {
    const response = await api.post('/orders', data)
    return response.data.order
  },

  async update(id: string | number, data: any): Promise<Order> {
    const response = await api.put(`/orders/${id}`, data)
    return response.data.order
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/orders/${id}`)
  },

  // Métodos para gerenciar itens de pedidos
  async createItem(orderId: string | number, data: { productId: string; quantity: number }): Promise<OrderItem> {
    const response = await api.post(`/orders/${orderId}/items`, data)
    return response.data
  },

  async updateItem(orderId: string | number, itemId: string | number, data: { productId: string; quantity: number }): Promise<OrderItem> {
    const response = await api.put(`/orders/${orderId}/items/${itemId}`, data)
    return response.data
  },

  async deleteItem(orderId: string | number, itemId: string | number): Promise<void> {
    await api.delete(`/orders/${orderId}/items/${itemId}`)
  }
}

// Serviços de Itens de Pedidos
export const orderItemService = {
  async create(data: CreateOrderItemData): Promise<OrderItem> {
    const response = await api.post('/order-items', data)
    return response.data.item || response.data
  },

  async update(id: number, data: UpdateOrderItemData): Promise<OrderItem> {
    const response = await api.put(`/order-items/${id}`, data)
    return response.data.item || response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/order-items/${id}`)
  }
}

export default api