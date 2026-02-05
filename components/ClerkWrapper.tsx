'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // Check if Clerk publishable key exists
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no key, render children without ClerkProvider
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider localization={trTR}>
      {children}
    </ClerkProvider>
  );
}
