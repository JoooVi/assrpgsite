import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; //
import { useDispatch, useSelector } from "react-redux"; //
import { logout } from "../redux/slices/authSlice"; //
import AccountMenu from "./AccountMenu"; //
import "./Navbar.css"; //
import logo from "../assets/asslogo1.png"; //

const Navbar = () => {
  const dispatch = useDispatch(); //
  const navigate = useNavigate(); //
  const token = useSelector((state) => state.auth.token); //
  const [isMenuOpen, setIsMenuOpen] = useState(false); //

  const handleLogout = () => {
    dispatch(logout()); //
    navigate("/login"); //
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); //
  };

  const closeMenu = () => {
    setIsMenuOpen(false); //
  };

  return (
    <nav className="navbar">
      {" "}
      {/* */}
      <div className="navbar-left">
        {" "}
        {/* */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          {" "}
          {/* */}
          <img src={logo} alt="Logo" className="logo-image" /> {/* */}
        </Link>
      </div>
      <div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
        {" "}
        {/* */}
        <Link to="/" className="navbar-link" onClick={closeMenu}>
          {" "}
          {/* */}
          Home
        </Link>
        <Link to="/create" className="navbar-link" onClick={closeMenu}>
          {" "}
          {/* */}
          Criação
        </Link>
        <Link to="/characters" className="navbar-link" onClick={closeMenu}>
          {" "}
          {/* */}
          Personagens
        </Link>
        {/* NOVO: Link para a página de Campanhas */}
        <Link to="/campaigns" className="navbar-link" onClick={closeMenu}>
          Campanhas(beta)
        </Link>
        <Link to="/homebrews" className="navbar-link" onClick={closeMenu}>
          {" "}
          {/* */}
          Homebrews
        </Link>
      </div>
      <div className="navbar-toggle" onClick={toggleMenu}>
        {" "}
        {/* */}
        <span className="bar"></span> {/* */}
        <span className="bar"></span> {/* */}
        <span className="bar"></span> {/* */}
      </div>
      <div className="navbar-right">
        {" "}
        {/* */}
        {token ? (
          <AccountMenu handleLogout={handleLogout} /> //
        ) : (
          <Link to="/login" className="navbar-link">
            {" "}
            {/* */}
            Conectar
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;