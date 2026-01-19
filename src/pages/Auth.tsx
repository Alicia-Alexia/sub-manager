import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Loader2, LayoutDashboard, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin, 
        },
      });

      if (error) throw error;

      setSent(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || 'Erro ao enviar o link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-xl shadow-blue-900/10">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Sub-Manager
          </h1>
          <p className="text-slate-400">
            Gerencie suas assinaturas sem complicações.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-500">
          
          {!sent ? (
            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-white">Acesso via Magic Link</h2>
                <p className="text-sm text-slate-400">
                  Digite seu e-mail e enviaremos um link mágico para você entrar. Sem senhas!
                </p>
              </div>

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

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Enviar Link Mágico
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifique seu e-mail</h2>
              <p className="text-slate-400 mb-6">
                Enviamos um link de acesso para <br/>
                <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                Dica: Verifique também sua caixa de Spam ou Promoções.
              </p>
              <button 
                onClick={() => setSent(false)}
                className="mt-6 text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Tentar outro e-mail
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-slate-600 text-xs">
          Protegido por Supabase Auth
        </div>
      </div>
    </div>
  );
}