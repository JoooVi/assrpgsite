import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import AccountMenu from "./AccountMenu"; // Menu Desktop apenas
import "./Navbar.css";
import logo from "../assets/asslogo1.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false); // Fecha o menu se estiver no mobile
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      
      {/* 1. LADO ESQUERDO (LOGO) */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Nero Industries" className="logo-image" />
        </Link>
      </div>

      {/* 2. MENU CENTRAL (DESKTOP E MOBILE) */}
      <div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
        
        {/* Links de Navegação */}
        <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>
        <Link to="/create" className="navbar-link" onClick={closeMenu}>Criação</Link>
        <Link to="/characters" className="navbar-link" onClick={closeMenu}>Personagens</Link>
        <Link to="/campaigns" className="navbar-link" onClick={closeMenu}>Campanhas (Beta)</Link>
        <Link to="/homebrews" className="navbar-link" onClick={closeMenu}>Homebrews</Link>

        {/* --- ÁREA EXCLUSIVA DO MOBILE --- */}
        {/* Esta div só aparece quando a tela é pequena (CSS display: block/none) */}
        <div className="mobile-only-menu">
            <div className="mobile-divider"></div>
            
            {user ? (
                <>
                    {/* Infos do Usuário no Mobile */}
                    <span className="mobile-user-greeting">Agente: {user.name}</span>
                    
                    <Link to="/perfil" className="navbar-link mobile-account-link" onClick={closeMenu}>
                        Minha Conta
                    </Link>
                    
                    <Link to="/edit-profile" className="navbar-link mobile-account-link" onClick={closeMenu}>
                        Configurações
                    </Link>

                    {/* BOTÃO DE SAIR BEM VISÍVEL */}
                    <button onClick={handleLogout} className="mobile-logout-btn">
                        SAIR DO SISTEMA
                    </button>
                </>
            ) : (
                <Link to="/login" className="navbar-link login-btn-mobile" onClick={closeMenu}>
                    ACESSAR CONTA
                </Link>
            )}
        </div>
      </div>

      {/* 3. BOTÃO HAMBURGUER (Só mobile) */}
      <div className={`navbar-toggle ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* 4. LADO DIREITO (APENAS DESKTOP) */}
      {/* Esta div desaparece completamente no mobile via CSS */}
      <div className="navbar-right desktop-only">
        {user ? (
          <AccountMenu handleLogout={handleLogout} user={user} />
        ) : (
          <Link to="/login" className="navbar-link login-btn-desktop">
            CONECTAR
          </Link>
        )}
      </div>

    </nav>
  );
};

export default Navbar;