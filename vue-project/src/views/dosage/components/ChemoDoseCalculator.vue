<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-slate-800 mb-6">Chemotherapy Dose Calculation</h2>
    <p class="text-slate-600 mb-4">Based on Body Surface Area (BSA)</p>

    <div v-if="loading" class="text-center py-4 text-slate-500">
      Calculating...
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Dose (mg/m²)</label>
          <input
            v-model.number="doseMgPerM2"
            type="number"
            min="0"
            step="0.1"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter dose per m²"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">BSA (m²)</label>
          <input
            v-model.number="bsa"
            type="number"
            min="0.1"
            step="0.01"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter BSA in m²"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="calculate"
            :disabled="loading"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Calculate Dose
          </button>
        </div>
      </div>

      <div v-if="result" class="bg-blue-50 border-l-4 border-blue-500 p-4">
        <h3 class="text-lg font-semibold text-slate-800 mb-2">Result:</h3>
        <p class="text-2xl font-bold text-slate-800">{{ result.doseMg }} mg</p>
        <p class="text-slate-600">Chemotherapy dose</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const doseMgPerM2 = ref('')
const bsa = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const calculate = () => {
  // Reset state
  error.value = ''
  result.value = null
  loading.value = true

  // Validate inputs
  if (doseMgPerM2.value === '' || doseMgPerM2.value < 0) {
    error.value = 'Please enter a valid dose (0 or greater)'
    loading.value = false
    return
  }

  if (!bsa.value || bsa.value <= 0) {
    error.value = 'Please enter a valid BSA greater than zero'
    loading.value = false
    return
  }

  // Simulate API call
  setTimeout(() => {
    try {
      const dosePerM2 = parseFloat(doseMgPerM2.value)
      const bodySurfaceArea = parseFloat(bsa.value)

      const doseMg = dosePerM2 * bodySurfaceArea

      result.value = {
        doseMg: Number(doseMg.toFixed(2)),
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
