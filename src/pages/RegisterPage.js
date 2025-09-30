import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Importe 'Link' aqui
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
      // Melhorar a mensagem de erro para o usuário
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Ex: "Email já cadastrado"
      } else {
        setError("Erro ao registrar usuário. Tente novamente.");
      }
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
            sx={{ mt: 2, mb: 1 }} // Adiciona margem superior e inferior ao botão Register
          >
            {loading ? "Registrando..." : "Registrar"}{" "}
          </Button>
        </form>

        {/* Seção para ir para o Login */}
        <div className="Register-footer">
          <p className="Register-footer-text">Já tem uma conta?</p>
          <Button
            component={Link} // Usa o Link do react-router-dom
            to="/login"
            variant="outlined" // Ou 'text', 'contained' - escolha o que se encaixa melhor no design
            color="secondary" // Defina uma cor que se encaixe no seu tema, talvez a mesma cor do botão primário para consistência
            sx={{ mt: 1, color: '#67110e', borderColor: '#67110e' }} // Exemplo: cor customizada
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;