/* ResetPasswordPage.js */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import styles from './CampaignForm.css'; // Reutilizando o CSS do CampaignForm

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('AS SENHAS NÃO CONFEREM.');
      return;
    }

    try {
      const response = await axios.post(`https://assrpgsite-be-production.up.railway.app/api/reset-password`, {
        token,
        password
      });
      
      setMessage("SENHA REDEFINIDA COM SUCESSO. REDIRECIONANDO...");
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'ERRO AO REDEFINIR SENHA.');
    }
  };

  return (
    <div className="campaign-form-page" style={{ alignItems: 'center' }}> 
      {/* Reutilizando o container do CampaignForm para pegar o fundo fixo e layout */}
      
      <div className="nero-form-card" style={{ maxWidth: '450px', padding: '40px' }}>
        <h2 className="form-title" style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          REDEFINIR CREDENCIAIS
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'Roboto Condensed', color: '#888', fontWeight: 'bold' }}>NOVA SENHA</label>
            <input
              type="password"
              className="nero-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ fontFamily: 'Roboto Condensed', color: '#888', fontWeight: 'bold' }}>CONFIRMAR SENHA</label>
            <input
              type="password"
              className="nero-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="btn-nero btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ATUALIZAR ACESSO
          </button>

          {message && (
            <div style={{ marginTop: '20px', color: '#4caf50', textAlign: 'center', fontFamily: 'Orbitron', fontSize: '0.9rem' }}>
              {message}
            </div>
          )}
          
          {error && (
            <div style={{ marginTop: '20px', color: '#bd2c2c', textAlign: 'center', fontFamily: 'Orbitron', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;