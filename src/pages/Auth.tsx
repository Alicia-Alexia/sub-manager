import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, LayoutDashboard, ArrowRight, Sparkles } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login e Cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- CADASTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Efeitos de Fundo (Glow) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-xl shadow-blue-900/10">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Sub-Manager
          </h1>
          <p className="text-slate-400">
            {isSignUp ? 'Crie sua conta para começar' : 'Gerencie suas assinaturas em um só lugar'}
          </p>
        </div>

        {/* Card de Auth */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 p-3.5 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-600 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 p-3.5 focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botão Principal */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta Grátis' : 'Entrar no Sistema'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-slate-500 text-xs font-medium uppercase">ou</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* Toggle Login/Cadastro */}
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
            >
              {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <span className="text-blue-400 group-hover:underline underline-offset-4">
                {isSignUp ? 'Fazer Login' : 'Cadastre-se agora'}
              </span>
            </button>
          </div>
        </div>
        
        {isSignUp && (
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-500 text-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Comece a organizar suas finanças hoje.</span>
          </div>
        )}
      </div>
    </div>
  );
}