'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type SupabaseContext = {
  supabase: ReturnType<typeof createClient> | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only create the client on the client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initializeSupabase = async () => {
      try {
        // Check if environment variables are available
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('Supabase environment variables not found');
          setIsLoading(false);
          return;
        }

        const client = createClient();
        setSupabase(client);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure environment variables are loaded
    setTimeout(initializeSupabase, 50);
  }, []);

  return (
    <Context.Provider value={{ supabase, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};