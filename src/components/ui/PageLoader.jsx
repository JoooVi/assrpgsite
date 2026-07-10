import React from "react";
import "./PageLoader.css";

const PageLoader = ({
  title = "Carregando",
  subtitle = "Sincronizando dados do sistema...",
  fullScreen = false,
  compact = false,
}) => {
  return (
    <div className={`page-loader ${fullScreen ? "full-screen" : ""} ${compact ? "compact" : ""}`}>
      <div className="page-loader-card" role="status" aria-live="polite">
        <div className="page-loader-orb" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="page-loader-copy">
          <p className="page-loader-kicker">PROTOCOLO NERO</p>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
