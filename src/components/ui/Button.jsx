import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl hover:shadow-error-500/25 transform hover:scale-105 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

export default Button