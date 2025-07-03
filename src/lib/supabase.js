// Supabase bağlantısı kaldırıldı - artık local server API kullanıyoruz

// Database types (referans için)
export const TABLES = {
  PRODUCTS: 'products',
  USERS_PROFILE: 'users_profile',
  LICENSES: 'licenses',
  LICENSE_ACTIVATIONS: 'license_activations',
  ANALYTICS_EVENTS: 'analytics_events'
}

export const LICENSE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

// Supabase artık kullanılmıyor
export const supabase = null