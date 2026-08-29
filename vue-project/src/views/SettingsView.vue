<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h2>{{ t('settings.title') }}</h2>
        <p class="page-subtitle">{{ t('settings.subtitle') }}</p>
      </div>
    </div>

    <div class="settings-panel">
      <div class="settings-row">
        <div>
          <h3>{{ t('settings.language.title') }}</h3>
          <p>{{ t('settings.language.description') }}</p>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background: #f1f5f9;
  padding: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.header-actions h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
}

.page-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.settings-panel {
  max-width: 760px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.settings-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  align-items: center;
  gap: 20px;
  padding: 18px;
  position: relative;
  z-index: 2;
}

.settings-row h3 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.settings-row p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .settings-row {
    grid-template-columns: 1fr;
  }
}
</style>
