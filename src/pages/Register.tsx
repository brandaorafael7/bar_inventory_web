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
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password, isAdmin ? adminKey : undefined);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao registrar usuário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-[#121215] rounded-xl p-8 border border-zinc-800 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Criar Conta</h1>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Nome Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
                placeholder="Ex: Rafael Guimarães"
              />
            </div>
          </div>

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
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
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
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded bg-[#18181B] border-zinc-700 text-amber-500 focus:ring-0"
              />
              <span>Criar como Administrador (Gerente)</span>
            </label>

            {isAdmin && (
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-amber-400 mb-1 uppercase tracking-wider font-mono">
                  Chave PIN de Acesso
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={isAdmin}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full bg-[#18181B] border border-amber-500/50 rounded-lg pl-10 pr-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    placeholder="Chave de segurança"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold py-2.5 rounded-lg transition shadow-md shadow-amber-500/10 text-xs uppercase tracking-wider"
          >
            <span>{isSubmitting ? 'Cadastrando...' : 'Concluir Cadastro'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-4">
          Já possui conta?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
};