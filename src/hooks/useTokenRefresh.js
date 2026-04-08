import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { updateTokens } from '../redux/slices/authSlice';

/**
 * Hook para renovar o access token proativamente
 * Verifica a expiração a cada minuto e renova 5 minutos antes de expirar
 */
export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const { token, refreshToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !refreshToken) return;

    // Função para renovar token
    const refreshAccessToken = async () => {
      try {
        const response = await fetch(
          'https://assrpgsite-be-production.up.railway.app/api/auth/refresh',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          dispatch(updateTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }));
        }
      } catch (error) {
        console.error('Erro ao renovar token:', error);
      }
    };

    // Função para verificar expiração
    const checkTokenExpiration = () => {
      try {
        const decoded = jwtDecode(token);
        const expiresIn = decoded.exp * 1000 - Date.now(); // em ms
        const RENEWAL_THRESHOLD = 5 * 60 * 1000; // 5 minutos

        // Se falta menos de 5 minutos, renovar
        if (expiresIn < RENEWAL_THRESHOLD && expiresIn > 0) {
          refreshAccessToken();
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    };

    // Verificar a cada 1 minuto
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    // Verificar ao montar o componente também
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [token, refreshToken, dispatch]);
};

export default useTokenRefresh;
