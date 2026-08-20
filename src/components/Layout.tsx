import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { Package, ArrowLeftRight, Tag, Users, Settings, LogOut, Store } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Estoque / Balcão', path: '/', icon: Package },
    { label: 'Movimentações', path: '/movements', icon: ArrowLeftRight },
    ...(user?.role === 'ADMIN'
      ? [
          { label: 'Categorias', path: '/categories', icon: Tag },
          { label: 'Usuários', path: '/users', icon: Users },
          { label: 'Configurações', path: '/settings', icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Barra Lateral */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          {/* Logo e Nome Dinâmico do Estabelecimento */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-white leading-tight truncate" title={settings.storeName}>
                {settings.storeName || 'Bar Inventory'}
              </h2>
              <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Itens de Navegação */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé do Usuário Logado */}
        <div className="border-t border-slate-800 pt-4 px-2 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};