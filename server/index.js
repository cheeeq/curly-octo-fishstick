import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Routes
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import licensesRoutes from './routes/licenses.js'
import usersRoutes from './routes/users.js'
import analyticsRoutes from './routes/analytics.js'
import reportsRoutes from './routes/reports.js'
import licenseApiRoutes from './routes/license-api.js'

// Database
import { initDatabase } from './database/init.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

// CORS configuration - Frontend URL'i düzelt
app.use(cors({
  origin: [
    'http://localhost:3000',  // Vite dev server
    'http://localhost:5173',  // Alternatif Vite port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.'
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Initialize database
await initDatabase()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/licenses', licensesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/license-api', licenseApiRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GateWay API Server çalışıyor',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : 'İç sunucu hatası'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 GateWay API Server ${PORT} portunda çalışıyor`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 License API: http://localhost:${PORT}/api/license-api`)
  console.log(`🌐 CORS enabled for: http://localhost:3000`)
})