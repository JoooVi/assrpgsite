import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../redux/authSlice";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login iniciado");
    dispatch(login({ email, password }));
  };

  useEffect(() => {
    if (status === "succeeded") {
      console.log("Login bem-sucedido");
      navigate("/characters");
    }
  }, [status, navigate]);

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={status === "loading"}
          fullWidth
        >
          {status === "loading" ? "Carregando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;