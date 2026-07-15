import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Dialog from "../ui/Dialog";
import "./ConfirmProvider.css";

const ConfirmContext = createContext(null);

const normalizeConfirm = (input) => {
  if (typeof input === "string") return { message: input };
  return {
    title: input?.title,
    message: input?.message || input?.msg || "Deseja confirmar esta ação?",
    confirmLabel: input?.confirmLabel,
    cancelLabel: input?.cancelLabel,
    tone: input?.tone,
  };
};

const inferTone = (message = "") => {
  const text = message.toLowerCase();
  if (["excluir", "deletar", "apagar", "permanent"].some((term) => text.includes(term))) return "danger";
  if (["encerrar", "remover", "cancelar"].some((term) => text.includes(term))) return "warning";
  return "info";
};

export const ConfirmProvider = ({ children }) => {
  const [request, setRequest] = useState(null);
  const cancelRef = useRef(null);

  const confirm = useCallback((input) => {
    const options = normalizeConfirm(input);
    return new Promise((resolve) => {
      setRequest((current) => {
        current?.resolve(false);
        return {
          ...options,
          tone: options.tone || inferTone(options.message),
          title: options.title || "Confirmar ação",
          confirmLabel: options.confirmLabel || "Confirmar",
          cancelLabel: options.cancelLabel || "Cancelar",
          resolve,
        };
      });
    });
  }, []);

  const close = useCallback((result) => {
    setRequest((current) => {
      current?.resolve(Boolean(result));
      return null;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog
        open={Boolean(request)}
        onClose={() => close(false)}
        title={request?.title || "Confirmar ação"}
        description={request?.message}
        size="small"
        tone={request?.tone === "danger" ? "danger" : "default"}
        initialFocusRef={cancelRef}
        showCloseButton={false}
        actions={request && (
          <>
            <button ref={cancelRef} type="button" className="confirm-button" onClick={() => close(false)}>
              {request.cancelLabel}
            </button>
            <button type="button" className="confirm-button primary" onClick={() => close(true)}>
              {request.confirmLabel}
            </button>
          </>
        )}
      >
        {request && (
          <div className={`confirm-summary ${request.tone}`}>
            <span className="confirm-icon" aria-hidden="true"><FaExclamationTriangle /></span>
            <span>Revise a ação antes de continuar.</span>
          </div>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm deve ser usado dentro de ConfirmProvider");
  return context;
};
