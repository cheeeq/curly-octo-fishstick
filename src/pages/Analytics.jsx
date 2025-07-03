import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download, TrendingUp, Users, Key, Package, Activity, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import { useApi, useAsyncAction } from '../hooks/useApi'
import { analyticsService, reportsService } from '../services/api'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const Analytics = () => {
  const { data: stats, loading } = useApi(() => analyticsService.getDashboardStats(), [])
  const { execute: executeReport } = useAsyncAction()

  const handleGenerateReport = async () => {
    const result = await executeReport(
      () => reportsService.generateLicenseReport(),
      {
        successMessage: 'Analitik raporu başarıyla oluşturuldu'
      }
    )

    if (result.success) {
      // Download the report as JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analitik-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const analyticsStats = [
    {
      title: 'Toplam Lisans',
      value: stats?.totalLicenses?.toString() || '0',
      change: '+5.2%',
      icon: Key,
      trend: 'up',
      color: 'primary'
    },
    {
      title: 'Aktif Kullanıcı',
      value: stats?.totalUsers?.toString() || '0',
      change: '+12.1%',
      icon: Users,
      trend: 'up',
      color: 'success'
    },
    {
      title: 'Ürün Sayısı',
      value: stats?.totalProducts?.toString() || '0',
      change: '+2',
      icon: Package,
      trend: 'up',
      color: 'accent'
    },
    {
      title: 'Büyüme Oranı',
      value: '15.3%',
      change: '+2.1%',
      icon: TrendingUp,
      trend: 'up',
      color: 'warning'
    }
  ]

  const getActivityMessage = (activity) => {
    switch (activity.event_type) {
      case 'license_created':
        return `${activity.licenses?.products?.name || 'ürün'} için yeni lisans oluşturuldu`
      case 'user_registered':
        return 'Yeni kullanıcı kaydoldu'
      case 'license_expired':
        return 'Lisans süresi doldu'
      case 'product_updated':
        return 'Ürün güncellendi'
      case 'license_activated':
        return 'Lisans etkinleştirildi'
      case 'license_deactivated':
        return 'Lisans devre dışı bırakıldı'
      default:
        return activity.event_type.replace('_', ' ').toLowerCase()
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analitik</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Detaylı analitik verilerini ve raporları görüntüleyin
          </p>
        </div>
        
        <Button onClick={handleGenerateReport}>
          <Download className="w-4 h-4 mr-2" />
          Rapor İndir
        </Button>
      </motion.div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
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
                <BarChart3 className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <p className="text-secondary-600 dark:text-secondary-400">
                  Grafik bileşeni burada entegre edilecek
                </p>
                <p className="text-xs text-secondary-500 mt-2">
                  Aktif: {stats?.activeLicenses || 0} / Toplam: {stats?.totalLicenses || 0}
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
                <p className="text-xs text-secondary-500 mt-2">
                  Bu ay: ₺24,567 (+15.3%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Son Aktiviteler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.slice(0, 8).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {format(new Date(activity.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-secondary-500">
                    {activity.licenses?.license_key && (
                      <span className="font-mono bg-secondary-200 dark:bg-secondary-700 px-2 py-1 rounded text-xs">
                        {activity.licenses.license_key}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
              <p className="text-sm text-secondary-500">Henüz aktivite kaydı bulunmuyor</p>
              <p className="text-xs text-secondary-400 mt-1">
                Sistem kullanımı başladığında aktiviteler burada görünecek
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sistem Performansı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">API Yanıt Süresi</span>
                <span className="text-sm font-medium text-success-600">~45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Veritabanı Bağlantısı</span>
                <span className="text-sm font-medium text-success-600">Aktif</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Bellek Kullanımı</span>
                <span className="text-sm font-medium text-warning-600">%23</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lisans İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Aktif Lisanslar</span>
                <span className="text-sm font-medium text-success-600">{stats?.activeLicenses || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Süresi Dolan</span>
                <span className="text-sm font-medium text-error-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Beklemede</span>
                <span className="text-sm font-medium text-warning-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Kullanım Oranları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Günlük Aktivasyon</span>
                <span className="text-sm font-medium text-primary-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">API Çağrıları</span>
                <span className="text-sm font-medium text-primary-600">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Başarı Oranı</span>
                <span className="text-sm font-medium text-success-600">%99.2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics