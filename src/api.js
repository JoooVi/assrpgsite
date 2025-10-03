import axios from 'axios';
import { store } from './redux/store'; // Importe sua store do Redux

const api = axios.create({
  baseURL: 'https://assrpgsite-be-production.up.railway.app/api',
});

// Adiciona um interceptor que será executado antes de cada requisição
api.interceptors.request.use(
  (config) => {
    // Pega o estado mais recente da store
    const { token } = store.getState().auth;

    // Se o token existir, adiciona ele ao cabeçalho Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // Retorna a configuração modificada
  },
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);

export default api;