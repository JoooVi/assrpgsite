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

  // Estilos mantendo consistência com o resto da aplicação
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const modalStyle = {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    border: '2px solid #0f3460',
    padding: '40px 30px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    animation: 'slideInDown 0.3s ease-out',
  };

  const iconStyle = {
    fontSize: '48px',
    color: '#e94560',
    marginBottom: '20px',
  };

  const titleStyle = {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  };

  const messageStyle = {
    color: '#b0b0b0',
    fontSize: '14px',
    marginBottom: '30px',
    lineHeight: '1.6',
  };

  const buttonStyle = {
    backgroundColor: '#00d4ff',
    color: '#000',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#00b8d4',
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
  };

  return (
    <div style={overlayStyle}>
      <style>
        {`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={modalStyle}>
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
