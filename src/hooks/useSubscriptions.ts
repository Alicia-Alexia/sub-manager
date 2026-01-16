import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase' 


type Subscription = Database['public']['Tables']['subscriptions']['Row']

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          categories (
            name,
            color, 
            icon
          )
        `) 
        .order('next_billing_date', { ascending: true })

      if (error) throw error
      return data as Subscription[]
    },
  })
}