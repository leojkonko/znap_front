<template>
  <div class="notifications-container">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="getColor(notification.type)"
      location="top right"
      :timeout="notification.timeout || 5000"
      multi-line
      variant="elevated"
      class="notification-snackbar"
      @click:outside="() => removeNotification(notification.id)"
    >
      <div class="notification-content">
        <div class="notification-header">
          <v-icon left :color="getIconColor(notification.type)">
            {{ getIcon(notification.type) }}
          </v-icon>
          <span class="notification-title">{{ notification.title }}</span>
        </div>
        <div v-if="notification.message" class="notification-message">
          {{ notification.message }}
        </div>
      </div>
      
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="removeNotification(notification.id)"
        ></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

const getColor = (type: string) => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return colors[type as keyof typeof colors] || 'info'
}

const getIconColor = (type: string) => {
  const colors = {
    success: 'white',
    error: 'white',
    warning: 'white',
    info: 'white'
  }
  return colors[type as keyof typeof colors] || 'white'
}

const getIcon = (type: string) => {
  const icons = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return icons[type as keyof typeof icons] || 'mdi-information'
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 9999;
  pointer-events: none;
}

.notification-snackbar {
  pointer-events: auto;
  margin-bottom: 8px;
  min-width: 350px;
  max-width: 500px;
}

.notification-content {
  width: 100%;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-title {
  font-weight: 600;
  font-size: 1rem;
}

.notification-message {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-left: 32px;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .notifications-container {
    top: 70px;
    left: 16px;
    right: 16px;
  }
  
  .notification-snackbar {
    min-width: auto;
    max-width: none;
  }
}
</style>