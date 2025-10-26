import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize tables if they don't exist
export async function initializeDatabase() {
  try {
    // Check if items table exists by trying to query it
    const { error } = await supabase.from('items').select('id').limit(1)
    
    if (error && error.code === '42P01') {
      console.log('⚠️  Tables do not exist. Please create them in Supabase dashboard.')
      console.log('\n📝 SQL to run in Supabase SQL Editor:\n')
      console.log(`
-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('notebook', 'idea', 'drawing')),
  title TEXT NOT NULL,
  author VARCHAR(50) NOT NULL CHECK (author IN ('lakhdar', 'amar')),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "isPublic" BOOLEAN DEFAULT false,
  "bodyHtml" TEXT,
  "imageUrl" TEXT,
  text TEXT
);

-- Create auth_codes table for email authentication
CREATE TABLE IF NOT EXISTS auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_public ON items("isPublic");
CREATE INDEX IF NOT EXISTS idx_items_author ON items(author);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public items are viewable by everyone" 
  ON items FOR SELECT 
  USING ("isPublic" = true);

-- Allow all operations for authenticated users (your backend)
CREATE POLICY "Backend can do everything on items" 
  ON items FOR ALL 
  USING (true);

CREATE POLICY "Backend can do everything on auth_codes" 
  ON auth_codes FOR ALL 
  USING (true);
      `)
      console.log('\n✅ Copy this SQL and run it in: Supabase Dashboard → SQL Editor → New Query\n')
    } else {
      console.log('✅ Database tables are ready')
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message)
  }
}
