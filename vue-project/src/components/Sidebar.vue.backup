<template>
  <aside class="sidebar">
    <!-- Section: Core -->
    <div class="nav-section">
      <router-link to="/dashboard" class="nav-item" active-class="active">
        <span class="icon">🎛️</span>
        <span>Dashboard</span>
      </router-link>
    </div>

    <!-- Section: Register -->
    <div class="nav-section">
      <span class="section-title">Register</span>
      <router-link to="/patients" class="nav-item" active-class="active">
        <span class="icon">👥</span>
        <span>Patients</span>
      </router-link>
      <router-link to="/appointments" class="nav-item" active-class="active">
        <span class="icon">📅</span>
        <span>Appointments</span>
      </router-link>
      <router-link to="/register-visit" class="nav-item" active-class="active">
        <span class="icon">👤+</span>
        <span>Register visit</span>
      </router-link>
      <router-link to="/queue" class="nav-item" active-class="active">
        <span class="icon">📋</span>
        <span>Queue</span>
      </router-link>
    </div>

    <!-- Section: Clinical -->
    <div class="nav-section">
      <span class="section-title">Clinical</span>
      <router-link to="/visit-list" class="nav-item" active-class="active">
        <span class="icon">➕</span>
        <span>Visit list</span>
      </router-link>
      <router-link to="/ward-board" class="nav-item" active-class="active">
        <span class="icon">🛏️</span>
        <span>Ward board</span>
      </router-link>
      <router-link to="/ipd-nursing" class="nav-item" active-class="active">
        <span class="icon">🩺</span>
        <span>IPD Nursing</span>
      </router-link>
      <router-link to="/laboratory" class="nav-item" active-class="active">
        <span class="icon">🔬</span>
        <span>Laboratory</span>
      </router-link>
      <router-link to="/radiology" class="nav-item" active-class="active">
        <span class="icon">📷</span>
        <span>Radiology</span>
      </router-link>
      <router-link to="/pharmacy" class="nav-item" active-class="active">
        <span class="icon">💊</span>
        <span>Pharmacy</span>
      </router-link>
    </div>

    <!-- Section: Inventory & Configurations -->
    <div class="nav-section">
      <span class="section-title">Pharmacy Settings</span>
      <router-link to="/inventory" class="nav-item" active-class="active">
        <span class="icon">📦</span>
        <span>Inventory</span>
      </router-link>
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
      <router-link to="/pharmacy" class="nav-item" active-class="active">
        <span class="icon">🏥</span>
        <span>Pharmacy</span>
      </router-link>
      <router-link to="/routes" class="nav-item" active-class="active">
        <span class="icon">🧭</span>
        <span>Routes</span>
      </router-link>
      <router-link to="/templates" class="nav-item" active-class="active">
        <span class="icon">🧾</span>
        <span>Templates</span>
      </router-link>
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
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 52px);
  overflow-y: auto;
  border-right: 1px solid var(--sidebar-border);
  box-shadow: var(--sidebar-shadow);
}

.section-title {
  font-size: 11px;
  color: var(--sidebar-text);
  padding: 4px 12px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.8;
}

.nav-section:nth-of-type(-n+3) {
  display: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--sidebar-text);
  border-radius: var(--sidebar-radius);
  text-decoration: none;
  margin-top: 2px;
  transition: all 0.2s ease;
  background-color: transparent;
  border: 1px solid transparent;
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
  font-size: 14px;
}
</style>
