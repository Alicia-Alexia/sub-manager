import { Fragment, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { subscriptionSchema } from '../lib/schemas'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/supabase'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

interface Props {
    isOpen: boolean
    onClose: () => void
    initialData?: Subscription | null
}

export function CreateSubscriptionModal({ isOpen, onClose, initialData }: Props) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await supabase.from('categories').select('*').order('name')
            return data || []
        },
        staleTime: 1000 * 60 * 5,
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: {
            currency: 'BRL',
            billing_cycle: 'monthly',
            category_id: 0,
        }
    })

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    price: initialData.price,
                    currency: initialData.currency,
                    billing_cycle: initialData.billing_cycle,
                    category_id: initialData.category_id || 0,
                    next_billing_date: initialData.next_billing_date.split('T')[0],
                    is_trial: initialData.status === 'trial',
                })
            } else {
                reset({
                    name: '',
                    price: undefined,
                    currency: 'BRL',
                    billing_cycle: 'monthly',
                    category_id: 0,
                    next_billing_date: undefined,
                    is_trial: false,
                })
            }
        }
    }, [initialData, reset, isOpen])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
    if (!user) return

    const { is_trial, ...subData } = data
    const status = is_trial ? 'trial' : 'active'

    try {
      let error;

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            ...subData, 
            status: status,
          })
          .eq('id', initialData.id)
        
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            ...subData, 
            user_id: user.id,
            start_date: new Date().toISOString(),
            status: status,
          })
        
        error = insertError
      }

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      onClose()
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar. Veja o console.')
    }
  }



    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

                                <div className="flex justify-between items-center mb-5">
                                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        {initialData ? 'Editar Assinatura' : 'Nova Assinatura'}
                                    </DialogTitle>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
                                        <div className="flex items-center gap-2 pb-2">
                                            <input
                                                type="checkbox"
                                                id="is_trial"
                                                {...register('is_trial')}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="is_trial" className="text-sm text-gray-700 font-medium cursor-pointer">
                                                É um período de testes (Free Trial)?
                                            </label>
                                        </div>
                                        <input
                                            {...register('name')}
                                            placeholder="Ex: Netflix, Spotify..."
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name.message as string}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                                        <select
                                            {...register('category_id')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                        >
                                            <option value="0">Sem Categoria</option>
                                            {categories?.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Preço</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('price')}
                                                placeholder="0.00"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                            />
                                            {errors.price && <span className="text-xs text-red-500">{errors.price.message as string}</span>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Moeda</label>
                                            <select {...register('currency')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                                                <option value="BRL">BRL (R$)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ciclo</label>
                                            <select {...register('billing_cycle')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                                                <option value="monthly">Mensal</option>
                                                <option value="yearly">Anual</option>
                                                <option value="weekly">Semanal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Próximo Pagamento</label>
                                            <input
                                                type="date"
                                                {...register('next_billing_date')}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                            />
                                            {errors.next_billing_date && <span className="text-xs text-red-500">{errors.next_billing_date.message as string}</span>}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Salvar Alterações' : 'Criar Assinatura')}
                                        </button>
                                    </div>
                                </form>

                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}