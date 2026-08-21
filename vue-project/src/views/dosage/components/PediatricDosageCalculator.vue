<template>
  <div>
    <div class="bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        Pediatric Dosage Calculator
      </h2>
      <p class="text-slate-600">Calculate medication dosage based on patient weight (mg/kg)</p>
      
      <form @submit.prevent="calculate" class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Patient Weight (kg)</label>
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
          <label class="block text-sm font-medium text-slate-700 mb-1">Dosage per Weight (mg/kg)</label>
          <div class="flex items-center">
            <input
              v-model.number="doseMgPerKg"
              type="number"
              min="0.1"
              step="0.1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter dose per kg"
            >
            <span v-if="doseMgPerKg.value" class="ml-2 text-slate-400">mg/kg</span>
          </div>
          <p v-if="error && !doseMgPerKg.value" class="mt-1 text-sm text-red-600">Please enter dosage</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Frequency per Day</label>
          <div class="flex items-center">
            <input
              v-model.number="frequencyPerDay"
              type="number"
              min="1"
              step="1"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Frequency per day"
            >
            <span v-if="frequencyPerDay.value" class="ml-2 text-slate-400">times/day</span>
          </div>
          <p v-if="error && (!frequencyPerDay.value || frequencyPerDay.value < 1)" class="mt-1 text-sm text-red-600">Please enter frequency (1 or more)</p>
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
            Calculate Dosage
          </template>
        </button>
      </form>

      <div v-if="result" class="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Results
        </h3>
        <div class="space-y-2">
          <p><strong>Single Dose:</strong> <span class="font-mono text-lg">{{ result.singleDoseMg }} mg</span></p>
          <p><strong>Daily Total:</strong> <span class="font-mono text-lg">{{ result.dailyTotalMg }} mg</span></p>
        </div>
        <div class="mt-3 p-2 bg-slate-50 rounded-lg text-sm text-slate-700">
          Weight: {{ result.weightKg }} kg │ 
          Dose/kg: {{ result.doseMgPerKg }} mg/kg │ 
          Frequency: {{ result.frequencyPerDay }} ×/day
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const weightKg = ref('')
const doseMgPerKg = ref('')
const frequencyPerDay = ref('')
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

  if (!doseMgPerKg.value || doseMgPerKg.value <= 0) {
    error.value = 'Please enter a valid dose per kg greater than zero'
    loading.value = false
    return
  }

  if (!frequencyPerDay.value || frequencyPerDay.value < 1) {
    error.value = 'Please enter a valid frequency (1 or greater)'
    loading.value = false
    return
  }

  setTimeout(() => {
    try {
      const weight = parseFloat(weightKg.value)
      const dosePerKg = parseFloat(doseMgPerKg.value)
      const frequency = parseInt(frequencyPerDay.value)

      const singleDoseMg = weight * dosePerKg
      const dailyTotalMg = singleDoseMg * frequency

      result.value = {
        weightKg: weight,
        doseMgPerKg: dosePerKg,
        singleDoseMg: Number(singleDoseMg.toFixed(2)),
        frequencyPerDay: frequency,
        dailyTotalMg: Number(dailyTotalMg.toFixed(2)),
        unit: 'mg'
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
