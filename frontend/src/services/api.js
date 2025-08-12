import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor for handling errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.detail || error.message
    // Here you could add a global notification system
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default apiClient