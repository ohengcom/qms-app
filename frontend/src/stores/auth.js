import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/token', credentials, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        this.token = response.data.access_token
        localStorage.setItem('token', this.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        await this.fetchUser()
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
        this.loading = true
        this.error = null
        try {
            await api.post('/auth/users/', userData)
            await this.login({ username: userData.username, password: userData.password })
        } catch (error) {
            this.error = error
            throw error
        } finally {
            this.loading = false
        }
    },

    async fetchUser() {
        if (!this.token) return
        this.loading = true
        this.error = null
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            const response = await api.get('/auth/users/me/')
            this.user = response.data
        } catch (error) {
            this.error = error
            this.logout()
        } finally {
            this.loading = false
        }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      this.router.push('/login')
    },
  },
})