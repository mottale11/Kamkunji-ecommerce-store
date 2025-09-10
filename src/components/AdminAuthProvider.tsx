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
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in as admin
    const checkAdminStatus = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (user) {
          // Check if user is an admin
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin, full_name')
            .eq('id', user.id)
            .single();

          if (!error && profile?.is_admin) {
            setAdminUser({
              id: user.id,
              email: user.email || '',
              full_name: profile.full_name,
            });
            setIsAdmin(true);
          } else {
            // User exists but is not an admin, sign them out
            await supabase.auth.signOut();
            setAdminUser(null);
            setIsAdmin(false);
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
              window.location.href = '/admin/login';
            }
          }
        } else if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminUser(null);
        setIsAdmin(false);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user is an admin
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin, full_name')
            .eq('id', session.user.id)
            .single();

          if (!error && profile?.is_admin) {
            setAdminUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: profile.full_name,
            });
            setIsAdmin(true);
          } else {
            // User exists but is not an admin
            await supabase.auth.signOut();
            setAdminUser(null);
            setIsAdmin(false);
            router.push('/admin/login');
          }
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
          setIsAdmin(false);
          router.push('/admin/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAdminUser(null);
      setIsAdmin(false);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    adminUser,
    isAdmin,
    loading,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
