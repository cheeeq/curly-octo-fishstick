import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Key,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertTriangle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import CreateLicenseModal from '../components/modals/CreateLicenseModal'
import EditLicenseModal from '../components/modals/EditLicenseModal'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { useApi, useAsyncAction } from '../hooks/useApi'
import { licensesService, reportsService } from '../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Licenses = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState(null)

  const { data: licenses, loading, refetch } = useApi(
    () => licensesService.getAll({ search: searchTerm, status: filterStatus }),
    [searchTerm, filterStatus]
  )

  const { execute: executeDelete, loading: deleteLoading } = useAsyncAction()
  const { execute: executeReport, loading: reportLoading } = useAsyncAction()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'expired':
        return <XCircle className="w-4 h-4 text-error-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />
      case 'suspended':
        return <AlertTriangle className="w-4 h-4 text-error-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400'
      case 'expired':
        return 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
      case 'pending':
        return 'bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400'
      case 'suspended':
        return 'bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400'
      default:
        return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'expired':
        return 'Süresi Dolmuş'
      case 'pending':
        return 'Beklemede'
      case 'suspended':
        return 'Askıya Alınmış'
      default:
        return status
    }
  }

  const handleEditClick = (license) => {
    setSelectedLicense(license)
    setShowEditModal(true)
  }

  const handleDeleteClick = (license) => {
    setSelectedLicense(license)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedLicense) return

    await executeDelete(
      () => licensesService.delete(selectedLicense.id),
      {
        successMessage: 'Lisans başarıyla silindi',
        onSuccess: () => {
          refetch()
          setShowDeleteModal(false)
          setSelectedLicense(null)
        }
      }
    )
  }

  const handleViewLicense = (license) => {
    toast.success(`Lisans görüntüleniyor: ${license.license_key}`)
  }

  const handleGenerateReport = async () => {
    const result = await executeReport(
      () => reportsService.generateLicenseReport({ search: searchTerm, status: filterStatus }),
      {
        successMessage: 'Rapor başarıyla oluşturuldu'
      }
    )

    if (result.success) {
      // Download the report as JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lisans-raporu-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleModalSuccess = () => {
    refetch()
    setSelectedLicense(null)
  }

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
          <h1 className="text-3xl font-bold gradient-text">Lisanslar</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Tüm yazılım lisanslarınızı yönetin ve izleyin
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleGenerateReport} loading={reportLoading}>
            <Download className="w-4 h-4 mr-2" />
            Rapor Oluştur
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Lisans Oluştur
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Lisans ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pl-10 pr-8 appearance-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="expired">Süresi Dolmuş</option>
                <option value="pending">Beklemede</option>
                <option value="suspended">Askıya Alınmış</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Lisans Yönetimi ({licenses?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {licenses?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 dark:bg-secondary-800/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-secondary-700 dark:text-secondary-300">
                      Lisans Anahtarı
                    </th>
                    <th className="text-left p-4 font-medium text-secondary-700 dark:text-secondary-300">
                      Ürün
                    </th>
                    <th className="text-left p-4 font-medium text-secondary-700 dark:text-secondary-300">
                      Kullanıcı
                    </th>
                    <th className="text-left p-4 font-medium text-secondary-700 dark:text-secondary-300">
                      Durum
                    </th>
                    <th className="text-left p-4 font-medium text-secondary-700 dark:text-secondary-300">
                      Bitiş Tarihi
                    </th>
                    <th className="text-left p-4 font-medium text-secondary-700 dark:text-secondary-300">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license, index) => (
                    <motion.tr
                      key={license.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-t border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-mono text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          {license.license_key}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-secondary-900 dark:text-secondary-100">
                          {license.products?.name || 'Bilinmeyen Ürün'}
                        </div>
                        <div className="text-xs text-secondary-500">
                          v{license.products?.version || '1.0.0'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-secondary-600 dark:text-secondary-400">
                          {license.users_profile?.full_name || 'Atanmamış'}
                        </div>
                        {license.users_profile?.company && (
                          <div className="text-xs text-secondary-500">
                            {license.users_profile.company}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(license.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                            {getStatusText(license.status)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-secondary-600 dark:text-secondary-400">
                          {license.expires_at ? format(new Date(license.expires_at), 'dd MMM yyyy') : 'Süresiz'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewLicense(license)}
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClick(license)}
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(license)}
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4 text-error-500" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                Lisans bulunamadı
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Arama veya filtre kriterlerinizi ayarlamayı deneyin'
                  : 'İlk lisansınızı oluşturarak başlayın'
                }
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Lisans Oluştur
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create License Modal */}
      <CreateLicenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Edit License Modal */}
      <EditLicenseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleModalSuccess}
        license={selectedLicense}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Lisansı Sil"
        message={`"${selectedLicense?.license_key}" lisansını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        type="danger"
        confirmText="Sil"
        cancelText="İptal"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Licenses