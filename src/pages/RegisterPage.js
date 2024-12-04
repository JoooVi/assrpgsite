import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
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
      setError("Erro ao registrar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Register-page">
      <div className="Register-container">
        <h2 className="Register-title">Registrar-se</h2>
        <form className="Register-form" onSubmit={handleSubmit}>
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
          >
            {loading ? "Registrando..." : "Registrar"}{" "}
            {/* Texto dinâmico do botão */}
          </Button>
        </form>
        <div className="Register-footer">
          <p>
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;