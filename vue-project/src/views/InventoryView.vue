<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h2>{{ t('inventory.title') }}</h2>
        <p class="page-subtitle">{{ t('inventory.subtitle', { count: inventory.length }) }}</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openStockInForm()">{{ t('inventory.stockIn') }}</button>
    </div>

    <div class="toolbar">
      <input
        v-model="searchTerm"
        class="search-input"
        type="search"
        :placeholder="t('inventory.search')"
      />
      <button class="btn btn-secondary" type="button" @click="loadPageData">{{ t('common.refresh') }}</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('common.barcode') }}</th>
            <th>{{ t('inventory.medicineName') }}</th>
            <th>{{ t('inventory.stockQty') }}</th>
            <th>{{ t('inventory.expiryDate') }}</th>
            <th>{{ t('inventory.expiryStatus') }}</th>
            <th class="action-col">{{ t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="empty-cell">{{ t('inventory.loading') }}</td>
          </tr>
          <tr v-else-if="filteredInventory.length === 0">
            <td colspan="6" class="empty-cell">{{ t('inventory.empty') }}</td>
          </tr>
          <template v-else>
            <tr v-for="item in filteredInventory" :key="item.id">
              <td><code>{{ item.barcode }}</code></td>
              <td class="text-bold">{{ item.name }}</td>
              <td>
                <strong class="qty-text">{{ formatQty(item.stock_qty) }}</strong>
                <span v-if="item.stock_unit" class="stock-unit">{{ item.stock_unit }}</span>
              </td>
              <td>{{ formatDate(item.expiry_date) }}</td>
              <td>
                <span class="status-badge" :class="item.status_class">{{ translateStatus(item.status) }}</span>
              </td>
              <td class="action-cell">
                <button class="icon-btn" type="button" @click="openStockInForm(item)">{{ t('inventory.restock') }}</button>
                <button class="icon-btn" type="button" @click="openAdjustForm(item)">{{ t('inventory.adjust') }}</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="showStockForm" class="modal-backdrop" @click.self="closeForms">
      <form class="modal-panel" @submit.prevent="saveStockIn">
        <div class="modal-header">
          <h3>{{ t('inventory.stockInTitle') }}</h3>
          <button class="close-btn" type="button" :aria-label="t('common.close')" @click="closeForms">x</button>
        </div>

        <div v-if="selectedInventoryItem" class="selected-medicine">
          <strong>{{ selectedInventoryItem.name }}</strong>
          <span>{{ selectedInventoryItem.barcode }}</span>
        </div>

        <div v-else class="form-field medicine-field">
          <span>{{ t('inventory.medicine') }}</span>
          <div class="medicine-picker">
            <button
              class="medicine-trigger"
              type="button"
              :class="{ placeholder: !selectedStockMedicine }"
              @click="toggleMedicinePicker"
            >
              <span>{{ selectedStockMedicine ? medicineDisplayName(selectedStockMedicine) : t('inventory.selectMedicine') }}</span>
              <span class="picker-chevron" aria-hidden="true">v</span>
            </button>

            <div v-if="medicinePickerOpen" class="medicine-menu">
              <input
                v-model="medicineSearch"
                class="medicine-search"
                type="search"
                :placeholder="t('inventory.searchMedicine')"
                @keydown.esc.prevent="medicinePickerOpen = false"
              />

              <div class="medicine-options">
                <button
                  v-for="medicine in filteredStockMedicines"
                  :key="medicine.id"
                  class="medicine-option"
                  type="button"
                  :class="{ active: String(stockForm.medicineId) === String(medicine.id) }"
                  @click="selectStockMedicine(medicine)"
                >
                  <strong>{{ medicine.name }}</strong>
                  <span>{{ medicine.barcode }}</span>
                </button>

                <div v-if="filteredStockMedicines.length === 0" class="medicine-empty">
                  {{ t('inventory.noMedicine') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <label class="form-field">
          <span>{{ t('inventory.quantityToAdd') }}</span>
          <input v-model.number="stockForm.quantity" type="number" min="0.01" step="0.01" required />
        </label>

        <label class="form-field">
          <span>{{ t('inventory.stockUnit') }}</span>
          <input v-model.trim="stockForm.stockUnit" type="text" placeholder="PCS, គ្រាប់, mg..." />
        </label>

        <label class="form-field">
          <span>{{ t('inventory.expiryDate') }}</span>
          <input v-model="stockForm.expiryDate" type="date" />
        </label>

        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="closeForms">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? t('common.saving') : t('inventory.saveStock') }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showAdjustForm" class="modal-backdrop" @click.self="closeForms">
      <form class="modal-panel" @submit.prevent="saveAdjustment">
        <div class="modal-header">
          <h3>{{ t('inventory.adjustTitle') }}</h3>
          <button class="close-btn" type="button" :aria-label="t('common.close')" @click="closeForms">x</button>
        </div>

        <div class="selected-medicine">
          <strong>{{ selectedInventoryItem?.name }}</strong>
          <span>{{ selectedInventoryItem?.barcode }}</span>
        </div>

        <label class="form-field">
          <span>{{ t('inventory.currentStockQty') }}</span>
          <input v-model.number="adjustForm.stockQty" type="number" step="0.01" required />
        </label>

        <label class="form-field">
          <span>{{ t('inventory.stockUnit') }}</span>
          <input v-model.trim="adjustForm.stockUnit" type="text" placeholder="PCS, គ្រាប់, mg..." />
        </label>

        <label class="form-field">
          <span>{{ t('inventory.expiryDate') }}</span>
          <input v-model="adjustForm.expiryDate" type="date" />
        </label>

        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="closeForms">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? t('common.saving') : t('inventory.updateStock') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const inventory = ref([])
const medicines = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const searchTerm = ref('')
const showStockForm = ref(false)
const showAdjustForm = ref(false)
const selectedInventoryItem = ref(null)
const medicinePickerOpen = ref(false)
const medicineSearch = ref('')

const stockForm = reactive({
  medicineId: '',
  quantity: 1,
  stockUnit: '',
  expiryDate: ''
})

const adjustForm = reactive({
  stockQty: 0,
  stockUnit: '',
  expiryDate: ''
})

const filteredInventory = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  if (!query) {
    return inventory.value
  }

  return inventory.value.filter((item) => {
    return [item.barcode, item.name].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )
  })
})

