import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Building, Phone, Shield } from 'lucide-react'
import Button from '../ui/Button'
import { useAsyncAction } from '../../hooks/useApi'
import { authService } from '../../services/api'

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: '',
    phone: '',
    role: 'user'
  })

  const { execute, loading } = useAsyncAction()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await execute(
      async () => {
        // Yeni kullanıcı oluştur
        const signUpResult = await authService.signUp(formData.email, formData.password, {
          full_name: formData.fullName
        })
        
        if (signUpResult.user) {
          // Profil bilgilerini güncelle
          await authService.ensureUserProfile({
            ...signUpResult.user,
            user_metadata: {
              full_name: formData.fullName,
              company: formData.company,
              phone: formData.phone,
              role: formData.role
            }
          })
        }
        
        return signUpResult
      },
      {
        successMessage: 'Kullanıcı başarıyla oluşturuldu!',
        onSuccess: () => {
          onSuccess?.()
          onClose()
          setFormData({
            email: '',
            password: '',
            fullName: '',
            company: '',
            phone: '',
            role: 'user'
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
                <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                  Kullanıcı Oluştur
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
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Ad Soyad
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Kullanıcının adı ve soyadı"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  E-posta
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="kullanici@ornek.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Güvenli bir şifre"
                  required
                  minLength={6}
                />
              </div>

              {/* Company and Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Şirket
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Şirket adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Telefon no"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Yönetici</option>
                </select>
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
                  Kullanıcı Oluştur
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreateUserModal