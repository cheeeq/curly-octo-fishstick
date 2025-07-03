import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/init.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const products = await db.allAsync(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC'
    )

    res.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      success: false,
      message: 'Ürünler alınırken hata oluştu'
    })
  }
})

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await db.getAsync(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [req.params.id]
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      })
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      success: false,
      message: 'Ürün alınırken hata oluştu'
    })
  }
})

// Create product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, version = '1.0.0', price = 0 } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Ürün adı gerekli'
      })
    }

    const productId = uuidv4()

    await db.runAsync(`
      INSERT INTO products (id, name, description, version, price) 
      VALUES (?, ?, ?, ?, ?)
    `, [productId, name, description, version, price])

    const product = await db.getAsync(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    )

    res.status(201).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      success: false,
      message: 'Ürün oluşturulurken hata oluştu'
    })
  }
})

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, version, price } = req.body
    const productId = req.params.id

    const product = await db.getAsync(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [productId]
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      })
    }

    await db.runAsync(`
      UPDATE products 
      SET name = ?, description = ?, version = ?, price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name || product.name,
      description !== undefined ? description : product.description,
      version || product.version,
      price !== undefined ? price : product.price,
      productId
    ])

    const updatedProduct = await db.getAsync(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    )

    res.json({
      success: true,
      data: updatedProduct
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken hata oluştu'
    })
  }
})

// Delete product (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id

    const product = await db.getAsync(
      'SELECT * FROM products WHERE id = ? AND is_active = 1',
      [productId]
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      })
    }

    await db.runAsync(
      'UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [productId]
    )

    res.json({
      success: true,
      message: 'Ürün başarıyla silindi'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      success: false,
      message: 'Ürün silinirken hata oluştu'
    })
  }
})

export default router