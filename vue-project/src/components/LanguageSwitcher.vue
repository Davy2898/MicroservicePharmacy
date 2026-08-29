<template>
  <div class="language-switcher">
    <span class="language-label">{{ t('language.label') }}</span>

    <div class="language-select" @keydown.esc.prevent="isOpen = false">
      <button
        class="language-trigger"
        type="button"
        :aria-expanded="isOpen"
        :aria-label="t('language.label')"
        @blur="closeAfterFocusLeaves"
        @click="isOpen = !isOpen"
      >
        <img class="flag-image" :src="selectedOption.flag" alt="" />
        <span>{{ selectedOption.label }}</span>
        <span class="chevron" aria-hidden="true">v</span>
      </button>

      <div v-if="isOpen" class="language-menu">
        <button
          v-for="option in languageOptions"
          :key="option.value"
          class="language-option"
          type="button"
          :class="{ active: option.value === locale }"
          @blur="closeAfterFocusLeaves"
          @click="selectLocale(option.value)"
        >
          <img class="flag-image" :src="option.flag" alt="" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n({ useScope: 'global' })
const isOpen = ref(false)

const makeFlag = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const flagImages = {
  en: makeFlag(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="circle"><circle cx="32" cy="32" r="32"/></clipPath></defs>
      <g clip-path="url(#circle)">
        <rect width="64" height="64" fill="#075bbb"/>
        <path d="M0 0 64 64M64 0 0 64" stroke="#fff" stroke-width="14"/>
        <path d="M0 0 64 64M64 0 0 64" stroke="#e4002b" stroke-width="8"/>
        <path d="M32 0v64M0 32h64" stroke="#fff" stroke-width="22"/>
        <path d="M32 0v64M0 32h64" stroke="#e4002b" stroke-width="13"/>
      </g>
    </svg>
  `),
  km: makeFlag(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="circle"><circle cx="32" cy="32" r="32"/></clipPath></defs>
      <g clip-path="url(#circle)">
        <rect width="64" height="64" fill="#273a91"/>
        <rect y="16" width="64" height="32" fill="#e51d2a"/>
        <path fill="#fff" stroke="#111827" stroke-width=".7" d="M12 44h40v3H12zM16 40h32v4H16zM20 36h24v4H20zM24 29h16v7H24z"/>
        <path fill="#fff" stroke="#111827" stroke-width=".7" d="M29 19h6l2 10H27zM18 28h7v8h-7zM39 28h7v8h-7z"/>
        <path fill="#fff" stroke="#111827" stroke-width=".7" d="M22 24h4l1 5h-6zM38 24h4l1 5h-6zM31 14h2l2 6h-6z"/>
        <path stroke="#111827" stroke-width=".7" d="M16 44h32M20 40h24M25 36h14M31 19v17M20 29v7M44 29v7" />
      </g>
    </svg>
  `)
}

const languageOptions = computed(() => [
  {
    value: 'en',
    label: t('language.english'),
    flag: flagImages.en
  },
  {
    value: 'km',
    label: t('language.khmer'),
    flag: flagImages.km
  }
])

const selectedOption = computed(() => {
  return languageOptions.value.find((option) => option.value === locale.value) || languageOptions.value[0]
})

const selectLocale = (value) => {
  locale.value = value
  localStorage.setItem('app-locale', value)
  document.documentElement.lang = value
  isOpen.value = false
}

const closeAfterFocusLeaves = () => {
  window.setTimeout(() => {
    if (!document.activeElement?.closest('.language-select')) {
      isOpen.value = false
    }
  }, 0)
}
</script>

<style scoped>
.language-switcher {
  display: grid;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.language-label {
  color: #64748b;
}

.language-select {
  position: relative;
  z-index: 20;
}

.language-trigger,
.language-option {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.language-trigger {
  height: 38px;
  justify-content: space-between;
  border-radius: 6px;
  padding: 0 10px;
}

.language-trigger:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  outline: none;
}

.language-trigger span:not(.chevron) {
  flex: 1;
  min-width: 0;
}

.flag-image {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
  object-fit: cover;
}

.chevron {
  color: #64748b;
  font-size: 10px;
  font-weight: 900;
}

.language-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  z-index: 100;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.16);
}

.language-option {
  height: 40px;
  border-width: 0;
  border-radius: 0;
  padding: 0 10px;
}

.language-option:hover,
.language-option.active {
  background: #eff6ff;
  color: #2563eb;
}
</style>
