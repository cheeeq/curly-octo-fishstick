import express from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/init.js'
import { generateToken, authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gerekli'
      })
    }

    console.log('Sign in attempt for:', email)

    // Demo user için özel durum
    if (email === 'admin@gateway.com') {
      console.log('Demo user login attempt')
      
      const demoUser = {
        id: '00000000-0000-0000-0000-000000000000',
        email: email,
        full_name: 'Admin User',
        company: 'Demo Company',
        phone: '+90 555 123 4567',
        role: 'admin'
      }

      const token = generateToken(demoUser)
      
      return res.json({
        success: true,
        data: {
          user: {
            id: demoUser.id,
            email: demoUser.email,
            profile: {
              full_name: demoUser.full_name,
              company: demoUser.company,
              phone: demoUser.phone,
              role: demoUser.role
            }
          },
          session: { access_token: token }
        }
      })
    }

    // Normal user authentication
    const user = await db.getAsync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      console.log('User not found:', email)
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      })
    }

    console.log('User found:', user.email)

    // For demo purposes, accept any password for existing users
    // In production, use: const validPassword = await bcrypt.compare(password, user.password_hash)
    const validPassword = true

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      })
    }

    const token = generateToken(user)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: {
            full_name: user.full_name,
            company: user.company,
            phone: user.phone,
            role: user.role
          }
        },
        session: { access_token: token }
      }
    })
  } catch (error) {
    console.error('Sign in error:', error)
    res.status(500).json({
      success: false,
      message: 'Giriş yapılırken hata oluştu'
    })
  }
})

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, userData = {} } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gerekli'
      })
    }

    console.log('Sign up attempt for:', email)

    // Check if user already exists
    const existingUser = await db.getAsync(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      console.log('User already exists:', email)
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      })
    }

    const userId = uuidv4()
    const passwordHash = await bcrypt.hash(password, 10)

    console.log('Creating new user:', { userId, email, userData })

    // Insert user into database
    await db.runAsync(`
      INSERT INTO users (id, email, password_hash, full_name, company, phone, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      email,
      passwordHash,
      userData.full_name || '',
      userData.company || '',
      userData.phone || '',
      userData.role || 'user'
    ])

    console.log('User created successfully')

    // Get the created user
    const user = await db.getAsync(
      'SELECT id, email, full_name, company, phone, role FROM users WHERE id = ?',
      [userId]
    )

    if (!user) {
      throw new Error('Kullanıcı oluşturuldu ancak geri alınamadı')
    }

    const token = generateToken(user)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: {
            full_name: user.full_name,
            company: user.company,
            phone: user.phone,
            role: user.role
          }
        },
        session: { access_token: token }
      }
    })
  } catch (error) {
    console.error('Sign up error:', error)
    res.status(500).json({
      success: false,
      message: 'Kayıt olurken hata oluştu: ' + error.message
    })
  }
})

// Get Current User
router.get('/user', authenticateToken, async (req, res) => {
  try {
    console.log('Get current user request for:', req.user?.email)
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          profile: {
            full_name: req.user.full_name,
            company: req.user.company,
            phone: req.user.phone,
            role: req.user.role
          }
        }
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken hata oluştu'
    })
  }
})

// Sign Out
router.post('/signout', (req, res) => {
  console.log('Sign out request')
  res.json({
    success: true,
    message: 'Başarıyla çıkış yapıldı'
  })
})

export default router