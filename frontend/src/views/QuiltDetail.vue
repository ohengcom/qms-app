<template>
  <div class="quilt-detail-page">
    <AppHeader />
    <div class="page-container" v-if="quilt" v-loading="loading">
      <el-page-header @back="goBack" :content="`Quilt #${quilt.item_number}: ${quilt.name}`" />
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="16">
          <el-card>
            <template #header>
              <span>Details</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Name">{{ quilt.name }}</el-descriptions-item>
              <el-descriptions-item label="Item Number">{{ quilt.item_number }}</el-descriptions-item>
              <el-descriptions-item label="Season">
                <el-tag :type="getSeasonTagType(quilt.season)">{{ quilt.season }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusTagType(quilt.current_status)">{{ quilt.current_status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Weight">{{ quilt.weight_grams }}g</el-descriptions-item>
              <el-descriptions-item label="Size">{{ quilt.length_cm }}cm x {{ quilt.width_cm }}cm</el-descriptions-item>
              <el-descriptions-item label="Fill Material">{{ quilt.fill_material }}</el-descriptions-item>
              <el-descriptions-item label="Color">{{ quilt.color }}</el-descriptions-item>
              <el-descriptions-item label="Location">{{ quilt.location }}</el-descriptions-item>
              <el-descriptions-item label="Brand">{{ quilt.brand }}</el-descriptions-item>
              <el-descriptions-item label="Purchase Date">{{ quilt.purchase_date }}</el-descriptions-item>
              <el-descriptions-item label="Notes">{{ quilt.notes }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>Usage History</span>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="period in quilt.usage_periods"
                :key="period.id"
                :timestamp="`${period.start_date} to ${period.end_date || 'Present'}`"
              >
                {{ period.notes }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuiltsStore } from '@/stores/quilts'
import AppHeader from '../components/layout/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const quiltsStore = useQuiltsStore()

const quiltId = ref(route.params.id)
const quilt = computed(() => quiltsStore.currentQuilt)
const loading = computed(() => quiltsStore.loading)

const goBack = () => {
  router.push({ name: 'Dashboard' })
}

const getSeasonTagType = (season) => {
  if (season === 'winter') return 'info'
  if (season === 'summer') return 'warning'
  return 'success'
}

const getStatusTagType = (status) => {
  if (status === 'in_use') return 'danger'
  if (status === 'available') return 'success'
  return 'info'
}

onMounted(() => {
  quiltsStore.fetchQuiltById(quiltId.value)
})
</script>

<style scoped>
.el-page-header {
  margin-bottom: 20px;
}
</style>