<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">ប្រព័ន្ធប្រគល់ថ្នាំ (Pharmacy Dispensing)</h1>

      <!-- Filter Buttons -->
      <div class="flex gap-2 mb-6">
        <button 
          v-for="status in ['ALL', 'PENDING', 'DISPENSED']" 
          :key="status"
          @click="selectedStatus = status"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            selectedStatus === status 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          ]"
        >
          {{ status === 'ALL' ? 'ទាំងអស់' : status === 'PENDING' ? 'មិនទាន់ប្រគល់' : 'បានប្រគល់រួច' }}
        </button>
      </div>

      <!-- Loading Indicator -->
      <div v-if="pharmacyStore.loading" class="text-center py-12 text-slate-500">
        កំពុងទាញយកទិន្នន័យពី Database...
      </div>

      <!-- Error Message -->
      <div v-else-if="pharmacyStore.error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
        {{ pharmacyStore.error }}
      </div>

      <!-- Prescriptions Table -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
              <th class="p-4">កូដសំបុត្រ</th>
              <th class="p-4">ឈ្មោះអ្នកជំងឺ / MRN</th>
              <th class="p-4">គ្រូពេទ្យចេញសំបុត្រ</th>
              <th class="p-4">ស្ថានភាព</th>
              <th class="p-4">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-sm">
            <tr v-if="filteredPrescriptions.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-500">No prescriptions found</td>
            </tr>
            <tr v-for="item in filteredPrescriptions" v-else :key="item.id" class="hover:bg-slate-50">
              <td class="p-4 font-semibold text-blue-600">{{ item.code }}</td>
              <td class="p-4">
                <div class="font-medium text-slate-800">{{ item.patient_name }}</div>
                <div class="text-xs text-slate-400">{{ item.mrn }}</div>
              </td>
              <td class="p-4 text-slate-600">{{ item.prescriber }}</td>
              <td class="p-4">
                <span 
                  :class="[
                    'px-2.5 py-1 rounded-full text-xs font-semibold',
                    item.status === 'DISPENSED' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  ]"
                >
                  {{ item.status === 'DISPENSED' ? 'បានប្រគល់រួច' : 'រង់ចាំប្រគល់' }}
                </span>
              </td>
              <td class="p-4">
                <button 
                  @click="openModal(item)"
                  class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium text-xs transition"
                >
                  ពិនិត្យ & ប្រគល់ថ្នាំ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal ប្រគល់ថ្នាំ -->
      <div v-if="activeItem" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl">
          <h2 class="text-xl font-bold text-slate-800 mb-4">
            សំបុត្រថ្នាំ៖ {{ activeItem.code }} - {{ activeItem.patient_name }}
          </h2>

          <div class="mb-4">
            <h3 class="font-semibold text-slate-700 mb-2">បញ្ជីថ្នាំត្រូវប្រគល់៖</h3>
            <div class="space-y-2">
              <div 
                v-for="drug in activeItem.drugs" 
                :key="drug.id"
                class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <div class="font-medium text-slate-800">{{ drug.name }} ({{ drug.barcode }})</div>
                  <div class="text-xs text-slate-500">{{ drug.dosage }} - {{ drug.instruction }}</div>
                </div>
                <div class="text-right">
                  <span class="font-bold text-blue-600">ចំនួន: {{ drug.qty }}</span>
                  <div class="text-xs text-slate-400">ស្តុកនៅសល់: {{ drug.stock }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ចំណាំឱសថការី -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-1">កំណត់ចំណាំឱសថការី៖</label>
            <textarea 
              v-model="pharmacistNote" 
              rows="2"
              class="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="វាយបញ្ចូលចំណាំបន្ថែមប្រសិនបើមាន..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button 
              @click="closeModal" 
              class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm"
            >
              បិទ
            </button>
            <button 
              v-if="activeItem.status !== 'DISPENSED'"
              @click="submitDispense" 
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              បញ្ជាក់ការប្រគល់ថ្នាំ & កាត់ស្តុក
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePharmacyStore } from '../stores/pharmacyStore'

const pharmacyStore = usePharmacyStore()

const selectedStatus = ref('ALL')
const activeItem = ref(null)
const pharmacistNote = ref('')

// ទាញយកទិន្នន័យពេល Component ដំណើរការដំបូង
onMounted(() => {
  pharmacyStore.fetchPrescriptions()
})

// Filter តាម Status
const filteredPrescriptions = computed(() => {
  if (selectedStatus.value === 'ALL') return pharmacyStore.prescriptions
  return pharmacyStore.prescriptions.filter(p => p.status === selectedStatus.value)
})

const openModal = (item) => {
  activeItem.value = JSON.parse(JSON.stringify(item))
  pharmacistNote.value = item.pharmacist_note || ''
}

const closeModal = () => {
  activeItem.value = null
}

const submitDispense = async () => {
  const res = await pharmacyStore.dispensePrescription(activeItem.value.id, pharmacistNote.value)
  if (res.success) {
    alert('✅ ' + res.message)
    closeModal()
  } else {
    alert('⚠️ ' + res.message)
  }
}
</script>
