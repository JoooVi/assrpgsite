import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ items = [], className = "" }) => {
  if (items.length < 2) return null;

  return (
    <nav className={`nero-breadcrumbs ${className}`.trim()} aria-label="Caminho da página">
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 && <FaChevronRight aria-hidden="true" />}
              {isCurrent || !item.to ? (
                <span aria-current={isCurrent ? "page" : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
