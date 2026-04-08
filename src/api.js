import axios from 'axios';
import { store } from './redux/store'; // Importe sua store do Redux
import { logout, updateTokens } from './redux/slices/authSlice';

const api = axios.create({
  baseURL: 'https://assrpgsite-be-production.up.railway.app/api',
});

// Adiciona um interceptor que será executado antes de cada requisição
api.interceptors.request.use(
  (config) => {
    // Pega o estado mais recente da store
    const { token, refreshToken } = store.getState().auth;

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

// Interceptor de resposta para lidar com 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e ainda não tentamos renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken } = store.getState().auth;

      if (refreshToken) {
        try {
          // Tentar renovar o token
          const response = await axios.post(
            'https://assrpgsite-be-production.up.railway.app/api/auth/refresh',
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // ✅ Guardar novos tokens no Redux
          store.dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }));

          // ✅ Tentar requisição original novamente com novo token
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // ❌ Refresh falhou, fazer logout
          store.dispatch(logout());

          // ⚠️ Disparar evento customizado para mostrar modal
          window.dispatchEvent(
            new CustomEvent('sessionExpired', {
              detail: { reason: 'Sua sessão expirou. Por favor, faça login novamente.' }
            })
          );

          return Promise.reject(refreshError);
        }
      } else {
        // Sem refresh token, fazer logout
        store.dispatch(logout());
        window.dispatchEvent(
          new CustomEvent('sessionExpired', {
            detail: { reason: 'Sessão inválida. Por favor, faça login novamente.' }
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;