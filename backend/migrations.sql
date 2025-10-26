-- ============================================
-- FRELSI BACKEND SECURITY MIGRATIONS
-- Date: 16 octobre 2025
-- Instructions: Copy-paste dans Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/phouklsqlhstcmsbllgg/sql
-- ============================================

-- Migration 1: Add attempts column to auth_codes (if not exists)
-- Purpose: Track failed verification attempts for brute force protection
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auth_codes' AND column_name = 'attempts'
  ) THEN
    ALTER TABLE auth_codes ADD COLUMN attempts INTEGER DEFAULT 0;
    RAISE NOTICE 'Column attempts added to auth_codes';
  ELSE
    RAISE NOTICE 'Column attempts already exists in auth_codes';
  END IF;
END $$;

-- Create index for attempts
CREATE INDEX IF NOT EXISTS idx_auth_codes_email_attempts 
ON auth_codes (email, attempts);

-- Migration 2: Create auth_logs table
-- Purpose: Audit logging for all authentication attempts
CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'request_code', 'verify_success', 'verify_fail', 'code_blocked'
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for auth_logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_email ON auth_logs (email);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON auth_logs (action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs (created_at);

-- Verify migrations
SELECT 'Migrations completed successfully!' AS status;

-- Show current structure
SELECT 
  'auth_codes' AS table_name,
  COUNT(*) AS row_count
FROM auth_codes
UNION ALL
SELECT 
  'auth_logs' AS table_name,
  COUNT(*) AS row_count
FROM auth_logs;
