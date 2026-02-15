-- Abandoned cart tracking table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,   -- anonymous session key from cookie/localStorage
  email TEXT,                         -- filled if user typed email in checkout
  user_id TEXT,                       -- filled if logged-in user
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10,2),
  reminder_sent_at TIMESTAMPTZ,       -- null = not yet sent
  converted_at TIMESTAMPTZ,           -- null = still abandoned; set when order placed
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for cron query: unsent reminders older than 1 hour, not yet converted
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_cron
  ON abandoned_carts (updated_at, reminder_sent_at, converted_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_abandoned_carts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_abandoned_carts_updated_at ON abandoned_carts;
CREATE TRIGGER trg_abandoned_carts_updated_at
  BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION update_abandoned_carts_updated_at();

-- RLS: service role only (no direct client access)
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
-- No policies — only service role key bypasses RLS
