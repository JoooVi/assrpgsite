// src/pages/RegisterPage.js

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider"; // 1. Importar o Divider
import { FaDiscord } from 'react-icons/fa'; // 2. Importar o ícone (opcional, mas recomendado)
import "./RegisterPage.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (sua lógica de registro com e-mail continua igual)
    setError("");
    setLoading(true);
    console.log("Tentativa de registro iniciada");

    if (!email || !password || !name) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://assrpgsite-be-production.up.railway.app/api/register", {
        name,
        email,
        password,
      });
      console.log("Resposta do servidor:", response.data);

      if (response.data.token) {
        navigate("/login");
      } else {
        setError("Erro ao registrar usuário. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao registrar usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Adicionar a função para o registro com Discord
  const handleDiscordRegister = () => {
    // Redireciona para a mesma rota de autenticação do backend
    window.location.href = 'https://assrpgsite-be-production.up.railway.app/api/auth/discord';
  };

  return (
    <div className="Register-page">
      <div className="Register-container">
        <h2 className="Register-title">Registrar-se</h2>
        <form className="Register-form" onSubmit={handleSubmit}>
            {/* ... Seus TextFields de nome, email e senha ... */}
            <div>
            <TextField
              label="Nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              margin="normal"
              InputProps={{ style: { fontSize: 20 } }}
              InputLabelProps={{ style: { fontSize: 18 } }}
            />
          </div>
          <div>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              margin="normal"
              InputProps={{ style: { fontSize: 18 } }}
              InputLabelProps={{ style: { fontSize: 18 } }}
            />
          </div>
          <div className="password">
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
              InputProps={{ style: { fontSize: 18 } }}
              InputLabelProps={{ style: { fontSize: 18 } }}
            />
          </div>
            {error && <p className="error-message">{error}</p>}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                sx={{ mt: 2, mb: 1 }}
            >
                {loading ? "Registrando..." : "Registrar"}
            </Button>
        </form>

        {/* 4. Adicionar o divisor e o novo botão */}
        <Divider sx={{ my: 2, color: 'rgba(0, 0, 0, 0.6)' }}>OU</Divider>

        <Button
          variant="contained"
          fullWidth
          startIcon={<FaDiscord />}
          onClick={handleDiscordRegister}
          sx={{ 
            backgroundColor: '#5865F2', 
            '&:hover': { backgroundColor: '#4752C4' },
            mb: 2 // Adiciona uma margem inferior
          }}
        >
          Registrar-se com Discord
        </Button>

        {/* Seção para ir para o Login */}
        <div className="Register-footer">
          <p className="Register-footer-text">Já tem uma conta?</p>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            color="secondary"
            sx={{ mt: 1, color: '#67110e', borderColor: '#67110e' }}
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;