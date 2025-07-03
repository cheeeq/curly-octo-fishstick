import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Trash2,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)

  // Demo notifications
  useEffect(() => {
    const demoNotifications = [
      {
        id: '1',
        type: 'success',
        title: 'Lisans Oluşturuldu',
        message: 'DEMO-12345-ABCDE-67890 lisansı başarıyla oluşturuldu',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Lisans Süresi',
        message: 'Premium Software lisansının süresi 7 gün içinde dolacak',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Yeni Kullanıcı',
        message: 'Sisteme yeni bir kullanıcı kaydoldu',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'API Hatası',
        message: 'Lisans doğrulama API\'sinde geçici bir hata oluştu',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true
      }
    ]
    setNotifications(demoNotifications)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-error-500" />
      default:
        return <Info className="w-5 h-5 text-primary-500" />
    }
  }

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
      case 'warning':
        return 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
      case 'error':
        return 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
      default:
        return 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 top-full mt-2 w-96 glass-card shadow-xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <span className="bg-error-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border mb-2 transition-all duration-200 ${
                      notification.read 
                        ? 'bg-secondary-50 dark:bg-secondary-800/50 border-secondary-200 dark:border-secondary-700' 
                        : getNotificationBg(notification.type)
                    } ${!notification.read ? 'shadow-sm' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              notification.read 
                                ? 'text-secondary-700 dark:text-secondary-300' 
                                : 'text-secondary-900 dark:text-secondary-100'
                            }`}>
                              {notification.title}
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full inline-block ml-2"></span>
                              )}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              notification.read 
                                ? 'text-secondary-500 dark:text-secondary-400' 
                                : 'text-secondary-600 dark:text-secondary-300'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-secondary-400 mt-2">
                              {format(notification.timestamp, 'dd MMM, HH:mm', { locale: tr })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                                title="Okundu işaretle"
                              >
                                <Check className="w-3 h-3 text-success-600" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 rounded hover:bg-error-100 dark:hover:bg-error-900/20 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3 h-3 text-error-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-sm text-secondary-500">Henüz bildirim yok</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-secondary-200 dark:border-secondary-700 text-center">
              <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                Tüm Bildirimleri Görüntüle
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationDropdown