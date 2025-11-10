-- Add car customization columns to profiles table
ALTER TABLE profiles 
ADD COLUMN car_color TEXT DEFAULT NULL,
ADD COLUMN car_upgrades TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create a table for available car colors
CREATE TABLE car_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex_color TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on car_colors
ALTER TABLE car_colors ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view car colors
CREATE POLICY "Car colors are viewable by everyone"
ON car_colors FOR SELECT
USING (true);

-- Insert default color options
INSERT INTO car_colors (name, hex_color, price) VALUES
  ('Original', 'original', 0),
  ('Midnight Black', '#000000', 25),
  ('Pure White', '#FFFFFF', 25),
  ('Racing Red', '#DC2626', 30),
  ('Electric Blue', '#2563EB', 30),
  ('Neon Green', '#22C55E', 30),
  ('Sunset Orange', '#F97316', 30),
  ('Royal Purple', '#9333EA', 35),
  ('Chrome Silver', '#E5E7EB', 40),
  ('Gold Rush', '#EAB308', 50);

-- Create a table for car upgrades
CREATE TABLE car_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  effect_type TEXT NOT NULL, -- 'speed', 'visual', 'cosmetic'
  price INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on car_upgrades
ALTER TABLE car_upgrades ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view car upgrades
CREATE POLICY "Car upgrades are viewable by everyone"
ON car_upgrades FOR SELECT
USING (true);

-- Insert some upgrade options
INSERT INTO car_upgrades (name, description, effect_type, price, icon) VALUES
  ('Nitro Boost', 'Visual nitro flames effect during races', 'visual', 75, '🔥'),
  ('Racing Stripes', 'Classic racing stripes overlay', 'cosmetic', 50, '🏁'),
  ('Underglow', 'Neon underglow lighting effect', 'visual', 60, '✨'),
  ('Spoiler', 'Aerodynamic spoiler visual', 'cosmetic', 65, '📐'),
  ('Custom Decals', 'Unique decal patterns', 'cosmetic', 55, '🎨');

-- Create a table to track owned colors
CREATE TABLE owned_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES car_colors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, color_id)
);

-- Enable RLS on owned_colors
ALTER TABLE owned_colors ENABLE ROW LEVEL SECURITY;

-- Users can view their own owned colors
CREATE POLICY "Users can view their own owned colors"
ON owned_colors FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own owned colors
CREATE POLICY "Users can insert their own owned colors"
ON owned_colors FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a table to track owned upgrades
CREATE TABLE owned_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upgrade_id UUID NOT NULL REFERENCES car_upgrades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, upgrade_id)
);

-- Enable RLS on owned_upgrades
ALTER TABLE owned_upgrades ENABLE ROW LEVEL SECURITY;

-- Users can view their own owned upgrades
CREATE POLICY "Users can view their own owned upgrades"
ON owned_upgrades FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own owned upgrades
CREATE POLICY "Users can insert their own owned upgrades"
ON owned_upgrades FOR INSERT
WITH CHECK (auth.uid() = user_id);