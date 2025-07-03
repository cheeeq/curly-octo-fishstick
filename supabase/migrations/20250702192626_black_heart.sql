/*
  # GateWay License Management Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `version` (text)
      - `price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users_profile`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `company` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `licenses`
      - `id` (uuid, primary key)
      - `license_key` (text, unique)
      - `product_id` (uuid, references products)
      - `user_id` (uuid, references auth.users)
      - `hwid` (text)
      - `status` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `license_activations`
      - `id` (uuid, primary key)
      - `license_id` (uuid, references licenses)
      - `hwid` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `activated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  version text DEFAULT '1.0.0',
  price decimal(10,2) DEFAULT 0.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company text,
  phone text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hwid text,
  status text DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending', 'suspended')),
  max_activations integer DEFAULT 1,
  current_activations integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create license activations table
CREATE TABLE IF NOT EXISTS license_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES licenses(id) ON DELETE CASCADE,
  hwid text NOT NULL,
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  activated_at timestamptz DEFAULT now(),
  deactivated_at timestamptz
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  license_id uuid REFERENCES licenses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users profile policies
CREATE POLICY "Users can read own profile"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Licenses policies
CREATE POLICY "Users can read own licenses"
  ON licenses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all licenses"
  ON licenses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- License activations policies
CREATE POLICY "Users can read own activations"
  ON license_activations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM licenses 
      WHERE id = license_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage activations"
  ON license_activations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Analytics policies
CREATE POLICY "Admins can read analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert analytics"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO products (name, description, version, price) VALUES
  ('Premium Software', 'Advanced software solution with premium features', '2.1.0', 99.99),
  ('Basic Plan', 'Essential features for small businesses', '1.5.0', 29.99),
  ('Enterprise Suite', 'Complete enterprise solution', '3.0.0', 299.99),
  ('Developer Tools', 'Professional development toolkit', '1.8.0', 149.99);

-- Create admin user profile (will be created after first login)
-- This will be handled in the application code