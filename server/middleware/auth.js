import jwt from 'jsonwebtoken'
import { db } from '../database/init.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    let token = null

    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      } else {
        token = authHeader
      }
    }

    console.log('Auth middleware - token:', token ? 'present' : 'missing')

    // Demo user için özel kontrol
    if (token && token.startsWith('demo-token-')) {
      const userId = token.replace('demo-token-', '')
      console.log('Demo token detected for user:', userId)
      
      // Demo user bilgilerini oluştur
      const demoUser = {
        id: userId,
        email: 'admin@gateway.com',
        full_name: 'Admin User',
        company: 'Demo Company',
        phone: '+90 555 123 4567',
        role: 'admin'
      }
      
      req.user = demoUser
      return next()
    }

    if (!token) {
      console.log('No token provided')
      return res.status(401).json({
        success: false,
        message: 'Erişim token\'ı gerekli'
      })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('Invalid token')
      return res.status(403).json({
        success: false,
        message: 'Geçersiz token'
      })
    }

    console.log('Token decoded successfully for user:', decoded.email)

    // Get user from database
    const user = await db.getAsync(
      'SELECT id, email, full_name, company, phone, role FROM users WHERE id = ?',
      [decoded.id]
    )

    if (!user) {
      console.log('User not found in database:', decoded.id)
      return res.status(403).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      })
    }

    console.log('User authenticated successfully:', user.email)
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Kimlik doğrulama hatası'
    })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gerekli'
    })
  }
  next()
}