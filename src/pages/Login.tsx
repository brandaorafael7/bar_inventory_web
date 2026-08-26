import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { Store, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'E-mail ou senha inválidos, ou o servidor está em inicialização.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-[#121215] rounded-xl p-8 border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Painel de Acesso</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider font-mono">
            {settings.storeName || 'Bar Inventory Suite'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs tracking-wide"
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs tracking-wide"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold py-2.5 rounded-lg transition shadow-md shadow-amber-500/10 text-xs uppercase tracking-wider"
          >
            <span>{isSubmitting ? 'Autenticando...' : 'Acessar Balcão'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-4">
          Primeiro acesso?{' '}
          <Link to="/register" className="text-amber-500 hover:text-amber-400 font-semibold transition">
            Cadastrar conta
          </Link>
        </div>
      </div>
    </div>
  );
};