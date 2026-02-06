'use client';

import React from 'react';
import {
  useUser as useClerkUserHook,
  useClerk as useClerkHook,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
} from '@clerk/nextjs';

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Safe wrapper for useUser that handles missing ClerkProvider
export function useUser() {
  if (!hasClerkKey) {
    return { user: null, isLoaded: true, isSignedIn: false };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkUserHook();
}

// Safe wrapper for useClerk that handles missing ClerkProvider
export function useClerk() {
  if (!hasClerkKey) {
    return {
      signOut: () => Promise.resolve(),
      openSignIn: () => {},
      openSignUp: () => {},
      openUserProfile: () => {},
    };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkHook();
}

// Safe wrapper for SignedIn - shows children only when signed in
export function SignedIn({ children }: { children: React.ReactNode }) {
  if (!hasClerkKey) {
    return null; // No Clerk, never show signed-in content
  }
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

// Safe wrapper for SignedOut - shows children only when signed out
export function SignedOut({ children }: { children: React.ReactNode }) {
  if (!hasClerkKey) {
    return <>{children}</>; // No Clerk, always show signed-out content
  }
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

// Safe wrapper for SignInButton
export function SignInButton({ children, mode, appearance }: { children?: React.ReactNode; mode?: 'modal' | 'redirect'; appearance?: any }) {
  if (!hasClerkKey) {
    return <>{children}</>; // No Clerk, just render children as-is (non-functional)
  }
  return <ClerkSignInButton mode={mode} appearance={appearance}>{children}</ClerkSignInButton>;
}
