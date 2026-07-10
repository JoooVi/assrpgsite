import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import "./ConfirmProvider.css";

const ConfirmContext = createContext(null);

const normalizeConfirm = (input) => {
  if (typeof input === "string") {
    return { message: input };
  }

  return {
    title: input?.title,
    message: input?.message || input?.msg || "Confirmar acao?",
    confirmLabel: input?.confirmLabel,
    cancelLabel: input?.cancelLabel,
    tone: input?.tone,
  };
};

const inferTone = (message = "") => {
  const text = message.toLowerCase();
  if (text.includes("excluir") || text.includes("deletar") || text.includes("apagar") || text.includes("permanent")) {
    return "danger";
  }
  if (text.includes("encerrar") || text.includes("remover") || text.includes("cancelar")) {
    return "warning";
  }
  return "info";
};

export const ConfirmProvider = ({ children }) => {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((input) => {
    const options = normalizeConfirm(input);

    return new Promise((resolve) => {
      setRequest({
        ...options,
        tone: options.tone || inferTone(options.message),
        title: options.title || "Confirmar acao",
        confirmLabel: options.confirmLabel || "Confirmar",
        cancelLabel: options.cancelLabel || "Cancelar",
        resolve,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setRequest((current) => {
      current?.resolve(Boolean(result));
      return null;
    });
  }, []);

  useEffect(() => {
    if (!request) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") close(false);
      if (event.key === "Enter") close(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, request]);

  useEffect(() => {
    const originalConfirm = window.confirm;

    window.confirm = (message) => {
      const options = normalizeConfirm(message);
      const result = originalConfirm(options.message);
      return result;
    };

    return () => {
      window.confirm = originalConfirm;
    };
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {request && (
        <div className="confirm-overlay" onMouseDown={() => close(false)}>
          <div
            className={`confirm-dialog ${request.tone}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="confirm-header">
              <div className="confirm-icon">
                <FaExclamationTriangle />
              </div>
              <h2 id="confirm-title" className="confirm-title">{request.title}</h2>
            </div>
            <div className="confirm-body">{request.message}</div>
            <div className="confirm-actions">
              <button type="button" className="confirm-button" onClick={() => close(false)}>
                {request.cancelLabel}
              </button>
              <button type="button" className="confirm-button primary" onClick={() => close(true)}>
                {request.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm deve ser usado dentro de ConfirmProvider");
  }
  return context;
};
