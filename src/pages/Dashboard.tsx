import { useState, useMemo, useEffect } from 'react'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { Database } from '../types/supabase'
import {
  Plus, CreditCard, Calendar, Loader2, Wallet, TrendingUp,
  Pencil, Trash2, LayoutDashboard, LogOut, Check, 
  Play, Home, DollarSign, Gamepad2, Book, Coffee, Box, HelpCircle, Music, Video,
  PlusCircle
} from 'lucide-react'
import { CreateSubscriptionModal } from '../components/CreateSubscriptionModal'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { BudgetCard } from '../components/BudgetCard';
import { BudgetModal } from '../components/BudgetModal';

interface Budget {
  id: string
  user_id: string
  category: string
  limit_amount: number
  created_at?: string
}

type BaseSubscription = Database['public']['Tables']['subscriptions']['Row']

type SubscriptionWithCategory = BaseSubscription & {
  categories: {
    name: string
    color: string | null
    icon: string | null
  } | null
}

const getDaysUntilDue = (dateString: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = dateString.split('-').map(Number)
  const due = new Date(year, month - 1, day)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getUrgencyStyle = (days: number, status: string) => {
  if (status === 'trial') {
    if (days < 0) return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'Trial Expirado' }
    if (days === 0) return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'Cancele HOJE!' }
    if (days <= 2) return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'Cancele Logo' }
    return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'Em Teste' }
  }

  if (days < 0) return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'Atrasada' }
  if (days === 0) return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'Vence Hoje!' }
  if (days <= 3) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'Vence em breve' }
  return { color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-slate-700', text: null }
}

const getCategoryIcon = (iconName: string | null) => {
  const iconClass = "w-6 h-6 text-white"
  switch (iconName) {
    case 'play': return <Play className={iconClass} />;
    case 'home': return <Home className={iconClass} />;
    case 'dollar-sign': return <DollarSign className={iconClass} />;
    case 'gamepad-2': return <Gamepad2 className={iconClass} />;
    case 'book': return <Book className={iconClass} />;
    case 'coffee': return <Coffee className={iconClass} />;
    case 'box': return <Box className={iconClass} />;
    case 'music': return <Music className={iconClass} />;
    case 'video': return <Video className={iconClass} />;
    default: return <HelpCircle className={iconClass} />;
  }
}

const calculateNextBillingDate = (currentDateStr: string, cycle: string) => {
  const [year, month, day] = currentDateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) 

  switch (cycle) {
    case 'monthly':
      { const currentDay = date.getDate()
      date.setMonth(date.getMonth() + 1)
      if (date.getDate() !== currentDay) {
        date.setDate(0) 
      }
      break }
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'quarterly':
       { const currDayQ = date.getDate()
       date.setMonth(date.getMonth() + 3)
       if (date.getDate() !== currDayQ) {
         date.setDate(0)
       }
       break }
  }

  return date.toISOString().split('T')[0]
}

