<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-slate-900">ការគិតត្រូវបាន (Dosage Calculators)</h1>
        <p class="mt-2 text-slate-600">Clinical dosage calculation tools for pharmacy practice</p>
      </div>

      <!-- Tabs -->
      <div class="mb-8">
        <div class="flex border-b border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'flex-1 px-5 py-3 font-medium text-sm transition-all duration-200',
              activeTab === tab 
                ? 'bg-white text-slate-900 border-b-2 border-blue-600 shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            ]"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-8">
          <PediatricDosageCalculator v-if="activeTab === 'Pediatric Dosage'" />
          <InfusionRateCalculator v-else-if="activeTab === 'Infusion Rate'" />
          <BSACalculator v-else-if="activeTab === 'BSA Calculator'" />
          <ChemoDoseCalculator v-else-if="activeTab === 'Chemo Dose'" />
          <DoseValidator v-else-if="activeTab === 'Dose Validation'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PediatricDosageCalculator from '@/views/dosage/components/PediatricDosageCalculator.vue'
import InfusionRateCalculator from '@/views/dosage/components/InfusionRateCalculator.vue'
import BSACalculator from '@/views/dosage/components/BSACalculator.vue'
import ChemoDoseCalculator from '@/views/dosage/components/ChemoDoseCalculator.vue'
import DoseValidator from '@/views/dosage/components/DoseValidator.vue'

const tabs = [
  'Pediatric Dosage',
  'Infusion Rate',
  'BSA Calculator',
  'Chemo Dose',
  'Dose Validation'
]

const activeTab = ref(tabs[0])
</script>

<style scoped>
</style>
