import { useState, useRef, type FC, type ChangeEvent, type FormEvent } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Store, Upload, Save, CheckCircle2, Phone, MapPin } from 'lucide-react';

export const Settings: FC = () => {
  const { settings, updateSettings } = useStore();
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState('');
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      phone,
      logoUrl: logoPreview,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Identidade do Estabelecimento</h1>
        <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
          Personalize o nome, logotipo e contatos exibidos no sistema
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2.5 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      <div className="bg-[#121215] border border-zinc-800/80 p-6 rounded-xl shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
              Logotipo do Bar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#18181B] border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-amber-500" />
                )}
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-[#18181B] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carregar Imagem (PNG/JPG)</span>
                </button>
                <p className="text-[10px] text-zinc-500 mt-1">Recomendado: Formato quadrado até 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Nome do Estabelecimento *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Meu Bar & Tabacaria"
                className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(79) 99999-9999"
                  className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Endereço / Cidade
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Centro, Tobias Barreto - SE"
                  className="w-full bg-[#18181B] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg transition text-xs uppercase tracking-wider shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;