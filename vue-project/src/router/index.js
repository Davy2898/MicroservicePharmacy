import { createRouter, createWebHistory } from 'vue-router'
import PharmacyView from '@/views/PharmacyView.vue'
import InventoryView from '@/views/InventoryView.vue'
import CategoryView from '@/views/CategoryView.vue'
import MedicineView from '@/views/MedicineView.vue'
import UnitView from '@/views/UnitView.vue'
import DoseUnitView from '@/views/DoseUnitView.vue'
import RouteView from '@/views/RouteView.vue'
import FormView from '@/views/FormView.vue'
import TemplateView from '@/views/TemplateView.vue'
import SettingsView from '@/views/SettingsView.vue'
import DosageView from '@/views/dosage/DosageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'medicines',
      component: MedicineView
    },
    {
      path: '/pharmacy',
      name: 'pharmacy-page',
      component: PharmacyView
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryView
    },
    {
      path: '/medicines',
      name: 'medicines',
      component: MedicineView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoryView
    },
    {
      path: '/units',
      name: 'units',
      component: UnitView
    },
    {
      path: '/dose-units',
      name: 'dose-units',
      component: DoseUnitView
    },
    {
      path: '/routes',
      name: 'routes',
      component: RouteView
    },
    {
      path: '/forms',
      name: 'forms',
      component: FormView
    },
    {
      path: '/templates',
      name: 'templates',
      component: TemplateView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/dosage',
      name: 'dosage',
      component: DosageView
    }
  ]
})

export default router
