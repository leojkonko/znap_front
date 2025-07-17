import { ref, reactive } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
}

const notifications = ref<Notification[]>([])

export const useNotifications = () => {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      timeout: 5000, // 5 segundos por padrão
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto remove after timeout
    if (newNotification.timeout && newNotification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.timeout)
    }
    
    return id
  }
  
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value.splice(0)
  }
  
  // Helper functions para diferentes tipos
  const showSuccess = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'success', title, message, timeout })
  }
  
  const showError = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'error', title, message, timeout: timeout || 8000 }) // Erros ficam mais tempo
  }
  
  const showWarning = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'warning', title, message, timeout })
  }
  
  const showInfo = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'info', title, message, timeout })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}