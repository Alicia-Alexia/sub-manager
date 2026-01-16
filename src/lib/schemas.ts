import { z } from 'zod'

export const subscriptionSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  price: z.coerce.number().min(0.01, 'Preço deve ser maior que 0'), 
  currency: z.enum(['BRL', 'USD', 'EUR']),
  billing_cycle: z.enum(['monthly', 'yearly', 'weekly', 'quarterly']),
  category_id: z.coerce.number().transform(val => val === 0 ? null : val).nullable().optional(),
  next_billing_date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'A data deve ser no futuro',
  }),
  is_trial: z.boolean().optional(),
})


export type CreateSubscriptionSchema = z.infer<typeof subscriptionSchema>