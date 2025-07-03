import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Calendar, User, Package } from 'lucide-react'
import Button from '../ui/Button'
import { useApi, useAsyncAction } from '../../hooks/useApi'
import { productsService, usersService, licensesService } from '../../services/api'
import { addDays, addMonths, addYears, format } from 'date-fns'

const EditLicenseModal = ({ isOpen, onClose, onSuccess, license }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    user_id: '',
    status: 'active',
    max_activations: 1,
    expires_at: ''
  })

  const { data: products } = useApi(() => productsService.getAll(), [])
  const { data: users } = useApi(() => usersService.getAll(), [])
  const { execute, loading } = useAsyncAction()

  useEffect(() => {
    if (license) {
      setFormData({
        product_id: license.product_id || '',
        user_id: license.user_id || '',
        status: license.status || 'active',
        max_activations: license.max_activations || 1,
        expires_at: license.expires_at ? license.expires_at.split('T')[0] : ''
      })
    }
  }, [license])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const updateData = {
      status: formData.status,
      max_activations: parseInt(formData.max_activations),
      user_id: formData.user_id || null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
    }

    const result = await execute(
      () => licensesService.update(license.id, updateData),
      {
        successMessage: 'Lisans başarıyla güncellendi!',
        onSuccess: () => {
          onSuccess?.()
          onClose()
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
                  Lisans Düzenle
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
              {/* License Key (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Lisans Anahtarı
                </label>
                <input
                  type="text"
                  value={license?.license_key || ''}
                  className="input-field bg-secondary-100 dark:bg-secondary-800"
                  disabled
                />
              </div>

              {/* Product (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  Ürün
                </label>
                <input
                  type="text"
                  value={license?.products?.name || 'Bilinmeyen Ürün'}
                  className="input-field bg-secondary-100 dark:bg-secondary-800"
                  disabled
                />
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Kullanıcı
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
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="active">Aktif</option>
                  <option value="expired">Süresi Dolmuş</option>
                  <option value="pending">Beklemede</option>
                  <option value="suspended">Askıya Alınmış</option>
                </select>
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
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Boş bırakırsanız süresiz olur
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
                >
                  Güncelle
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EditLicenseModal