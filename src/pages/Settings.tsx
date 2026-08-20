import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Store, Upload, Save, Phone, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Leitor de arquivo do computador para Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateSettings({ storeName, logoUrl, phone });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Identidade do Estabelecimento</h1>
        <p className="text-slate-400 text-sm">Personalize o nome, logotipo e contatos exibidos no sistema</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prévia da Logo / Nome */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{storeName || 'Nome do Estabelecimento'}</h3>
              <p className="text-xs text-slate-400">Logotipo atual que aparece no balcão e cabeçalho</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Bar / Tabacaria</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="Ex: Beergod"
            />
          </div>

          {/* Upload de Logotipo Local */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Logotipo da Empresa</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 cursor-pointer transition">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>Escolher Imagem do Computador</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover Logo
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Formatos suportados: PNG, JPG ou WebP (máx. 2MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Telefone / WhatsApp (Opcional)</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                placeholder="(79) 99999-9999"
              />
            </div>
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
              Configurações e logotipo atualizados com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};