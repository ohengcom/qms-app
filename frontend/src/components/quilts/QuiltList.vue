<template>
  <div class="quilt-list">
    <div class="filters">
      <el-radio-group v-model="seasonFilter" @change="applyFilters">
        <el-radio-button label="">All Seasons</el-radio-button>
        <el-radio-button label="winter">Winter</el-radio-button>
        <el-radio-button label="spring_autumn">Spring/Autumn</el-radio-button>
        <el-radio-button label="summer">Summer</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="statusFilter" @change="applyFilters" style="margin-left: 20px;">
        <el-radio-button label="">All Statuses</el-radio-button>
        <el-radio-button label="available">Available</el-radio-button>
        <el-radio-button label="in_use">In Use</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="filteredQuilts" v-loading="loading" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="item_number" label="ID" width="80" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="season" label="Season">
        <template #default="scope">
          <el-tag :type="getSeasonTagType(scope.row.season)">{{ scope.row.season }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="weight_grams" label="Weight (g)" />
      <el-table-column prop="location" label="Location" />
      <el-table-column prop="current_status" label="Status">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.current_status)">{{ scope.row.current_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="viewDetails(scope.row)">Details</el-button>
          <el-button size="small" type="danger" @click="deleteQuilt(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuiltsStore } from '@/stores/quilts'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const quiltsStore = useQuiltsStore()

const loading = computed(() => quiltsStore.loading)
const filteredQuilts = computed(() => quiltsStore.filteredQuilts)

const seasonFilter = ref('')
const statusFilter = ref('')

const applyFilters = () => {
  quiltsStore.setFilter('season', seasonFilter.value)
  quiltsStore.setFilter('status', statusFilter.value)
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

const viewDetails = (quilt) => {
  router.push({ name: 'QuiltDetail', params: { id: quilt.id } })
}

const deleteQuilt = (quilt) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${quilt.name}"? This action cannot be undone.`,
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    quiltsStore.deleteQuilt(quilt.id).then(() => {
      ElMessage({
        type: 'success',
        message: 'Delete completed',
      })
      quiltsStore.fetchDashboardStats()
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: 'Delete canceled',
    })
  })
}

onMounted(() => {
  quiltsStore.fetchQuilts()
})
</script>

<style scoped>
.filters {
  display: flex;
  gap: 20px;
}
</style>