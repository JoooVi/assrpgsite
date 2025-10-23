import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import AccountMenu from "./AccountMenu";
import "./Navbar.css";
import logo from "../assets/asslogo1.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    // --- ALTERAÇÃO: Fechar o menu ao fazer logout ---
    closeMenu(); 
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    // --- ALTERAÇÃO: Adiciona classe 'mobile-menu-open' quando aberto ---
    <nav className={`navbar ${isMenuOpen ? "mobile-menu-open" : ""}`}>
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Logo" className="logo-image" />
        </Link>
      </div>

      {/* --- ALTERAÇÃO: Este div agora é o menu dropdown em mobile --- */}
      <div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
        <Link to="/" className="navbar-link" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/create" className="navbar-link" onClick={closeMenu}>
          Criação
        </Link>
        <Link to="/characters" className="navbar-link" onClick={closeMenu}>
          Personagens
        </Link>
        <Link to="/campaigns" className="navbar-link" onClick={closeMenu}>
          Campanhas(beta)
        </Link>
        <Link to="/homebrews" className="navbar-link" onClick={closeMenu}>
          Homebrews
        </Link>

        {/* --- NOVO: Secção para conta/login DENTRO do menu mobile --- */}
        <div className="mobile-account-section">
          {user ? (
            // Passa a função closeMenu para o AccountMenu (opcional, mas bom UX)
            <AccountMenu handleLogout={handleLogout} user={user} onLinkClick={closeMenu}/>
          ) : (
            <Link to="/login" className="navbar-link" onClick={closeMenu}>
              Conectar
            </Link>
          )}
        </div>
        {/* --- FIM DA NOVA SECÇÃO --- */}

      </div>

      {/* Botão Hambúrguer permanece igual */}
      <div className="navbar-toggle" onClick={toggleMenu}>
        <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
        <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
        <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
      </div>

      {/* Secção direita original - será escondida em mobile via CSS */}
      <div className="navbar-right">
        {user ? (
          // Não precisa do onLinkClick aqui
          <AccountMenu handleLogout={handleLogout} user={user} />
        ) : (
          <Link to="/login" className="navbar-link">
            Conectar
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;