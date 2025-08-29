'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SupabaseProvider with no SSR
const SupabaseProvider = dynamic(() => import('./SupabaseProvider'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const HydrationErrorBoundary = dynamic(() => import('./HydrationErrorBoundary'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

interface SupabaseWrapperProps {
  children: ReactNode;
}

export default function SupabaseWrapper({ children }: SupabaseWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During build time or SSR, render children without context
  // This prevents the build from failing
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SupabaseProvider>
      <HydrationErrorBoundary>
        {children}
      </HydrationErrorBoundary>
    </SupabaseProvider>
  );
}
