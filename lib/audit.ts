/**
 * Audit logging system for admin actions
 * Tracks all administrative operations for security and compliance
 */

import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

// Supabase client for audit logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Audit action types
export type AuditAction =
  | 'product_create'
  | 'product_update'
  | 'product_delete'
  | 'product_visibility_toggle'
  | 'order_status_update'
  | 'order_tracking_update'
  | 'file_upload'
  | 'settings_update'
  | 'admin_login'
  | 'admin_logout';

// Audit log entry
export interface AuditLogEntry {
  action: AuditAction;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an admin action to the audit log
 */
export async function logAuditEvent(
  entry: AuditLogEntry,
  request?: Request
): Promise<void> {
  try {
    // Get current user info
    const user = await currentUser();
    const userId = user?.id || 'unknown';
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'unknown';

    // Extract request info
    let ipAddress = entry.ip_address || 'unknown';
    let userAgent = entry.user_agent || 'unknown';

    if (request) {
      ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
      userAgent = request.headers.get('user-agent') || 'unknown';
    }

    // Create audit log entry
    const logEntry = {
      user_id: userId,
      user_email: userEmail,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id || null,
      details: entry.details || {},
      ip_address: ipAddress,
      user_agent: userAgent.slice(0, 500), // Limit length
      created_at: new Date().toISOString(),
    };

    // Log to console (always)
    console.log('[Audit]', {
      action: entry.action,
      resource: `${entry.resource_type}${entry.resource_id ? ':' + entry.resource_id : ''}`,
      user: userEmail,
      ip: ipAddress,
      timestamp: logEntry.created_at,
    });

    // Log to database if available
    if (supabase) {
      const { error } = await supabase
        .from('audit_logs')
        .insert(logEntry);

      if (error) {
        // Don't throw - audit logging should not break the main operation
        // Check if table doesn't exist
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.warn('[Audit] audit_logs table does not exist. Run the setup SQL.');
        } else {
          console.error('[Audit] Failed to log to database:', error.message);
        }
      }
    }
  } catch (error) {
    // Never throw from audit logging - it should be non-blocking
    console.error('[Audit] Error logging event:', error);
  }
}

/**
 * Create audit log wrapper for async operations
 * Logs before and after the operation with success/failure status
 */
export async function withAuditLog<T>(
  entry: AuditLogEntry,
  operation: () => Promise<T>,
  request?: Request
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();

    // Log success
    await logAuditEvent({
      ...entry,
      details: {
        ...entry.details,
        status: 'success',
        duration_ms: Date.now() - startTime,
      },
    }, request);

    return result;
  } catch (error) {
    // Log failure
    await logAuditEvent({
      ...entry,
      details: {
        ...entry.details,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      },
    }, request);

    throw error;
  }
}

/**
 * SQL to create audit_logs table in Supabase
 * Run this in Supabase SQL editor
 */
export const AUDIT_TABLE_SQL = `
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from API)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can read (for admin dashboard)
CREATE POLICY "Service role can read audit logs"
  ON audit_logs FOR SELECT
  TO service_role
  USING (true);

-- Comment on table
COMMENT ON TABLE audit_logs IS 'Admin action audit logs for security and compliance';
`;
