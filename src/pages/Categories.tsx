import { useEffect, useState, type FC, type FormEvent } from 'react';
import { api } from '../services/api';
import { Tag, Plus, Trash2, Check, Search } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export const Categories: FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/categories', { name, description });
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Deseja realmente remover a categoria "${catName}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir categoria.');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Categorias de Produtos</h1>
        <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
          Agrupamento para controle do balcão (Bebidas, Tabacaria, Destilados, etc.)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#121215] border border-zinc-800/80 p-5 rounded-xl h-fit shadow-sm">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" /> Nova Categoria
          </h2>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Nome da Categoria *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cervejas Long Neck"
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Descrição (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ex: Todas as cervejas em garrafa de vidro 330ml"
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg px-3.5 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold py-2.5 rounded-lg transition text-xs uppercase tracking-wider shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Adicionar Categoria'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoria..."
              className="w-full bg-[#121215] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#09090B] text-zinc-400 uppercase border-b border-zinc-800 text-[11px] font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-5 py-3.5">Descrição</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-zinc-500 font-mono">
                      Carregando categorias...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-zinc-500">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c._id} className="hover:bg-[#18181B]/50 transition">
                      <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">{c.description || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c._id, c.name)}
                          className="p-1.5 bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;