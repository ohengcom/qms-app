<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// Main App component
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f5f7fa;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

.page-container {
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  .page-container {
    padding: 10px;
  }
}
</style>