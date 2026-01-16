/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function CreateSubscriptionModal({ isOpen, onClose, initialData }: CreateSubscriptionModalProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
 
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [category, setCategory] = useState('');
  const [isTrial, setIsTrial] = useState(false);

  const categories = ['Streaming', 'Software', 'Educação', 'Lazer', 'Finanças', 'Casa' ,'Outros'];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setCurrency(initialData.currency || 'BRL');
      setBillingCycle(initialData.billing_cycle);
      setNextBillingDate(initialData.next_billing_date);
      setCategory(initialData.categories?.name || ''); 
      setIsTrial(initialData.status === 'trial');
    } else {
      setName('');
      setPrice('');
      setCurrency('BRL');
      setBillingCycle('monthly');
      setNextBillingDate('');
      setCategory('');
      setIsTrial(false);
    }
  }, [initialData, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não logado');

      let categoryId = null;
      if (category) {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .eq('user_id', user.id)
          .single();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({ 
              name: category, 
              user_id: user.id,
              color: '#3b82f6', 
              icon: 'box' 
            })
            .select()
            .single();
          
          if (catError) throw catError;
          categoryId = newCat.id;
        }
      }

      const subscriptionData = {
        user_id: user.id,
        name,
        price: parseFloat(price.replace(',', '.')),
        currency,
        billing_cycle: billingCycle,
        next_billing_date: nextBillingDate,
        category_id: categoryId,
        status: isTrial ? 'trial' : 'active'
      };

      let error;
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);
        error = insertError;
      }

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      onClose();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Assinatura' : 'Nova Assinatura'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Nome do Serviço</label>
              <input
                type="text"
                required
                placeholder="Ex: Netflix, Spotify..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-600 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <input 
                type="checkbox" 
                id="trial"
                checked={isTrial}
                onChange={e => setIsTrial(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"
              />
              <label htmlFor="trial" className="text-sm text-slate-300 cursor-pointer select-none">
                É um período de testes (Free Trial)?
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
              >
                <option value="">Sem Categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Preço</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 p-3 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Moeda</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Ciclo</label>
                <select
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Próximo Pagamento</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={nextBillingDate}
                    onChange={e => setNextBillingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]"
                  />
                  <Calendar className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                initialData ? 'Salvar Alterações' : 'Criar Assinatura'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}