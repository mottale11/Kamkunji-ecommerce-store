'use client';

import { useEffect, useState } from 'react';

interface HydrationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function HydrationErrorBoundary({ 
  children, 
  fallback = null 
}: HydrationErrorBoundaryProps) {
  const [hasHydrationError, setHasHydrationError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag after hydration
    setIsClient(true);
    
    // Listen for hydration errors
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('hydration') || event.message.includes('mismatch')) {
        console.warn('Hydration mismatch detected, suppressing warning:', event.message);
        setHasHydrationError(true);
        // Prevent the error from showing in console
        event.preventDefault();
        return false;
      }
    };

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('hydration') || event.reason.message.includes('mismatch'))) {
        console.warn('Hydration mismatch in promise, suppressing warning:', event.reason.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Show fallback during hydration or if there's an error
  if (!isClient || hasHydrationError) {
    return fallback || <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
}
