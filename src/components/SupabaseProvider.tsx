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
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing required Supabase environment variables');
      setIsLoading(false);
      return;
    }

    try {
      const client = createBrowserClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      );
      
      setSupabase(client);
    } catch (error) {
      console.error('Error creating Supabase client:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Don't render children until Supabase is initialized
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
};