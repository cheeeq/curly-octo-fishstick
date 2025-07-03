-- Tüm RLS politikalarını kaldır ve yeniden oluştur
-- Bu migration dosyasını Supabase SQL Editor'da çalıştırın

-- Önce tüm mevcut politikaları kaldır
DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

DROP POLICY IF EXISTS "Users can read own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
DROP POLICY IF EXISTS "Admins can read all profiles" ON users_profile;

DROP POLICY IF EXISTS "Authenticated users can read licenses" ON licenses;
DROP POLICY IF EXISTS "Authenticated users can create licenses" ON licenses;
DROP POLICY IF EXISTS "Authenticated users can update licenses" ON licenses;
DROP POLICY IF EXISTS "Authenticated users can delete licenses" ON licenses;

DROP POLICY IF EXISTS "Authenticated users can read activations" ON license_activations;
DROP POLICY IF EXISTS "Authenticated users can create activations" ON license_activations;
DROP POLICY IF EXISTS "Authenticated users can update activations" ON license_activations;

DROP POLICY IF EXISTS "Authenticated users can read analytics" ON analytics_events;
DROP POLICY IF EXISTS "Authenticated users can create analytics" ON analytics_events;

-- RLS'yi geçici olarak devre dışı bırak
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- Tekrar etkinleştir
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Çok basit ve permissive politikalar oluştur
-- Products için
CREATE POLICY "Allow all for products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for products anon" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

-- Users profile için
CREATE POLICY "Allow all for users_profile" ON users_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for users_profile anon" ON users_profile FOR ALL TO anon USING (true) WITH CHECK (true);

-- Licenses için
CREATE POLICY "Allow all for licenses" ON licenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for licenses anon" ON licenses FOR ALL TO anon USING (true) WITH CHECK (true);

-- License activations için
CREATE POLICY "Allow all for license_activations" ON license_activations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for license_activations anon" ON license_activations FOR ALL TO anon USING (true) WITH CHECK (true);

-- Analytics için
CREATE POLICY "Allow all for analytics_events" ON analytics_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for analytics_events anon" ON analytics_events FOR ALL TO anon USING (true) WITH CHECK (true);

-- Demo user için admin profili oluştur
INSERT INTO users_profile (id, full_name, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Admin User',
  role = 'admin';