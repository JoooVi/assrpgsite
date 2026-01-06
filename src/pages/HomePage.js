import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css"; 

const HomePage = () => {
  return (
    // Se a imagem de fundo for dinâmica, coloque: style={{ backgroundImage: `url(${suaImagem})` }}
    <div className="homepage-container" style={{backgroundImage: "url('./assets/')"}}>
      
      <div className="homepage-content">
        <h1 className="homepage-title">
          NERO <span className="title-highlight">INDUSTRIES</span>
        </h1>
        
        <div className="homepage-description">
          <p className="status-label">
            // STATUS DO SISTEMA: <span className="status-alert">CRÍTICO</span>
          </p>
          <p style={{margin: 0, lineHeight: '1.6'}}>
            Bem-vindo ao Sistema de Recrutamento. Sua sobrevivência é nossa prioridade. 
            Complete seu cadastro e torne-se parte da solução.
          </p>
        </div>
        
        <div className="homepage-links">
          <Link to="/register" className="btn-home btn-primary">
            Cadastrar
          </Link>
          
          <Link to="/login" className="btn-home btn-secondary">
            Acessar Sistema
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;