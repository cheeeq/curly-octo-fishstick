import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Calendar, User, Package } from 'lucide-react'
import Button from '../ui/Button'
import { useApi, useAsyncAction } from '../../hooks/useApi'
import { productsService, usersService, licensesService } from '../../services/api'
import { addDays, addMonths, addYears, format } from 'date-fns'

const CreateLicenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    user_id: '', // This can be empty now
    duration_type: 'months',
    duration_value: 12,
    max_activations: 1
  })

  const { data: products } = useApi(() => productsService.getAll(), [])
  const { data: users } = useApi(() => usersService.getAll(), [])
  const { execute, loading } = useAsyncAction()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Calculate expiration date
    let expiresAt
    const now = new Date()
    
    switch (formData.duration_type) {
      case 'days':
        expiresAt = addDays(now, parseInt(formData.duration_value))
        break
      case 'months':
        expiresAt = addMonths(now, parseInt(formData.duration_value))
        break
      case 'years':
        expiresAt = addYears(now, parseInt(formData.duration_value))
        break
      default:
        expiresAt = addMonths(now, 12)
    }

    const licenseData = {
      product_id: formData.product_id,
      max_activations: parseInt(formData.max_activations),
      expires_at: expiresAt.toISOString(),
      status: 'active'
    }

    // Only add user_id if it's selected
    if (formData.user_id && formData.user_id !== '') {
      licenseData.user_id = formData.user_id
    }

    const result = await execute(
      () => licensesService.create(licenseData),
      {
        successMessage: 'Lisans başarıyla oluşturuldu!',
        onSuccess: () => {
          onSuccess?.()
          onClose()
          setFormData({
            product_id: '',
            user_id: '',
            duration_type: 'months',
            duration_value: 12,
            max_activations: 1
          })
        }
      }
    )
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getDurationText = () => {
    const value = parseInt(formData.duration_value) || 0
    const type = formData.duration_type
    
    if (value === 0) return ''
    
    const typeText = {
      days: value === 1 ? 'gün' : 'gün',
      months: value === 1 ? 'ay' : 'ay', 
      years: value === 1 ? 'yıl' : 'yıl'
    }
    
    return `${value} ${typeText[type]}`
  }

  const getExpirationDate = () => {
    if (!formData.duration_value) return ''
    
    const now = new Date()
    let expiresAt
    
    switch (formData.duration_type) {
      case 'days':
        expiresAt = addDays(now, parseInt(formData.duration_value))
        break
      case 'months':
        expiresAt = addMonths(now, parseInt(formData.duration_value))
        break
      case 'years':
        expiresAt = addYears(now, parseInt(formData.duration_value))
        break
      default:
        return ''
    }
    
    return format(expiresAt, 'dd MMMM yyyy')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                  Lisans Oluştur
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  Ürün *
                </label>
                <select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Bir ürün seçin</option>
                  {products?.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} v{product.version}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Selection (Optional) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Kullanıcı (İsteğe Bağlı)
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Atanmamış Lisans</option>
                  {users?.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} {user.company && `(${user.company})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-secondary-500 mt-1">
                  Atanmamış lisans oluşturmak için boş bırakın
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Lisans Süresi
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="duration_value"
                    value={formData.duration_value}
                    onChange={handleChange}
                    className="input-field flex-1"
                    min="1"
                    required
                  />
                  <select
                    name="duration_type"
                    value={formData.duration_type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="days">Gün</option>
                    <option value="months">Ay</option>
                    <option value="years">Yıl</option>
                  </select>
                </div>
                {getDurationText() && (
                  <div className="mt-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-xs text-primary-700 dark:text-primary-400">
                      <strong>Süre:</strong> {getDurationText()}
                    </p>
                    {getExpirationDate() && (
                      <p className="text-xs text-primary-700 dark:text-primary-400">
                        <strong>Bitiş Tarihi:</strong> {getExpirationDate()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Max Activations */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Maksimum Aktivasyon
                </label>
                <input
                  type="number"
                  name="max_activations"
                  value={formData.max_activations}
                  onChange={handleChange}
                  className="input-field"
                  min="1"
                  max="10"
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Bu lisansın kaç cihazda kullanılabileceğini belirler
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                  disabled={!formData.product_id}
                >
                  Lisans Oluştur
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreateLicenseModal