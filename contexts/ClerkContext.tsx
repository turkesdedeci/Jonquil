'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUser as useClerkUser, useClerk as useClerkClerk } from '@clerk/nextjs';

interface UserContextType {
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean;
}

interface ClerkContextType {
  signOut: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoaded: true,
  isSignedIn: false,
});

const ClerkActionsContext = createContext<ClerkContextType>({
  signOut: () => {},
});

// Check if Clerk is configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ClerkUserProvider({ children }: { children: ReactNode }) {
  const clerkUser = useClerkUser();
  const clerk = useClerkClerk();

  return (
    <UserContext.Provider value={{
      user: clerkUser.user,
      isLoaded: clerkUser.isLoaded,
      isSignedIn: clerkUser.isSignedIn ?? false,
    }}>
      <ClerkActionsContext.Provider value={{
        signOut: () => clerk.signOut(),
      }}>
        {children}
      </ClerkActionsContext.Provider>
    </UserContext.Provider>
  );
}

function MockUserProvider({ children }: { children: ReactNode }) {
  return (
    <UserContext.Provider value={{
      user: null,
      isLoaded: true,
      isSignedIn: false,
    }}>
      <ClerkActionsContext.Provider value={{
        signOut: () => {},
      }}>
        {children}
      </ClerkActionsContext.Provider>
    </UserContext.Provider>
  );
}

export function SafeUserProvider({ children }: { children: ReactNode }) {
  if (!isClerkConfigured) {
    return <MockUserProvider>{children}</MockUserProvider>;
  }
  return <ClerkUserProvider>{children}</ClerkUserProvider>;
}

export function useSafeUser() {
  return useContext(UserContext);
}

export function useSafeClerk() {
  return useContext(ClerkActionsContext);
}

export { isClerkConfigured };
