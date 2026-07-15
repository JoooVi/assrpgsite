import React, { useCallback, useEffect, useRef } from "react";
import api from "../api";
import { dispatchToast } from "./notifications/ToastProvider";
import determinationPointIcon from "../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_determinacao_cima_NOVO.png";
import assimilationPointIcon from "../assets/icons/ICONES_PONTOS_NIVEIS_ASSIMILACAO_DETERMINACAO_pontos_assimilacao_baixo_NOVA.png";
import styles from "./TugOfWar.module.css";

const clampResource = (value) => Math.min(10, Math.max(0, Number(value) || 0));

const ResourceMeter = ({ label, level, points, icon, color, isReadOnly, onLevelChange, onPointsChange }) => (
  <section className={styles.resourceMeter} style={{ "--resource-color": color }}>
    <div className={styles.resourceHeader}>
      <span className={styles.resourceName}><img src={icon} alt="" />{label}</span>
      <label className={styles.levelField} title={`Editar nível de ${label}`}>
        <small>Nível</small>
        <input
          type="number"
          min="0"
          max="10"
          value={level}
          disabled={isReadOnly}
          onChange={(event) => onLevelChange(event.target.value)}
          aria-label={`Nível de ${label}`}
        />
      </label>
    </div>

    <div className={styles.pointsRow}>
      <span>Pontos</span>
      <strong className={points > level ? styles.warningValue : ""}>{points}<small>/{level}</small></strong>
    </div>

    <div className={styles.pointTrack} aria-label={`${points} Pontos de ${label}`}>
      {Array.from({ length: 10 }, (_, index) => {
        const point = index + 1;
        return (
          <button
            key={point}
            type="button"
            disabled={isReadOnly || point > level}
            className={`${styles.point} ${point <= points ? styles.pointAvailable : ""} ${point > level ? styles.pointBeyondLevel : ""}`}
            onClick={() => onPointsChange(points === point ? point - 1 : point)}
            title={`${point <= points ? "Remover" : "Definir"} ${point} ${point === 1 ? "ponto" : "pontos"}`}
            aria-label={`${point <= points ? "Remover" : "Definir"} ponto ${point} de ${label}`}
          />
        );
      })}
    </div>
  </section>
);

const TugOfWar = ({ character, setCharacter, isReadOnly = false }) => {
  const saveTimerRef = useRef(null);
  const latestStateRef = useRef(character);
  const characterIdRef = useRef(character?._id);

  useEffect(() => {
    latestStateRef.current = character;
    characterIdRef.current = character?._id;
  }, [character]);

  const persistState = useCallback(async (updated) => {
    const characterId = characterIdRef.current;
    if (!characterId || isReadOnly) return;
    try {
      await api.put(`/characters/${characterId}/tugofwar`, {
        determinationLevel: updated.determinationLevel,
        determinationPoints: updated.determinationPoints,
        assimilationLevel: updated.assimilationLevel,
        assimilationPoints: updated.assimilationPoints,
      });
    } catch (error) {
      dispatchToast({
        type: "error",
        message: error.response?.data?.message || "Não foi possível atualizar o Cabo de Guerra.",
      });
    }
  }, [isReadOnly]);

  const scheduleSave = useCallback((updated) => {
    latestStateRef.current = updated;
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      persistState(updated);
    }, 240);
  }, [persistState]);

  useEffect(() => () => {
    if (!saveTimerRef.current) return;
    window.clearTimeout(saveTimerRef.current);
    persistState(latestStateRef.current);
  }, [persistState]);

  if (!character) return null;

  const updateState = (patchOrUpdater) => {
    if (isReadOnly) return;
    setCharacter((current) => {
      const patch = typeof patchOrUpdater === "function"
        ? patchOrUpdater(current)
        : patchOrUpdater;
      const updated = { ...current, ...patch };
      scheduleSave(updated);
      return updated;
    });
  };

  const determinationLevel = clampResource(character.determinationLevel);
  const assimilationLevel = clampResource(character.assimilationLevel);
  const determinationPoints = clampResource(character.determinationPoints);
  const assimilationPoints = clampResource(character.assimilationPoints);
  const levelTotal = determinationLevel + assimilationLevel;
  const followsStandardBalance = levelTotal === 10;
  const hasPointsBeyondLevel = determinationPoints > determinationLevel || assimilationPoints > assimilationLevel;

  const handleBalanceChange = (event) => {
    const nextDetermination = clampResource(event.target.value);
    const nextAssimilation = 10 - nextDetermination;
    updateState((current) => ({
      determinationLevel: nextDetermination,
      determinationPoints: Math.min(clampResource(current.determinationPoints), nextDetermination),
      assimilationLevel: nextAssimilation,
      assimilationPoints: Math.min(clampResource(current.assimilationPoints), nextAssimilation),
    }));
  };

  const updateLevel = (levelKey, pointsKey, value) => {
    const nextLevel = clampResource(value);
    updateState((current) => ({
      [levelKey]: nextLevel,
      [pointsKey]: Math.min(clampResource(current[pointsKey]), nextLevel),
    }));
  };

  const isStandardExtreme = followsStandardBalance
    && ((determinationLevel === 10 && assimilationLevel === 0)
      || (determinationLevel === 0 && assimilationLevel === 10));

  const status = !followsStandardBalance
    ? `Configuração livre: níveis somam ${levelTotal}.`
    : hasPointsBeyondLevel
      ? "Há pontos acima do nível; configuração da mesa preservada."
      : !isStandardExtreme && determinationPoints === 0
        ? "Determinação esgotada: personagem suscetível."
        : !isStandardExtreme && assimilationPoints === 0
          ? "Assimilação esgotada: custos podem usar 2 DET."
          : "";

  return (
    <div className={styles.tugOfWar}>
      <div className={styles.titleRow}>
        <h3>Cabo de Guerra</h3>
        {!followsStandardBalance && <span>Modo livre</span>}
      </div>

      <div className={styles.meters}>
        <ResourceMeter
          label="Determinação"
          level={determinationLevel}
          points={determinationPoints}
          icon={determinationPointIcon}
          color="#4e0202"
          isReadOnly={isReadOnly}
          onLevelChange={(value) => updateLevel("determinationLevel", "determinationPoints", value)}
          onPointsChange={(value) => updateState({ determinationPoints: Math.min(clampResource(value), determinationLevel) })}
        />
        <ResourceMeter
          label="Assimilação"
          level={assimilationLevel}
          points={assimilationPoints}
          icon={assimilationPointIcon}
          color="#02425f"
          isReadOnly={isReadOnly}
          onLevelChange={(value) => updateLevel("assimilationLevel", "assimilationPoints", value)}
          onPointsChange={(value) => updateState({ assimilationPoints: Math.min(clampResource(value), assimilationLevel) })}
        />
      </div>

      {!isReadOnly && (
        <div className={styles.balanceSlider}>
          <span>Determinação</span>
          <input type="range" min="0" max="10" value={determinationLevel} onChange={handleBalanceChange} aria-label="Equilíbrio padrão entre Determinação e Assimilação" />
          <span>Assimilação</span>
        </div>
      )}

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};

export default TugOfWar;
