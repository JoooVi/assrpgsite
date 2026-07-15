import React, { useEffect, useMemo, useState } from "react";
import Dialog from "./ui/Dialog";
import DiceFace from "./DiceFace";
import { getRollPileBreakdown, summarizeRoll } from "../utils/assimilationDice";
import "./RollKeepSelector.css";

const RollKeepSelector = ({
  open,
  rollData,
  keepCount = 1,
  onConfirm,
  onCancel,
}) => {
  const dice = useMemo(() => rollData?.roll || [], [rollData]);
  const required = Math.max(1, Math.min(Number(keepCount) || 1, dice.length || 1));
  const pileSources = useMemo(
    () => getRollPileBreakdown(rollData?.formula, rollData?.pileSources),
    [rollData],
  );
  const rollMode = rollData?.rollMode || (required > 1 ? "assimilation" : "manual");
  const ruleLabel = rollData?.selectionRule?.label
    || (rollMode === "assimilation" ? "Escolha assimilada" : "Escolha padrão");
  const ruleReason = rollData?.selectionRule?.reason
    || (required > 1 ? `Mantenha ${required} resultados desta pilha.` : "Mantenha um resultado desta pilha.");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    const alreadyKept = dice
      .map((die, index) => die?.kept === true ? index : -1)
      .filter((index) => index >= 0)
      .slice(0, required);
    setSelected(alreadyKept);
  }, [dice, open, required]);

  if (!open || !rollData) return null;

  const toggleDie = (index) => {
    setSelected((current) => {
      if (current.includes(index)) return current.filter((value) => value !== index);
      if (current.length >= required) {
        return required === 1 ? [index] : [...current.slice(1), index];
      }
      return [...current, index];
    });
  };

  const selectedRoll = dice.map((die, index) => ({ ...die, kept: selected.includes(index) }));
  const summary = summarizeRoll(selectedRoll);
  const canConfirm = selected.length === required;

  return (
    <Dialog
      open
      onClose={onCancel}
      title="Escolha o resultado"
      description={`Selecione ${required === 1 ? "1 dado para manter" : `${required} dados para manter`}.`}
      size="medium"
      className="roll-keep-dialog"
      actions={(
        <>
          <button type="button" className="roll-keep-cancel" onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="roll-keep-confirm"
            disabled={!canConfirm}
            onClick={() => onConfirm?.({
              ...rollData,
              rollMode,
              selection: {
                keepCount: required,
                selectedIndexes: selected,
                label: ruleLabel,
                reason: ruleReason,
              },
              roll: selectedRoll,
            })}
          >
            Manter resultado
          </button>
        </>
      )}
    >
      <div className="roll-keep-context">
        <div>
          <span className="roll-keep-kicker">{rollMode === "assimilation" ? "Assimilação" : rollMode === "skill" ? "Teste" : "Rolagem livre"}</span>
          <strong>{rollData.skill || "Rolagem livre"}</strong>
        </div>
        <code>{rollData.formula}</code>
      </div>
      <div className="roll-keep-rule">
        <div>
          <strong>{ruleLabel}</strong>
          <span>{ruleReason}</span>
        </div>
        <b>{selected.length}/{required}</b>
      </div>
      <div className="roll-keep-pile" aria-label="Composição da pilha">
        {pileSources.map((source, index) => (
          <span key={`${source.label}-${source.sides}-${index}`}>
            <small>{source.label}</small>
            <strong>{source.count}d{source.sides}</strong>
          </span>
        ))}
      </div>
      <div className="roll-keep-grid" role="group" aria-label="Dados rolados">
        {dice.map((die, index) => {
          const isSelected = selected.includes(index);
          return (
            <button
              key={`${die.sides}-${die.face}-${index}`}
              type="button"
              className={`roll-keep-die ${isSelected ? "roll-keep-die--selected" : ""}`}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Remover" : "Manter"} dado d${die.sides}`}
              onClick={() => toggleDie(index)}
            >
              <DiceFace die={die} size={58} />
              <span>{isSelected ? "Mantido" : "Selecionar"}</span>
            </button>
          );
        })}
      </div>
      <div className="roll-keep-summary" aria-live="polite">
        <span><strong>{summary.successes}</strong> {summary.successes === 1 ? "Sucesso" : "Sucessos"}</span>
        {summary.adaptations > 0 && <span><strong>{summary.adaptations}</strong> {summary.adaptations === 1 ? "Adaptação" : "Adaptações"}</span>}
        {summary.pressures > 0 && <span><strong>{summary.pressures}</strong> {summary.pressures === 1 ? "Pressão" : "Pressões"}</span>}
      </div>
    </Dialog>
  );
};

export default RollKeepSelector;
