import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Tag,
  Users,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';

interface LowStockItem {
  _id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/products/low-stock');
        setLowStockItems(res.data);
      } catch (err) {
        console.error('Erro ao buscar alertas de estoque:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 45000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { label: 'Visão Geral / KPIs', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Estoque & Balcão', path: '/', icon: Package },
        { label: 'Movimentações', path: '/movements', icon: ArrowLeftRight },
      ],
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            title: 'GESTÃO & SISTEMA',
            items: [
              { label: 'Categorias', path: '/categories', icon: Tag },
              { label: 'Usuários & Acessos', path: '/users', icon: Users },
              { label: 'Configurações', path: '/settings', icon: Settings },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Topbar Superior */}
      <header className="sticky top-0 z-40 h-16 bg-[#121215] border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg border border-zinc-800 focus:outline-none"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-amber-500" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                {settings.storeName || 'Bar Inventory'}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-medium">
                Admin Suite
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar módulo, produto ou atalho..."
              className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sino de Notificações */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserDropdownOpen(false);
              }}
              className="relative p-2 text-zinc-400 hover:text-white bg-[#18181B] border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
            >
              <Bell className="w-4 h-4" />
              {lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#18181B] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Alertas de Estoque</span>
                  <span className="text-[10px] text-amber-500 font-medium font-mono">{lowStockItems.length} críticos</span>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {lowStockItems.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Nenhum item com estoque baixo.</p>
                  ) : (
                    lowStockItems.map((item) => (
                      <div key={item._id} className="p-2 bg-[#121215] border border-zinc-800/80 rounded-lg flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-zinc-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-zinc-500">Mínimo: {item.minStock} {item.unit}</p>
                        </div>
                        <span className="font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] flex-shrink-0">
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Perfil */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-[#18181B] hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-zinc-300 hidden sm:inline max-w-[100px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#18181B] border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="p-2 border-b border-zinc-800 mb-1">
                  <p className="font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-medium">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition font-medium text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex flex-1">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 md:hidden"
          />
        )}

        <aside
          className={`fixed md:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-[#121215] border-r border-zinc-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold text-zinc-500 tracking-wider font-mono">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold shadow-inner'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#18181B] border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-semibold text-emerald-400 font-mono">ONLINE EM PRODUÇÃO</span>
            </div>
            <p className="text-[11px] text-zinc-500">v1.2.0 • Obsidian Theme</p>
          </div>
        </aside>

        <main className="flex-1 w-full min-w-0 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};