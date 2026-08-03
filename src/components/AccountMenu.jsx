import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaQuestionCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import "./AccountMenu.css";

export default function AccountMenu({ handleLogout, user, isLoggingOut = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const navigateAndClose = (path) => {
    setOpen(false);
    navigate(path);
  };

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="account-menu-shell">
      <button
        ref={buttonRef}
        type="button"
        className={`account-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-controls="account-menu"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Minha conta"
      >
        <span className="account-avatar" aria-hidden="true">
          {user?.avatar ? (
            <img src={user.avatar} alt="" width="32" height="32" decoding="async" />
          ) : initial}
        </span>
        <span className="account-name">{user?.name || "Agente"}</span>
      </button>

      {open && (
        <div ref={menuRef} id="account-menu" className="account-popover" role="menu">
          <button type="button" role="menuitem" className="account-menu-item profile" onClick={() => navigateAndClose("/perfil")}>
            <span className="account-menu-avatar" aria-hidden="true">
              {user?.avatar ? <img src={user.avatar} alt="" width="30" height="30" decoding="async" /> : initial}
            </span>
            <span>Perfil</span>
          </button>

          <span className="account-menu-divider" aria-hidden="true" />

          <button type="button" role="menuitem" className="account-menu-item" onClick={() => navigateAndClose("/edit-profile")}>
            <FaCog aria-hidden="true" />
            <span>Configurações</span>
          </button>
          <a className="account-menu-item" role="menuitem" href="https://discord.gg/tzrezdyzhs" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <FaQuestionCircle aria-hidden="true" />
            <span>Suporte</span>
          </a>
          <button
            type="button"
            role="menuitem"
            className="account-menu-item danger"
            disabled={isLoggingOut}
            onClick={() => {
              setOpen(false);
              handleLogout();
            }}
          >
            {isLoggingOut ? <FaUser aria-hidden="true" /> : <FaSignOutAlt aria-hidden="true" />}
            <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
