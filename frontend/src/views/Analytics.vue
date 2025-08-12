<template>
  <div class="analytics-page">
    <AppHeader />
    <div class="page-container">
      <h1>Analytics</h1>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>Seasonal Distribution</template>
            <div style="height: 300px;">
              <Doughnut :data="seasonalData" :options="chartOptions" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>Brand Distribution</template>
            <div style="height: 300px;">
              <Bar :data="brandData" :options="chartOptions" />
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px;">
        <el-col :span="24">
           <el-card>
            <template #header>Top 5 Most Used Quilts</template>
            <el-table :data="topUsedQuilts" style="width: 100%">
                <el-table-column prop="quilt.name" label="Name" />
                <el-table-column prop="stats.usage_count" label="Usage Count" />
                <el-table-column prop="stats.total_usage_days" label="Total Days Used" />
                <el-table-column prop="stats.average_duration" label="Avg. Duration (days)" />
            </el-table>
           </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuiltsStore } from '@/stores/quilts'
import AppHeader from '../components/layout/AppHeader.vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const quiltsStore = useQuiltsStore()
const stats = computed(() => quiltsStore.dashboardStats)

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
})

const seasonalData = computed(() => ({
  labels: Object.keys(stats.value?.seasonal_distribution || {}),
  datasets: [
    {
      backgroundColor: ['#409EFF', '#67C23A', '#E6A23C'],
      data: Object.values(stats.value?.seasonal_distribution || {})
    }
  ]
}))

const brandData = computed(() => ({
    labels: Object.keys(stats.value?.brand_distribution || {}),
    datasets: [
        {
            label: 'Quilts by Brand',
            backgroundColor: '#F56C6C',
            data: Object.values(stats.value?.brand_distribution || {})
        }
    ]
}))

const topUsedQuilts = computed(() => stats.value?.top_used_quilts || [])

onMounted(() => {
  quiltsStore.fetchDashboardStats()
})
</script>