import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutSession } from "../redux/slices/authSlice";
import { getPrimaryNavigation, isNavigationItemActive } from "../config/navigation";
import AccountMenu from "./AccountMenu";
import "./Navbar.css";
import logo from "../assets/asslogo1.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const navItems = getPrimaryNavigation(isAuthenticated);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await dispatch(logoutSession());
      closeMenu();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("navbar-menu-open", isMenuOpen);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        closeMenu();
        toggleRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("navbar-menu-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const timer = window.setTimeout(() => menuRef.current?.querySelector("a")?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isMenuOpen]);

  return (
    <nav className="navbar" aria-label="Navegação principal">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Nero Industries" className="logo-image" />
        </Link>
      </div>

      {isMenuOpen && (
        <button type="button" className="navbar-backdrop" onClick={closeMenu} aria-label="Fechar menu" />
      )}

      <div ref={menuRef} id="primary-navigation" className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
        {navItems.map((item) => {
          const active = isNavigationItemActive(item, location.pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`navbar-link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={closeMenu}
            >
              <Icon className="navbar-link-icon" aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && <span className="navbar-beta-badge">{item.badge}</span>}
            </Link>
          );
        })}

        <div className="mobile-only-menu">
          <div className="mobile-divider" />
          {user ? (
            <>
              <span className="mobile-user-greeting">Agente: {user.name}</span>
              <Link to="/perfil" className="navbar-link" onClick={closeMenu}>Minha conta</Link>
              <Link to="/edit-profile" className="navbar-link" onClick={closeMenu}>Configurações</Link>
              <a href="https://discord.gg/tzrezdyzhs" className="navbar-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Suporte</a>
              <button onClick={handleLogout} className="mobile-logout-btn" disabled={isLoggingOut}>
                {isLoggingOut ? "Saindo..." : "Sair do sistema"}
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-link login-btn-mobile" onClick={closeMenu}>
              Acessar conta
            </Link>
          )}
        </div>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className={`navbar-toggle ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      <div className="navbar-right desktop-only">
        {user ? (
          <AccountMenu handleLogout={handleLogout} user={user} isLoggingOut={isLoggingOut} />
        ) : (
          <Link to="/login" className="navbar-link login-btn-desktop">Conectar</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
