import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Shield, 
  Globe, 
  Bell,
  Monitor,
  Palette,
  Database,
  Activity
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useTheme } from '../context/ThemeContext'
import { settingsService } from '../services/api'
import { useAsyncAction } from '../hooks/useApi'
import toast from 'react-hot-toast'

const Settings = () => {
  const { isDark, toggleTheme } = useTheme()
  const { execute, loading } = useAsyncAction()
  const [systemStatus, setSystemStatus] = useState(null)
  const [settings, setSettings] = useState({
    systemName: 'GateWay',
    systemDescription: 'Lisans Yönetimi',
    statusMessage: 'Tüm sistemler çalışıyor',
    maintenanceMode: false,
    autoRefresh: true,
    refreshInterval: 30000,
    notifications: {
      email: true,
      browser: true,
      licenseExpiry: true,
      systemAlerts: true
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      twoFactorAuth: false
    }
  })

  useEffect(() => {
    loadSettings()
    checkSystemStatus()
  }, [])

  const loadSettings = () => {
    const savedSettings = settingsService.getSystemSettings()
    setSettings(prev => ({ ...prev, ...savedSettings }))
  }

  const checkSystemStatus = async () => {
    const status = await settingsService.getSystemStatus()
    setSystemStatus(status)
  }

  const handleSaveSettings = async () => {
    await execute(
      () => settingsService.updateSystemSettings(settings),
      {
        successMessage: 'Ayarlar başarıyla kaydedildi',
        onSuccess: () => {
          // Sidebar'daki sistem durumunu güncelle
          window.dispatchEvent(new CustomEvent('systemSettingsUpdated', { detail: settings }))
        }
      }
    )
  }

  const handleInputChange = (section, field, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success-600'
      case 'offline':
        return 'text-error-600'
      case 'maintenance':
        return 'text-warning-600'
      default:
        return 'text-secondary-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-slow"></div>
      case 'offline':
        return <div className="w-2 h-2 bg-error-500 rounded-full"></div>
      case 'maintenance':
        return <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
      default:
        return <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Sistem Ayarları</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Sistem konfigürasyonunu ve tercihlerini yönetin
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={checkSystemStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Durumu Yenile
          </Button>
          <Button onClick={handleSaveSettings} loading={loading}>
            <Save className="w-4 h-4 mr-2" />
            Ayarları Kaydet
          </Button>
        </div>
      </motion.div>

      {/* System Status */}
      <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-700 dark:text-primary-400">
            <Activity className="w-5 h-5" />
            Sistem Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemStatus ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(systemStatus.status)}
                <div>
                  <p className={`font-medium ${getStatusColor(systemStatus.status)}`}>
                    {systemStatus.status === 'online' ? 'Çevrimiçi' : 
                     systemStatus.status === 'offline' ? 'Çevrimdışı' : 'Bakımda'}
                  </p>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {systemStatus.message}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-secondary-500">Son Kontrol</p>
                <p className="text-sm font-mono">
                  {new Date(systemStatus.lastCheck).toLocaleTimeString('tr-TR')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="loading-spinner w-4 h-4"></div>
              <span>Sistem durumu kontrol ediliyor...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Sistem Adı
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleInputChange(null, 'systemName', e.target.value)}
                className="input-field"
                placeholder="Sistem adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Sistem Açıklaması
              </label>
              <input
                type="text"
                value={settings.systemDescription}
                onChange={(e) => handleInputChange(null, 'systemDescription', e.target.value)}
                className="input-field"
                placeholder="Sistem açıklamasını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Durum Mesajı
              </label>
              <input
                type="text"
                value={settings.statusMessage}
                onChange={(e) => handleInputChange(null, 'statusMessage', e.target.value)}
                className="input-field"
                placeholder="Durum mesajını girin"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Bakım Modu
                </label>
                <p className="text-xs text-secondary-500">
                  Sistemi geçici olarak devre dışı bırak
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange(null, 'maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Görünüm Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Karanlık Tema
                </label>
                <p className="text-xs text-secondary-500">
                  Arayüz temasını değiştir
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Otomatik Yenileme
                </label>
                <p className="text-xs text-secondary-500">
                  Verileri otomatik olarak yenile
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleInputChange(null, 'autoRefresh', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {settings.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Yenileme Aralığı (saniye)
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => handleInputChange(null, 'refreshInterval', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={10000}>10 saniye</option>
                  <option value={30000}>30 saniye</option>
                  <option value={60000}>1 dakika</option>
                  <option value={300000}>5 dakika</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirim Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  E-posta Bildirimleri
                </label>
                <p className="text-xs text-secondary-500">
                  Önemli olaylar için e-posta gönder
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Tarayıcı Bildirimleri
                </label>
                <p className="text-xs text-secondary-500">
                  Tarayıcıda bildirim göster
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.browser}
                  onChange={(e) => handleInputChange('notifications', 'browser', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Lisans Süresi Uyarıları
                </label>
                <p className="text-xs text-secondary-500">
                  Lisans süresi dolmadan önce uyar
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.licenseExpiry}
                  onChange={(e) => handleInputChange('notifications', 'licenseExpiry', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Güvenlik Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Oturum Zaman Aşımı (saniye)
              </label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={1800}>30 dakika</option>
                <option value={3600}>1 saat</option>
                <option value={7200}>2 saat</option>
                <option value={14400}>4 saat</option>
                <option value={28800}>8 saat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Maksimum Giriş Denemesi
              </label>
              <select
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={3}>3 deneme</option>
                <option value={5}>5 deneme</option>
                <option value={10}>10 deneme</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Güçlü Şifre Zorunluluğu
                </label>
                <p className="text-xs text-secondary-500">
                  Karmaşık şifre kuralları uygula
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.requireStrongPassword}
                  onChange={(e) => handleInputChange('security', 'requireStrongPassword', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                Uygulama Bilgileri
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Versiyon:</span>
                  <span className="font-mono">v2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Build:</span>
                  <span className="font-mono">2024.01.02</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Environment:</span>
                  <span className="font-mono">Development</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                Veritabanı
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Tip:</span>
                  <span className="font-mono">SQLite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Boyut:</span>
                  <span className="font-mono">~2.4 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Durum:</span>
                  <span className="text-success-600 font-medium">Bağlı</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                API Durumu
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Port:</span>
                  <span className="font-mono">3001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">CORS:</span>
                  <span className="text-success-600 font-medium">Etkin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Rate Limit:</span>
                  <span className="font-mono">100/15min</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings