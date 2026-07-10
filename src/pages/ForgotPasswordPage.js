import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import InlineLoader from "../components/ui/InlineLoader";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { API_URL } from "../config/apiConfig";
import "../styles/auth.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      const successMessage = response.data.message || "Enviamos as instruções para o email informado.";
      setMessage(successMessage);
      dispatchToast({ message: successMessage, type: "success" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erro ao processar solicitação.";
      setError(errorMessage);
      dispatchToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box auth-box-compact">
        <p className="auth-kicker">PROTOCOLO DE ACESSO</p>
        <h2 className="auth-title">Recuperar Acesso</h2>
        <p className="auth-subtitle">
          Informe o email da conta para receber as instruções de redefinição de senha.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-native-label" htmlFor="recovery-email">
            Email cadastrado
          </label>
          <input
            id="recovery-email"
            type="email"
            className="auth-native-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />

          <button type="submit" className="auth-native-button" disabled={loading}>
            {loading ? <InlineLoader label="Enviando" /> : "Enviar instruções"}
          </button>

          {message && <p className="auth-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="auth-footer">
          <p>Lembrou a senha?</p>
          <Link to="/login">Voltar para login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
