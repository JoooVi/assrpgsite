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

// Estilo customizado para os Inputs ficarem escuros/táticos
const darkInputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff", // Cor do texto digitado
    fontFamily: "Rajdhani, sans-serif",
    backgroundColor: "rgba(0,0,0,0.3)",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.2)", // Borda padrão
    },
    "&:hover fieldset": {
      borderColor: "#fff", // Borda no hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8a1c18", // Borda Vermelha no foco
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa", // Cor do label
    fontFamily: "Rajdhani, sans-serif",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ff3333", // Cor do label no foco
  },
};

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
        <h2 className="auth-title">LOGIN</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            sx={darkInputStyle}
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            sx={darkInputStyle}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '10px' }}>
             <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>
              Esqueci a senha
            </Link>
          </div>
          
          {error && <div className="error-message">ERRO: {error}</div>}
          
          <Button
            type="submit"
            variant="contained"
            disabled={status === "loading"}
            fullWidth
            sx={{ 
              mt: 1, 
              mb: 2, 
              backgroundColor: '#8a1c18', 
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '1px',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#67110e', boxShadow: '0 0 15px rgba(138, 28, 24, 0.5)' }
            }}
          >
            {status === "loading" ? "AUTENTICANDO..." : "ACESSAR"}
          </Button>
        </form>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)', color: '#666' }}>OU</Divider>

        <Button
          variant="contained"
          fullWidth
          startIcon={<FaDiscord />}
          onClick={handleDiscordLogin}
          sx={{ 
            backgroundColor: '#5865F2', 
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '600',
            '&:hover': { backgroundColor: '#4752C4' },
            mb: 2
          }}
        >
          Entrar com Discord
        </Button>

        <div className="auth-footer">
          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>NÃO POSSUI CREDENCIAIS?</p>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            fullWidth
            sx={{ 
              color: '#fff', 
              borderColor: 'rgba(255,255,255,0.3)', 
              fontFamily: 'Rajdhani, sans-serif',
              '&:hover': { borderColor: '#8a1c18', backgroundColor: 'rgba(138, 28, 24, 0.1)' }
            }}
          >
            SOLICITAR CADASTRO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;