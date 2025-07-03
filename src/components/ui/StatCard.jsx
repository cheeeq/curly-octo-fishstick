import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatCard = ({ title, value, change, icon: Icon, trend = 'up', color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
    accent: 'from-accent-500 to-accent-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {value}
          </p>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-success-600' : 'text-error-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard