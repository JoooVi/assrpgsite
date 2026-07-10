import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./ToastProvider.css";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4200;

const titles = {
  success: "Sucesso",
  error: "Erro",
  warning: "Aviso",
  info: "Info",
};

const icons = {
  success: <FaCheck />,
  error: <FaTimes />,
  warning: <FaExclamationTriangle />,
  info: <FaInfoCircle />,
};

const normalizeToast = (input, fallbackType = "info") => {
  if (typeof input === "string") {
    return { message: input, type: fallbackType };
  }

  return {
    message: input?.message || input?.msg || "Algo aconteceu.",
    title: input?.title,
    type: input?.type || input?.severity || fallbackType,
    duration: input?.duration,
  };
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input, fallbackType) => {
    const toast = normalizeToast(input, fallbackType);
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const duration = Number(toast.duration || DEFAULT_DURATION);

    setToasts((current) => [
      ...current.slice(-3),
      {
        ...toast,
        id,
        duration,
        type: ["success", "error", "warning", "info"].includes(toast.type) ? toast.type : "info",
      },
    ]);

    if (duration > 0) {
      window.setTimeout(() => dismissToast(id), duration);
    }

    return id;
  }, [dismissToast]);

  useEffect(() => {
    const handleToastEvent = (event) => {
      showToast(event.detail || "Notificacao", event.detail?.type);
    };

    window.addEventListener("app:toast", handleToastEvent);
    return () => window.removeEventListener("app:toast", handleToastEvent);
  }, [showToast]);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message) => {
      showToast(String(message || ""), "info");
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const value = useMemo(() => ({
    showToast,
    dismissToast,
    success: (message, options = {}) => showToast({ ...options, message, type: "success" }),
    error: (message, options = {}) => showToast({ ...options, message, type: "error" }),
    warning: (message, options = {}) => showToast({ ...options, message, type: "warning" }),
    info: (message, options = {}) => showToast({ ...options, message, type: "info" }),
  }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card ${toast.type}`}
            role="status"
            style={{ "--toast-duration": `${toast.duration}ms` }}
          >
            <div className="toast-icon">{icons[toast.type] || icons.info}</div>
            <div className="toast-content">
              <p className="toast-title">{toast.title || titles[toast.type] || titles.info}</p>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fechar notificacao"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
};

export const dispatchToast = (detail) => {
  window.dispatchEvent(new CustomEvent("app:toast", { detail }));
};
