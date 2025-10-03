import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthFromToken } from '../redux/slices/authSlice';

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("--- PASSO 1: Entrei na página de Callback ---");
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      console.log("--- PASSO 2: Token encontrado! Despachando para o Redux... ---");
      dispatch(setAuthFromToken(token));
      console.log("--- PASSO 3: Redirecionando para /characters AGORA! ---");
      navigate('/characters');
    } else {
      console.error("--- ERRO: Cheguei na Callback, mas não encontrei o token! ---");
      navigate('/login');
    }
  }, [dispatch, navigate, location]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Autenticando...</h2>
      <p>Aguarde, estamos processando seu login.</p>
    </div>
  );
};

export default AuthCallbackPage;