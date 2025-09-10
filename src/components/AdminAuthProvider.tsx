'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './SupabaseProvider';

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { supabase, isLoading: isSupabaseLoading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (isSupabaseLoading) return;
    if (!supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const checkAdminStatus = async () => {
      if (!isMounted) return;
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin, full_name')
            .eq('id', user.id)
            .single();

          if (isMounted) {
            if (!error && profile?.is_admin) {
              setAdminUser({
                id: user.id,
                email: user.email || '',
                full_name: profile.full_name,
              });
              setIsAdmin(true);
            } else {
              await supabase.auth.signOut();
              setAdminUser(null);
              setIsAdmin(false);
            }
          }
        } else if (isMounted) {
          setAdminUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (isMounted) {
          setAdminUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await checkAdminStatus();
      }
    });
    
    authSubscription = data;

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, [supabase, isSupabaseLoading]);

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setAdminUser(null);
      setIsAdmin(false);
      
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't render children until we've checked auth state
  if (loading || isSupabaseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdmin, loading, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
