export default {
  language: {
    label: 'Language',
    english: 'English',
    khmer: 'Khmer'
  },
  nav: {
    clinical: 'Clinical',
    pharmacy: 'Pharmacy',
    pharmacySettings: 'Pharmacy Settings',
    medicines: 'Medicines',
    categories: 'Categories',
    units: 'Units',
    doseUnits: 'Dose Units',
    routes: 'Routes',
    forms: 'Forms',
    templates: 'Templates',
    inventory: 'Inventory',
    settings: 'Settings'
  },
  common: {
    add: 'Add',
    refresh: 'Refresh',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    edit: 'Edit',
    delete: 'Delete',
    action: 'Action',
    close: 'Close',
    barcode: 'Barcode',
    name: 'Name',
    description: 'Description',
    order: 'Order',
    no: 'No.',
    uom: 'UoM',
    code: 'Code',
    default: 'Default',
    yes: 'Yes',
    noValue: 'No',
    type: 'Type'
  },
  medicine: {
    title: 'Medicine Management',
    subtitle: '{count} medicines in database',
    add: '+ Add Medicine',
    search: 'Search by name or barcode',
    tableName: 'Medicine',
    loading: 'Loading medicines...',
    empty: 'No medicines found',
    formAdd: 'Add Medicine',
    formEdit: 'Edit Medicine',
    name: 'Medicine Name',
    deleteTitle: 'Delete medicine?',
    deleteMessage: 'This medicine will be permanently removed from the database.',
    deleteLabel: 'Medicine',
    errors: {
      load: 'Cannot load medicines from database',
      save: 'Cannot save medicine',
      delete: 'Cannot delete medicine'
    }
  },
  category: {
    title: 'Category Management',
    subtitle: '{count} categories in database',
    add: '+ Add Category',
    search: 'Search category',
    loading: 'Loading categories...',
    empty: 'No categories found',
    formAdd: 'Add Category',
    formEdit: 'Edit Category',
    deleteTitle: 'Delete category?',
    deleteMessage: 'This category will be permanently removed from the database.',
    deleteLabel: 'Category',
    errors: {
      load: 'Cannot load categories from database',
      save: 'Cannot save category',
      delete: 'Cannot delete category'
    }
  },
  unit: {
    title: 'Unit Management',
    subtitle: '{count} units in database',
    add: '+ Add Unit',
    search: 'Search unit',
    tableName: 'Unit',
    name: 'Unit Name',
    defaultUnit: 'Default unit',
    loading: 'Loading units...',
    empty: 'No units found',
    formAdd: 'Add Unit',
    formEdit: 'Edit Unit',
    deleteTitle: 'Delete unit?',
    deleteMessage: 'This unit will be permanently removed from the database.',
    deleteLabel: 'Unit',
    errors: {
      load: 'Cannot load units from database',
      save: 'Cannot save unit',
      delete: 'Cannot delete unit'
    }
  },
  doseUnit: {
    title: 'Dose Unit Management',
    subtitle: '{count} dose units in database',
    add: '+ Add Dose Unit',
    search: 'Search dose unit',
    tableName: 'Unit',
    name: 'Unit Name',
    loading: 'Loading dose units...',
    empty: 'No dose units found',
    formAdd: 'Add Dose Unit',
    formEdit: 'Edit Dose Unit',
    deleteTitle: 'Delete dose unit?',
    deleteMessage: 'This dose unit will be permanently removed from the database.',
    deleteLabel: 'Dose unit',
    errors: {
      load: 'Cannot load dose units from database',
      save: 'Cannot save dose unit',
      delete: 'Cannot delete dose unit'
    }
  },
  route: {
    title: 'Route Management',
    subtitle: '{count} routes in database',
    add: '+ Add Route',
    search: 'Search route',
    name: 'Route Name',
    loading: 'Loading routes...',
    empty: 'No routes found',
    formAdd: 'Add Route',
    formEdit: 'Edit Route',
    deleteTitle: 'Delete route?',
    deleteMessage: 'This route will be permanently removed from the database.',
    deleteLabel: 'Route',
    errors: {
      load: 'Cannot load routes from database',
      save: 'Cannot save route',
      delete: 'Cannot delete route'
    }
  },
  form: {
    title: 'Form Management',
    subtitle: '{count} forms in database',
    add: '+ Add Form',
    search: 'Search form',
    name: 'Form Name',
    loading: 'Loading forms...',
    empty: 'No forms found',
    formAdd: 'Add Form',
    formEdit: 'Edit Form',
    deleteTitle: 'Delete form?',
    deleteMessage: 'This form will be permanently removed from the database.',
    deleteLabel: 'Form',
    errors: {
      load: 'Cannot load forms from database',
      save: 'Cannot save form',
      delete: 'Cannot delete form'
    }
  },
  template: {
    title: 'Medicine Template',
    subtitle: '{count} templates in database',
    add: '+ Add Template',
    search: 'Search template',
    name: 'Template Name',
    disease: 'Treatment On Disease',
    loading: 'Loading templates...',
    empty: 'No templates found',
    formAdd: 'Add Template',
    formEdit: 'Edit Template',
    deleteTitle: 'Delete template?',
    deleteMessage: 'This template will be permanently removed from the database.',
    deleteLabel: 'Template',
    errors: {
      load: 'Cannot load templates from database',
      save: 'Cannot save template',
      delete: 'Cannot delete template'
    }
  },
  inventory: {
    title: 'Inventory & Stock Control',
    subtitle: '{count} stocked medicines',
    stockIn: '+ Stock In',
    search: 'Search by name or barcode',
    medicineName: 'Medicine Name',
    stockQty: 'Stock Qty',
    expiryDate: 'Expiry Date',
    expiryStatus: 'Expiry Status',
    loading: 'Loading inventory...',
    empty: 'No stock records found',
    restock: 'Restock',
    adjust: 'Adjust',
    stockInTitle: 'Stock In',
    adjustTitle: 'Adjust Stock',
    medicine: 'Medicine',
    selectMedicine: 'Select medicine',
    searchMedicine: 'Search medicine or barcode',
    noMedicine: 'No medicine found',
    quantityToAdd: 'Quantity To Add',
    stockUnit: 'Stock Unit',
    currentStockQty: 'Current Stock Qty',
    saveStock: 'Save Stock',
    updateStock: 'Update Stock',
    selectMedicineError: 'Please select a medicine',
    status: {
      normal: 'Normal',
      nearExpiry: 'Near Expiry',
      expired: 'Expired',
      outOfStock: 'Out of Stock'
    },
    errors: {
      load: 'Cannot load inventory from database',
      save: 'Cannot save stock',
      update: 'Cannot update stock'
    }
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage system preferences',
    language: {
      title: 'Language',
      description: 'Choose the language used across the pharmacy system.'
    }
  }
}
