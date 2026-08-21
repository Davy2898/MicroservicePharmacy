<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-slate-800 mb-6">Dose Validation</h2>
    <p class="text-slate-600 mb-4">Check if a calculated dose is within standard range</p>

    <div v-if="loading" class="text-center py-4 text-slate-500">
      Validating...
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Calculated Dose</label>
          <input
            v-model.number="calculatedDose"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter calculated dose"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Minimum Standard</label>
          <input
            v-model.number="minStandard"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter minimum standard dose"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Maximum Standard</label>
          <input
            v-model.number="maxStandard"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter maximum standard dose"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="validate"
            :disabled="loading"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Validate Dose
          </button>
        </div>
      </div>

      <div v-if="result" class="p-6 rounded-lg" :class="result.type === 'THERAPEUTIC' ? 'bg-green-50 border-l-4 border-green-500' : result.type === 'UNDERDOSE' ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-red-50 border-l-4 border-red-500'">
        <h3 class="text-lg font-semibold text-slate-800 mb-2">Validation Result:</h3>
        <div class="space-y-2">
          <p><strong>Status:</strong> 
            <span :class="result.type === 'THERAPEUTIC' ? 'text-green-600 font-bold' : result.type === 'UNDERDOSE' ? 'text-yellow-600 font-bold' : 'text-red-600 font-bold'">
              {{ result.type }}
            </span>
          </p>
          <p><strong>Message:</strong> {{ result.message }}</p>
          <p v-if="result.valid" class="text-green-600">✅ Dose is appropriate for administration</p>
          <p v-else class="text-red-600">⚠️ Dose requires review before administration</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const calculatedDose = ref('')
const minStandard = ref('')
const maxStandard = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const validate = () => {
  // Reset state
  error.value = ''
  result.value = null
  loading.value = true

  // Validate inputs
  if (calculatedDose.value === '' || calculatedDose.value < 0) {
    error.value = 'Please enter a valid calculated dose (0 or greater)'
    loading.value = false
    return
  }

  if (minStandard.value === '' || minStandard.value < 0) {
    error.value = 'Please enter a valid minimum standard (0 or greater)'
    loading.value = false
    return
  }

  if (maxStandard.value === '' || maxStandard.value < 0) {
    error.value = 'Please enter a valid maximum standard (0 or greater)'
    loading.value = false
    return
  }

  if (parseFloat(minStandard.value) > parseFloat(maxStandard.value)) {
    error.value = 'Minimum standard cannot be greater than maximum standard'
    loading.value = false
    return
  }

  // Simulate API call
  setTimeout(() => {
    try {
      const dose = parseFloat(calculatedDose.value)
      const min = parseFloat(minStandard.value)
      const max = parseFloat(maxStandard.value)

      let validationResult = {}
      let type = ''

      if (dose < min) {
        validationResult = {
          valid: false,
          message: `Dose ${dose} is below minimum standard of ${min}`,
          type: 'UNDERDOSE'
        }
        type = 'UNDERDOSE'
      } else if (dose > max) {
        validationResult = {
          valid: false,
          message: `Dose ${dose} exceeds maximum standard of ${max}`,
          type: 'OVERDOSE'
        }
        type = 'OVERDOSE'
      } else {
        validationResult = {
          valid: true,
          message: `Dose ${dose} is within standard range (${min}-${max})`,
          type: 'THERAPEUTIC'
        }
        type = 'THERAPEUTIC'
      }

      result.value = validationResult
    } catch (err) {
      error.value = 'Validation error: ' + err.message
    } finally {
      loading.value = false
    }
  }, 500)
}
</script>

<style scoped>
</style>
