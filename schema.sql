-- Buat tabel users (berelasi dengan auth.users bawaan Supabase)
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  email TEXT NOT NULL,
  "phoneNumber" TEXT,
  type TEXT,
  role JSONB DEFAULT '[]'::jsonb,
  address JSONB DEFAULT '[]'::jsonb,
  "indexAddressSelected" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) di tabel users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy agar user hanya bisa membaca dan mengubah datanya sendiri
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-------------------------------------------------------------------------

-- Buat tabel trash (Kategori/Jenis sampah)
CREATE TABLE trash (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "imageUrl" TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) di tabel trash
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;

-- Policy agar semua user yang login bisa melihat daftar trash
CREATE POLICY "Anyone authenticated can view trash" 
ON trash FOR SELECT 
USING (auth.role() = 'authenticated');

-------------------------------------------------------------------------

-- Buat tabel customer_orders
CREATE TABLE customer_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "customerId" UUID REFERENCES users(id) NOT NULL,
  "trashId" TEXT, -- Bisa dijadikan referensi ke tabel trash jika tipe ID sama
  "addressNotes" TEXT,
  "orderNotes" TEXT,
  "trashPicture" TEXT,
  pinpoint JSONB, -- Menyimpan object {_lat, _long}
  status TEXT DEFAULT 'WAITING',
  "cleanerId" UUID,
  "fullAddress" TEXT,
  "createdDate" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) di tabel customer_orders
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Policy agar user hanya bisa melihat pesanan mereka sendiri
CREATE POLICY "Users can view own orders" 
ON customer_orders FOR SELECT 
USING (auth.uid() = "customerId");

-- Policy agar user bisa membuat pesanannya sendiri
CREATE POLICY "Users can insert own orders" 
ON customer_orders FOR INSERT 
WITH CHECK (auth.uid() = "customerId");

-- Policy agar user bisa memperbarui pesanan mereka sendiri
CREATE POLICY "Users can update own orders" 
ON customer_orders FOR UPDATE 
USING (auth.uid() = "customerId");
