'use client';

import { createBrowserClient } from '@supabase/ssr';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserClient> | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only create the client on the client side
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
            },
          });
          setSupabase(client);
        } catch (error) {
          console.error('Error creating Supabase client:', error);
        }
      } else {
        console.warn('Missing required Supabase environment variables');
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabase) {
      try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
          // Refresh the page on auth state change
          // This is a simple approach - in a real app you might use more sophisticated state management
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth listener:', error);
      }
    }
  }, [supabase]);

  // Show loading state while initializing
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    // During build time, return a mock context
    if (typeof window === 'undefined') {
      return { supabase: null };
    }
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};