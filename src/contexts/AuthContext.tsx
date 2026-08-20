import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@bar_user');
    const storagedToken = localStorage.getItem('@bar_token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user: loggedUser } = response.data;

    localStorage.setItem('@bar_token', accessToken);
    localStorage.setItem('@bar_user', JSON.stringify(loggedUser));

    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem('@bar_token');
    localStorage.removeItem('@bar_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);