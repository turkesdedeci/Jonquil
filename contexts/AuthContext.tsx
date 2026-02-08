'use client';

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import {
  useUser as useClerkUser,
  useClerk as useClerkHook,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
} from '@clerk/nextjs';

// Check if Clerk is configured
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Types
interface User {
  id: string;
  primaryEmailAddress?: { emailAddress: string };
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  openSignIn: () => void;
  openSignUp: () => void;
  openUserProfile: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoaded: true,
  isSignedIn: false,
  signOut: async () => {},
  openSignIn: () => {},
  openSignUp: () => {},
  openUserProfile: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Provider that uses Clerk hooks (only rendered when ClerkProvider is present)
function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  const clerk = useClerkHook();

  // Memoize callbacks to prevent unnecessary re-renders
  const signOut = useCallback(() => clerk.signOut(), [clerk]);
  const openSignIn = useCallback(() => clerk.openSignIn(), [clerk]);
  const openSignUp = useCallback(() => clerk.openSignUp(), [clerk]);
  const openUserProfile = useCallback(() => clerk.openUserProfile(), [clerk]);

  // Memoize the context value to prevent re-renders
  const value = useMemo<AuthContextType>(() => ({
    user: user as User | null,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    signOut,
    openSignIn,
    openSignUp,
    openUserProfile,
  }), [user, isLoaded, isSignedIn, signOut, openSignIn, openSignUp, openUserProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Fallback provider when Clerk is not configured
function FallbackAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}

// Main provider that chooses the right implementation
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!hasClerkKey) {
    return <FallbackAuthProvider>{children}</FallbackAuthProvider>;
  }
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Re-export Clerk components with safe fallbacks
export function SignedIn({ children }: { children: ReactNode }) {
  if (!hasClerkKey) {
    return null;
  }
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  if (!hasClerkKey) {
    return <>{children}</>;
  }
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

export function SignInButton({
  children,
  mode,
}: {
  children?: ReactNode;
  mode?: 'modal' | 'redirect';
}) {
  if (!hasClerkKey) {
    return <>{children}</>;
  }
  return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
}
