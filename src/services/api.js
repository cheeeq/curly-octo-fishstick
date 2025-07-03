import axios from 'axios'

// API Base URL - Local server
const API_BASE_URL = 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 saniye timeout
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Demo user token kontrolü
  const demoUser = localStorage.getItem('demo_user')
  if (demoUser) {
    try {
      const user = JSON.parse(demoUser)
      config.headers.Authorization = `Bearer demo-token-${user.id}`
      console.log('Demo token added:', `demo-token-${user.id}`)
    } catch (error) {
      console.error('Demo user parse error:', error)
      localStorage.removeItem('demo_user')
    }
  }
  
  return config
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // Token geçersizse logout yap
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message
      if (errorMessage && (errorMessage.includes('token') || errorMessage.includes('Geçersiz') || errorMessage.includes('Erişim'))) {
        console.log('Invalid token detected, logging out...')
        localStorage.removeItem('demo_user')
        window.location.href = '/login'
        return Promise.reject(new Error('Oturum süresi doldu, lütfen tekrar giriş yapın'))
      }
    }
    
    // CORS hatası için özel mesaj
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.')
    }
    
    return Promise.reject(error)
  }
)

// Auth Services
export const authService = {
  async signIn(email, password) {
    try {
      const { data } = await api.post('/auth/signin', { email, password })
      
      // Demo user için özel işlem
      if (email === 'admin@gateway.com') {
        const demoUser = {
          id: '00000000-0000-0000-0000-000000000000',
          email: email,
          profile: {
            full_name: 'Admin User',
            company: 'Demo Company',
            phone: '+90 555 123 4567',
            role: 'admin'
          }
        }
        
        localStorage.setItem('demo_user', JSON.stringify(demoUser))
        console.log('Demo user stored:', demoUser)
        return demoUser
      }
      
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Giriş başarısız')
    }
  },

  async signUp(email, password, userData = {}) {
    try {
      const { data } = await api.post('/auth/signup', { 
        email, 
        password, 
        userData 
      })
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Kayıt başarısız')
    }
  },

  async signOut() {
    try {
      await api.post('/auth/signout')
      localStorage.removeItem('demo_user')
    } catch (error) {
      console.error('Sign out error:', error)
      localStorage.removeItem('demo_user')
    }
  },

  async resetPassword(email) {
    try {
      const { data } = await api.post('/auth/reset-password', { email })
      return data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'E-posta gönderilemedi')
    }
  },

  async updatePassword(newPassword) {
    try {
      const { data } = await api.post('/auth/update-password', { password: newPassword })
      return data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Şifre güncellenemedi')
    }
  },

  async getCurrentUser() {
    try {
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        const user = JSON.parse(demoUser)
        console.log('Current demo user:', user)
        return user
      }

      const { data } = await api.get('/auth/user')
      return data.data.user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }
}

// Products Services
export const productsService = {
  async getAll() {
    try {
      const { data } = await api.get('/products')
      console.log('Products API response:', data)
      return data.data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw new Error(error.response?.data?.message || 'Ürünler alınamadı')
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/products/${id}`)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ürün bulunamadı')
    }
  },

  async create(productData) {
    try {
      console.log('Creating product:', productData)
      const { data } = await api.post('/products', productData)
      console.log('Product created:', data)
      return data.data
    } catch (error) {
      console.error('Error creating product:', error)
      throw new Error(error.response?.data?.message || 'Ürün oluşturulamadı')
    }
  },

  async update(id, productData) {
    try {
      const { data } = await api.put(`/products/${id}`, productData)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ürün güncellenemedi')
    }
  },

  async delete(id) {
    try {
      await api.delete(`/products/${id}`)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ürün silinemedi')
    }
  }
}

// Licenses Services
export const licensesService = {
  async getAll(filters = {}) {
    try {
      const { data } = await api.get('/licenses', { params: filters })
      console.log('Licenses API response:', data)
      return data.data || []
    } catch (error) {
      console.error('Error fetching licenses:', error)
      throw new Error(error.response?.data?.message || 'Lisanslar alınamadı')
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/licenses/${id}`)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lisans bulunamadı')
    }
  },

  async create(licenseData) {
    try {
      console.log('Creating license:', licenseData)
      const { data } = await api.post('/licenses', licenseData)
      console.log('License created:', data)
      return data.data
    } catch (error) {
      console.error('Error creating license:', error)
      throw new Error(error.response?.data?.message || 'Lisans oluşturulamadı')
    }
  },

  async update(id, licenseData) {
    try {
      const { data } = await api.put(`/licenses/${id}`, licenseData)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lisans güncellenemedi')
    }
  },

  async delete(id) {
    try {
      await api.delete(`/licenses/${id}`)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lisans silinemedi')
    }
  }
}

