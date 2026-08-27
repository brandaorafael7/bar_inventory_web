import { useEffect, useState, type FC, type FormEvent } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  ShieldCheck,
  User,
  Trash2,
  X,
  Check,
  Search,
  Mail,
  Lock,
} from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
  createdAt: string;
}

export const Users: FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/users', {
        name,
        email,
        password,
        role,
      });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('EMPLOYEE');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode desativar o seu próprio usuário logado.');
      return;
    }

    if (!confirm(`Deseja realmente desativar o acesso de "${userName}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover usuário.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Usuários & Acessos</h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
            Gerencie as credenciais e níveis de permissão dos operadores do balcão
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Operador</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail de acesso..."
          className="w-full bg-[#121215] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 min-w-[700px]">
            <thead className="bg-[#09090B] text-zinc-400 uppercase border-b border-zinc-800 text-[11px] font-mono tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nome do Usuário</th>
                <th className="px-5 py-3.5">E-mail de Acesso</th>
                <th className="px-5 py-3.5">Nível de Permissão</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500 font-mono">
                    Carregando operadores cadastrados...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u._id === currentUser?.id;
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u._id} className="hover:bg-[#18181B]/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                              {u.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                                  Você
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-zinc-400">{u.email}</td>

                      <td className="px-5 py-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
                            <User className="w-3.5 h-3.5" /> Operador Balcão
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 font-mono text-[11px]">Ativo</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                            title="Desativar Operador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Operador */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-amber-500" /> Cadastrar Novo Operador
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  E-mail de Acesso *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@exemplo.com"
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Senha Provisória *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Nível de Permissão
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('EMPLOYEE')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      role === 'EMPLOYEE'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold'
                        : 'bg-[#18181B] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Operador Balcão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      role === 'ADMIN'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold'
                        : 'bg-[#18181B] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Administrador</span>
                  </button>
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
                  <span>{isSubmitting ? 'Cadastrando...' : 'Criar Operador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;