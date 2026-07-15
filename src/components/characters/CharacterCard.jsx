import React from "react";
import { Link } from "react-router-dom";
import { FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";
import "./CharacterCard.css";

const getFallbackAvatar = (character) => {
  const seed = String(character?._id || character?.name || "personagem");
  const avatarSvg = createAvatar(adventurerNeutral, { seed: [seed] }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;
};

const getAvatar = (character) => character?.avatar || getFallbackAvatar(character);

const CharacterCard = ({ character, onDelete, compact = false, deleting = false, canDelete = true }) => (
  <article className={`characterCard ${compact ? "compact" : ""}`}>
    <Link className="characterCardMain" to={`/character-sheet/${character._id}`} aria-label={`Abrir ficha de ${character.name}`}>
      <div className="cardImageContainer">
        <img
          className="cardImage"
          src={getAvatar(character)}
          alt={`Retrato de ${character.name}`}
          onError={(event) => {
            const fallback = getFallbackAvatar(character);
            if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
          }}
        />
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
