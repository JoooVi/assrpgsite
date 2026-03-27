import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthFromToken } from '../redux/slices/authSlice';

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        const response = await fetch('https://assrpgsite-be-production.up.railway.app/api/auth/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        if (!response.ok || !data.token) {
          throw new Error(data.message || 'Falha ao concluir autenticação com Discord.');
        }

        dispatch(setAuthFromToken(data.token));
        navigate('/characters', { replace: true });
      } catch (error) {
        console.error('Erro no callback OAuth:', error);
        navigate('/login', { replace: true });
      }
    };

    exchangeCodeForToken();
  }, [dispatch, location.search, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Autenticando...</h2>
      <p>Aguarde, estamos processando seu login.</p>
    </div>
  );
};

export default AuthCallbackPage;