<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h2>Medicine Template</h2>
        <p class="page-subtitle">{{ templates.length }} templates in database</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openCreateForm">+ Add Template</button>
    </div>

    <div class="toolbar">
      <input v-model="searchTerm" class="search-input" type="search" placeholder="Search template" />
      <button class="btn btn-secondary" type="button" @click="fetchTemplates">Refresh</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th class="no-col">No.</th>
            <th>Template Name</th>
            <th>Treatment On Disease</th>
            <th class="type-col">Type</th>
            <th>Description</th>
            <th class="order-col">Order</th>
            <th class="action-col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="empty-cell">Loading templates...</td>
          </tr>
          <tr v-else-if="filteredTemplates.length === 0">
            <td colspan="7" class="empty-cell">No templates found</td>
          </tr>
          <template v-else>
            <tr v-for="template in filteredTemplates" :key="template.id">
              <td>{{ template.no }}</td>
              <td class="text-bold">{{ template.name }}</td>
              <td>{{ template.disease || '-' }}</td>
              <td>
                <span class="type-badge" :class="template.type.toLowerCase()">{{ template.type }}</span>
              </td>
              <td class="text-muted">{{ template.description || '-' }}</td>
              <td>{{ template.order }}</td>
              <td class="action-cell">
                <button class="icon-btn" type="button" @click="openEditForm(template)">Edit</button>
                <button class="icon-btn danger" type="button" @click="deleteTemplate(template)">Delete</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <form class="modal-panel" @submit.prevent="saveTemplate">
        <div class="modal-header">
          <h3>{{ editingTemplate ? 'Edit Template' : 'Add Template' }}</h3>
          <button class="close-btn" type="button" aria-label="Close" @click="closeForm">x</button>
        </div>

        <div class="form-grid">
          <label class="form-field">
            <span>No.</span>
            <input v-model.trim="form.no" type="text" required />
          </label>

          <label class="form-field">
            <span>Type</span>
            <select v-model="form.type" required>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </select>
          </label>
        </div>

        <label class="form-field">
          <span>Template Name</span>
          <input v-model.trim="form.name" type="text" required />
        </label>

        <label class="form-field">
          <span>Treatment On Disease</span>
          <input v-model.trim="form.disease" type="text" />
        </label>

        <label class="form-field">
          <span>Description</span>
          <input v-model.trim="form.description" type="text" />
        </label>

        <label class="form-field">
          <span>Order</span>
          <input v-model.number="form.order" type="number" min="0" step="1" required />
        </label>

        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="closeForm">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <ConfirmDialog
      :open="Boolean(templateToDelete)"
      :busy="deleting"
      title="Delete template?"
      message="This template will be permanently removed from the database."
      item-label="Template"
      :item-name="templateToDelete?.name"
      @cancel="templateToDelete = null"
      @confirm="confirmDeleteTemplate"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const templates = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const searchTerm = ref('')
const showForm = ref(false)
const editingTemplate = ref(null)
const templateToDelete = ref(null)

const form = reactive({
  no: '',
  name: '',
  disease: '',
  type: 'OPD',
  description: '',
  order: 0
})

const filteredTemplates = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  if (!query) return templates.value

  return templates.value.filter((template) =>
    [template.no, template.name, template.disease, template.type, template.description, template.order].some(
      (value) => String(value || '').toLowerCase().includes(query)
    )
  )
})

const getErrorMessage = (err, fallback) => err.response?.data?.error || fallback

const fetchTemplates = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('/api/templates')
    templates.value = response.data
  } catch (err) {
    console.error('Error fetching templates:', err)
    error.value = getErrorMessage(err, 'Cannot load templates from database')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.no = ''
  form.name = ''
  form.disease = ''
  form.type = 'OPD'
  form.description = ''
  form.order = templates.value.length + 1
}

const openCreateForm = () => {
  editingTemplate.value = null
  resetForm()
  error.value = ''
  showForm.value = true
}

