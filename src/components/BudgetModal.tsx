import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Ajuste o caminho se necessário

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BudgetModal({ isOpen, onClose, onSuccess }: BudgetModalProps) {
  const [category, setCategory] = useState('Streaming');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Streaming', 'Software', 'Educação', 'Lazer', 'Finanças','Casa' ,'Outros'];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('budgets')
      .upsert(
        { 
          user_id: user.id, 
          category, 
          limit_amount: parseFloat(amount.replace(',', '.')) 
        },
        { onConflict: 'user_id, category' } 
      );

    setLoading(false);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      onSuccess(); 
      onClose();   
      setAmount('');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Definir Teto de Gastos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Limite Mensal (R$)</label>
            <input 
              type="number" 
              step="0.01"
              required
              placeholder="Ex: 150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors mt-4"
          >
            {loading ? 'Salvando...' : 'Salvar Teto'}
          </button>
        </form>
      </div>
    </div>
  );
}