const selectedStockMedicine = computed(() => {
  return medicines.value.find((medicine) => String(medicine.id) === String(stockForm.medicineId))
})

const filteredStockMedicines = computed(() => {
  const query = medicineSearch.value.trim().toLowerCase()
  const source = query
    ? medicines.value.filter((medicine) =>
        [medicine.name, medicine.barcode, medicine.uom].some((value) =>
          String(value || '').toLowerCase().includes(query)
        )
      )
    : medicines.value

  return source.slice(0, 80)
})

const getErrorMessage = (err, fallback) => {
  return err.response?.data?.error || fallback
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return String(value).slice(0, 10)
}

const formatQty = (value) => {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return value
  }

  return Number.isInteger(numberValue) ? numberValue : numberValue.toFixed(2)
}

const translateStatus = (status) => {
  const statusKey = {
    Normal: 'normal',
    'Near Expiry': 'nearExpiry',
    Expired: 'expired',
    'Out of Stock': 'outOfStock'
  }[status]

  return statusKey ? t(`inventory.status.${statusKey}`) : status
}

const medicineDisplayName = (medicine) => {
  return `${medicine.name} - ${medicine.barcode}`
}

const toggleMedicinePicker = () => {
  medicinePickerOpen.value = !medicinePickerOpen.value
}

const selectStockMedicine = (medicine) => {
  stockForm.medicineId = medicine.id
  medicineSearch.value = ''
  medicinePickerOpen.value = false
}

const fetchInventory = async () => {
  const response = await axios.get('/api/inventory')
  inventory.value = response.data
}

const fetchMedicines = async () => {
  const response = await axios.get('/api/medicines')
  medicines.value = response.data
}

const loadPageData = async () => {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([fetchInventory(), fetchMedicines()])
  } catch (err) {
    console.error('Error loading inventory:', err)
    error.value = getErrorMessage(err, t('inventory.errors.load'))
  } finally {
    loading.value = false
  }
}

const resetStockForm = () => {
  stockForm.medicineId = ''
  stockForm.quantity = 1
  stockForm.stockUnit = ''
  stockForm.expiryDate = ''
  medicineSearch.value = ''
  medicinePickerOpen.value = false
}

const resetAdjustForm = () => {
  adjustForm.stockQty = 0
  adjustForm.stockUnit = ''
  adjustForm.expiryDate = ''
}

const openStockInForm = (item = null) => {
  selectedInventoryItem.value = item
  resetStockForm()
  error.value = ''

  if (item) {
    stockForm.medicineId = item.medicine_id
    stockForm.stockUnit = item.stock_unit || ''
    stockForm.expiryDate = formatDate(item.expiry_date) === '-' ? '' : formatDate(item.expiry_date)
  }

  showStockForm.value = true
}

