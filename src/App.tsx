import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Products } from './pages/Products';
import { Movements } from './pages/Movements';
import { Categories } from './pages/Categories';
import { Users } from './pages/Users';
import { SettingsPage } from './pages/Settings';
import { Register } from './pages/Register';

const PrivateRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Products />} />
              <Route path="movements" element={<Movements />} />
              <Route
                path="categories"
                element={
                  <PrivateRoute adminOnly>
                    <Categories />
                  </PrivateRoute>
                }
              />
              <Route
                path="users"
                element={
                  <PrivateRoute adminOnly>
                    <Users />
                  </PrivateRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <PrivateRoute adminOnly>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
            </Route>
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}