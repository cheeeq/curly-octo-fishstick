import express from 'express'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await db.allAsync(
      'SELECT id, email, full_name, company, phone, role, created_at FROM users ORDER BY created_at DESC'
    )

    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken hata oluştu'
    })
  }
})

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync(
      'SELECT id, email, full_name, company, phone, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Kullanıcı alınırken hata oluştu'
    })
  }
})

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { full_name, company, phone, role } = req.body
    const userId = req.params.id

    const user = await db.getAsync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      })
    }

    await db.runAsync(`
      UPDATE users 
      SET full_name = ?, company = ?, phone = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      full_name !== undefined ? full_name : user.full_name,
      company !== undefined ? company : user.company,
      phone !== undefined ? phone : user.phone,
      role !== undefined ? role : user.role,
      userId
    ])

    const updatedUser = await db.getAsync(
      'SELECT id, email, full_name, company, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    )

    res.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu'
    })
  }
})

export default router