import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  Moon, 
  Sun, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Edit2, 
  X, 
  Check, 
  Layers
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  category: Category;
  barcode?: string;
  costPrice: number;
  dayPrice: number;
  nightPrice?: number;
  currentStock: number;
  minStock: number;
  unit: string;
  isFractionable: boolean;
  unitsPerPack?: number;
}

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Estados de Modal de Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estados de Modal de Movimentação Rápida
  const [quickMovementProduct, setQuickMovementProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'SALE' | 'ENTRY' | 'LOSS' | 'ADJUSTMENT'>('SALE');
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [movementReason, setMovementReason] = useState('');
  const [submittingMovement, setSubmittingMovement] = useState(false);

  // Formulário de Produto
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    barcode: '',
    costPrice: '',
    dayPrice: '',
    nightPrice: '',
    currentStock: '',
    minStock: '5',
    unit: 'un',
    isFractionable: false,
    unitsPerPack: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Category[]>('/categories'),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      barcode: '',
      costPrice: '',
      dayPrice: '',
      nightPrice: '',
      currentStock: '0',
      minStock: '5',
      unit: 'un',
      isFractionable: false,
      unitsPerPack: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.category?._id || '',
      barcode: product.barcode || '',
      costPrice: String(product.costPrice),
      dayPrice: String(product.dayPrice),
      nightPrice: product.nightPrice ? String(product.nightPrice) : '',
      currentStock: String(product.currentStock),
      minStock: String(product.minStock),
      unit: product.unit || 'un',
      isFractionable: product.isFractionable || false,
      unitsPerPack: product.unitsPerPack ? String(product.unitsPerPack) : '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.categoryId,
        barcode: formData.barcode || undefined,
        costPrice: Number(formData.costPrice),
        dayPrice: Number(formData.dayPrice),
        nightPrice: formData.nightPrice ? Number(formData.nightPrice) : undefined,
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        unit: formData.unit,
        isFractionable: formData.isFractionable,
        unitsPerPack: formData.isFractionable && formData.unitsPerPack ? Number(formData.unitsPerPack) : undefined,
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar produto.');
    }
  };

  const handleOpenQuickMovement = (product: Product, type: 'SALE' | 'ENTRY' | 'LOSS' | 'ADJUSTMENT') => {
    setQuickMovementProduct(product);
    setMovementType(type);
    setMovementQuantity(1);
    setMovementReason('');
  };

  const handleConfirmMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMovementProduct) return;

    setSubmittingMovement(true);
    try {
      await api.post('/stock-movements', {
        product: quickMovementProduct._id,
        type: movementType,
        quantity: Number(movementQuantity),
        reason: movementReason || undefined,
      });

      setQuickMovementProduct(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar movimentação.');
    } finally {
      setSubmittingMovement(false);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search));
    const matchesCat = selectedCategory ? item.category?._id === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  return (
    <div className="space-y-6">
      {/* Topo / Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Controle de Estoque & Balcão</h1>
          <p className="text-slate-400 text-sm">Gerencie o saldo e registre saídas rápidas</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Alternância de Tarifa Noturna */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
              isNightMode
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 shadow-md shadow-purple-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isNightMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{isNightMode ? 'Tarifa Madrugada (Ativa)' : 'Tarifa Normal Diurna'}</span>
          </button>

          {user?.role === 'ADMIN' && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total de Produtos</p>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Itens com Estoque Baixo</p>
            <p className="text-2xl font-bold text-white">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filtros de Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código de barras..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Produtos Responsiva */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Produto</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5 text-center">Estoque Atual</th>
                <th className="px-5 py-3.5 text-right">Preço em Vigência</th>
                <th className="px-5 py-3.5 text-center">Ações de Balcão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Carregando estoque...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentPrice = isNightMode && p.nightPrice ? p.nightPrice : p.dayPrice;
                  const isLow = p.currentStock <= p.minStock;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.barcode && <span className="text-[11px] text-slate-500 font-mono">EAN: {p.barcode}</span>}
                          {p.isFractionable && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Layers className="w-3 h-3" /> Fracionável ({p.unitsPerPack} un)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{p.category?.name || 'Sem categoria'}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-block font-mono text-xs px-2.5 py-1 rounded-full font-bold ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-white">
                        R$ {Number(currentPrice).toFixed(2)}
                        {isNightMode && p.nightPrice && (
                          <span className="block text-[10px] text-purple-400 font-normal">T. Madrugada</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Venda Rápida (-1) */}
                          <button
                            onClick={() => handleOpenQuickMovement(p, 'SALE')}
                            title="Registrar Venda / Saída"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>

                          {/* Entrada de Estoque (+1) */}
                          <button
                            onClick={() => handleOpenQuickMovement(p, 'ENTRY')}
                            title="Registrar Entrada"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Perda / Avaria */}
                          <button
                            onClick={() => handleOpenQuickMovement(p, 'LOSS')}
                            title="Registrar Quebra / Perda"
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>

                          {/* Editar Produto */}
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Editar Produto"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition ml-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Movimentação Rápida */}
      {quickMovementProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {movementType === 'SALE' && '🛒 Registrar Venda'}
                {movementType === 'ENTRY' && '📥 Entrada de Estoque'}
                {movementType === 'LOSS' && '⚠️ Perda / Quebra'}
                {movementType === 'ADJUSTMENT' && '🔧 Ajuste de Balanço'}
              </h3>
              <button onClick={() => setQuickMovementProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300">
              Produto: <span className="font-bold text-amber-400">{quickMovementProduct.name}</span>
            </p>

            <form onSubmit={handleConfirmMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Quantidade ({quickMovementProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {movementType !== 'SALE' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Motivo (Opcional)</label>
                  <input
                    type="text"
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value)}
                    placeholder="Ex: Garrafa trincada no transporte"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickMovementProduct(null)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingMovement}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  <Check className="w-4 h-4" />
                  {submittingMovement ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cerveja Heineken 330ml / Cigarro Lucky Strike"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoria *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="" disabled>Selecione</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Código de Barras (EAN)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="7891234567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preço de Custo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="5.50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preço Diurno (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.dayPrice}
                    onChange={(e) => setFormData({ ...formData, dayPrice: e.target.value })}
                    placeholder="9.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-purple-400 mb-1">Preço Madrugada (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.nightPrice}
                    onChange={(e) => setFormData({ ...formData, nightPrice: e.target.value })}
                    placeholder="11.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estoque Inicial *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="un, dose, maço"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Venda Fracionada (Tabacaria) */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFractionable}
                    onChange={(e) => setFormData({ ...formData, isFractionable: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Permitir venda fracionada (ex: maço vendido por unidade/cigarro avulso)</span>
                </label>

                {formData.isFractionable && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Unidades por Pacote/Maço</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={formData.unitsPerPack}
                      onChange={(e) => setFormData({ ...formData, unitsPerPack: e.target.value })}
                      placeholder="Ex: 20 (cigarros por maço)"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  <Check className="w-4 h-4" />
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};