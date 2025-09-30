import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Adicionado estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false); // Para garantir que o carregamento seja desativado
        console.log("Token não encontrado, redirecionando para login");
        return navigate("/login"); // Redireciona para o login caso o token não esteja presente
      }

      try {
        // Enviar uma requisição ao back-end para obter os dados do perfil
        const response = await axios.get("https://assrpgsite-be-production.up.railway.app/api/profile", {
          // Alteração para HTTPS
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Dados do perfil carregados:", response.data);
        setUser(response.data); // Armazena os dados do usuário
        setLoading(false); // Desativa o estado de carregamento após a resposta
      } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
        setError("Erro ao carregar dados do perfil.");
        setLoading(false); // Desativa o estado de carregamento mesmo em caso de erro
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div className="loading-spinner">Carregando...</div>; // Exibe enquanto os dados do usuário estão sendo carregados
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => navigate("/login")}>
          Tentar Novamente
        </button>{" "}
        {/* Botão para tentar novamente */}
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Perfil do Usuário</h2>
      <div className="profile-info">
        <p>
          <strong>Nome:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>
      <button onClick={() => navigate("/edit-profile")}>Editar Perfil</button>
    </div>
  );
};

export default ProfilePage;