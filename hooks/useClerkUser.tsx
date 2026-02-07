'use client';

// Re-export everything from AuthContext for backwards compatibility
export { useAuth as useUser, useAuth as useClerk, SignedIn, SignedOut, SignInButton } from '@/contexts/AuthContext';
