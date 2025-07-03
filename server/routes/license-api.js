import express from 'express'
import { db } from '../database/init.js'

const router = express.Router()

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'License API çalışıyor',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      test: 'GET /test - API durum kontrolü',
      client: 'POST /client - Lisans doğrulama'
    }
  })
})

// Client license validation endpoint
router.post('/client', async (req, res) => {
  try {
    // Authorization kontrolü
    const authHeader = req.headers['authorization']
    
    if (!authHeader) {
      return res.status(401).json({
        status_code: 401,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Authorization header gerekli'
      })
    }

    // API key'i çıkar
    let apiKey = authHeader
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }

    const { licensekey, product, version } = req.body

    if (!licensekey || !product || !version) {
      return res.status(400).json({
        status_code: 400,
        status_id: null,
        status_overview: 'error',
        status_msg: 'licensekey, product ve version gerekli'
      })
    }

    // Demo lisans kontrolü
    if (licensekey === 'DEMO-12345-ABCDE-67890' && product === 'Demo Product') {
      // Hash oluştur
      const licenseFirst = licensekey.substring(0, 2)
      const licenseLast = licensekey.substring(licensekey.length - 2)
      const apiKeyFirst = apiKey.substring(0, 2)
      
      const hashContent = `${licenseFirst}${licenseLast}${apiKeyFirst}`
      const encodedHash = Buffer.from(hashContent).toString('base64')
      
      // Zaman damgası
      const epochTime = Math.floor(Date.now() / 1000)
      const epochTimeShort = epochTime.toString().substring(0, epochTime.toString().length - 2)
      
      const statusId = `${encodedHash}694201337${epochTimeShort}`

      return res.json({
        status_code: 200,
        status_id: statusId,
        status_overview: 'success',
        status_msg: 'Demo lisans doğrulama başarılı',
        license_info: {
          product: product,
          version: version,
          expires_at: '2025-12-31T23:59:59Z',
          max_activations: 1,
          current_activations: 0,
          license_type: 'demo',
          validated_at: new Date().toISOString()
        }
      })
    }

    // Veritabanından lisans kontrolü
    const license = await db.getAsync(`
      SELECT 
        l.*,
        p.name as product_name,
        p.version as product_version
      FROM licenses l
      LEFT JOIN products p ON l.product_id = p.id
      WHERE l.license_key = ? AND l.status = 'active'
    `, [licensekey])

    if (!license) {
      return res.status(404).json({
        status_code: 404,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Lisans bulunamadı veya geçersiz'
      })
    }

    // Ürün kontrolü
    if (license.product_name !== product) {
      return res.status(400).json({
        status_code: 400,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Ürün eşleşmiyor'
      })
    }

    // Süre kontrolü
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return res.status(400).json({
        status_code: 400,
        status_id: null,
        status_overview: 'error',
        status_msg: 'Lisans süresi dolmuş'
      })
    }

    // Hash oluştur
    const licenseFirst = licensekey.substring(0, 2)
    const licenseLast = licensekey.substring(licensekey.length - 2)
    const apiKeyFirst = apiKey.substring(0, 2)
    
    const hashContent = `${licenseFirst}${licenseLast}${apiKeyFirst}`
    const encodedHash = Buffer.from(hashContent).toString('base64')
    
    // Zaman damgası
    const epochTime = Math.floor(Date.now() / 1000)
    const epochTimeShort = epochTime.toString().substring(0, epochTime.toString().length - 2)
    
    const statusId = `${encodedHash}694201337${epochTimeShort}`

    res.json({
      status_code: 200,
      status_id: statusId,
      status_overview: 'success',
      status_msg: 'Lisans doğrulama başarılı',
      license_info: {
        product: license.product_name,
        version: license.product_version,
        expires_at: license.expires_at,
        max_activations: license.max_activations,
        current_activations: license.current_activations,
        license_type: 'standard',
        validated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('License validation error:', error)
    res.status(500).json({
      status_code: 500,
      status_id: null,
      status_overview: 'error',
      status_msg: 'Sunucu hatası',
      error: error.message
    })
  }
})

export default router