export default {
  message: {
    hello: 'Hello',
    welcome: 'Welcome to our Pharmacy Management System',
    // Category Management
    category: {
      title: 'Category Management',
      subtitle: '{{count}} categories in database',
      addCategory: '+ Add Category',
      searchPlaceholder: 'Search category',
      refresh: 'Refresh',
      noCategories: 'No categories found',
      loading: 'Loading categories...',
      table: {
        name: 'Name',
        description: 'Description',
        order: 'Order',
        action: 'Action'
      },
      form: {
        title: {
          add: 'Add Category',
          edit: 'Edit Category'
        },
        fields: {
          name: 'Name',
          description: 'Description',
          order: 'Order'
        },
        actions: {
          cancel: 'Cancel',
          save: 'Save',
          saving: 'Saving...'
        }
      },
      messages: {
        error: {
          load: 'Cannot load categories from database',
          save: 'Cannot save category',
          delete: 'Cannot delete category'
        },
        confirm: {
          delete: 'Delete {{name}}?'
        }
      }
    }
  }
}
