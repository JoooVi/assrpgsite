import React from "react";
import { FaSatelliteDish } from "react-icons/fa";
import "./EmptyState.css";

const EmptyState = ({
  icon,
  title = "Nada encontrado",
  description = "Não há dados para exibir agora.",
  action,
  primaryAction,
  secondaryAction,
  compact = false,
}) => {
  return (
    <div className={`empty-state ${compact ? "compact" : ""}`}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon || <FaSatelliteDish />}
      </div>
      <div className="empty-state-copy">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {(action || primaryAction || secondaryAction) && (
        <div className="empty-state-action">
          {action || <>{primaryAction}{secondaryAction}</>}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