const openEditForm = (template) => {
  editingTemplate.value = template
  form.no = template.no || ''
  form.name = template.name || ''
  form.disease = template.disease || ''
  form.type = template.type || 'OPD'
  form.description = template.description || ''
  form.order = template.order || 0
  error.value = ''
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingTemplate.value = null
  resetForm()
}

const saveTemplate = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload = {
      no: form.no,
      name: form.name,
      disease: form.disease,
      type: form.type,
      description: form.description,
      order: form.order
    }

    if (editingTemplate.value) {
      await axios.put(`/api/templates/${editingTemplate.value.id}`, payload)
    } else {
      await axios.post('/api/templates', payload)
    }

    closeForm()
    await fetchTemplates()
  } catch (err) {
    console.error('Error saving template:', err)
    error.value = getErrorMessage(err, 'Cannot save template')
  } finally {
    saving.value = false
  }
}

const deleteTemplate = (template) => {
  templateToDelete.value = template
}

const confirmDeleteTemplate = async () => {
  if (!templateToDelete.value) return

  deleting.value = true
  error.value = ''

  try {
    await axios.delete(`/api/templates/${templateToDelete.value.id}`)
    templateToDelete.value = null
    await fetchTemplates()
  } catch (err) {
    console.error('Error deleting template:', err)
    error.value = getErrorMessage(err, 'Cannot delete template')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchTemplates)
</script>

<style scoped>
.page-container { min-height: 100vh; padding: 20px; background: #f1f5f9; }
.header-actions, .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.header-actions h2 { margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; }
.page-subtitle { margin-top: 4px; color: #64748b; font-size: 13px; }
.search-input { width: min(100%, 360px); height: 38px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 12px; font-size: 14px; outline: none; }
.search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
.btn { height: 38px; border: 1px solid transparent; border-radius: 6px; padding: 0 14px; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn:disabled { cursor: not-allowed; opacity: 0.65; }
.btn-primary { background: #134e5e; color: #ffffff; }
.btn-secondary { background: #ffffff; color: #334155; border-color: #cbd5e1; }
.alert { margin-bottom: 16px; border-radius: 6px; padding: 10px 12px; font-size: 13px; font-weight: 600; }
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); }
.data-table { width: 100%; border-collapse: collapse; table-layout: fixed; text-align: left; }
.data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
.data-table th { background: #f8fafc; color: #64748b; font-weight: 800; text-transform: uppercase; }
.no-col { width: 76px; }
.type-col { width: 100px; }
.order-col { width: 100px; }
.action-col { width: 180px; text-align: right; }
.text-bold { color: #0f172a; font-weight: 700; }
.text-muted { color: #64748b; }
.type-badge { display: inline-flex; min-width: 46px; justify-content: center; border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 800; }
.type-badge.opd { background: #dcfce7; color: #15803d; }
.type-badge.ipd { background: #dbeafe; color: #1e40af; }
.action-cell { display: flex; justify-content: flex-end; gap: 8px; }
.icon-btn { min-width: 64px; height: 30px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; color: #334155; font-size: 12px; font-weight: 700; cursor: pointer; }
.icon-btn.danger { color: #b91c1c; border-color: #fecaca; }
.empty-cell { height: 90px; text-align: center; color: #64748b; }
.modal-backdrop { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.48); padding: 20px; }
.modal-panel { width: min(100%, 520px); background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.22); }
.modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.modal-header h3 { margin: 0; color: #0f172a; font-size: 18px; }
.close-btn { width: 30px; height: 30px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; color: #334155; cursor: pointer; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-field { display: grid; gap: 6px; margin-bottom: 14px; color: #334155; font-size: 13px; font-weight: 700; }
.form-field input, .form-field select { height: 38px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 10px; font-size: 14px; outline: none; }
.form-field input:focus, .form-field select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
@media (max-width: 860px) { .header-actions, .toolbar { align-items: stretch; flex-direction: column; } .search-input, .btn { width: 100%; } .data-table { min-width: 960px; } .table-card { overflow-x: auto; } .form-grid { grid-template-columns: 1fr; gap: 0; } }
</style>
