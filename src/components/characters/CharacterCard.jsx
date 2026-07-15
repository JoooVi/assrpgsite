import React from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import "./CharacterCard.css";

const getAvatar = (character) => {
  if (character.avatar) return character.avatar;
  const initial = String(character.name || "?")
    .trim()
    .charAt(0)
    .toUpperCase()
    .replace(/[<>&"']/g, "") || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320" viewBox="0 0 240 320"><rect width="240" height="320" fill="#080808"/><circle cx="120" cy="135" r="58" fill="#8a1c18" opacity=".78"/><text x="120" y="155" fill="#fff" font-family="Arial,sans-serif" font-size="64" font-weight="700" text-anchor="middle">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CharacterCard = ({ character, onDelete, compact = false, deleting = false, canDelete = true }) => (
  <article className={`characterCard ${compact ? "compact" : ""}`}>
    <Link className="characterCardMain" to={`/character-sheet/${character._id}`} aria-label={`Abrir ficha de ${character.name}`}>
      <div className="cardImageContainer">
        <img className="cardImage" src={getAvatar(character)} alt={`Retrato de ${character.name}`} />
      </div>
      <div className="cardInfo">
        <h2 className="characterName">{character.name}</h2>
        <p className="characterSubtitle">{character.occupation || "Ocupação não informada"}</p>
      </div>
    </Link>

    <div className="cardHoverActions" aria-label={`Ações de ${character.name}`}>
      {!compact && (
        <Link
          className="actionIcon"
          to={`/character-portrait/${character._id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir portrait de ${character.name}`}
          title="Abrir portrait"
        >
          <FaExternalLinkAlt aria-hidden="true" />
        </Link>
      )}
      {onDelete && canDelete && (
        <button
          type="button"
          className="actionIcon danger"
          onClick={() => onDelete(character)}
          disabled={deleting}
          aria-label={`Excluir personagem ${character.name}`}
          title="Excluir personagem"
        >
          <FaTrash aria-hidden="true" />
        </button>
      )}
    </div>
  </article>
);

export default CharacterCard;
