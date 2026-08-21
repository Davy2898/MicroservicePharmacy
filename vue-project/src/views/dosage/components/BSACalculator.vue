<template>
  <div>
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0 4a3 3 0 100-6 3 3 0 000 6z"></path>
        </svg>
        BSA Calculator
      </h2>
      <p class="text-slate-600">Calculate Body Surface Area using Mosteller formula</p>
      
      <form @submit.prevent="calculate" class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
          <div class="flex items-center">
            <input
              v-model.number="weightKg"
              type="number"
              min="0.1"
              step="0.1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter weight in kg"
            >
            <span v-if="weightKg.value" class="ml-2 text-slate-400">kg</span>
          </div>
          <p v-if="error && !weightKg.value" class="mt-1 text-sm text-red-600">Please enter weight</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
          <div class="flex items-center">
            <input
              v-model.number="heightCm"
              type="number"
              min="0.1"
              step="0.1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter height in cm"
            >
            <span v-if="heightCm.value" class="ml-2 text-slate-400">cm</span>
          </div>
          <p v-if="error && !heightCm.value" class="mt-1 text-sm text-red-600">Please enter height</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <template v-if="loading">
            <span class="mr-2">Calculating...</span>
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </template>
          <template v-else>
            Calculate BSA
          </template>
        </button>
      </form>

      <div v-if="result" class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Result
        </h3>
        <div class="space-y-2">
          <p><strong>BSA:</strong> <span class="font-mono text-xl">{{ result.bsa }} m²</span></p>
        </div>
        <div class="mt-3 p-2 bg-slate-50 rounded-lg text-sm text-slate-700">
          Weight: {{ weightKg }} kg │ 
          Height: {{ heightCm }} cm
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const weightKg = ref('')
const heightCm = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const calculate = () => {
  error.value = ''
  result.value = null
  loading.value = true

  if (!weightKg.value || weightKg.value <= 0) {
    error.value = 'Please enter a valid weight greater than zero'
    loading.value = false
    return
  }

  if (!heightCm.value || heightCm.value <= 0) {
    error.value = 'Please enter a valid height greater than zero'
    loading.value = false
    return
  }

  setTimeout(() => {
    try {
      const weight = parseFloat(weightKg.value)
      const height = parseFloat(heightCm.value)

      // Mosteller formula: BSA (m²) = √[(height(cm) × weight(kg)) / 3600]
      const bsa = Math.sqrt((height * weight) / 3600)

      result.value = {
        bsa: Number(bsa.toFixed(2)),
        unit: 'm²'
      }
    } catch (err) {
      error.value = 'Calculation error: ' + err.message
    } finally {
      loading.value = false
    }
  }, 500)
}
</script>

<style scoped>
</style>
