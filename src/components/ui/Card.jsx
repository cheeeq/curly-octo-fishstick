import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const Card = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn("card p-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn("text-lg font-semibold text-secondary-900 dark:text-secondary-100", className)} {...props}>
      {children}
    </h3>
  )
}

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardContent }