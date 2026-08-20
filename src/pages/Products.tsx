import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertOctagon, 
  SlidersHorizontal,
  X,
  Flame,
  Moon,
  Sun
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  categoryId: Category;
  barcode?: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  hasNightPrice?: boolean;
  nightSellPrice?: number;
  nightUnitSellPrice?: number;
  allowUnitSale?: boolean;
  unitsPerPack?: number;
  unitSellPrice?: number;
}

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modo Noturno: automático se for entre 00:00 e 05:59, ou controlado manualmente
  const currentHour = new Date().getHours();
  const [isNightMode, setIsNightMode] = useState<boolean>(currentHour >= 0 && currentHour < 6);

  // Modais
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SAIDA' | 'PERDA' | 'AJUSTE'>('SAIDA');
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementReason, setMovementReason] = useState('');
  const [movementSubmitting, setMovementSubmitting] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryId: '',
    barcode: '',
    currentStock: 0,
    minStock: 5,
    costPrice: 0,
    sellPrice: 0,
    hasNightPrice: false,
    nightSellPrice: 0,
    nightUnitSellPrice: 0,
    allowUnitSale: false,
    unitsPerPack: 20,
    unitSellPrice: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Category[]>('/categories'),
      ]);
      setProducts(resProducts.data);
      setCategories(resCategories.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.barcode && item.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory ? item.categoryId?._id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const renderStockQuantity = (p: Product) => {
    if (!p.allowUnitSale || !p.unitsPerPack || p.unitsPerPack <= 1) {
      return `${p.currentStock} un`;
    }
    const packs = Math.floor(p.currentStock / p.unitsPerPack);
    const units = p.currentStock % p.unitsPerPack;

    if (packs === 0) return `${units} un soltas`;
    if (units === 0) return `${packs} maços (${p.currentStock} un)`;
    return `${packs} maços + ${units} un (${p.currentStock} un)`;
  };

  const handleQuickUnitSale = async (product: Product) => {
    if (product.currentStock < 1) {
      alert('Estoque insuficiente para vender unidade avulsa.');
      return;
    }
    try {
      const activeUnitPrice = isNightMode && product.hasNightPrice && product.nightUnitSellPrice
        ? product.nightUnitSellPrice
        : product.unitSellPrice || 0;

      await api.post('/stock-movements', {
        productId: product._id,
        type: 'SAIDA',
        quantity: 1,
        reason: `Venda avulsa balcão (${isNightMode ? 'Madrugada R$' : 'R$'} ${activeUnitPrice.toFixed(2)})`,
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar venda avulsa.');
    }
  };

  const handleOpenMovement = (product: Product, type: 'ENTRADA' | 'SAIDA' | 'PERDA' | 'AJUSTE') => {
    setSelectedProduct(product);
    setMovementType(type);
    setMovementQuantity(product.allowUnitSale && product.unitsPerPack ? product.unitsPerPack : 1);
    setMovementReason('');
    setMovementModalOpen(true);
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setMovementSubmitting(true);
      await api.post('/stock-movements', {
        productId: selectedProduct._id,
        type: movementType,
        quantity: Number(movementQuantity),
        reason: movementReason || undefined,
      });
      setMovementModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar movimentação.');
    } finally {
      setMovementSubmitting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: newProduct.name,
        categoryId: newProduct.categoryId,
        barcode: newProduct.barcode || undefined,
        currentStock: Number(newProduct.currentStock),
        minStock: Number(newProduct.minStock),
        costPrice: Number(newProduct.costPrice),
        sellPrice: Number(newProduct.sellPrice),
        hasNightPrice: newProduct.hasNightPrice,
        nightSellPrice: newProduct.hasNightPrice ? Number(newProduct.nightSellPrice) : undefined,
        nightUnitSellPrice: newProduct.hasNightPrice && newProduct.allowUnitSale ? Number(newProduct.nightUnitSellPrice) : undefined,
        allowUnitSale: newProduct.allowUnitSale,
        unitsPerPack: newProduct.allowUnitSale ? Number(newProduct.unitsPerPack) : 1,
        unitSellPrice: newProduct.allowUnitSale ? Number(newProduct.unitSellPrice) : undefined,
      });
      setCreateModalOpen(false);
      setNewProduct({
        name: '',
        categoryId: '',
        barcode: '',
        currentStock: 0,
        minStock: 5,
        costPrice: 0,
        sellPrice: 0,
        hasNightPrice: false,
        nightSellPrice: 0,
        nightUnitSellPrice: 0,
        allowUnitSale: false,
        unitsPerPack: 20,
        unitSellPrice: 0,
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar produto.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Seletor Noturno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Controle de Estoque & Balcão</h1>
          <p className="text-slate-400 text-sm">Gerencie o saldo e registre saídas rápidas</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternador de Horário Noturno */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
              isNightMode
                ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Clique para alternar a tabela de preços noturna"
          >
            {isNightMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>{isNightMode ? 'Tarifa Noturna Ativa (Pós 00:00)' : 'Tarifa Normal Diurna'}</span>
          </button>

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          )}
        </div>
      </div>

      {/* Alerta Visual se a Tarifa Noturna estiver ativa */}
      {isNightMode && (
        <div className="p-3.5 bg-purple-950/40 border border-purple-800/40 rounded-xl flex items-center justify-between text-purple-300 text-xs">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            <span><strong>Tabela Madrugada Ativada:</strong> Os produtos com tarifa noturna configurada estão exibindo o preço especial compensatório.</span>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total de Produtos</p>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Itens com Estoque Baixo</p>
            <p className="text-2xl font-bold text-amber-400">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Produto</th>
                <th className="py-3.5 px-4 font-semibold">Categoria</th>
                <th className="py-3.5 px-4 font-semibold text-center">Estoque Atual</th>
                <th className="py-3.5 px-4 font-semibold">Preço em Vigência</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações de Balcão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Carregando estoque...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  const activePrice = isNightMode && p.hasNightPrice && p.nightSellPrice
                    ? p.nightSellPrice
                    : p.sellPrice;

                  const activeUnitPrice = isNightMode && p.hasNightPrice && p.nightUnitSellPrice
                    ? p.nightUnitSellPrice
                    : p.unitSellPrice;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          {p.allowUnitSale && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-normal">
                              Fracionável
                            </span>
                          )}
                          {p.hasNightPrice && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-normal" title="Tem preço noturno">
                              <Moon className="w-2.5 h-2.5" />
                              Noturno
                            </span>
                          )}
                        </div>
                        {p.barcode && <span className="text-xs text-slate-500">EAN: {p.barcode}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{p.categoryId?.name || '-'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                          {renderStockQuantity(p)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        <div className={isNightMode && p.hasNightPrice ? 'text-purple-300 font-bold' : 'text-white'}>
                          R$ {activePrice.toFixed(2)} {p.allowUnitSale && <span className="text-xs text-slate-400 font-normal">/ maço</span>}
                        </div>
                        {p.allowUnitSale && activeUnitPrice && (
                          <div className={`text-xs ${isNightMode && p.hasNightPrice ? 'text-purple-400 font-semibold' : 'text-amber-400'}`}>
                            R$ {activeUnitPrice.toFixed(2)} / avulso
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {p.allowUnitSale && (
                            <button
                              onClick={() => handleQuickUnitSale(p)}
                              title="Venda Rápida: 1 Solto"
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              -1 Solto
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenMovement(p, 'SAIDA')}
                            title={p.allowUnitSale ? 'Vender Maço / Personalizado' : 'Registrar Venda / Saída'}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          >
                            <ArrowDownCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenMovement(p, 'ENTRADA')}
                            title="Registrar Entrada / Reposição"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
                          >
                            <ArrowUpCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenMovement(p, 'PERDA')}
                            title="Registrar Perda / Avaria"
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition"
                          >
                            <AlertOctagon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenMovement(p, 'AJUSTE')}
                            title="Ajuste Manual de Inventário"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                          >
                            <SlidersHorizontal className="w-5 h-5" />
                          </button>
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

      {/* Modal de Movimentação */}
      {movementModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {movementType === 'SAIDA' && 'Venda / Saída de Produto'}
                {movementType === 'ENTRADA' && 'Entrada / Compra de Estoque'}
                {movementType === 'PERDA' && 'Registro de Perda / Quebra'}
                {movementType === 'AJUSTE' && 'Ajuste de Balanço'}
              </h3>
              <button onClick={() => setMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              Produto: <span className="font-semibold text-white">{selectedProduct.name}</span> (Estoque: {renderStockQuantity(selectedProduct)})
            </p>

            <form onSubmit={handleSubmitMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {movementType === 'AJUSTE' ? 'Nova Quantidade Total (em unidades)' : 'Quantidade de Unidades'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Motivo / Obs.</label>
                <input
                  type="text"
                  placeholder="Ex: Venda madrugada, reposição..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMovementModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={movementSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition"
                >
                  {movementSubmitting ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Produto com Opção Noturna */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Produto</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cerveja Heineken Long Neck ou Cigarro Derby"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                <select
                  required
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opção Fracionável (Cigarros) */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.allowUnitSale}
                    onChange={(e) => setNewProduct({ ...newProduct, allowUnitSale: e.target.checked })}
                    className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-700 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-200">Permite venda avulsa/fracionada (ex: cigarros)</span>
                </label>

                {newProduct.allowUnitSale && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Qtd por Maço</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newProduct.unitsPerPack}
                        onChange={(e) => setNewProduct({ ...newProduct, unitsPerPack: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Preço 1 Avulso (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={newProduct.unitSellPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, unitSellPrice: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opção Tarifa Noturna (Madrugada) */}
              <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.hasNightPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, hasNightPrice: e.target.checked })}
                    className="w-4 h-4 text-purple-500 bg-slate-900 border-slate-700 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-purple-200 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-purple-400" />
                    Ativar preço especial pós-meia-noite
                  </span>
                </label>

                {newProduct.hasNightPrice && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-900/30">
                    <div>
                      <label className="block text-xs font-medium text-purple-300 mb-1">Preço Noturno (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={newProduct.nightSellPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, nightSellPrice: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-purple-900/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    {newProduct.allowUnitSale && (
                      <div>
                        <label className="block text-xs font-medium text-purple-300 mb-1">Avulso Noturno (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={newProduct.nightUnitSellPrice}
                          onChange={(e) => setNewProduct({ ...newProduct, nightUnitSellPrice: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-purple-900/50 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Código de Barras (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 7891234567890"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Estoque Inicial (un)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.currentStock}
                    onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Preço Padrão Diurno (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newProduct.sellPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition"
                >
                  Criar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};