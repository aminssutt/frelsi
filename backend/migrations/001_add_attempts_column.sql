-- Migration: Add attempts column to auth_codes table
-- Run this in Supabase SQL Editor

ALTER TABLE auth_codes 
ADD COLUMN attempts INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_auth_codes_email_attempts 
ON auth_codes (email, attempts);