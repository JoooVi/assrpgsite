// Arquivo: src/pages/AuthCallbackPage.js

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthFromToken } from '../redux/slices/authSlice'; // Criaremos isso a seguir

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pega o token dos parâmetros da URL (ex: /auth/callback?token=...)
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      dispatch(setAuthFromToken(token));
      navigate('/characters'); // Redireciona para a página principal após o login
    } else {
      // Caso de erro, redireciona para a página de login
      navigate('/login');
    }
  }, [dispatch, navigate, location]);

  return (
    <div>
      <p>Autenticando...</p>
    </div>
  );
};

export default AuthCallbackPage;