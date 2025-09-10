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

    try {
      const client = createClient();
      setSupabase(client);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    } finally {
      setIsLoading(false);
    }
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