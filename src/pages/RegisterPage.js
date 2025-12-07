import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider"; 
import { FaDiscord } from 'react-icons/fa'; 
import "./RegisterPage.css";

// Reutilizando o estilo escuro (você pode extrair isso para um arquivo de tema se quiser)
const darkInputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    fontFamily: "Rajdhani, sans-serif",
    backgroundColor: "rgba(0,0,0,0.3)",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
    "&:hover fieldset": { borderColor: "#fff" },
    "&.Mui-focused fieldset": { borderColor: "#8a1c18" },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    fontFamily: "Rajdhani, sans-serif",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ff3333",
  },
};

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || !name) {
      setError("ERRO: Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://assrpgsite-be-production.up.railway.app/api/register", {
        name,
        email,
        password,
      });

      if (response.data.token) {
        navigate("/login");
      } else {
        setError("Falha no registro.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao conectar com servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordRegister = () => {
    window.location.href = 'https://assrpgsite-be-production.up.railway.app/api/auth/discord';
  };

  return (
    <div className="Register-page">
      <div className="Register-container">
        <h2 className="Register-title">REGISTRAR-SE</h2>
        <form className="Register-form" onSubmit={handleSubmit}>
          
            <TextField
              label="Nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              margin="dense"
              sx={darkInputStyle}
            />
         
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              margin="dense"
              sx={darkInputStyle}
            />
         
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              margin="dense"
              sx={darkInputStyle}
            />
          
            {error && <p className="error-message">{error}</p>}
            
            <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{ 
                  mt: 2, 
                  mb: 1,
                  backgroundColor: '#8a1c18', 
                  color: '#fff',
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '1px',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#67110e', boxShadow: '0 0 15px rgba(138, 28, 24, 0.5)' }
                }}
            >
                {loading ? "PROCESSANDO..." : "REGISTRAR-SE"}
            </Button>
        </form>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)', color: '#666' }}>OU</Divider>

        <Button
          variant="contained"
          fullWidth
          startIcon={<FaDiscord />}
          onClick={handleDiscordRegister}
          sx={{ 
            backgroundColor: '#5865F2', 
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '600',
            '&:hover': { backgroundColor: '#4752C4' },
            mb: 2 
          }}
        >
          Registrar com Discord
        </Button>

        <div className="Register-footer">
          <p className="Register-footer-text" style={{fontSize: '0.9rem'}}>JÁ POSSUI CADASTRO?</p>
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            fullWidth
            sx={{ 
              color: '#fff', 
              borderColor: 'rgba(255,255,255,0.3)',
              fontFamily: 'Rajdhani, sans-serif', 
              '&:hover': { borderColor: '#8a1c18', backgroundColor: 'rgba(138, 28, 24, 0.1)' }
            }}
          >
            ACESSAR SISTEMA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;