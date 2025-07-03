import express from 'express'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get dashboard stats
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalLicenses,
      activeLicenses,
      totalUsers,
      totalProducts,
      recentActivities
    ] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM licenses'),
      db.getAsync('SELECT COUNT(*) as count FROM licenses WHERE status = "active"'),
      db.getAsync('SELECT COUNT(*) as count FROM users'),
      db.getAsync('SELECT COUNT(*) as count FROM products WHERE is_active = 1'),
      db.allAsync(`
        SELECT 
          ae.*,
          l.license_key,
          p.name as product_name
        FROM analytics_events ae
        LEFT JOIN licenses l ON ae.license_id = l.id
        LEFT JOIN products p ON l.product_id = p.id
        ORDER BY ae.created_at DESC
        LIMIT 10
      `)
    ])

    // Transform recent activities to match frontend expectations
    const transformedActivities = recentActivities.map(activity => ({
      ...activity,
      licenses: activity.license_key ? {
        license_key: activity.license_key,
        products: activity.product_name ? {
          name: activity.product_name
        } : null
      } : null
    }))

    res.json({
      success: true,
      data: {
        totalLicenses: totalLicenses.count,
        activeLicenses: activeLicenses.count,
        totalUsers: totalUsers.count,
        totalProducts: totalProducts.count,
        recentActivities: transformedActivities
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri alınırken hata oluştu'
    })
  }
})

export default router