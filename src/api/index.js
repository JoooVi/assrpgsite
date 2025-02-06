import axios from 'axios';
import store from '../redux/store';

const api = axios.create({
  baseURL: 'https://assrpgsite-be-production.up.railway.app/api',
});

// Adicionar interceptador para incluir o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Adicionar interceptador para logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.config.url}]:`, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Exemplo de como a rota deve estar configurada
const getAllItems = () => {
  return api.get('/items/all'); // ou a rota correta do seu backend
};

export default api;