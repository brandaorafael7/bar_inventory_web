import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ArrowLeftRight, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertOctagon, 
  SlidersHorizontal,
  User,
  Calendar,
  Filter
} from 'lucide-react';

interface Movement {
  _id: string;
  productId: {
    _id: string;
    name: string;
    barcode?: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  type: 'ENTRADA' | 'SAIDA' | 'PERDA' | 'AJUSTE';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
}

export const Movements: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const loadMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get<Movement[]>('/stock-movements');
      setMovements(res.data);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const filteredMovements = filterType
    ? movements.filter((m) => m.type === filterType)
    : movements;

  const getBadgeStyle = (type: Movement['type']) => {
    switch (type) {
      case 'ENTRADA':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SAIDA':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'PERDA':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'AJUSTE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getIcon = (type: Movement['type']) => {
    switch (type) {
      case 'ENTRADA':
        return <ArrowUpCircle className="w-4 h-4" />;
      case 'SAIDA':
        return <ArrowDownCircle className="w-4 h-4" />;
      case 'PERDA':
        return <AlertOctagon className="w-4 h-4" />;
      case 'AJUSTE':
        return <SlidersHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico de Movimentações</h1>
          <p className="text-slate-400 text-sm">Trilha de auditoria completa de entradas, vendas, perdas e ajustes</p>
        </div>

        {/* Filtro por Tipo */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos os Tipos</option>
            <option value="ENTRADA">Entradas / Reposição</option>
            <option value="SAIDA">Saídas / Vendas</option>
            <option value="PERDA">Perdas / Avarias</option>
            <option value="AJUSTE">Ajustes Manuais</option>
          </select>
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Data / Hora</th>
                <th className="py-3.5 px-4 font-semibold">Produto</th>
                <th className="py-3.5 px-4 font-semibold">Tipo</th>
                <th className="py-3.5 px-4 font-semibold text-center">Qtd.</th>
                <th className="py-3.5 px-4 font-semibold text-center">Balanço (Antes → Depois)</th>
                <th className="py-3.5 px-4 font-semibold">Operador</th>
                <th className="py-3.5 px-4 font-semibold">Motivo / Obs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Carregando histórico...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(m.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {m.productId?.name || 'Produto Removido'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(
                          m.type,
                        )}`}
                      >
                        {getIcon(m.type)}
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-white">
                      {m.type === 'SAIDA' || m.type === 'PERDA' ? `-${m.quantity}` : `+${m.quantity}`} un
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 whitespace-nowrap">
                      <span className="text-slate-500">{m.previousStock} un</span>
                      <span className="mx-1 text-slate-600">→</span>
                      <span className="font-semibold text-white">{m.newStock} un</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>{m.userId?.name || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs max-w-xs truncate">
                      {m.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};