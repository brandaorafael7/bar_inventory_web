import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Tag, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get<Category[]>('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/categories', {
        name,
        description: description || undefined,
      });
      setModalOpen(false);
      setName('');
      setDescription('');
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Deseja realmente desativar a categoria "${catName}"?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      await loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover categoria.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias de Produtos</h1>
          <p className="text-slate-400 text-sm">Organize seus produtos por seções (Cervejas, Tabacaria, Destilados, etc.)</p>
        </div>

        <button
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-lg font-semibold transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-500 col-span-full">Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p className="text-slate-500 col-span-full">Nenhuma categoria cadastrada.</p>
        ) : (
          categories.map((c) => (
            <div
              key={c._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start justify-between group hover:border-slate-700 transition shadow-lg"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{c.description || 'Sem descrição cadastrada.'}</p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(c._id, c.name)}
                title="Desativar Categoria"
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Criar Nova Categoria</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cervejas Artesanais"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Long necks, latas e artesanais"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition"
                >
                  {submitting ? 'Criando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};