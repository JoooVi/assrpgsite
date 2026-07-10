import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaFilter, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { fetchAllAssimilations } from "../redux/slices/assimilationsSlice";
import EmptyState from "./ui/EmptyState";
import PageLoader from "./ui/PageLoader";
import SystemText from "./SystemText";
import "../pages/Homebrews.css";

const getEvolutionClass = (type) => {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "copas") return "is-copas";
  if (normalized === "espadas" || normalized === "inoportuna") return "is-espadas";
  if (normalized === "paus" || normalized === "singular") return "is-paus";
  if (normalized === "ouros" || normalized === "adaptativa") return "is-ouros";
  return "";
};

const AssimilationsModal = ({ open, handleClose, onItemSelect }) => {
  const dispatch = useDispatch();
  const { allAssimilations = [], userAssimilations = [], loading } = useSelector((state) => state.assimilations);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (open) dispatch(fetchAllAssimilations());
  }, [dispatch, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, open]);

  const combined = useMemo(() => (
    [...allAssimilations, ...userAssimilations].reduce((acc, current) => {
      const exists = acc.find((item) => item._id === current._id);
      return exists ? acc : acc.concat([current]);
    }, [])
  ), [allAssimilations, userAssimilations]);

  const categories = useMemo(() => (
    [...new Set(combined.map((item) => item.category))].filter(Boolean)
  ), [combined]);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return combined
      .filter((item) => !selectedCategory || item.category === selectedCategory)
      .filter((item) => {
        if (!search) return true;
        return [item.name, item.category, item.description, item.evolutionType]
          .some((field) => String(field || "").toLowerCase().includes(search));
      });
  }, [combined, searchTerm, selectedCategory]);

  if (!open) return null;

  return (
    <div className="hb-picker-overlay" onClick={(event) => event.target === event.currentTarget && handleClose()}>
      <section className="hb-picker-panel">
        <header className="hb-picker-header">
          <div>
            <span>Assimilação</span>
            <h2>Selecionar assimilação</h2>
          </div>
          <button type="button" className="hb-picker-close" onClick={handleClose} aria-label="Fechar">
            <FaTimes />
          </button>
        </header>

        <div className="hb-picker-controls">
          <div className="hb-picker-filter-row">
            <label className="hb-picker-search">
              <FaSearch />
              <input
                className="nero-input"
                placeholder="Buscar assimilação..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <label className="hb-picker-search">
              <FaFilter />
              <select
                className="nero-select"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="hb-picker-scroll">
          {loading ? (
            <PageLoader title="Carregando assimilações" subtitle="Consultando biblioteca genética..." compact />
          ) : (
            <div className="hb-picker-list">
              {filtered.map((item) => {
                const isExpanded = expandedId === item._id;
                return (
                  <article key={item._id} className={`hb-card hb-picker-entry ${isExpanded ? "expanded" : ""}`}>
                    <button type="button" className="hb-card-header" onClick={() => setExpandedId(isExpanded ? null : item._id)}>
                      <div>
                        <span className={`hb-card-title hb-evolution-title ${getEvolutionClass(item.evolutionType)}`}>{item.name}</span>
                        <span className="hb-card-subtitle">
                          {item.category || "Sem categoria"} • {item.evolutionType || "Sem evolução"}
                        </span>
                      </div>
                      {item.isCustom && <span className="hb-homebrew-badge">HB</span>}
                    </button>

                    {isExpanded && (
                      <div className="hb-card-body">
                        <div className="hb-assimilation-metrics">
                          <div><span>Sucessos</span><strong>{item.successCost ?? 0}</strong></div>
                          <div><span>Adaptações</span><strong>{item.adaptationCost ?? 0}</strong></div>
                          <div><span>Pressão</span><strong>{item.pressureCost ?? 0}</strong></div>
                        </div>
                        <p className="hb-picker-description"><SystemText text={item.description || "Sem descrição registrada."} /></p>
                        <button className="btn-nero btn-primary hb-picker-select" onClick={() => onItemSelect(item)}>
                          <FaPlus /> Selecionar
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}

              {filtered.length === 0 && (
                <EmptyState
                  compact
                  title="Nenhuma assimilação encontrada"
                  description="Tente ajustar a busca ou remover o filtro de categoria."
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AssimilationsModal;
