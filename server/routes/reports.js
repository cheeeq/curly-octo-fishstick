import express from 'express'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Generate license report
router.get('/license-report', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query

    let query = `
      SELECT 
        l.*,
        p.name as product_name,
        p.version as product_version,
        u.full_name as user_full_name
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

    const report = {
      generatedAt: new Date().toISOString(),
      totalLicenses: licenses.length,
      statusBreakdown: {
        active: licenses.filter(l => l.status === 'active').length,
        expired: licenses.filter(l => l.status === 'expired').length,
        pending: licenses.filter(l => l.status === 'pending').length,
        suspended: licenses.filter(l => l.status === 'suspended').length
      },
      licenses: licenses.map(license => ({
        id: license.id,
        licenseKey: license.license_key,
        product: license.product_name || 'Bilinmeyen Ürün',
        user: license.user_full_name || 'Atanmamış',
        status: license.status,
        createdAt: license.created_at,
        expiresAt: license.expires_at
      }))
    }

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Generate license report error:', error)
    res.status(500).json({
      success: false,
      message: 'Lisans raporu oluşturulurken hata oluştu'
    })
  }
})

// Generate user report
router.get('/user-report', authenticateToken, async (req, res) => {
  try {
    const users = await db.allAsync(
      'SELECT id, email, full_name, company, role, created_at FROM users ORDER BY created_at DESC'
    )

    const report = {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        company: user.company,
        role: user.role,
        createdAt: user.created_at
      }))
    }

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Generate user report error:', error)
    res.status(500).json({
      success: false,
      message: 'Kullanıcı raporu oluşturulurken hata oluştu'
    })
  }
})

// Generate revenue report
router.get('/revenue-report', authenticateToken, async (req, res) => {
  try {
    const licensesWithProducts = await db.allAsync(`
      SELECT l.*, p.name as product_name, p.price
      FROM licenses l
      LEFT JOIN products p ON l.product_id = p.id
      ORDER BY l.created_at DESC
    `)

    const products = await db.allAsync(
      'SELECT * FROM products WHERE is_active = 1'
    )

    const revenue = licensesWithProducts.reduce((total, license) => {
      return total + (license.price || 0)
    }, 0)

    const report = {
      generatedAt: new Date().toISOString(),
      totalRevenue: revenue,
      totalLicenses: licensesWithProducts.length,
      averageRevenuePerLicense: licensesWithProducts.length > 0 ? revenue / licensesWithProducts.length : 0,
      revenueByProduct: products.map(product => {
        const productLicenses = licensesWithProducts.filter(l => l.product_id === product.id)
        return {
          productName: product.name,
          licenseCount: productLicenses.length,
          revenue: productLicenses.length * product.price
        }
      })
    }

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Generate revenue report error:', error)
    res.status(500).json({
      success: false,
      message: 'Gelir raporu oluşturulurken hata oluştu'
    })
  }
})

// Generate full report
router.get('/full-report', authenticateToken, async (req, res) => {
  try {
    // Get all reports
    const [licenseReportRes, userReportRes, revenueReportRes] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/api/reports/license-report`, {
        headers: { Authorization: req.headers.authorization }
      }),
      fetch(`${req.protocol}://${req.get('host')}/api/reports/user-report`, {
        headers: { Authorization: req.headers.authorization }
      }),
      fetch(`${req.protocol}://${req.get('host')}/api/reports/revenue-report`, {
        headers: { Authorization: req.headers.authorization }
      })
    ])

    const [licenseReport, userReport, revenueReport] = await Promise.all([
      licenseReportRes.json(),
      userReportRes.json(),
      revenueReportRes.json()
    ])

    const fullReport = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalLicenses: licenseReport.data.totalLicenses,
        totalUsers: userReport.data.totalUsers,
        totalRevenue: revenueReport.data.totalRevenue
      },
      licenses: licenseReport.data,
      users: userReport.data,
      revenue: revenueReport.data
    }

    res.json({
      success: true,
      data: fullReport
    })
  } catch (error) {
    console.error('Generate full report error:', error)
    res.status(500).json({
      success: false,
      message: 'Tam rapor oluşturulurken hata oluştu'
    })
  }
})

export default router