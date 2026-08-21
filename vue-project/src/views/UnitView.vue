<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h2>Unit Management</h2>
        <p class="page-subtitle">{{ units.length }} units in database</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openCreateForm">+ Add Unit</button>
    </div>

    <div class="toolbar">
      <input
        v-model="searchTerm"
        class="search-input"
        type="search"
        placeholder="Search unit"
      />
      <button class="btn btn-secondary" type="button" @click="fetchUnits">Refresh</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Unit</th>
            <th class="code-col">Code</th>
            <th>Description</th>
            <th class="default-col">Default</th>
            <th class="order-col">Order</th>
            <th class="action-col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="empty-cell">Loading units...</td>
          </tr>
          <tr v-else-if="filteredUnits.length === 0">
            <td colspan="6" class="empty-cell">No units found</td>
          </tr>
          <template v-else>
            <tr v-for="unit in filteredUnits" :key="unit.id">
              <td class="text-bold">{{ unit.name }}</td>
              <td><code>{{ unit.code }}</code></td>
              <td class="text-muted">{{ unit.description || '-' }}</td>
              <td>
                <span class="default-badge" :class="{ active: unit.is_default }">
                  {{ unit.is_default ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>{{ unit.order }}</td>
              <td class="action-cell">
                <button class="icon-btn" type="button" @click="openEditForm(unit)">Edit</button>
                <button class="icon-btn danger" type="button" @click="deleteUnit(unit)">Delete</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <form class="modal-panel" @submit.prevent="saveUnit">
        <div class="modal-header">
          <h3>{{ editingUnit ? 'Edit Unit' : 'Add Unit' }}</h3>
          <button class="close-btn" type="button" aria-label="Close" @click="closeForm">x</button>
        </div>

        <label class="form-field">
          <span>Unit Name</span>
          <input v-model.trim="form.name" type="text" required />
        </label>

        <label class="form-field">
          <span>Code</span>
          <input v-model.trim="form.code" type="text" required />
        </label>

        <label class="form-field">
          <span>Description</span>
          <input v-model.trim="form.description" type="text" />
        </label>

        <label class="form-field">
          <span>Order</span>
          <input v-model.number="form.order" type="number" min="0" step="1" required />
        </label>

        <label class="checkbox-field">
          <input v-model="form.isDefault" type="checkbox" />
          <span>Default unit</span>
        </label>

        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="closeForm">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'

const units = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const searchTerm = ref('')
const showForm = ref(false)
const editingUnit = ref(null)

const form = reactive({
  name: '',
  code: '',
  description: '',
  isDefault: false,
  order: 0
})

const filteredUnits = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  if (!query) {
    return units.value
  }

  return units.value.filter((unit) => {
    return [unit.name, unit.code, unit.description, unit.order].some((value) =>
      String(value || '').toLowerCase().includes(query)
    )
  })
})

const getErrorMessage = (err, fallback) => {
  return err.response?.data?.error || fallback
}

const fetchUnits = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('/api/units')
    units.value = response.data
  } catch (err) {
    console.error('Error fetching units:', err)
    error.value = getErrorMessage(err, 'Cannot load units from database')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.code = ''
  form.description = ''
  form.isDefault = false
  form.order = units.value.length + 1
}

const openCreateForm = () => {
  editingUnit.value = null
  resetForm()
  error.value = ''
  showForm.value = true
}

const openEditForm = (unit) => {
  editingUnit.value = unit
  form.name = unit.name || ''
  form.code = unit.code || ''
  form.description = unit.description || ''
  form.isDefault = Boolean(unit.is_default)
  form.order = unit.order || 0
  error.value = ''
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingUnit.value = null
  resetForm()
}

const saveUnit = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload = {
      name: form.name,
      code: form.code,
      description: form.description,
      isDefault: form.isDefault,
      order: form.order
    }

    if (editingUnit.value) {
      await axios.put(`/api/units/${editingUnit.value.id}`, payload)
    } else {
      await axios.post('/api/units', payload)
    }

    closeForm()
    await fetchUnits()
  } catch (err) {
    console.error('Error saving unit:', err)
    error.value = getErrorMessage(err, 'Cannot save unit')
  } finally {
    saving.value = false
  }
}

const deleteUnit = async (unit) => {
  const confirmed = window.confirm(`Delete ${unit.name}?`)

  if (!confirmed) {
    return
  }

  error.value = ''

  try {
    await axios.delete(`/api/units/${unit.id}`)
    await fetchUnits()
  } catch (err) {
    console.error('Error deleting unit:', err)
    error.value = getErrorMessage(err, 'Cannot delete unit')
  }
}

onMounted(fetchUnits)
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

.code-col {
  width: 150px;
}

.default-col,
.order-col {
  width: 110px;
}

.action-col {
  width: 180px;
  text-align: right;
}

.text-bold {
  color: #0f172a;
  font-weight: 700;
}

.text-muted {
  color: #64748b;
}

.default-badge {
  display: inline-flex;
  min-width: 42px;
  justify-content: center;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 800;
}

.default-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.action-cell {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.icon-btn {
  min-width: 64px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.icon-btn.danger {
  color: #b91c1c;
  border-color: #fecaca;
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
  width: min(100%, 460px);
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

.form-field input {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 14px;
  outline: none;
}

.form-field input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.checkbox-field input {
  width: 16px;
  height: 16px;
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
    min-width: 780px;
  }

  .table-card {
    overflow-x: auto;
  }
}
</style>
