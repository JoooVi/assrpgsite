import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { FaDiscord } from "react-icons/fa";
import InlineLoader from "../components/ui/InlineLoader";
import { login } from "../redux/slices/authSlice";
import { API_URL } from "../config/apiConfig";
import "../styles/auth.css";

const darkInputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontFamily: "Rajdhani, sans-serif",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
    "&:hover fieldset": { borderColor: "#777" },
    "&.Mui-focused fieldset": { borderColor: "#ff3333" },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    fontFamily: "Rajdhani, sans-serif",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ff3333",
  },
};

const primaryButtonSx = {
  backgroundColor: "#8a1c18",
  color: "#fff",
  fontFamily: "Orbitron, sans-serif",
  fontWeight: "bold",
  letterSpacing: "1px",
  mt: 1,
  mb: 2,
  "&:hover": {
    backgroundColor: "#a0201c",
    boxShadow: "0 0 18px rgba(138, 28, 24, 0.48)",
  },
};

const secondaryButtonSx = {
  backgroundColor: "#111",
  border: "1px solid #444",
  borderRadius: 0,
  color: "#ddd",
  fontFamily: "Rajdhani, sans-serif",
  fontWeight: 700,
  mb: 2,
  "&:hover": {
    backgroundColor: "rgba(138, 28, 24, 0.18)",
    borderColor: "#ff3333",
    color: "#fff",
  },
};

const outlineButtonSx = {
  borderColor: "rgba(255,255,255,0.3)",
  color: "#fff",
  fontFamily: "Rajdhani, sans-serif",
  fontWeight: 700,
  "&:hover": {
    backgroundColor: "rgba(138, 28, 24, 0.1)",
    borderColor: "#8a1c18",
  },
};

const AuthAccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error: loginError, isAuthenticated } = useSelector((state) => state.auth);

  const isRegisterMode = location.pathname === "/register";
  const requestedLocation = location.state?.from;
  const postAuthPath = requestedLocation?.pathname
    ? `${requestedLocation.pathname}${requestedLocation.search || ""}${requestedLocation.hash || ""}`
    : "/characters";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const loginFaceRef = useRef(null);
  const registerFaceRef = useRef(null);

  const cardClassName = useMemo(
    () => `auth-flip-card ${isRegisterMode ? "is-register" : ""}`,
    [isRegisterMode]
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate(postAuthPath, { replace: true });
    }
  }, [isAuthenticated, navigate, postAuthPath]);

  useEffect(() => {
    if (loginFaceRef.current) loginFaceRef.current.inert = isRegisterMode;
    if (registerFaceRef.current) registerFaceRef.current.inert = !isRegisterMode;
  }, [isRegisterMode]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email: loginEmail, password: loginPassword }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    if (!registerName || !registerEmail || !registerPassword) {
      setRegisterError("ERRO: Preencha todos os campos obrigatórios.");
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      if (response.data.token) {
        navigate("/login", { state: location.state, replace: true });
      } else {
        setRegisterError("Falha no registro.");
      }
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Erro ao conectar com servidor.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDiscordAuth = () => {
    window.location.href = `${API_URL}/auth/discord`;
  };

  return (
    <div className="auth-container auth-flip-container">
      <div className="auth-flip-stage">
        <div className={cardClassName}>
          <section
            ref={loginFaceRef}
            className="auth-box auth-flip-face auth-flip-front"
            aria-hidden={isRegisterMode}
          >
            <h2 className="auth-title">Acessar Sistema</h2>
            <p className="auth-subtitle">
              Entre na sua conta para acessar personagens, campanhas e ferramentas da mesa.
            </p>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <TextField
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                sx={darkInputStyle}
              />

              <TextField
                label="Senha"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                sx={darkInputStyle}
              />

              <div className="auth-row-end">
                <Link to="/forgot-password" className="auth-link">
                  Esqueci a senha
                </Link>
              </div>

              {loginError && <div className="error-message">ERRO: {loginError}</div>}

              <Button type="submit" variant="contained" disabled={status === "loading"} fullWidth sx={primaryButtonSx}>
                {status === "loading" ? <InlineLoader label="Autenticando" /> : "Acessar"}
              </Button>
            </form>

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)", color: "#666" }}>
              OU
            </Divider>

            <Button variant="contained" fullWidth startIcon={<FaDiscord />} onClick={handleDiscordAuth} sx={secondaryButtonSx}>
              Entrar com Discord
            </Button>

            <div className="auth-footer">
              <p>Não possui credenciais?</p>
              <Button type="button" variant="outlined" fullWidth sx={outlineButtonSx} onClick={() => navigate("/register", { state: location.state })}>
                Solicitar Cadastro
              </Button>
            </div>
          </section>

          <section
            ref={registerFaceRef}
            className="auth-box auth-flip-face auth-flip-back"
            aria-hidden={!isRegisterMode}
          >
            <h2 className="auth-title">Solicitar Cadastro</h2>
            <p className="auth-subtitle">
              Crie sua conta para registrar fichas, campanhas e conteúdos personalizados.
            </p>

            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <TextField label="Nome" type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required fullWidth margin="dense" sx={darkInputStyle} />

              <TextField label="Email" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required fullWidth margin="dense" sx={darkInputStyle} />

              <TextField label="Senha" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required fullWidth margin="dense" sx={darkInputStyle} />

              {registerError && <p className="error-message">{registerError}</p>}

              <Button type="submit" variant="contained" disabled={registerLoading} fullWidth sx={primaryButtonSx}>
                {registerLoading ? <InlineLoader label="Processando" /> : "Registrar"}
              </Button>
            </form>

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)", color: "#666" }}>
              OU
            </Divider>

            <Button variant="contained" fullWidth startIcon={<FaDiscord />} onClick={handleDiscordAuth} sx={secondaryButtonSx}>
              Registrar com Discord
            </Button>

            <div className="auth-footer">
              <p>Já possui cadastro?</p>
              <Button type="button" variant="outlined" fullWidth sx={outlineButtonSx} onClick={() => navigate("/login", { state: location.state })}>
                Acessar Sistema
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthAccessPage;
