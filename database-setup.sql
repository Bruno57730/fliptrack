-- FlipTrack Database Setup Script
-- Copy and paste this entire script into Supabase SQL Editor

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items table (articles/flips)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT,
  status TEXT DEFAULT 'stock',
  purchase_price DECIMAL(10, 2),
  purchase_date DATE,
  purchase_source TEXT,
  restoration_cost DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  sale_date DATE,
  sale_platform TEXT,
  platform_fees DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2),
  net_profit DECIMAL(10, 2),
  roi_percent DECIMAL(5, 2),
  photos TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT,
  description TEXT,
  date DATE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. PROFILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 5. ITEMS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own items"
ON items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- 6. EXPENSES POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own expenses"
ON expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
ON expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
ON expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
ON expenses FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- 7. STORAGE POLICIES (Run separately in Storage section)
-- ============================================================================

-- Note: These storage policies should be created in the Storage section:
--
-- 1. Create a bucket named: "item-photos"
-- 2. Make it public (uncheck "Private bucket")
-- 3. Copy-paste these policies in the Storage > item-photos > Policies section:

-- Storage Policy 1: Users can upload their own photos
-- CREATE POLICY "Users can upload their own photos"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'item-photos'
--   AND (auth.uid())::text = (storage.foldername(name))[1]
-- );

-- Storage Policy 2: Users can view their own photos
-- CREATE POLICY "Users can view their own photos"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'item-photos'
--   AND (auth.uid())::text = (storage.foldername(name))[1]
-- );

-- Storage Policy 3: Users can delete their own photos
-- CREATE POLICY "Users can delete their own photos"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'item-photos'
--   AND (auth.uid())::text = (storage.foldername(name))[1]
-- );

-- ============================================================================
-- DONE!
-- ============================================================================

-- Your database is now ready for FlipTrack!
--
-- Next steps:
-- 1. Create the "item-photos" bucket in Storage (make it public)
-- 2. Add the storage policies from the section above
-- 3. Copy your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 4. Paste them into .env.local in your FlipTrack project
-- 5. Run: npm install && npm run dev
