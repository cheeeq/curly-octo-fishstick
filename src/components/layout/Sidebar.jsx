import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Key,
  Package,
  Users,
  BarChart3,
  X,
  Shield,
  FileText,
  Book,
  Settings as SettingsIcon
} from 'lucide-react'
import { settingsService } from '../../services/api'

const navigation = [
  { name: 'Kontrol Paneli', href: '/', icon: LayoutDashboard },
  { name: 'Lisanslar', href: '/licenses', icon: Key },
  { name: 'Ürünler', href: '/products', icon: Package },
  { name: 'Kullanıcılar', href: '/users', icon: Users },
  { name: 'Analitik', href: '/analytics', icon: BarChart3 },
  { name: 'Raporlar', href: '/reports', icon: FileText },
  { name: 'API Docs', href: '/api-docs', icon: Book },
  { name: 'Ayarlar', href: '/settings', icon: SettingsIcon },
]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'GateWay',
    systemDescription: 'Lisans Yönetimi',
    statusMessage: 'Tüm sistemler çalışıyor'
  })

  useEffect(() => {
    // Load initial settings
    const settings = settingsService.getSystemSettings()
    setSystemSettings(settings)

    // Listen for settings updates
    const handleSettingsUpdate = (event) => {
      setSystemSettings(event.detail)
    }

    window.addEventListener('systemSettingsUpdated', handleSettingsUpdate)
    return () => window.removeEventListener('systemSettingsUpdated', handleSettingsUpdate)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72
        bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl
        border-r border-secondary-200 dark:border-secondary-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">{systemSettings.systemName}</h1>
                <p className="text-xs text-secondary-500">{systemSettings.systemDescription}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    sidebar-item group relative
                    ${isActive ? 'active' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">Sistem Durumu</p>
                  <p className="text-xs text-success-600 dark:text-success-400">{systemSettings.statusMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar