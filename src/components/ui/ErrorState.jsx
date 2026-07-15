import React, { useState } from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";
import "./ErrorState.css";

const ErrorState = ({
  title = "Não foi possível concluir esta ação",
  description = "Tente novamente. Se o problema continuar, verifique sua conexão.",
  onRetry,
  retryLabel = "Tentar novamente",
  action,
  compact = false,
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <section className={`error-state ${compact ? "compact" : ""}`} role="alert" aria-live="assertive" aria-busy={retrying}>
      <div className="error-state-icon" aria-hidden="true"><FaExclamationTriangle /></div>
      <div className="error-state-copy">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {(onRetry || action) && (
        <div className="error-state-actions">
          {onRetry && (
            <button type="button" className="btn-nero" onClick={handleRetry} disabled={retrying}>
              <FaRedo aria-hidden="true" /> {retrying ? "Tentando..." : retryLabel}
            </button>
          )}
          {action}
        </div>
      )}
    </section>
  );
};

export default ErrorState;
