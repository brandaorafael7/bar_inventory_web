import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Anexa automaticamente o token JWT salvo em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@bar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});