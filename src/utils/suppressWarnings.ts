// Utility to suppress hydration warnings and other development console noise
// This should only be used in development

if (process.env.NODE_ENV === 'development') {
  // Suppress hydration mismatch warnings
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0];
    
    // Suppress hydration mismatch warnings
    if (typeof message === 'string' && 
        (message.includes('hydration') || 
         message.includes('mismatch') || 
         message.includes('data-new-gr-c-s-check-loaded') ||
         message.includes('data-gr-ext-installed'))) {
      // Convert to warning instead of error
      console.warn('🔧 Suppressed hydration warning:', ...args);
      return;
    }
    
    // Suppress specific browser extension warnings
    if (typeof message === 'string' && 
        message.includes('A tree hydrated but some attributes')) {
      console.warn('🔧 Suppressed hydration mismatch warning (browser extension related)');
      return;
    }
    
    // Pass through all other errors
    originalConsoleError.apply(console, args);
  };

  // Suppress specific React warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    
    // Suppress specific warnings that are not critical
    if (typeof message === 'string' && 
        (message.includes('hydration') || 
         message.includes('mismatch'))) {
      // Don't show these warnings in development
      return;
    }
    
    // Pass through all other warnings
    originalConsoleWarn.apply(console, args);
  };
}

export const suppressHydrationWarnings = () => {
  // This function can be called to manually suppress warnings
  if (typeof window !== 'undefined') {
    // Client-side only
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes('hydration')) {
        return; // Suppress hydration errors
      }
      originalError.apply(console, args);
    };
  }
};
