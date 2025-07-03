import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import CreateProductModal from '../components/modals/CreateProductModal'
import { useApi, useAsyncAction } from '../hooks/useApi'
import { productsService } from '../services/api'
import { format } from 'date-fns'

const Products = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: products, loading, refetch } = useApi(() => productsService.getAll(), [])
  const { execute: executeDelete } = useAsyncAction()

  const handleDelete = async (productId) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      await executeDelete(
        () => productsService.delete(productId),
        {
          successMessage: 'Ürün başarıyla silindi',
          onSuccess: refetch
        }
      )
    }
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ürünler</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Yazılım ürünlerinizi ve versiyonlarınızı yönetin
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ürün Ekle
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ürün Yönetimi ({products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-error-500" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-secondary-500">Versiyon:</span>
                      <span className="ml-1 font-medium text-secondary-900 dark:text-secondary-100">
                        {product.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-success-600 font-medium">
                      <DollarSign className="w-4 h-4" />
                      ₺{product.price}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <p className="text-xs text-secondary-500">
                      Oluşturuldu {format(new Date(product.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                Henüz ürün bulunamadı
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                İlk ürününüzü oluşturarak başlayın
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ürün Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refetch}
      />
    </div>
  )
}

export default Products