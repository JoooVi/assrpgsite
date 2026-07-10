import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuthFromToken } from "../redux/slices/authSlice";
import { dispatchToast } from "../components/notifications/ToastProvider";
import PageLoader from "../components/ui/PageLoader";
import { API_URL } from "../config/apiConfig";

const AuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!code) {
      dispatchToast({ message: "Código de autenticação ausente.", type: "warning" });
      navigate("/login", { replace: true });
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/exchange`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        const accessToken = data.accessToken || data.token;

        if (!response.ok || !accessToken) {
          throw new Error(data.message || "Falha ao concluir autenticação com Discord.");
        }

        dispatch(setAuthFromToken({
          token: accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }));
        navigate("/characters", { replace: true });
      } catch (error) {
        console.error("Erro no callback OAuth:", error);
        dispatchToast({ message: error.message || "Não foi possível concluir o login.", type: "error" });
        navigate("/login", { replace: true });
      }
    };

    exchangeCodeForToken();
  }, [dispatch, location.search, navigate]);

  return (
    <PageLoader
      title="Autenticando"
      subtitle="Processando credenciais e preparando seu acesso..."
      fullScreen
    />
  );
};

export default AuthCallbackPage;
