import { useSupabase } from '../components/SupabaseProvider';

export type Category = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export async function getCategories(supabase: any): Promise<Category[]> {
  try {
    if (!supabase) {
      console.error('Supabase client is undefined');
      return [];
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

export async function getCategoryById(supabase: any, id: string): Promise<Category | null> {
  try {
    if (!supabase) {
      console.error('Supabase client is undefined');
      return null;
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return null;
  }
}

export async function createCategory(supabase: any, category: { name: string; description?: string }) {
  try {
    if (!supabase) {
      throw new Error('Supabase client is undefined');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
}

export async function updateCategory(supabase: any, id: string, updates: { name?: string; description?: string }) {
  try {
    if (!supabase) {
      throw new Error('Supabase client is undefined');
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
}

export async function deleteCategory(supabase: any, id: string) {
  try {
    if (!supabase) {
      throw new Error('Supabase client is undefined');
    }

    // Check if category is in use
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', id);

    if (countError) {
      console.error('Error checking category usage:', countError);
      throw countError;
    }

    // Don't delete if category is in use
    if (count && count > 0) {
      throw new Error(`Cannot delete category with ID ${id} because it is used by ${count} products`);
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
}