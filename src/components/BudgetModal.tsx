import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { id: string, category: string, limit_amount: number } | null;
}

export function BudgetModal({ isOpen, onClose, onSuccess, initialData }: BudgetModalProps) {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const [category, setCategory] = useState(initialData?.category || 'Streaming');
  const [amount, setAmount] = useState(
    initialData?.limit_amount ? formatCurrency(initialData.limit_amount) : ''
  );

  const categories = ['Streaming', 'Software', 'Educação', 'Lazer', 'Finanças', 'Outros'];
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, ''); 

    if (onlyDigits === '') {
      setAmount('');
      return;
    }

    const numberValue = Number(onlyDigits) / 100; 
    setAmount(formatCurrency(numberValue)); 
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rawAmount = parseFloat(
      amount.replace(/\./g, '').replace(',', '.')
    );

    if (isNaN(rawAmount) || rawAmount <= 0) {
      alert("Valor inválido.");
      setLoading(false);
      return;
    }

    let error;

    if (initialData?.id) {
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ category, limit_amount: rawAmount })
        .eq('id', initialData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('budgets')
        .upsert(
          { user_id: user.id, category, limit_amount: rawAmount },
          { onConflict: 'user_id, category' }
        );
      error = insertError;
    }

    setLoading(false);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      onSuccess();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Teto' : 'Novo Teto de Gastos'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Limite Mensal</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500 font-bold text-sm">R$</span>
              <input 
                type="text" 
                inputMode="numeric"
                required
                placeholder="0,00"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold tracking-wide"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex justify-center mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Salvar Alterações' : 'Definir Teto')}
          </button>
        </form>
      </div>
    </div>
  );
}