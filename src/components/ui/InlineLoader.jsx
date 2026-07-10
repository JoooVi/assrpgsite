import React from "react";
import "./InlineLoader.css";

const InlineLoader = ({ label = "Processando" }) => (
  <span className="inline-loader" aria-live="polite">
    <span className="inline-loader-ring" aria-hidden="true" />
    <span>{label}</span>
  </span>
);

export default InlineLoader;
