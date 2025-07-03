import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Key,
  Package,
  DollarSign
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApi, useAsyncAction } from '../hooks/useApi'
import { reportsService, analyticsService } from '../services/api'
import { format, subDays, subMonths } from 'date-fns'

const Reports = () => {
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('all')
  
  const { data: stats, loading } = useApi(() => analyticsService.getDashboardStats(), [])
  const { execute: executeReport, loading: reportLoading } = useAsyncAction()

  const handleGenerateReport = async (type) => {
    const result = await executeReport(
      () => {
        switch (type) {
          case 'license':
            return reportsService.generateLicenseReport()
          case 'user':
            return reportsService.generateUserReport()
          case 'revenue':
            return reportsService.generateRevenueReport()
          default:
            return reportsService.generateFullReport()
        }
      },
      {
        successMessage: 'Rapor başarıyla oluşturuldu!'
      }
    )

    if (result.success) {
      // Download the report as JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const reportCards = [
    {
      title: 'Lisans Raporu',
      description: 'Tüm lisansların detaylı raporu',
      icon: Key,
      color: 'primary',
      action: () => handleGenerateReport('license')
    },
    {
      title: 'Kullanıcı Raporu',
      description: 'Kullanıcı istatistikleri ve analizi',
      icon: Users,
      color: 'success',
      action: () => handleGenerateReport('user')
    },
    {
      title: 'Gelir Raporu',
      description: 'Satış ve gelir analizi',
      icon: DollarSign,
      color: 'warning',
      action: () => handleGenerateReport('revenue')
    },
    {
      title: 'Tam Rapor',
      description: 'Tüm verilerin kapsamlı raporu',
      icon: FileText,
      color: 'accent',
      action: () => handleGenerateReport('full')
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
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
          <h1 className="text-3xl font-bold gradient-text">Raporlar</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Detaylı analiz ve raporları görüntüleyin ve indirin
          </p>
        </div>
        
        <Button onClick={() => handleGenerateReport('full')} loading={reportLoading}>
          <Download className="w-4 h-4 mr-2" />
          Tam Rapor İndir
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Tarih Aralığı
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="7">Son 7 gün</option>
                  <option value="30">Son 30 gün</option>
                  <option value="90">Son 90 gün</option>
                  <option value="365">Son 1 yıl</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Rapor Türü
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="all">Tüm Raporlar</option>
                  <option value="license">Lisans Raporları</option>
                  <option value="user">Kullanıcı Raporları</option>
                  <option value="revenue">Gelir Raporları</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Toplam Lisans
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats?.totalLicenses || 0}
                </p>
              </div>
              <Key className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Aktif Kullanıcı
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Toplam Ürün
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-accent-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                  Aylık Gelir
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  ₺24,567
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-warning-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report, index) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    report.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/20' :
                    report.color === 'success' ? 'bg-success-100 dark:bg-success-900/20' :
                    report.color === 'warning' ? 'bg-warning-100 dark:bg-warning-900/20' :
                    'bg-accent-100 dark:bg-accent-900/20'
                  }`}>
                    <report.icon className={`w-6 h-6 ${
                      report.color === 'primary' ? 'text-primary-600' :
                      report.color === 'success' ? 'text-success-600' :
                      report.color === 'warning' ? 'text-warning-600' :
                      'text-accent-600'
                    }`} />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {report.title}
                </h3>
                
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                  {report.description}
                </p>

                <Button
                  onClick={report.action}
                  loading={reportLoading}
                  className="w-full"
                  variant="secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Raporu İndir
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Lisans Durumu Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <p className="text-secondary-600 dark:text-secondary-400">
                  Grafik bileşeni entegre edilecek
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Gelir Trendleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-success-50 to-warning-50 dark:from-success-900/20 dark:to-warning-900/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-success-500 mx-auto mb-4" />
                <p className="text-secondary-600 dark:text-secondary-400">
                  Gelir grafiği burada gösterilecek
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Reports