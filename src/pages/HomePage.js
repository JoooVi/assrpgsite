import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css"; // Estilos da página inicial
import Button from "@mui/material/Button";

const HomePage = () => {
  console.log("HomePage renderizada");
  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1 className="homepage-title">NERO INDUSTRIES</h1>
        <p className="homepage-description">
        Bem-vindo ao Sistema de Recrutamento da Nero Industries. Sua sobrevivência é nossa prioridade. Complete seu cadastro e torne-se parte da solução.
        </p>
        <div className="homepage-links">
          <Button
            component={Link}
            to="/register"
            variant="contained"
            style={{ backgroundColor: "#67110e", color: "#fff" }}
            className="homepage-link"
          >
            Cadastrar
          </Button>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            style={{ backgroundColor: "#67110e", color: "#fff" }}
            className="homepage-link"
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;