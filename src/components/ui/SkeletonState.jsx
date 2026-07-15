import React from "react";
import "./SkeletonState.css";

const SkeletonState = ({ variant = "cards", count = 3, label = "Carregando conteúdo" }) => (
  <section className={`skeleton-state skeleton-${variant}`} aria-busy="true" aria-label={label}>
    {Array.from({ length: count }, (_, index) => (
      <div className="skeleton-item" key={index} aria-hidden="true">
        <span className="skeleton-media" />
        <span className="skeleton-line skeleton-line-title" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line-short" />
      </div>
    ))}
    <span className="sr-only">{label}</span>
  </section>
);

export default SkeletonState;
