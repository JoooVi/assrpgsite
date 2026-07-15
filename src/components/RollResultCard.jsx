import React from "react";
import DiceFace from "./DiceFace";
import { formatRollAccessibleText, getKeptDice, pluralizeRollCount, summarizeRoll } from "../utils/assimilationDice";
import "./RollResultCard.css";

const timeLabel = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const isoTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const metricItems = (summary) => [
  { key: "adaptation", value: summary.adaptations, singular: "Adaptação", plural: "Adaptações" },
  { key: "pressure", value: summary.pressures, singular: "Pressão", plural: "Pressões" },
].filter((item) => item.value > 0);

const RollResultCard = ({
  roll,
  actorName,
  actionLabel,
  formula,
  timestamp,
  selection,
  variant = "full",
  recent = false,
  className = "",
}) => {
  const dice = Array.isArray(roll) ? roll : [];
  const summary = summarizeRoll(dice);
  const { dice: keptDice, hasExplicitSelection } = getKeptDice(dice);
  const discardedDice = hasExplicitSelection ? dice.filter((die) => die?.kept !== true) : [];
  const metrics = metricItems(summary);
  const compact = variant === "compact";
  const diceSize = compact ? 38 : variant === "latest" ? 56 : 48;
  const discardedDiceSize = compact ? 27 : 32;
  const isUnresolvedPile = !summary.hasExplicitSelection && dice.length > 1;
  const mainResult = summary.successes > 0
    ? pluralizeRollCount(summary.successes, "Sucesso", "Sucessos")
    : "Sem sucessos";
  const resultContext = isUnresolvedPile
    ? "Rolagem de pilha"
    : summary.hasExplicitSelection
      ? (selection?.label || "Resultado mantido")
      : "Resultado da rolagem";
  const accessibleText = formatRollAccessibleText({ actorName, actionLabel, formula, roll: dice });

  return (
    <article
      className={`roll-result-card roll-result-card--${variant} ${recent ? "roll-result-card--recent" : ""} ${className}`.trim()}
      aria-label={accessibleText}
      aria-live={recent ? "polite" : undefined}
    >
      <div className="roll-result-card__header">
        <div className="roll-result-card__identity">
          {actionLabel
            ? <strong title={actionLabel}>{actionLabel}</strong>
            : actorName && <strong title={actorName}>{actorName}</strong>}
          {actionLabel && actorName && <span title={actorName}>{actorName}</span>}
        </div>
        {timestamp && <time dateTime={isoTimestamp(timestamp)}>{timeLabel(timestamp)}</time>}
      </div>

      <div className="roll-result-card__result">
        <strong>{mainResult}</strong>
        <span>{resultContext}</span>
      </div>

      <div className={`roll-result-card__kept ${hasExplicitSelection ? "roll-result-card__kept--selected" : ""}`}>
        {hasExplicitSelection && <span className="roll-result-card__dice-label">Resultado escolhido</span>}
        <div className="roll-result-card__dice" aria-hidden="true">
          {keptDice.map((die, index) => (
            <DiceFace
              key={`kept-${die?.sides || "x"}-${die?.face || "x"}-${index}`}
              die={die}
              size={diceSize}
              label={!compact}
              className={hasExplicitSelection ? "dice-face--kept" : ""}
            />
          ))}
        </div>
      </div>

      {discardedDice.length > 0 && (
        <div className="roll-result-card__discarded">
          <span className="roll-result-card__dice-label">Dado Descartado</span>
          <div className="roll-result-card__discarded-dice" aria-hidden="true">
            {discardedDice.map((die, index) => (
          <DiceFace
                key={`discarded-${die?.sides || "x"}-${die?.face || "x"}-${index}`}
            die={die}
                size={discardedDiceSize}
                label={false}
                className="dice-face--discarded"
          />
        ))}
          </div>
      </div>
      )}

      <div className="roll-result-card__footer">
        <div className="roll-result-card__metrics">
          {metrics.length ? metrics.map((item) => (
            <span key={item.key} className={`roll-result-card__metric roll-result-card__metric--${item.key}`}>
              {pluralizeRollCount(item.value, item.singular, item.plural)}
            </span>
          )) : summary.successes === 0 && <span className="roll-result-card__empty">Nenhum símbolo no resultado</span>}
        </div>
        <div className="roll-result-card__technical">
          {selection?.keepCount > 0 && <span>{selection.keepCount} mantido{selection.keepCount === 1 ? "" : "s"}</span>}
          {formula && <code>{formula}</code>}
        </div>
      </div>
    </article>
  );
};

export default RollResultCard;
