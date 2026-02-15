-- Add note_created_at column to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS note_updated_at TIMESTAMPTZ;

-- For existing rows that have a note, back-fill with created_at
UPDATE orders
  SET note_updated_at = created_at
  WHERE order_note IS NOT NULL AND note_updated_at IS NULL;
