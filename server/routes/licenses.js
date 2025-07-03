import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

function generateLicenseKey() {
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(Math.random().toString(36).substring(2, 7).toUpperCase())
  }
  return segments.join('-')
}

// Get all licenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query

    let query = `
      SELECT 
        l.*,
        p.name as product_name,
        p.version as product_version,
        u.full_name as user_full_name,
        u.company as user_company,
        u.phone as user_phone,
        u.role as user_role
      FROM licenses l
      LEFT JOIN products p ON l.product_id = p.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `
    const params = []

    if (status && status !== 'all') {
      query += ' AND l.status = ?'
      params.push(status)
    }

    if (search) {
      query += ' AND l.license_key LIKE ?'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY l.created_at DESC'

    const licenses = await db.allAsync(query, params)

    // Transform data to match frontend expectations
    const transformedLicenses = licenses.map(license => ({
      ...license,
      products: license.product_name ? {
        name: license.product_name,
        version: license.product_version
      } : null,
      users_profile: license.user_full_name ? {
        full_name: license.user_full_name,
        company: license.user_company,
        phone: license.user_phone,
        role: license.user_role
      } : null
    }))

    res.json({
      success: true,
      data: transformedLicenses
    })
  } catch (error) {
    console.error('Get licenses error:', error)
    res.status(500).json({
      success: false,
      message: 'Lisanslar alınırken hata oluştu'
    })
  }
})

// Get license by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const license = await db.getAsync(`
      SELECT 
        l.*,
        p.name as product_name,
        p.version as product_version,
        u.full_name as user_full_name,
        u.company as user_company,
        u.phone as user_phone,
        u.role as user_role
      FROM licenses l
      LEFT JOIN products p ON l.product_id = p.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [req.params.id])

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Lisans bulunamadı'
      })
    }

    // Transform data
    const transformedLicense = {
      ...license,
      products: license.product_name ? {
        name: license.product_name,
        version: license.product_version
      } : null,
      users_profile: license.user_full_name ? {
        full_name: license.user_full_name,
        company: license.user_company,
        phone: license.user_phone,
        role: license.user_role
      } : null
    }

    res.json({
      success: true,
      data: transformedLicense
    })
  } catch (error) {
    console.error('Get license error:', error)
    res.status(500).json({
      success: false,
      message: 'Lisans alınırken hata oluştu'
    })
  }
})

// Create license
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, user_id, max_activations = 1, expires_at, status = 'active' } = req.body

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Ürün ID gerekli'
      })
    }

    // Verify product exists
    const product = await db.getAsync(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [product_id]
    )

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ürün ID'
      })
    }

    // Verify user exists if provided
    if (user_id) {
      const user = await db.getAsync(
        'SELECT * FROM users WHERE id = ?',
        [user_id]
      )

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz kullanıcı ID'
        })
      }
    }

    const licenseId = uuidv4()
    const licenseKey = generateLicenseKey()

    await db.runAsync(`
      INSERT INTO licenses (id, license_key, product_id, user_id, status, max_activations, expires_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [licenseId, licenseKey, product_id, user_id || null, status, max_activations, expires_at])

    // Log analytics event
    try {
      await db.runAsync(`
        INSERT INTO analytics_events (id, event_type, license_id, user_id) 
        VALUES (?, ?, ?, ?)
      `, [uuidv4(), 'license_created', licenseId, req.user.id])
    } catch (analyticsError) {
      console.error('Analytics error:', analyticsError)
    }

    // Get the created license with relations
    const createdLicense = await db.getAsync(`
      SELECT 
        l.*,
        p.name as product_name,
        p.version as product_version,
        u.full_name as user_full_name,
        u.company as user_company,
        u.phone as user_phone,
        u.role as user_role
      FROM licenses l
      LEFT JOIN products p ON l.product_id = p.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [licenseId])

    // Transform data
    const transformedLicense = {
      ...createdLicense,
      products: createdLicense.product_name ? {
        name: createdLicense.product_name,
        version: createdLicense.product_version
      } : null,
      users_profile: createdLicense.user_full_name ? {
        full_name: createdLicense.user_full_name,
        company: createdLicense.user_company,
        phone: createdLicense.user_phone,
        role: createdLicense.user_role
      } : null
    }

    res.status(201).json({
      success: true,
      data: transformedLicense
    })
  } catch (error) {
    console.error('Create license error:', error)
    res.status(500).json({
      success: false,
      message: 'Lisans oluşturulurken hata oluştu'
    })
  }
})

// Update license
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, max_activations, expires_at, user_id } = req.body
    const licenseId = req.params.id

    const license = await db.getAsync(
      'SELECT * FROM licenses WHERE id = ?',
      [licenseId]
    )

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Lisans bulunamadı'
      })
    }

    await db.runAsync(`
      UPDATE licenses 
      SET status = ?, max_activations = ?, expires_at = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      status || license.status,
      max_activations !== undefined ? max_activations : license.max_activations,
      expires_at !== undefined ? expires_at : license.expires_at,
      user_id !== undefined ? user_id : license.user_id,
      licenseId
    ])

    // Get updated license
    const updatedLicense = await db.getAsync(`
      SELECT 
        l.*,
        p.name as product_name,
        p.version as product_version,
        u.full_name as user_full_name,
        u.company as user_company,
        u.phone as user_phone,
        u.role as user_role
      FROM licenses l
      LEFT JOIN products p ON l.product_id = p.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `, [licenseId])

    // Transform data
    const transformedLicense = {
      ...updatedLicense,
      products: updatedLicense.product_name ? {
        name: updatedLicense.product_name,
        version: updatedLicense.product_version
      } : null,
      users_profile: updatedLicense.user_full_name ? {
        full_name: updatedLicense.user_full_name,
        company: updatedLicense.user_company,
        phone: updatedLicense.user_phone,
        role: updatedLicense.user_role
      } : null
    }

    res.json({
      success: true,
      data: transformedLicense
    })
  } catch (error) {
    console.error('Update license error:', error)
    res.status(500).json({
      success: false,
      message: 'Lisans güncellenirken hata oluştu'
    })
  }
})

// Delete license
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const licenseId = req.params.id

    const license = await db.getAsync(
      'SELECT * FROM licenses WHERE id = ?',
      [licenseId]
    )

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Lisans bulunamadı'
      })
    }

    await db.runAsync('DELETE FROM licenses WHERE id = ?', [licenseId])

    res.json({
      success: true,
      message: 'Lisans başarıyla silindi'
    })
  } catch (error) {
    console.error('Delete license error:', error)
    res.status(500).json({
      success: false,
      message: 'Lisans silinirken hata oluştu'
    })
  }
})

export default router