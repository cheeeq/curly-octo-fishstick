import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      setError(err)
      toast.error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}

export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false)

  const execute = async (asyncFunction, options = {}) => {
    try {
      setLoading(true)
      const result = await asyncFunction()
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return { success: true, data: result }
    } catch (error) {
      const errorMessage = options.errorMessage || error.message || 'An error occurred'
      toast.error(errorMessage)
      
      if (options.onError) {
        options.onError(error)
      }
      
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading }
}