export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category_id: string | null
          stock_quantity: number
          is_featured: boolean
          condition: string
          location: string | null
          phone: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category_id?: string | null
          stock_quantity?: number
          is_featured?: boolean
          condition?: string
          location?: string | null
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category_id?: string | null
          stock_quantity?: number
          is_featured?: boolean
          condition?: string
          location?: string | null
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          password_hash: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          password_hash: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          password_hash?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string
          address: string
          city: string
          additional_info: string | null
          total_amount: number
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone: string
          address: string
          city: string
          additional_info?: string | null
          total_amount: number
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          additional_info?: string | null
          total_amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          product_id: string
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          reason: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          reason?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}