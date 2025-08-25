import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/database.types';

export type Report = Database['public']['Tables']['reports']['Row'];

// Create a client-side Supabase client
const getClient = () => createClientComponentClient<Database>();

/**
 * Create a new report for a product
 */
export async function createReport({
  product_id,
  reason,
}: {
  product_id: string;
  reason: string;
}): Promise<Report | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('reports')
    .insert({
      product_id,
      reason,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    return null;
  }

  return data as Report;
}

/**
 * Get all reports with optional filtering
 */
export async function getReports({
  product_id,
  status,
  limit = 50,
  offset = 0,
}: {
  product_id?: string;
  status?: 'pending' | 'resolved' | 'dismissed' | 'all';
  limit?: number;
  offset?: number;
} = {}): Promise<Report[]> {
  const supabase = getClient();
  let query = supabase
    .from('reports')
    .select('*, products!inner(*)') // Join with products table
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (product_id) {
    query = query.eq('product_id', product_id);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return data as unknown as Report[];
}

// [Rest of the functions with similar modifications...]