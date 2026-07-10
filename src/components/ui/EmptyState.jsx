import React from "react";
import { FaSatelliteDish } from "react-icons/fa";
import "./EmptyState.css";

const EmptyState = ({
  icon,
  title = "Nada encontrado",
  description = "Nao ha dados para exibir agora.",
  action,
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
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
