// src/components/TugOfWar.js - VERSÃO FINAL COM ÍCONES SÓLIDOS/VAZADOS

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import axios from 'axios';
import styles from '../styles/TugOfWar.module.css';

// --- COMPONENTES DOS ÍCONES SVG ---

// ### MUDANÇA PRINCIPAL AQUI ###
// O ícone agora tem dois visuais: sólido ou vazado, controlado pela prop 'isFilled'.
const TrackIcon = ({ color, isFilled, onClick, isClickable }) => {
  const fillColor = isFilled ? color : 'none'; // Se não estiver preenchido, o fundo é transparente.
  const strokeColor = color; // A cor do contorno é sempre a mesma.

  return (
    <svg 
      width="40" 
      height="24" 
      viewBox="0 0 40 24" 
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={isClickable ? styles.clickableIcon : ''}
    >
      <path 
        d="M20 0L0 12L20 24L40 12Z" // O caminho do losango sólido
        fill={fillColor} 
        stroke={strokeColor} 
        strokeWidth="2.5" // A espessura do contorno
      />
    </svg>
  );
};


const DeterminationCircle = ({ level }) => (
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20" stroke="#a73c39" strokeWidth="4" fill="#fdfaf5" /> 
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#a73c39" fontSize="20" fontWeight="bold">{level}</text>
    </svg>
);

const AssimilationCircle = ({ level }) => (
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20" stroke="#3b4766" strokeWidth="4" fill="#fdfaf5" />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#3b4766" fontSize="20" fontWeight="bold">{level}</text>
    </svg>
);


const TugOfWar = ({ character, setCharacter }) => {
  // A lógica de salvar, gastar pontos e cair de nível continua a mesma.
  const saveStateToBackend = async (updatedState) => {
    try {
      const token = localStorage.getItem("token");
      const apiState = {
        determinationLevel: updatedState.determinationLevel,
        determinationPoints: updatedState.determinationPoints,
        assimilationLevel: updatedState.assimilationLevel,
        assimilationPoints: updatedState.assimilationPoints,
      }
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${character._id}/tugofwar`,
        apiState,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Erro ao salvar o estado de Determinação/Assimilação:", error);
    }
  };

  const handleSetPoints = (type, value) => {
    if (!character) return;
    
    let updatedState = { ...character };

    if (type === 'determination') {
        const newPoints = value === character.determinationPoints ? value - 1 : value;
        updatedState.determinationPoints = newPoints;

        if (newPoints <= 0 && character.determinationLevel > 0) {
            updatedState.determinationLevel -= 1;
            updatedState.assimilationLevel += 1;
            updatedState.determinationPoints = updatedState.determinationLevel;
            updatedState.assimilationPoints = updatedState.assimilationLevel;
            alert("Você gastou seu último ponto de Determinação e seu Nível caiu!");
        }
    } else if (type === 'assimilation') {
        const newPoints = value === character.assimilationPoints ? value - 1 : value;
        updatedState.assimilationPoints = newPoints;
    }
    
    setCharacter(updatedState);
    saveStateToBackend(updatedState);
  };

  const handleConvertDetToAss = () => {
    if (character.determinationPoints < 2) return;

    const newDetPoints = character.determinationPoints - 2;
    const newAssPoints = Math.min(character.assimilationLevel, character.assimilationPoints + 1);

    const updatedState = {
      ...character,
      determinationPoints: newDetPoints,
      assimilationPoints: newAssPoints,
    };

    setCharacter(updatedState);
    saveStateToBackend(updatedState);
  };

  const renderTrack = () => {
    const trackItems = [];
    const colorDet = "#a73c39";
    const colorAss = "#3b4766";

    // Adiciona os ícones de Determinação
    for (let i = 1; i <= character.determinationLevel; i++) {
        const isFilled = i <= character.determinationPoints; // Verifica se este ponto está "preenchido"
        trackItems.push(
            <TrackIcon 
                key={`det-${i}`} 
                color={colorDet}
                isFilled={isFilled} // Passa a informação para o componente do ícone
                onClick={() => handleSetPoints('determination', i)}
                isClickable={true}
            />
        );
    }

    // Adiciona os ícones de Assimilação
    for (let i = 1; i <= character.assimilationLevel; i++) {
        const isFilled = i <= character.assimilationPoints;
        trackItems.push(
            <TrackIcon 
                key={`ass-${i}`} 
                color={colorAss}
                isFilled={isFilled}
                onClick={() => handleSetPoints('assimilation', i)}
                isClickable={true}
            />
        );
    }

    return (
      <div className={styles.track}>
        <div className={styles.trackEndCap}>
            <DeterminationCircle level={character.determinationLevel} />
        </div>
        <div className={styles.trackIconsContainer}>
            {trackItems}
        </div>
        <div className={styles.trackEndCap}>
            <AssimilationCircle level={character.assimilationLevel} />
        </div>
      </div>
    );
  };

  return (
    <Paper elevation={0} className={styles.container}>
      <Typography variant="h6" gutterBottom className={styles.title}>
        Assimilação & Determinação
      </Typography>
      
      {renderTrack()}
      
      <div className={styles.controlsContainer}>
        <div className={styles.controlSection}>
          <Typography variant="h6" className={styles.pointsText}>
            <strong>{character.determinationPoints}</strong>
            <span className={styles.levelText}> Pontos de Determinação</span>
          </Typography>
        </div>
        <div className={styles.controlSection}>
          <Typography variant="h6" className={styles.pointsText}>
            <strong>{character.assimilationPoints}</strong>
            <span className={styles.levelText}> Pontos de Assimilação</span>
          </Typography>
        </div>
      </div>

      <div className={styles.conversionSection}>
        <Button
          variant="contained"
          onClick={handleConvertDetToAss}
          disabled={character.determinationPoints < 2}
        >
          Converter 2 DET p/ 1 Ponto de ASS
        </Button>
      </div>
    </Paper>
  );
};

export default TugOfWar;