export function Dashboard() {
  const { data: subscriptions, isLoading } = useSubscriptions() as {
    data: SubscriptionWithCategory[] | undefined,
    isLoading: boolean
  }
  const { data: rates } = useExchangeRates()

  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null) // Novo estado para edição de budget
  
  const [editingSubscription, setEditingSubscription] = useState<BaseSubscription | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')

  async function fetchBudgets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) setBudgets(data);
    }
  }

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleNewBudget = () => {
    setEditingBudget(null); 
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este limite de gastos?')) return;
    
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      fetchBudgets(); 
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao excluir orçamento.');
    }
  };

  const getCategorySpent = (categoryName: string) => {
    if (!subscriptions) return 0;

    const targetCategory = categoryName.trim().toLowerCase();

    return subscriptions
      .filter(sub => {
        if (!sub.categories?.name) return false;

        const subCategory = sub.categories.name.trim().toLowerCase();
        const namesMatch = subCategory === targetCategory;
        const isValidStatus = ['active', 'trial', 'overdue'].includes(sub.status);

        return namesMatch && isValidStatus;
      })
      .reduce((acc, sub) => {
        let price = Number(sub.price)

        if (sub.billing_cycle === 'yearly') price = price / 12
        if (sub.billing_cycle === 'weekly') price = price * 4

        if (rates) {
          if (sub.currency === 'USD') price = price * rates.USD
          if (sub.currency === 'EUR') price = price * rates.EUR
        }

        return acc + price;
      }, 0);
  };

  const financialData = useMemo(() => {
    if (!subscriptions) return { totalMonthly: 0, totalAnnual: 0, distribution: [] }

    const activeSubs = subscriptions.filter(sub => sub.status === 'active' || sub.status === 'trial')
    
    const categoryMap = new Map<string, { total: number, color: string }>()
    let totalMonthly = 0

    activeSubs.forEach(sub => {
      let price = Number(sub.price)

      if (sub.billing_cycle === 'yearly') price = price / 12
      if (sub.billing_cycle === 'weekly') price = price * 4

      if (rates) {
        if (sub.currency === 'USD') price = price * rates.USD
        if (sub.currency === 'EUR') price = price * rates.EUR
      }

      totalMonthly += price

      const catName = sub.categories?.name || 'Outros'
      const catColor = sub.categories?.color || '#94a3b8'
      
      const current = categoryMap.get(catName) || { total: 0, color: catColor }
      categoryMap.set(catName, { total: current.total + price, color: catColor })
    })

    const distribution = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.total,
        color: data.color,
        percentage: totalMonthly > 0 ? (data.total / totalMonthly) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)

    return { totalMonthly, totalAnnual: totalMonthly * 12, distribution }
  }, [subscriptions, rates])

  const donutGradient = useMemo(() => {
    if (financialData.distribution.length === 0) return 'conic-gradient(#334155 0% 100%)'
    
    let currentDeg = 0
    const stops = financialData.distribution.map(item => {
      const start = currentDeg
      const degrees = (item.percentage / 100) * 360
      currentDeg += degrees
      return `${item.color} ${start}deg ${currentDeg}deg`
    })
    
    return `conic-gradient(${stops.join(', ')})`
  }, [financialData.distribution])


  const availableCategories = useMemo(() => {
    if (!subscriptions) return []
    const categories = new Set<string>()
    subscriptions.forEach(sub => {
      if (sub.categories?.name) categories.add(sub.categories.name)
    })
    return Array.from(categories)
  }, [subscriptions])

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions) return []
    if (activeFilter === 'all') return subscriptions

    return subscriptions.filter(sub => {
      const days = getDaysUntilDue(sub.next_billing_date)
      if (activeFilter === 'overdue') return days < 0
      if (activeFilter === 'today') return days === 0
      if (activeFilter === 'upcoming') return days > 0 && days <= 7
      return sub.categories?.name === activeFilter
    })
  }, [subscriptions, activeFilter])

  const handleEdit = (sub: SubscriptionWithCategory) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categories, ...subData } = sub
    setEditingSubscription(subData)
    setIsModalOpen(true)
  }

  const handleNew = () => {
    setEditingSubscription(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta assinatura?')) return
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) throw error
      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar.')
    }
  }

  const handleMarkAsPaid = async (sub: SubscriptionWithCategory) => {
    const nextDate = calculateNextBillingDate(sub.next_billing_date, sub.billing_cycle)
    
    const cycleName = sub.billing_cycle === 'monthly' ? 'próximo mês' : sub.billing_cycle === 'yearly' ? 'próximo ano' : 'próxima semana';
    if (!window.confirm(`Confirmar pagamento de ${sub.name}?\n\nO vencimento será atualizado para ${nextDate} (${cycleName}).`)) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ next_billing_date: nextDate })
        .eq('id', sub.id)

      if (error) throw error
      
      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      
    } catch (error) {
      console.error('Erro ao renovar:', error)
      alert('Erro ao processar pagamento.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-sm border border-slate-800 text-blue-500">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sub-Manager</h1>
              <p className="text-slate-400 text-sm">Controle inteligente de assinaturas</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
     
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border border-slate-700/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-10"></div>
            
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Gasto Mensal</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.totalMonthly)}
              </h2>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Projeção Anual</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-semibold text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.totalAnnual)}
              </p>
            </div>

            {rates && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5" title="Cotação do Dólar hoje">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>USD</span>
                  <span className="text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rates.USD)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Cotação do Euro hoje">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>EUR</span>
                  <span className="text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rates.EUR)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 flex-shrink-0">
              <div className="w-full h-full rounded-full transition-all duration-500" style={{ background: donutGradient }}></div>
              <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center flex-col">
                <span className="text-xs text-slate-500 font-medium">Categorias</span>
                <span className="text-2xl font-bold text-white">{financialData.distribution.length}</span>
              </div>
            </div>
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {financialData.distribution.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-slate-300">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                    </p>
                    <p className="text-xs text-slate-500">{item.percentage.toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white"> 
              Teto de Gastos
            </h2>
            
            <button 
              onClick={handleNewBudget}
              className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <PlusCircle size={18} />
              Definir Limite
            </button>
          </div>
          
          {budgets.length === 0 ? (
            <div className="text-gray-500 text-sm bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
              Nenhum teto de gastos definido. Clique em "Definir Limite" para começar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget: Budget) => (
                <BudgetCard 
                  key={budget.id}
                  category={budget.category} 
                  limit={budget.limit_amount} 
                  spent={getCategorySpent(budget.category)} 
                  onEdit={() => handleEditBudget(budget)}
                  onDelete={() => handleDeleteBudget(budget.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8 bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-800 max-w-fit">
          {['all', 'overdue', 'today', 'upcoming'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeFilter === filter
                  ? filter === 'overdue' ? 'bg-red-500/20 text-red-400 border-red-500/20'
                  : filter === 'today' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20'
                  : filter === 'upcoming' ? 'bg-purple-500/20 text-purple-400 border-purple-500/20'
                  : 'bg-blue-600 text-white border-blue-500'
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'Todas' : filter === 'overdue' ? 'Atrasadas' : filter === 'today' ? 'Vence Hoje' : 'Próximas (7 dias)'}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeFilter === cat
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
           <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-white">
              {activeFilter === 'all' ? 'Minhas Assinaturas' : `Filtro: ${activeFilter}`}
             </h2>
             <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold border border-slate-700">
               {filteredSubscriptions?.length}
             </span>
           </div>

           <button
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20 text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Assinatura</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : filteredSubscriptions?.length === 0 ? (
          <div className="text-center py-32 bg-slate-900 rounded-3xl shadow-sm border border-slate-800">
            <CreditCard className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">Nada aqui...</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredSubscriptions?.map((sub) => {
              const daysUntil = getDaysUntilDue(sub.next_billing_date)
              const urgency = getUrgencyStyle(daysUntil, sub.status)

              return (
                <div key={sub.id} className="bg-slate-900 rounded-3xl p-1 shadow-lg border border-slate-800 hover:border-slate-700 hover:shadow-2xl transition-all duration-300 group">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ 
                          backgroundColor: sub.categories?.color || '#334155',
                          boxShadow: `0 0 15px ${sub.categories?.color}40`
                        }}
                      >
                        {sub.categories?.icon ? getCategoryIcon(sub.categories.icon) : <span className="font-bold text-white">{sub.name.charAt(0)}</span>}
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleMarkAsPaid(sub)}
                          className="p-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors"
                          title="Marcar como pago (Renovar)"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        
                        <button onClick={() => handleEdit(sub)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-1">
                        <h3 className="text-lg font-bold text-white">{sub.name}</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{sub.categories?.name || 'Geral'}</p>
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-white">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: sub.currency || 'BRL' }).format(sub.price)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            /{sub.billing_cycle === 'monthly' ? 'mês' : sub.billing_cycle === 'yearly' ? 'ano' : 'sem'}
                        </span>
                    </div>
                  </div>

                  <div className={`mx-1 mb-1 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium border ${urgency.bg} ${urgency.color} ${urgency.border}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(sub.next_billing_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    </div>
                    {urgency.text && <span className="bg-slate-950/40 px-2 py-0.5 rounded-md shadow-sm border border-white/10">{urgency.text}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <CreateSubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingSubscription}
        />

        <BudgetModal 
          key={editingBudget ? editingBudget.id : 'new-budget'} 
          isOpen={isBudgetModalOpen} 
          onClose={() => setIsBudgetModalOpen(false)}
          onSuccess={fetchBudgets}
          initialData={editingBudget}
        />
      </div>
    </div>
  )
}