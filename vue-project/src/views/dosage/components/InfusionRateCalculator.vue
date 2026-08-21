<template>
  <div>
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8l4 4m0 0l-4 4m4-4H6"></path>
        </svg>
        Infusion Rate Calculator
      </h2>
      <p class="text-slate-600">Calculate IV infusion rate in ml/hour</p>
      
      <form @submit.prevent="calculate" class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Dose (mg/hour)</label>
          <div class="flex items-center">
            <input
              v-model.number="doseMgPerHour"
              type="number"
              min="0"
              step="0.1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter dose per hour"
            >
            <span v-if="doseMgPerHour.value" class="ml-2 text-slate-400">mg/hour</span>
          </div>
          <p v-if="error && doseMgPerHour.value < 0" class="mt-1 text-sm text-red-600">Dose cannot be negative</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Concentration (mg/ml)</label>
          <div class="flex items-center">
            <input
              v-model.number="concentrationMgPerMl"
              type="number"
              min="0.1"
              step="0.1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter concentration"
            >
            <span v-if="concentrationMgPerMl.value" class="ml-2 text-slate-400">mg/ml</span>
          </div>
          <p v-if="error && !concentrationMgPerMl.value" class="mt-1 text-sm text-red-600">Please enter concentration</p>
          <p v-if="error && concentrationMgPerMl.value <= 0" class="mt-1 text-sm text-red-600">Concentration must be greater than zero</p>
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
            Calculate Rate
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
          <p><strong>Infusion Rate:</strong> <span class="font-mono text-xl">{{ result.rateMlPerHour }} ml/hour</span></p>
        </div>
        <div class="mt-3 p-2 bg-slate-50 rounded-lg text-sm text-slate-700">
          Dose: {{ doseMgPerHour }} mg/hour │ 
          Concentration: {{ concentrationMgPerMl }} mg/ml
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const doseMgPerHour = ref('')
const concentrationMgPerMl = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const calculate = () => {
  error.value = ''
  result.value = null
  loading.value = true

  if (doseMgPerHour.value === '' || doseMgPerHour.value < 0) {
    error.value = 'Please enter a valid dose (0 or greater)'
    loading.value = false
    return
  }

  if (!concentrationMgPerMl.value || concentrationMgPerMl.value <= 0) {
    error.value = 'Please enter a valid concentration greater than zero'
    loading.value = false
    return
  }

  setTimeout(() => {
    try {
      const dose = parseFloat(doseMgPerHour.value)
      const concentration = parseFloat(concentrationMgPerMl.value)

      if (concentration === 0) {
        throw new Error('Concentration cannot be zero')
      }

      const rateMlPerHour = dose / concentration

      result.value = {
        rateMlPerHour: Number(rateMlPerHour.toFixed(2)),
        unit: 'ml/hour'
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
