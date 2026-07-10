import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import InlineLoader from "../components/ui/InlineLoader";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { API_URL } from "../config/apiConfig";
import "../styles/auth.css";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      const mismatchMessage = "As senhas não conferem.";
      setError(mismatchMessage);
      dispatchToast({ message: mismatchMessage, type: "warning" });
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/reset-password`, {
        token,
        password,
      });

      const successMessage = "Senha redefinida com sucesso. Redirecionando para o login...";
      setMessage(successMessage);
      dispatchToast({ message: successMessage, type: "success" });
      window.setTimeout(() => {
        navigate("/login");
      }, 2600);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erro ao redefinir senha.";
      setError(errorMessage);
      dispatchToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box auth-box-compact">
        <p className="auth-kicker">NOVA CREDENCIAL</p>
        <h2 className="auth-title">Redefinir Acesso</h2>
        <p className="auth-subtitle">
          Cadastre uma nova senha para recuperar o acesso ao sistema.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-native-label" htmlFor="new-password">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            className="auth-native-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Digite a nova senha"
          />

          <label className="auth-native-label" htmlFor="confirm-password">
            Confirmar senha
          </label>
          <input
            id="confirm-password"
            type="password"
            className="auth-native-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Repita a nova senha"
          />

          <button type="submit" className="auth-native-button" disabled={loading}>
            {loading ? <InlineLoader label="Atualizando" /> : "Atualizar acesso"}
          </button>

          {message && <div className="auth-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="auth-footer">
          <p>Já recuperou o acesso?</p>
          <Link to="/login">Voltar para login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
