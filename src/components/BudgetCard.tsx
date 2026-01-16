import { Pencil, Trash2 } from 'lucide-react';

interface BudgetCardProps {
  category: string;
  limit: number;
  spent: number;
  onEdit: () => void; 
  onDelete: () => void; 
}

export function BudgetCard({  category, limit, spent, onEdit, onDelete }: BudgetCardProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  
  let progressColor = 'bg-emerald-500'; 
  let textColor = 'text-emerald-400';

  if (percentage >= 100) {
    progressColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage >= 80) {
    progressColor = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  }

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg group relative transition-all hover:border-slate-700">
      
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onEdit} 
          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          title="Editar"
        >
          <Pencil size={14} />
        </button>
        <button 
          onClick={onDelete} 
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Excluir"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex justify-between items-end mb-3">
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            {category}
          </h3>
          <p className="text-2xl font-bold text-white mt-1">
            {formatMoney(spent)} 
            <span className="text-sm text-slate-500 font-normal ml-2">
               / {formatMoney(limit)}
            </span>
          </p>
        </div>
        
        <span className={`text-sm font-bold ${textColor}`}>
          {Math.round((spent / limit) * 100)}%
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage >= 100 && (
        <p className="text-xs text-red-400 mt-3 font-medium flex items-center gap-1">
          ⚠️ Limite excedido!
        </p>
      )}
    </div>
  );
}