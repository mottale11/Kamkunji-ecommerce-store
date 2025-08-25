import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';

export type DashboardStats = {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  reportedItems: number;
};

export type CategoryCount = {
  name: string;
  count: number;
  id: string;
  icon: string | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total items count
    const { count: totalItems, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get pending items count
    const { count: pendingItems, error: pendingError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get approved items count
    const { count: approvedItems, error: approvedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (approvedError) throw approvedError;

    // Get reported items count
    const { count: reportedItems, error: reportedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'reported');

    if (reportedError) throw reportedError;

    return {
      totalItems: totalItems || 0,
      pendingItems: pendingItems || 0,
      approvedItems: approvedItems || 0,
      reportedItems: reportedItems || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

export async function getCategoriesWithCount(): Promise<CategoryCount[]> {
  try {
    // First get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, icon');

    if (categoriesError) throw categoriesError;

    // For each category, count the number of products
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        if (error) throw error;

        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          count: count || 0,
        };
      })
    );

    // Sort by count in descending order
    return categoriesWithCount.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching categories with count:', error);
    throw error;
  }
}