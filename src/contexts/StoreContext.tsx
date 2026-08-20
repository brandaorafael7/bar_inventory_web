import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

interface StoreSettings {
  storeName: string;
  logoUrl?: string;
  phone?: string;
}

interface StoreContextType {
  settings: StoreSettings;
  updateSettings: (data: Partial<StoreSettings>) => Promise<void>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType>({} as StoreContextType);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>({ storeName: 'Carregando...' });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get<StoreSettings>('/settings');
      setSettings(res.data);
    } catch {
      setSettings({ storeName: 'Bar Inventory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (data: Partial<StoreSettings>) => {
    const res = await api.patch<StoreSettings>('/settings', data);
    setSettings(res.data);
  };

  return (
    <StoreContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);