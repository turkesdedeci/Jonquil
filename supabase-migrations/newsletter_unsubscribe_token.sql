-- Add unsubscribe_token to newsletter_subscribers
-- Run in Supabase SQL Editor

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token
  ON newsletter_subscribers (unsubscribe_token);
