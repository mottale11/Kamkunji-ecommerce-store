/**
 * @deprecated Please use the useSupabase hook from @/app/supabase-provider instead.
 * This file is maintained for backward compatibility only.
 * 
 * Migration guide:
 * 1. Replace imports from '@/utils/supabase' with '@/app/supabase-provider'
 * 2. Use the useSupabase hook in your components:
 *    import { useSupabase } from '@/app/supabase-provider';
 *    const { supabase } = useSupabase();
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

type ClientOptions = {
  auth?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
    detectSessionInUrl?: boolean;
  };
};

/**
 * @deprecated Use the useSupabase hook instead
 */
function createClient(url: string, key: string, options?: ClientOptions) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'createClient from @/utils/supabase is deprecated. ' +
      'Use the useSupabase hook from @/app/supabase-provider instead.'
    );
  }
  
  return createBrowserClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...options?.auth,
    },
  });
}

// Get environment variables
const getEnvVars = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
});

const { url, key } = getEnvVars();

if (!url || !key) {
  throw new Error('Missing required Supabase environment variables');
}

// Create a single Supabase client for interacting with your database
const supabase = createClient(url, key);

// Re-export the useSupabase hook for backward compatibility
export { useSupabase } from '@/app/supabase-provider';

// Re-export types and utilities for convenience
export * from '@supabase/supabase-js';

// Export for backward compatibility
export { createClient };

export default supabase;

// New utility file to provide typed Supabase client
import { createClient } from '../lib/supabase/client';

export const typedSupabase = createClient();

export type Tables = {
  products: {
    Row: {
      id: string;
      name: string;
      price: number;
      description: string;
      condition: string;
      location: string;
      phone: string;
      status: string;
      created_at: string;
      categories?: {
        name: string;
      };
      product_images?: Array<{
        url: string;
      }>;
    };
  };
  // Add other table types as needed
};

export type Product = Tables['products']['Row'];