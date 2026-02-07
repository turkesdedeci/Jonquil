'use client';

import dynamic from 'next/dynamic';
import { Package } from 'lucide-react';

// Dynamically import the admin component with SSR disabled
// This prevents any server-side rendering issues with Clerk or other client-only code
const AdminClient = dynamic(() => import('./AdminClient'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Package className="mx-auto mb-4 h-12 w-12 animate-pulse text-[#0f3f44]" />
        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-[#0f3f44]" />
      </div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminClient />;
}
