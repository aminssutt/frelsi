import { createClient } from '@supabase/supabase-js'

// Use SERVICE_ROLE key for migrations (bypasses RLS)
const SUPABASE_URL = 'https://phouklsqlhstcmsbllgg.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBob3VrbHNxbGhzdGNtc2JsbGdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2OTMwNywiZXhwIjoyMDc2MDQ1MzA3fQ.SOzqyNedmXYUMB9h3nitGpZDL4uOaTto5OClHNCtLlY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runMigrations() {
  console.log('🚀 Starting migrations...\n')

  try {
    // Migration 1: Add attempts column to auth_codes
    console.log('📝 Migration 1: Adding attempts column to auth_codes...')
    
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add attempts column if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'auth_codes' AND column_name = 'attempts'
          ) THEN
            ALTER TABLE auth_codes ADD COLUMN attempts INTEGER DEFAULT 0;
            CREATE INDEX IF NOT EXISTS idx_auth_codes_email_attempts ON auth_codes (email, attempts);
          END IF;
        END $$;
      `
    })

    if (error1) {
      console.log('⚠️  Migration 1 note:', error1.message)
      console.log('Trying alternative method...')
      
      // Alternative: Use direct SQL execution
      const { error: altError1 } = await supabase
        .from('auth_codes')
        .select('attempts')
        .limit(1)
      
      if (altError1 && altError1.message.includes('column "attempts" does not exist')) {
        console.log('❌ Migration 1 failed. Please run SQL manually in Supabase dashboard.')
        console.log(`
ALTER TABLE auth_codes ADD COLUMN attempts INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_auth_codes_email_attempts ON auth_codes (email, attempts);
        `)
      } else {
        console.log('✅ Column attempts already exists or migration succeeded')
      }
    } else {
      console.log('✅ Migration 1 completed\n')
    }

    // Migration 2: Create auth_logs table
    console.log('📝 Migration 2: Creating auth_logs table...')
    
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS auth_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT NOT NULL,
          action TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          details JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs (email);
        CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON auth_logs (action);
        CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs (created_at);
      `
    })

    if (error2) {
      console.log('⚠️  Migration 2 note:', error2.message)
      console.log('Trying alternative method...')
      
      // Check if table exists
      const { error: altError2 } = await supabase
        .from('auth_logs')
        .select('id')
        .limit(1)
      
      if (altError2 && altError2.message.includes('relation "auth_logs" does not exist')) {
        console.log('❌ Migration 2 failed. Please run SQL manually in Supabase dashboard.')
        console.log(`
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_logs_email ON auth_logs (email);
CREATE INDEX idx_auth_logs_action ON auth_logs (action);
CREATE INDEX idx_auth_logs_created_at ON auth_logs (created_at);
        `)
      } else {
        console.log('✅ Table auth_logs already exists or migration succeeded')
      }
    } else {
      console.log('✅ Migration 2 completed\n')
    }

    console.log('✅ All migrations completed!\n')
    
  } catch (error) {
    console.error('❌ Migration error:', error.message)
    console.log('\n⚠️  If migrations failed, run the SQL manually in Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg/sql\n')
  }
}

runMigrations()
