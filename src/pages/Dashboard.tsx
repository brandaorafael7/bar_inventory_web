import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowLeft,
  ShoppingCart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [productsCount, setProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);

  const chartData = [
    { dia: 'Seg', vendas: 420, entradas: 150 },
    { dia: 'Ter', vendas: 580, entradas: 0 },
    { dia: 'Qua', vendas: 790, entradas: 300 },
    { dia: 'Qui', vendas: 920, entradas: 200 },
    { dia: 'Sex', vendas: 1650, entradas: 500 },
    { dia: 'Sáb', vendas: 2400, entradas: 400 },
    { dia: 'Dom', vendas: 1890, entradas: 100 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [prodRes, lowRes, movRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/low-stock'),
          api.get('/stock-movements'),
        ]);

        setProductsCount(prodRes.data.length);
        setLowStockCount(lowRes.data.length);
        setRecentMovements(movRes.data.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com Botões de Retorno para o Balcão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Painel de Desempenho</h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
            Acompanhe os principais indicadores de fluxo do balcão e saúde do estoque
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Voltar ao Balcão / Estoque</span>
        </button>
      </div>

      {/* Grade de Cards KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Itens Cadastrados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-mono">{productsCount}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Catálogo Ativo</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Estoque Crítico</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-400 font-mono">{lowStockCount}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500/80">
              <span>Abaixo do mínimo</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Vendas Estimadas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-mono">R$ 8.630</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.8% vs semana anterior</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-4 rounded-xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Taxa de Quebra/Perda</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-mono">0.8%</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Dentro da meta operacional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico e Movimentações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121215] border border-zinc-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Fluxo de Saída por Dia (R$)</h2>
              <p className="text-xs text-zinc-500">Volume estimado de consumo do balcão</p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded font-mono font-medium">
              Últimos 7 dias
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="dia" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Últimas Atividades</h2>
              <Clock className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {recentMovements.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Nenhuma movimentação recente registrada.</p>
              ) : (
                recentMovements.map((mov) => (
                  <div key={mov._id} className="flex items-center justify-between p-2.5 bg-[#18181B] border border-zinc-800/60 rounded-lg text-xs">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-zinc-200 truncate">{mov.product?.name || 'Item Removido'}</p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        mov.type === 'SALE'
                          ? 'text-rose-400 bg-rose-500/10'
                          : mov.type === 'ENTRY'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {mov.type === 'SALE' ? '-' : '+'}{mov.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/movements')}
            className="w-full mt-4 flex items-center justify-center gap-1.5 p-2 bg-[#18181B] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <span>Ver Histórico Completo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};