<template>
  <div class="app-shell">
    <div class="layout-shell">
      <Sidebar />
      <main class="content-shell">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Kantumruy Pro', system-ui, -apple-system, sans-serif;
}

html, body, #app {
  margin: 0;
  width: 100%;
  min-height: 100%;
  background: #f1f5f9;
}

.app-shell {
  min-height: 100vh;
  width: 100%;
  background: #f1f5f9;
}

.layout-shell {
  display: flex;
  min-height: 100vh;
  align-items: stretch;
}

.sidebar {
  flex-shrink: 0;
}

.content-shell {
  flex: 1;
  min-width: 0;
  background: #f1f5f9;
  overflow-y: auto;
  padding: 20px;
}
</style>
