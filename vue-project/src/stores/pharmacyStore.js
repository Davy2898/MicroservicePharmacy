import { defineStore } from 'pinia'
import axios from 'axios'

export const usePharmacyStore = defineStore('pharmacy', {
  state: () => ({
    prescriptions: [],
    loading: false,
    error: null
  }),

  actions: {
    // ១. ទាញយកបញ្ជី Prescriptions ទាំងអស់ចេញពី Database តាម Backend API
    async fetchPrescriptions() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/prescriptions')
        this.prescriptions = response.data
      } catch (err) {
        console.error('Error fetching prescriptions:', err)
        this.error = 'មិនអាចទាញយកទិន្នន័យបានទេ'
      } finally {
        this.loading = false
      }
    },

    // ២. ប្រគល់ថ្នាំ និងកាត់ស្តុកក្នុង Database (ប្រើ Transaction នៅ Backend)
    async dispensePrescription(prescriptionId, note = '') {
      try {
        const response = await axios.post(`/api/prescriptions/${prescriptionId}/dispense`, { note })
        
        if (response.data.success) {
          // ពេលកាត់ស្តុកជោគជ័យ ទាញយក Data ថ្មីមក Update UI ភ្លាមៗ
          await this.fetchPrescriptions()
          return { success: true, message: response.data.message }
        }
      } catch (err) {
        const message = err.response?.data?.message || 'មានបញ្ហាក្នុងការប្រគល់ថ្នាំ'
        return { success: false, message }
      }
    }
  }
})