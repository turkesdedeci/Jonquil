'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { trTR } from '@clerk/localizations';
import React from 'react';

// Error boundary for Clerk-related errors
class ClerkErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ClerkWrapper error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // Check if Clerk publishable key exists
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no key, render children without ClerkProvider
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkErrorBoundary fallback={<>{children}</>}>
      <ClerkProvider localization={trTR}>
        {children}
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}
