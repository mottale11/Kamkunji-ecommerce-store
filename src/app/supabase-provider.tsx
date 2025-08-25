'use client';

import { createBrowserClient } from '@supabase/ssr';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Database } from '@/types/database.types';

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserClient<Database>>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [supabase] = useState(() => {
    const supabaseUrl = 
      (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_SUPABASE_URL) ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';

    const supabaseAnonKey = 
      (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    return createBrowserClient<Database>(
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
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // You can add additional auth state change handling here if needed
      console.log('Auth state changed:', event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};