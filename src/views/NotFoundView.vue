<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-icon">
        <v-icon size="120" color="grey">mdi-alert-circle-outline</v-icon>
      </div>
      
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">Página não encontrada</h2>
      
      <p class="error-message">
        A página que você está procurando não existe ou foi movida.
      </p>
      
      <div class="error-actions">
        <v-btn
          color="primary"
          size="large"
          :to="{ name: 'dashboard' }"
          prepend-icon="mdi-home"
        >
          Voltar ao Dashboard
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nothing needed here for now
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 24px;
}

.error-title {
  font-size: 4rem;
  font-weight: 300;
  color: #666;
  margin-bottom: 16px;
}

.error-subtitle {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 16px;
}

.error-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  justify-content: center;
}
</style>