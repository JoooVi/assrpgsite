import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../redux/slices/authSlice";

// Componentes do Material-UI e Ícone
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { FaDiscord } from 'react-icons/fa';

import "../styles/auth.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleDiscordLogin = () => {
    window.location.href = 'https://assrpgsite-be-production.up.railway.app/api/auth/discord';
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/characters");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Link to="/forgot-password" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
            Esqueci minha senha
          </Link>
          
          {error && <p style={{ color: "red", textAlign: 'center' }}>{error}</p>}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={status === "loading"}
            fullWidth
            sx={{ mb: 2 }}
          >
            {status === "loading" ? "Carregando..." : "Entrar"}
          </Button>
        </form>

        <Divider sx={{ my: 1, color: 'rgba(0, 0, 0, 0.6)' }}>OU</Divider>

        <Button
          variant="contained"
          fullWidth
          startIcon={<FaDiscord />}
          onClick={handleDiscordLogin}
          sx={{ 
            backgroundColor: '#5865F2', 
            '&:hover': { backgroundColor: '#4752C4' },
            mt: 2
          }}
        >
          Entrar com Discord
        </Button>

        {/* --- SEÇÃO ADICIONADA PARA IR AO REGISTRO --- */}
        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0' }}>Ainda não tem uma conta?</p>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            color="secondary"
            sx={{ color: '#67110e', borderColor: '#67110e' }}
          >
            Registre-se
          </Button>
        </div>
        {/* --- FIM DA SEÇÃO --- */}

      </div>
    </div>
  );
};

export default LoginPage;