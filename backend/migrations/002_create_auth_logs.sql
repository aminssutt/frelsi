-- Migration: Create auth_logs table for audit trail
-- Run this in Supabase SQL Editor

CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'request_code', 'verify_success', 'verify_fail', 'code_blocked'
  ip_address TEXT,
  user_agent TEXT,
  details JSONB, -- Additional context (e.g., error messages, attempts count)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_auth_logs_email ON auth_logs (email);
CREATE INDEX idx_auth_logs_action ON auth_logs (action);
CREATE INDEX idx_auth_logs_created_at ON auth_logs (created_at);

-- RLS (Row Level Security) - optional
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own logs
CREATE POLICY "Users can view their own auth logs" ON auth_logs
  FOR SELECT USING (auth.email() = email);