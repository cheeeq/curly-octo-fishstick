import React from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const Header = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl border-b border-secondary-200 dark:border-secondary-700">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-3 bg-secondary-100 dark:bg-secondary-800 rounded-xl px-4 py-2 min-w-[300px]">
            <Search className="w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Lisans, kullanıcı, ürün ara..."
              className="bg-transparent border-none outline-none text-sm text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 flex-1"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-secondary-600" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </motion.button>

          {/* User menu */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                  {user?.profile?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-secondary-500">Yönetici</p>
              </div>
            </motion.button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header