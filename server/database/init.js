import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ✅ gateway.db dosyasının doğru yolu
const dbPath = join(__dirname, 'gateway.db') // "database" klasörü içinde

// 📁 Klasör yoksa oluştur
const dbDir = dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  console.log('📁 Veritabanı klasörü oluşturuldu:', dbDir)
}

// 📦 Veritabanı bağlantısı
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err.message)
  } else {
    console.log('✅ Veritabanına bağlanıldı:', dbPath)
  }
})

// 📌 Promisify
db.runAsync = promisify(db.run.bind(db))
db.getAsync = promisify(db.get.bind(db))
db.allAsync = promisify(db.all.bind(db))

// 🚀 Başlatıcı fonksiyon
export async function initDatabase() {
  try {
    console.log('🗄️  Veritabanı başlatılıyor...')

    // Tablolar oluşturuluyor
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        company TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        price REAL DEFAULT 0.00,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY,
        license_key TEXT UNIQUE NOT NULL,
        product_id TEXT,
        user_id TEXT,
        hwid TEXT,
        status TEXT DEFAULT 'active',
        max_activations INTEGER DEFAULT 1,
        current_activations INTEGER DEFAULT 0,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS license_activations (
        id TEXT PRIMARY KEY,
        license_id TEXT,
        hwid TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT 1,
        activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deactivated_at DATETIME,
        FOREIGN KEY (license_id) REFERENCES licenses(id)
      )
    `)

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        license_id TEXT,
        user_id TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (license_id) REFERENCES licenses(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // 🔍 Index'ler
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key)`)
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id)`)
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id)`)
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status)`)

    // 🧪 Örnek veri
    await insertSampleData()

    console.log('✅ Veritabanı başarıyla başlatıldı')
  } catch (error) {
    console.error('❌ Veritabanı başlatma hatası:', error)
    throw error
  }
}

async function insertSampleData() {
  try {
    const userCount = await db.getAsync('SELECT COUNT(*) as count FROM users')
    if (userCount.count > 0) return

    console.log('📝 Örnek veriler ekleniyor...')

    await db.runAsync(`
      INSERT INTO users (id, email, password_hash, full_name, role) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      '00000000-0000-0000-0000-000000000000',
      'admin@gateway.com',
      '$2a$10$dummy.hash.for.demo.purposes.only',
      'Admin User',
      'admin'
    ])

    const products = [
      {
        id: 'prod-1',
        name: 'Premium Yazılım',
        description: 'Gelişmiş özellikler içeren premium yazılım çözümü',
        version: '2.1.0',
        price: 99.99
      },
      {
        id: 'prod-2',
        name: 'Temel Plan',
        description: 'Küçük işletmeler için temel özellikler',
        version: '1.5.0',
        price: 29.99
      },
      {
        id: 'prod-3',
        name: 'Kurumsal Paket',
        description: 'Kapsamlı kurumsal çözüm',
        version: '3.0.0',
        price: 299.99
      },
      {
        id: 'prod-4',
        name: 'Geliştirici Araçları',
        description: 'Profesyonel geliştirme araç seti',
        version: '1.8.0',
        price: 149.99
      }
    ]

    for (const product of products) {
      await db.runAsync(`
        INSERT INTO products (id, name, description, version, price) 
        VALUES (?, ?, ?, ?, ?)
      `, [product.id, product.name, product.description, product.version, product.price])
    }

    await db.runAsync(`
      INSERT INTO licenses (id, license_key, product_id, status, max_activations, expires_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'license-demo-1',
      'DEMO-12345-ABCDE-67890',
      'prod-1',
      'active',
      1,
      '2025-12-31 23:59:59'
    ])

    console.log('✅ Örnek veriler başarıyla eklendi')
  } catch (error) {
    console.error('❌ Örnek veri ekleme hatası:', error)
  }
}
