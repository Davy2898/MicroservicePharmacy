<template>
  <aside class="sidebar">
    <div class="sidebar-inner">
      <div class="nav-header">
        <div class="title-block">
          <span class="section-label">Clinical</span>
          <router-link to="/pharmacy" class="nav-item compact" active-class="active">
            <span class="icon">💊</span>
            <span>Pharmacy</span>
          </router-link>
        </div>
      </div>

      <div class="nav-group">
        <h2 class="page-title">Pharmacy Settings</h2>
        <router-link to="/medicines" class="nav-item" active-class="active">
          <span class="icon">💊</span>
          <span>Medicines</span>
        </router-link>
        <router-link to="/categories" class="nav-item" active-class="active">
          <span class="icon">🏷️</span>
          <span>Categories</span>
        </router-link>
        <router-link to="/units" class="nav-item" active-class="active">
          <span class="icon">📏</span>
          <span>Units</span>
        </router-link>
        <router-link to="/dose-units" class="nav-item" active-class="active">
          <span class="icon">🧪</span>
          <span>Dose Units</span>
        </router-link>
        <router-link to="/routes" class="nav-item" active-class="active">
          <span class="icon">🛣️</span>
          <span>Routes</span>
        </router-link>
        <router-link to="/forms" class="nav-item" active-class="active">
          <span class="icon">🧾</span>
          <span>Forms</span>
        </router-link>
        <router-link to="/templates" class="nav-item" active-class="active">
          <span class="icon">📋</span>
          <span>Templates</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<style scoped>
:root {
  --sidebar-bg: #ffffff;
  --sidebar-text: #64748b;
  --sidebar-hover: #f8fafc;
  --sidebar-active-bg: #eff6ff;
  --sidebar-active-text: #2563eb;
  --sidebar-border: #e2e8f0;
  --sidebar-shadow: 0 2px 4px rgba(0,0,0,0.05);
  --sidebar-radius: 8px;
  --sidebar-width: 260px;
}

.sidebar {
  flex: 0 0 var(--sidebar-width);
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  max-width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  padding: 24px 20px;
  box-sizing: border-box;
  box-shadow: var(--sidebar-shadow);
  border-right: 1px solid var(--sidebar-border);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.nav-header {
  margin-bottom: 4px;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--sidebar-text);
  opacity: 0.8;
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 12px;
  color: #1e293b;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  border-radius: var(--sidebar-radius);
  transition: all 0.2s ease;
  background-color: transparent;
  border: 1px solid transparent;
}

.nav-item.compact {
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
}

.nav-item:hover {
  background-color: var(--sidebar-hover);
  color: #334155;
}

.nav-item.active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
  border-color: #dbeafe;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  text-align: center;
  font-size: 17px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    flex: 0 0 220px;
    width: 220px;
    min-width: 220px;
    max-width: 220px;
    padding: 20px 14px;
  }

  .page-title {
    font-size: 18px;
  }

  .nav-item {
    font-size: 13px;
    padding: 8px 10px;
  }

  .icon {
    width: 20px;
    min-width: 20px;
    font-size: 15px;
  }
}
</style>