import { defineStore } from 'pinia'
import api from '../services/api'

export const useQuiltsStore = defineStore('quilts', {
  state: () => ({
    quilts: [],
    currentQuilt: null,
    loading: false,
    error: null,
    filters: {
      season: null,
      status: null,
      searchTerm: ''
    },
    dashboardStats: null,
  }),

  getters: {
    filteredQuilts: (state) => {
      return state.quilts.filter(quilt => {
        if (state.filters.season && quilt.season !== state.filters.season) return false
        if (state.filters.status && quilt.current_status !== state.filters.status) return false
        if (state.filters.searchTerm && !quilt.name.toLowerCase().includes(state.filters.searchTerm.toLowerCase())) return false
        return true
      })
    },
    inUseQuilts: (state) => state.quilts.filter(q => q.current_status === 'in_use'),
    availableQuilts: (state) => state.quilts.filter(q => q.current_status === 'available'),
  },

  actions: {
    async fetchQuilts() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/api/quilts/')
        this.quilts = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async fetchQuiltById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/api/quilts/${id}`)
        this.currentQuilt = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async createQuilt(quiltData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/api/quilts/', quiltData)
        this.quilts.push(response.data)
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateQuilt(quiltData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/api/quilts/${quiltData.id}`, quiltData)
        const index = this.quilts.findIndex(q => q.id === quiltData.id)
        if (index !== -1) {
          this.quilts[index] = response.data
        }
        this.currentQuilt = response.data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteQuilt(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/api/quilts/${id}`)
        this.quilts = this.quilts.filter(q => q.id !== id)
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchDashboardStats() {
        this.loading = true
        this.error = null
        try {
            const response = await api.get('/api/analytics/dashboard')
            this.dashboardStats = response.data
        } catch (error) {
            this.error = error
        } finally {
            this.loading = false
        }
    },

    setFilter(filterType, value) {
        this.filters[filterType] = value
    }
  }
})