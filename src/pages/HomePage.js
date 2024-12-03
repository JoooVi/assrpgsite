import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css"; // Estilos da página inicial
import Button from "@mui/material/Button";

const HomePage = () => {
  console.log("HomePage renderizada");
  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1 className="homepage-title">Bem-vindo ao Mundo de ASSIMILAÇÃO</h1>
        <p className="homepage-description">
          Em um mundo devastado, você é a chave para a sobrevivência. Crie seu
          personagem e entre nesta aventura!
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