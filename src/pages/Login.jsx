import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

const Login = () => {
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login, register, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const result = await login(formData)
        if (result.success) {
          toast.success('Hoş geldiniz!')
          navigate('/')
        } else {
          toast.error(result.error || 'Giriş başarısız')
        }
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Şifreler eşleşmiyor')
          return
        }
        
        const result = await register(formData)
        if (result.success) {
          toast.success('Hesap oluşturuldu! Giriş yapabilirsiniz.')
          setMode('login')
          setFormData({ ...formData, password: '', confirmPassword: '' })
        } else {
          toast.error(result.error || 'Kayıt başarısız')
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(formData.email)
        if (result.success) {
          toast.success('Şifre sıfırlama e-postası gönderildi!')
          setMode('login')
        } else {
          toast.error(result.error || 'E-posta gönderilemedi')
        }
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const fillDemoCredentials = () => {
    setFormData({
      ...formData,
      email: 'admin@gateway.com',
      password: 'demo123'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold gradient-text mb-2"
          >
            GateWay'e Hoş Geldiniz
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-secondary-600 dark:text-secondary-400"
          >
            {mode === 'login' && 'Lisans yönetim panelinize giriş yapın'}
            {mode === 'register' && 'Yeni hesap oluşturun'}
            {mode === 'forgot' && 'Şifrenizi sıfırlayın'}
          </motion.p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8"
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Back Button for non-login modes */}
              {mode !== 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri dön
                </button>
              )}

              {/* Full Name Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field pl-11"
                      placeholder="Adınızı ve soyadınızı girin"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="E-posta adresinizi girin"
                    required
                  />
                </div>
              </div>

              {/* Password Field (not for forgot mode) */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-11 pr-11"
                      placeholder="Şifrenizi girin"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password Field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pl-11 pr-11"
                      placeholder="Şifrenizi tekrar girin"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password (Login only) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 bg-secondary-100 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">
                      Beni hatırla
                    </span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Şifremi unuttum
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!formData.email || (mode !== 'forgot' && !formData.password)}
              >
                {mode === 'login' && 'Giriş Yap'}
                {mode === 'register' && 'Hesap Oluştur'}
                {mode === 'forgot' && 'Şifre Sıfırlama E-postası Gönder'}
              </Button>

              {/* Mode Switch */}
              {mode === 'login' && (
                <div className="text-center">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">
                    Hesabınız yok mu?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors font-medium"
                  >
                    Kayıt olun
                  </button>
                </div>
              )}
            </motion.form>
          </AnimatePresence>

          {/* Demo Credentials */}
          {mode === 'login' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl border border-secondary-200 dark:border-secondary-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Demo Hesabı:
                  </p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400">
                    admin@gateway.com / herhangi bir şifre
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={fillDemoCredentials}
                >
                  Doldur
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-secondary-500">
            © 2024 GateWay. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login