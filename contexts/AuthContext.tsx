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
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const clerk = useClerkHook();

  // Extract primitive values from user to create stable dependencies
  const userId = clerkUser?.id;
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const userFirstName = clerkUser?.firstName;
  const userLastName = clerkUser?.lastName;
  const userImageUrl = clerkUser?.imageUrl;

  // Memoize callbacks to prevent unnecessary re-renders
  const signOut = useCallback(() => clerk.signOut(), [clerk]);
  const openSignIn = useCallback(() => clerk.openSignIn(), [clerk]);
  const openSignUp = useCallback(() => clerk.openSignUp(), [clerk]);
  const openUserProfile = useCallback(() => clerk.openUserProfile(), [clerk]);

  // Create a stable user object from primitive values
  const user = useMemo<User | null>(() => {
    if (!userId) return null;
    return {
      id: userId,
      primaryEmailAddress: userEmail ? { emailAddress: userEmail } : undefined,
      firstName: userFirstName,
      lastName: userLastName,
      imageUrl: userImageUrl,
    };
  }, [userId, userEmail, userFirstName, userLastName, userImageUrl]);

  // Memoize the context value to prevent re-renders
  const value = useMemo<AuthContextType>(() => ({
    user,
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
