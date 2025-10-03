import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthFromToken } from '../redux/slices/authSlice';

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("--- PASSO 1: Entrei na página de Callback (deve aparecer SÓ UMA VEZ) ---");
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      console.log("--- PASSO 2: Token encontrado! Despachando para o Redux... ---");
      dispatch(setAuthFromToken(token));
      console.log("--- PASSO 3: Redirecionando para /characters AGORA! ---");
      // Usamos replace: true para que o usuário não possa voltar para esta página com o botão "Voltar"
      navigate('/characters', { replace: true }); 
    } else {
      console.error("--- ERRO: Cheguei na Callback, mas não encontrei o token! ---");
      navigate('/login', { replace: true });
    }
  // A CORREÇÃO ESTÁ AQUI: O array de dependências está vazio.
  // Isso garante que o efeito rode apenas uma vez.
  }, []); 

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Autenticando...</h2>
      <p>Aguarde, estamos processando seu login.</p>
    </div>
  );
};

export default AuthCallbackPage;