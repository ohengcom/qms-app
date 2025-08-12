<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-icon" style="background-color: #e6f7ff;">
            <el-icon color="#1890ff" :size="32"><Box /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">Total Quilts</div>
            <div class="stat-value">{{ stats?.total_quilts || 0 }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-icon" style="background-color: #f6ffed;">
            <el-icon color="#52c41a" :size="32"><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">Available</div>
            <div class="stat-value">{{ stats?.available_count || 0 }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-icon" style="background-color: #fffbe6;">
            <el-icon color="#faad14" :size="32"><HomeFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">In Use</div>
            <div class="stat-value">{{ stats?.in_use_count || 0 }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover">
        <div class="stat-item">
          <div class="stat-icon" style="background-color: #fff1f0;">
            <el-icon color="#f5222d" :size="32"><Tools /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">Maintenance</div>
            <div class="stat-value">{{ stats?.maintenance_count || 0 }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useQuiltsStore } from '@/stores/quilts'
import { Box, Check, HomeFilled, Tools } from '@element-plus/icons-vue'

const quiltsStore = useQuiltsStore()
const stats = computed(() => quiltsStore.dashboardStats)

onMounted(() => {
  quiltsStore.fetchDashboardStats()
})
</script>

<style scoped>
.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-title {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #262626;
}
</style>