<template>
  <el-header class="app-header">
    <div class="logo">
      <router-link to="/">QMS</router-link>
    </div>
    <el-menu mode="horizontal" :router="true" :default-active="$route.path" class="main-menu">
      <el-menu-item index="/">Dashboard</el-menu-item>
      <el-menu-item index="/analytics">Analytics</el-menu-item>
      <el-menu-item index="/settings">Settings</el-menu-item>
    </el-menu>
    <div class="header-actions">
      <el-input
        v-model="searchTerm"
        placeholder="Search quilts..."
        class="search-input"
        :prefix-icon="Search"
        @input="onSearch"
      />
      <el-button v-if="authStore.isAuthenticated" @click="authStore.logout()" style="margin-left: 20px;">Logout</el-button>
    </div>
  </el-header>
</template>

<script setup>
import { ref } from 'vue'
import { useQuiltsStore } from '@/stores/quilts'
import { useAuthStore } from '@/stores/auth'
import { Search } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

const quiltsStore = useQuiltsStore()
const authStore = useAuthStore()
const searchTerm = ref('')

const onSearch = debounce(() => {
  quiltsStore.setFilter('searchTerm', searchTerm.value)
}, 300)
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.logo a {
  text-decoration: none;
  color: #303133;
}

.main-menu {
  border-bottom: none;
  flex-grow: 1;
  margin-left: 40px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.search-input {
  width: 240px;
}
</style>