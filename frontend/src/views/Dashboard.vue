<template>
  <div class="dashboard-page">
    <AppHeader />
    <div class="page-container">
      <el-row :gutter="20">
        <el-col :span="24">
          <DashboardStats />
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Quilts Inventory</span>
                <el-button type="primary" @click="showAddQuiltDialog = true">Add Quilt</el-button>
              </div>
            </template>
            <QuiltList />
          </el-card>
        </el-col>
      </el-row>
    </div>
    <AddQuiltDialog v-model="showAddQuiltDialog" @quilt-added="onQuiltAdded" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import DashboardStats from '../components/dashboard/DashboardStats.vue'
import QuiltList from '../components/quilts/QuiltList.vue'
import AddQuiltDialog from '../components/quilts/AddQuiltDialog.vue'
import { useQuiltsStore } from '@/stores/quilts'

const showAddQuiltDialog = ref(false)
const quiltsStore = useQuiltsStore()

const onQuiltAdded = () => {
  showAddQuiltDialog.value = false
  quiltsStore.fetchQuilts()
  quiltsStore.fetchDashboardStats()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>