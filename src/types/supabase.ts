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
          email: string | null
          preferred_currency: 'BRL' | 'USD' | 'EUR'
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          preferred_currency?: 'BRL' | 'USD' | 'EUR'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          preferred_currency?: 'BRL' | 'USD' | 'EUR'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          color: string | null
          icon: string | null  //
          is_system: boolean
          user_id: string | null
        }
        Insert: {
          id?: number
          name: string
          color?: string | null
          icon?: string | null 
          is_system?: boolean
          user_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          color?: string | null
          icon?: string | null 
          is_system?: boolean
          user_id?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: number
          user_id: string
          category_id: number | null
          name: string
          price: number
          currency: 'BRL' | 'USD' | 'EUR'
          billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly'
          start_date: string
          next_billing_date: string
          status: 'active' | 'cancelled' | 'trial'
          logo_url: string | null
          website_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          category_id?: number | null
          name: string
          price: number
          currency?: 'BRL' | 'USD' | 'EUR'
          billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly'
          start_date: string
          next_billing_date: string
          status?: 'active' | 'cancelled' | 'trial'
          logo_url?: string | null
          website_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          category_id?: number | null
          name?: string
          price?: number
          currency?: 'BRL' | 'USD' | 'EUR'
          billing_cycle?: 'monthly' | 'yearly' | 'weekly' | 'quarterly'
          start_date?: string
          next_billing_date?: string
          status?: 'active' | 'cancelled' | 'trial'
          logo_url?: string | null
          website_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      subscription_cycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly'
      currency_type: 'BRL' | 'USD' | 'EUR'
      subscription_status: 'active' | 'cancelled' | 'trial'
    }
  }
}