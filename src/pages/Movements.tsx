import { useEffect, useState, type FC } from 'react';
import { api } from '../services/api';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter,
  Calendar,
  Layers
} from 'lucide-react';

interface Movement {
  _id: string;
  product: {
    _id: string;
    name: string;
    unit: string;
  } | null;
  type: 'ENTRADA' | 'SAIDA' | 'PERDA' | 'AJUSTE';
  quantity: number;
  reason?: string;
  user: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
}

export const Movements: FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stock-movements');
      setMovements(res.data);
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter((m) => {
    const productName = m.product?.name?.toLowerCase() || '';
    const userName = m.user?.name?.toLowerCase() || '';
    const query = search.toLowerCase();

    const matchesSearch = productName.includes(query) || userName.includes(query);
    const matchesType = typeFilter ? m.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const getBadge = (type: string) => {
    switch (type) {
      case 'SAIDA':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            <TrendingDown className="w-3.5 h-3.5" /> Saída / Venda
          </span>
        );
      case 'ENTRADA':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Entrada de Estoque
          </span>
        );
      case 'PERDA':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Quebra / Perda
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            <Layers className="w-3.5 h-3.5" /> Ajuste Manual
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Registro de Movimentações</h1>
        <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
          Auditoria de entradas, saídas no balcão e conferência de quebras
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por produto ou operador responsável..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#121215] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">Todos os Tipos</option>
            <option value="SAIDA">Apenas Saídas / Vendas</option>
            <option value="ENTRADA">Apenas Entradas</option>
            <option value="PERDA">Apenas Quebras / Perdas</option>
            <option value="AJUSTE">Apenas Ajustes</option>
          </select>
        </div>
      </div>

      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 min-w-[700px]">
            <thead className="bg-[#09090B] text-zinc-400 uppercase border-b border-zinc-800 text-[11px] font-mono tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Data & Hora</th>
                <th className="px-5 py-3.5">Produto</th>
                <th className="px-5 py-3.5">Tipo de Evento</th>
                <th className="px-5 py-3.5 text-center">Quantidade</th>
                <th className="px-5 py-3.5">Responsável / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500 font-mono">
                    Carregando histórico de movimentações...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov._id} className="hover:bg-[#18181B]/50 transition">
                    <td className="px-5 py-3.5 font-mono text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{new Date(mov.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-300">
                          {new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-white">
                      {mov.product?.name || <span className="text-zinc-500 italic">Item excluído</span>}
                    </td>
                    <td className="px-5 py-3.5">{getBadge(mov.type)}</td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold">
                      <span className={mov.type === 'SAIDA' || mov.type === 'PERDA' ? 'text-rose-400' : 'text-emerald-400'}>
                        {mov.type === 'SAIDA' || mov.type === 'PERDA' ? '-' : '+'}{mov.quantity} {mov.product?.unit || 'un'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-zinc-300 font-medium">{mov.user?.name || 'Sistema'}</div>
                      {mov.reason && <p className="text-[11px] text-zinc-500 italic mt-0.5">{mov.reason}</p>}
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

export default Movements;