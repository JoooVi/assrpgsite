import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import AccountMenu from "./AccountMenu";
import "./Navbar.css";
import logo from "../assets/asslogo1.png";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/create", label: "Criação" },
  { to: "/characters", label: "Personagens" },
  { to: "/campaigns", label: "Campanhas", badge: "Beta" },
  { to: "/homebrews", label: "Homebrews" },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    closeMenu();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  useEffect(() => {
    document.body.classList.toggle("navbar-menu-open", isMenuOpen);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("navbar-menu-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const navLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? " active" : ""}`;

  return (
    <nav className="navbar" aria-label="Navegação principal">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Nero Industries" className="logo-image" />
        </Link>
      </div>

      <div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={navLinkClass}
            onClick={closeMenu}
          >
            <span>{item.label}</span>
            {item.badge && <span className="navbar-beta-badge">{item.badge}</span>}
          </NavLink>
        ))}

        <div className="mobile-only-menu">
          <div className="mobile-divider" />

          {user ? (
            <>
              <span className="mobile-user-greeting">Agente: {user.name}</span>

              <NavLink to="/perfil" className={navLinkClass} onClick={closeMenu}>
                Minha Conta
              </NavLink>

              <NavLink
                to="/edit-profile"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Configurações
              </NavLink>

              <button onClick={handleLogout} className="mobile-logout-btn">
                Sair do Sistema
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${navLinkClass({ isActive })} login-btn-mobile`
              }
              onClick={closeMenu}
            >
              Acessar Conta
            </NavLink>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`navbar-toggle ${isMenuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMenuOpen}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      <div className="navbar-right desktop-only">
        {user ? (
          <AccountMenu handleLogout={handleLogout} user={user} />
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${navLinkClass({ isActive })} login-btn-desktop`
            }
          >
            Conectar
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
