import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { Store, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password, isAdmin ? adminKey : undefined);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4 overflow-hidden shadow-inner">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-amber-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Criar Conta</h1>
          <p className="text-slate-400 text-sm mt-1">{settings.storeName || 'Bar Inventory'}</p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="seuemail@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="Repita sua senha"
              />
            </div>
          </div>

          {/* Opção para Administrador */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
              />
              <span>Criar como Administrador (Dono / Gerente)</span>
            </label>

            {isAdmin && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-amber-400 mb-1">Chave Secreta de Administrador</label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={isAdmin}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-lg pl-11 pr-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
                    placeholder="Digite o PIN de administrador"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            <span>{isSubmitting ? 'Cadastrando...' : 'Criar Conta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-400">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-amber-500 hover:underline font-medium">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
};