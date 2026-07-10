import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Sua sessão expirou.');
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Escutar evento global de expiração de sessão
    const handleSessionExpired = (event) => {
      setReason(event.detail?.reason || 'Sua sessão expirou.');
      setIsOpen(true);
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleRedirectToLogin = () => {
    setIsOpen(false);
    navigate('/login');
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 21000,
    display: 'grid',
    placeItems: 'center',
    padding: '18px',
    background: 'radial-gradient(circle at 50% 18%, rgba(138, 28, 24, 0.14), transparent 34%), rgba(0, 0, 0, 0.88)',
    backdropFilter: 'blur(6px)',
    animation: 'sessionModalFade 140ms ease-out',
  };

  const modalStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: 'min(460px, 100%)',
    background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.98), rgba(8, 8, 8, 0.99))',
    border: '1px solid #333',
    borderTop: '4px solid #8a1c18',
    borderRadius: '0',
    padding: '34px 28px 28px',
    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.78), 0 0 28px rgba(138, 28, 24, 0.12)',
    textAlign: 'center',
    animation: 'sessionModalEnter 180ms ease-out',
  };

  const accentLineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 51, 51, 0.55), transparent)',
  };

  const cornerStyle = {
    position: 'absolute',
    right: '10px',
    bottom: '10px',
    width: '18px',
    height: '18px',
    borderRight: '2px solid #666',
    borderBottom: '2px solid #666',
    opacity: 0.9,
  };

  const iconStyle = {
    width: '56px',
    height: '56px',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 16px',
    border: '1px solid #333',
    background: '#080808',
    color: '#ff3333',
    boxShadow: 'inset 0 0 18px rgba(255, 255, 255, 0.03)',
    fontSize: '22px',
  };

  const titleStyle = {
    color: '#fff',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '1.2rem',
    fontWeight: 700,
    letterSpacing: '1.6px',
    marginBottom: '10px',
    textTransform: 'uppercase',
    textShadow: '0 0 14px rgba(138, 28, 24, 0.35)',
  };

  const messageStyle = {
    color: '#aaa',
    fontFamily: '"Roboto Condensed", "Rajdhani", sans-serif',
    fontSize: '1rem',
    marginBottom: '26px',
    lineHeight: '1.45',
  };

  const buttonStyle = {
    width: '100%',
    minHeight: '46px',
    backgroundColor: '#8a1c18',
    color: '#fff',
    border: '1px solid #500',
    borderRadius: '0',
    padding: '0 22px',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#a0201c',
    borderColor: '#ff3333',
    boxShadow: '0 0 18px rgba(138, 28, 24, 0.42)',
    transform: 'translateY(-1px)',
  };

  return (
    <div style={overlayStyle}>
      <style>
        {`
          @keyframes sessionModalFade {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes sessionModalEnter {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={modalStyle}>
        <div style={accentLineStyle} />
        <div style={cornerStyle} />
        <div style={iconStyle}>
          <FaLock />
        </div>
        <h2 style={titleStyle}>Sessão Expirada</h2>
        <p style={messageStyle}>{reason}</p>
        <button
          style={isHovering ? buttonHoverStyle : buttonStyle}
          onClick={handleRedirectToLogin}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;