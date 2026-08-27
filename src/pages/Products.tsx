import { useEffect, useState, type FC, type FormEvent } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Minus,
  Edit2,
  Trash2,
  X,
  Check,
  Filter,
  DollarSign,
  Tag,
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  barcode?: string;
  category: Category | null;
  dayPrice: number;
  eventPrice: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
}

export const Products: FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modais de Gestão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form de Produto (Cadastro / Edição)
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dayPrice, setDayPrice] = useState('');
  const [eventPrice, setEventPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [unit, setUnit] = useState('un');

  // Form de Movimentação Rápida de Balcão
  const [movementType, setMovementType] = useState<'SALE' | 'ENTRY' | 'LOSS'>('SALE');
  const [movementQty, setMovementQty] = useState('1');
  const [movementReason, setMovementReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err: any) {
      console.error('Erro ao carregar catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setSelectedProduct(prod);
      setName(prod.name);
      setBarcode(prod.barcode || '');
      setCategoryId(prod.category?._id || '');
      setDayPrice(prod.dayPrice.toString());
      setEventPrice(prod.eventPrice.toString());
      setCostPrice(prod.costPrice.toString());
      setCurrentStock(prod.currentStock.toString());
      setMinStock(prod.minStock.toString());
      setUnit(prod.unit || 'un');
    } else {
      setSelectedProduct(null);
      setName('');
      setBarcode('');
      setCategoryId(categories[0]?._id || '');
      setDayPrice('');
      setEventPrice('');
      setCostPrice('');
      setCurrentStock('');
      setMinStock('5');
      setUnit('un');
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      barcode: barcode || undefined,
      category: categoryId || undefined,
      dayPrice: parseFloat(dayPrice) || 0,
      eventPrice: parseFloat(eventPrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      currentStock: parseInt(currentStock, 10) || 0,
      minStock: parseInt(minStock, 10) || 0,
      unit,
    };

    try {
      if (selectedProduct) {
        await api.patch(`/products/${selectedProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Deseja realmente desativar o produto "${prodName}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover produto.');
    }
  };

  const handleOpenMovementModal = (prod: Product, type: 'SALE' | 'ENTRY' | 'LOSS') => {
    setSelectedProduct(prod);
    setMovementType(type);
    setMovementQty('1');
    setMovementReason('');
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      await api.post('/stock-movements', {
        productId: selectedProduct._id,
        type: movementType,
        quantity: parseInt(movementQty, 10) || 1,
        reason: movementReason || undefined,
      });
      setIsMovementModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar operação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Venda Rápida de Balcão (1 Clique: -1 un)
  const handleQuickSale = async (prod: Product) => {
    if (prod.currentStock <= 0) {
      alert('Produto sem estoque disponível!');
      return;
    }

    try {
      await api.post('/stock-movements', {
        productId: prod._id,
        type: 'SALE',
        quantity: 1,
        reason: 'Saída rápida no balcão',
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar saída.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchesCat = selectedCategory ? p.category?._id === selectedCategory : true;
    const matchesLow = showLowStockOnly ? p.currentStock <= p.minStock : true;
    return matchesSearch && matchesCat && matchesLow;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Estoque & Balcão</h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
            Gestão operacional em tempo real de produtos, saídas de balcão e conferência
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => handleOpenProductModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do item ou código de barras..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-3">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#121215] border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3 flex items-center">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
              showLowStockOnly
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold'
                : 'bg-[#121215] border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Apenas Estoque Baixo</span>
          </button>
        </div>
      </div>

      {/* Grid de Balcão / Tabela Unificada */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 min-w-[850px]">
            <thead className="bg-[#09090B] text-zinc-400 uppercase border-b border-zinc-800 text-[11px] font-mono tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Item / Detalhes</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5 text-right">Preço Dia</th>
                <th className="px-5 py-3.5 text-right">Preço Evento</th>
                <th className="px-5 py-3.5 text-center">Nível de Estoque</th>
                <th className="px-5 py-3.5 text-center">Saída Rápida</th>
                {user?.role === 'ADMIN' && <th className="px-5 py-3.5 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-500 font-mono">
                    Carregando estoque do balcão...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                    Nenhum produto localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p._id} className="hover:bg-[#18181B]/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">{p.name}</p>
                            {p.barcode && (
                              <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{p.barcode}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {p.category ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            <Tag className="w-3 h-3 text-amber-500" />
                            {p.category.name}
                          </span>
                        ) : (
                          <span className="text-zinc-600 italic">Sem categoria</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-white">
                        R$ {p.dayPrice.toFixed(2)}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono text-zinc-400">
                        R$ {p.eventPrice.toFixed(2)}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold px-2.5 py-0.5 rounded text-xs ${
                              isLow
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Mín: {p.minStock} {p.unit}
                          </span>
                        </div>
                      </td>

                      {/* Botão de Saída Rápida (Baixa instantânea de balcão) */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickSale(p)}
                            title="Venda Rápida (-1 un)"
                            disabled={p.currentStock <= 0}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20 font-bold rounded-lg text-xs transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                            <span>1 {p.unit}</span>
                          </button>

                          <button
                            onClick={() => handleOpenMovementModal(p, 'SALE')}
                            title="Registrar quantidade específica"
                            className="p-1 text-zinc-500 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Ações Administrativas */}
                      {user?.role === 'ADMIN' && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenMovementModal(p, 'ENTRY')}
                              title="Adicionar Estoque"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 bg-zinc-900 border border-zinc-800 rounded-lg transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              title="Editar Produto"
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 bg-zinc-900 border border-zinc-800 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              title="Desativar Produto"
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 bg-zinc-900 border border-zinc-800 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Cadastro / Edição de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cerveja Heineken Long Neck 330ml"
                  className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Categoria
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Sem Categoria</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Unidade de Medida
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="lata">Lata</option>
                    <option value="garrafa">Garrafa</option>
                    <option value="dose">Dose</option>
                    <option value="maco">Maço</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Preço de Custo
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Preço Dia *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={dayPrice}
                      onChange={(e) => setDayPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Preço Evento
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={eventPrice}
                      onChange={(e) => setEventPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Estoque Inicial / Atual *
                  </label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="5"
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Movimentação Específica (Entrada / Baixa / Perda) */}
      {isMovementModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Registrar Movimentação
              </h3>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-amber-400 mb-3">{selectedProduct.name}</p>

            <form onSubmit={handleSaveMovement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Tipo de Operação
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="SALE">Saída de Balcão (Venda)</option>
                  <option value="ENTRY">Entrada de Fornecedor</option>
                  <option value="LOSS">Quebra / Garrafa Quebrada / Perda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Quantidade ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(e.target.value)}
                  className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Motivo / Observação (Opcional)
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ex: Mesa 04 / Reposição de freezer"
                  className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition"
                >
                  {isSubmitting ? 'Gravando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;