const openAdjustForm = (item) => {
  selectedInventoryItem.value = item
  adjustForm.stockQty = item.stock_qty
  adjustForm.stockUnit = item.stock_unit || ''
  adjustForm.expiryDate = formatDate(item.expiry_date) === '-' ? '' : formatDate(item.expiry_date)
  error.value = ''
  showAdjustForm.value = true
}

const closeForms = () => {
  showStockForm.value = false
  showAdjustForm.value = false
  selectedInventoryItem.value = null
  medicinePickerOpen.value = false
  resetStockForm()
  resetAdjustForm()
}

const saveStockIn = async () => {
  if (!stockForm.medicineId) {
    error.value = t('inventory.selectMedicineError')
    return
  }

  saving.value = true
  error.value = ''

  try {
    await axios.post('/api/inventory/stock-in', {
      medicineId: stockForm.medicineId,
      quantity: stockForm.quantity,
      stockUnit: stockForm.stockUnit || null,
      expiryDate: stockForm.expiryDate || null
    })

    closeForms()
    await loadPageData()
  } catch (err) {
    console.error('Error saving stock:', err)
    error.value = getErrorMessage(err, t('inventory.errors.save'))
  } finally {
    saving.value = false
  }
}

const saveAdjustment = async () => {
  if (!selectedInventoryItem.value) {
    return
  }

  saving.value = true
  error.value = ''

  try {
    await axios.put(`/api/inventory/${selectedInventoryItem.value.id}`, {
      stockQty: adjustForm.stockQty,
      stockUnit: adjustForm.stockUnit || null,
      expiryDate: adjustForm.expiryDate || null
    })

    closeForms()
    await loadPageData()
  } catch (err) {
    console.error('Error updating stock:', err)
    error.value = getErrorMessage(err, t('inventory.errors.update'))
  } finally {
    saving.value = false
  }
}

onMounted(loadPageData)
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 20px;
  background: #f1f5f9;
}

.header-actions,
.toolbar {
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

.search-input {
  width: min(100%, 360px);
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.btn {
  height: 38px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-primary {
  background: #134e5e;
  color: #ffffff;
}

.btn-secondary {
  background: #ffffff;
  color: #334155;
  border-color: #cbd5e1;
}

.alert {
  margin-bottom: 16px;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
}

.data-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
}

.action-col {
  width: 190px;
  text-align: right;
}

.text-bold {
  color: #0f172a;
  font-weight: 700;
}

.qty-text {
  color: #0d9488;
  font-size: 14px;
}

.stock-unit {
  margin-left: 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
}

.status-badge.normal {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.warning {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.icon-btn {
  min-width: 68px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.empty-cell {
  height: 90px;
  text-align: center;
  color: #64748b;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.48);
  padding: 20px;
}

.modal-panel {
  width: min(100%, 480px);
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.22);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.close-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
}

.form-field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.form-field input,
.form-field select {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 14px;
  outline: none;
}

.form-field input:focus,
.form-field select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.medicine-field {
  position: relative;
}

.medicine-picker {
  position: relative;
}

.medicine-trigger {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  padding: 0 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
}

.medicine-trigger span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medicine-trigger.placeholder {
  color: #64748b;
}

.medicine-trigger:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  outline: none;
}

.picker-chevron {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 11px;
  font-weight: 900;
}

.medicine-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 70;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
}

.medicine-search {
  width: calc(100% - 20px);
  height: 38px;
  margin: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  color: #0f172a;
  font-size: 14px;
  outline: none;
}

.medicine-search:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.medicine-options {
  max-height: 220px;
  overflow-y: auto;
  padding: 4px;
}

.medicine-option {
  display: grid;
  width: 100%;
  gap: 3px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #0f172a;
  cursor: pointer;
  padding: 9px 10px;
  text-align: left;
}

.medicine-option:hover,
.medicine-option.active {
  background: #eff6ff;
}

.medicine-option strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 800;
}

.medicine-option span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.medicine-empty {
  padding: 18px 10px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}

.selected-medicine {
  display: grid;
  gap: 4px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 12px;
  color: #0f172a;
  font-size: 13px;
}

.selected-medicine span {
  color: #64748b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 760px) {
  .header-actions,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input,
  .btn {
    width: 100%;
  }

  .data-table {
    min-width: 820px;
  }

  .table-card {
    overflow-x: auto;
  }
}
</style>
