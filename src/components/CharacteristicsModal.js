import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FaChevronDown, FaChevronUp, FaExclamationTriangle, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import EmptyState from "./ui/EmptyState";
import SystemText from "./SystemText";
import "../pages/Homebrews.css";

const formatDescription = (text = "") => {
  const requirementRegex = /^(Requisito:.*?\.)(.*)/s;
  const match = text.match(requirementRegex);

  if (!match) {
    return <div className="trait-description-text"><SystemText text={text || "Sem descrição registrada."} /></div>;
  }

  return (
    <>
      <div className="trait-requirement-badge">
        <FaExclamationTriangle />
        <strong>REQUISITO:</strong> <SystemText text={match[1].replace("Requisito:", "").trim()} />
      </div>
      <div className="trait-description-text"><SystemText text={match[2].trim()} /></div>
    </>
  );
};

const CharacteristicsModal = ({
  open,
  handleClose,
  items = [],
  homebrewItems = [],
  onItemSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const { characterTraits = [] } = useSelector((state) => state.characteristics);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, open]);

  const filteredList = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const traitsPool = items.length > 0 ? items : characterTraits;
    const displayList = homebrewItems.length > 0 ? [...traitsPool, ...homebrewItems] : [...traitsPool];

    return displayList
      .filter((item, index, self) => self.findIndex((trait) => trait._id === item._id) === index)
      .filter((item) => {
        if (!search) return true;
        return [item.name, item.category, item.description]
          .some((field) => String(field || "").toLowerCase().includes(search));
      });
  }, [characterTraits, homebrewItems, items, searchTerm]);

  if (!open) return null;

  return (
    <div className="hb-picker-overlay" onClick={(event) => event.target === event.currentTarget && handleClose()}>
      <section className="hb-picker-panel">
        <header className="hb-picker-header">
          <div>
            <span>Traços</span>
            <h2>Selecionar característica</h2>
          </div>
          <button type="button" className="hb-picker-close" onClick={handleClose} aria-label="Fechar">
            <FaTimes />
          </button>
        </header>

        <div className="hb-picker-controls">
          <label className="hb-picker-search">
            <FaSearch />
            <input
              type="text"
              className="nero-input"
              placeholder="Buscar característica..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="hb-picker-scroll">
          <div className="hb-picker-list">
            {filteredList.map((item) => {
              const isExpanded = expandedId === item._id;
              return (
                <article key={item._id} className={`hb-card hb-picker-entry ${isExpanded ? "expanded" : ""}`}>
                  <button type="button" className="hb-card-header" onClick={() => setExpandedId(isExpanded ? null : item._id)}>
                    <div>
                      <span className={`hb-card-title ${isExpanded ? "is-active" : ""}`}>{item.name}</span>
                      <span className="hb-card-subtitle">
                        {item.category || "Geral"} • {item.pointsCost ?? 0} pontos
                      </span>
                    </div>
                    <div className="hb-picker-card-meta">
                      {item.isCustom && <span className="hb-homebrew-badge">HB</span>}
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="hb-card-body">
                      <div className="hb-trait-summary">
                        <div><span>Categoria</span><strong>{item.category || "Geral"}</strong></div>
                        <div><span>Custo</span><strong>{item.pointsCost ?? 0} pontos</strong></div>
                      </div>
                      <div className="hb-picker-description">{formatDescription(item.description)}</div>
                      <button className="btn-nero btn-primary hb-picker-select" onClick={() => onItemSelect(item)}>
                        <FaPlus /> Adicionar
                      </button>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredList.length === 0 && (
              <EmptyState
                compact
                title="Nenhuma característica encontrada"
                description="Tente ajustar a busca ou cadastrar uma nova característica."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharacteristicsModal;