// Users Services
export const usersService = {
  async getAll() {
    try {
      const { data } = await api.get('/users')
      console.log('Users API response:', data)
      return data.data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error(error.response?.data?.message || 'Kullanıcılar alınamadı')
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/users/${id}`)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Kullanıcı bulunamadı')
    }
  },

  async update(id, userData) {
    try {
      const { data } = await api.put(`/users/${id}`, userData)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Kullanıcı güncellenemedi')
    }
  }
}

// Analytics Services
export const analyticsService = {
  async getDashboardStats() {
    try {
      const { data } = await api.get('/analytics/dashboard-stats')
      console.log('Analytics API response:', data)
      return data.data || {
        totalLicenses: 0,
        activeLicenses: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentActivities: []
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        totalLicenses: 0,
        activeLicenses: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentActivities: []
      }
    }
  }
}

// Reports Services
export const reportsService = {
  async generateLicenseReport(filters = {}) {
    try {
      const { data } = await api.get('/reports/license-report', { params: filters })
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Rapor oluşturulamadı')
    }
  },

  async generateUserReport() {
    try {
      const { data } = await api.get('/reports/user-report')
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Kullanıcı raporu oluşturulamadı')
    }
  },

  async generateRevenueReport() {
    try {
      const { data } = await api.get('/reports/revenue-report')
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gelir raporu oluşturulamadı')
    }
  },

  async generateFullReport() {
    try {
      const { data } = await api.get('/reports/full-report')
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Tam rapor oluşturulamadı')
    }
  }
}

// Notifications Services
export const notificationsService = {
  async getAll() {
    try {
      const { data } = await api.get('/notifications')
      return data.data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  async markAsRead(id) {
    try {
      const { data } = await api.put(`/notifications/${id}/read`)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Bildirim güncellenemedi')
    }
  },

  async markAllAsRead() {
    try {
      const { data } = await api.put('/notifications/mark-all-read')
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Bildirimler güncellenemedi')
    }
  },

  async delete(id) {
    try {
      await api.delete(`/notifications/${id}`)
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Bildirim silinemedi')
    }
  },

  async send(notificationData) {
    try {
      const { data } = await api.post('/notifications/send', notificationData)
      return data.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Bildirim gönderilemedi')
    }
  }
}

// License API Services (for API docs)
export const licenseApiService = {
  async testApi() {
    try {
      const response = await fetch('http://localhost:3001/api/license-api/test')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('API bağlantı hatası: ' + error.message)
    }
  },

  async testClientApi() {
    try {
      const response = await fetch('http://localhost:3001/api/license-api/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'demo-api-key-12345'
        },
        body: JSON.stringify({
          licensekey: 'DEMO-12345-ABCDE-67890',
          product: 'Demo Product',
          version: '1.0.0'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      throw new Error('Client API bağlantı hatası: ' + error.message)
    }
  }
}

// System Settings Services
export const settingsService = {
  async getSystemStatus() {
    try {
      const { data } = await api.get('/health')
      return {
        status: 'online',
        message: 'Tüm sistemler çalışıyor',
        lastCheck: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'offline',
        message: 'Sistem bağlantısı kurulamadı',
        lastCheck: new Date().toISOString()
      }
    }
  },

  async updateSystemSettings(settings) {
    // Local storage'da ayarları sakla
    localStorage.setItem('system_settings', JSON.stringify(settings))
    return settings
  },

  getSystemSettings() {
    const settings = localStorage.getItem('system_settings')
    return settings ? JSON.parse(settings) : {
      systemName: 'GateWay',
      systemDescription: 'Lisans Yönetimi',
      statusMessage: 'Tüm sistemler çalışıyor',
      maintenanceMode: false,
      autoRefresh: true,
      refreshInterval: 30000
    }
  }
}