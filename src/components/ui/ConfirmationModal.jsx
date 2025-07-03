import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'
import Button from './Button'

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Onay Gerekli',
  message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
  type = 'warning', // 'warning', 'danger', 'success'
  confirmText = 'Onayla',
  cancelText = 'İptal',
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-error-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-success-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-warning-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-error-50 dark:bg-error-900/20',
          border: 'border-error-200 dark:border-error-800',
          button: 'danger'
        }
      case 'success':
        return {
          bg: 'bg-success-50 dark:bg-success-900/20',
          border: 'border-success-200 dark:border-success-800',
          button: 'primary'
        }
      default:
        return {
          bg: 'bg-warning-50 dark:bg-warning-900/20',
          border: 'border-warning-200 dark:border-warning-800',
          button: 'primary'
        }
    }
  }

  const colors = getColors()

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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.border} border`}>
                  {getIcon()}
                </div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                  {title}
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-secondary-600 dark:text-secondary-400">
                {message}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={colors.button}
                onClick={onConfirm}
                loading={loading}
                className="flex-1"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal