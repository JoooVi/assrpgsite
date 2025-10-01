// src/pages/CharacterPortraitPage.js - VERSÃO ATUALIZADA

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Rating,
} from "@mui/material";
import "./CharacterPortraitPage.css";
import { ReactComponent as HeartFullIcon } from '../assets/icons/heart-full.svg';
import { ReactComponent as HeartEmptyIcon } from '../assets/icons/heart-empty.svg';

// Helper com os nomes e descrições dos 6 Níveis de Saúde
const healthLevelDetails = {
    6: { name: "Saudável" },
    5: { name: "Escoriado" },
    4: { name: "Lacerado" },
    3: { name: "Ferido" },
    2: { name: "Arrebentado" },
    1: { name: "Incapacitado" },
};

// --- COMPONENTES DOS ÍCONES SVG PARA O CABO DE GUERRA ---
const TrackIcon = ({ color, isFilled }) => {
    const fillColor = isFilled ? color : 'none';
    const strokeColor = color;
    return (
      <svg width="32" height="19" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0L0 12L20 24L40 12Z" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
      </svg>
    );
};
  
const DeterminationCircle = ({ level }) => (
    <svg width="40" height="40" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20" stroke="#a73c39" strokeWidth="4" fill="#1a1a1a" /> 
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#fff" fontSize="20" fontWeight="bold">{level}</text>
    </svg>
);

const AssimilationCircle = ({ level }) => (
    <svg width="40" height="40" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20" stroke="#3b4766" strokeWidth="4" fill="#1a1a1a" />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#fff" fontSize="20" fontWeight="bold">{level}</text>
    </svg>
);


const FETCH_INTERVAL = 2500;

const CharacterPortraitPage = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [animationState, setAnimationState] = useState("idle");
  const [animatedRoll, setAnimatedRoll] = useState(null);
  const [lastSeenRollTimestamp, setLastSeenRollTimestamp] = useState(null);

 const fetchCharacterData = useCallback(async () => {
    if (!id) return;
    try {
      // Adicionamos `?t=${new Date().getTime()}` para forçar a busca de dados novos
      const response = await api.get(
        `https://assrpgsite-be-production.up.railway.app/api/public/characters/${id}/portrait?t=${new Date().getTime()}`
      );
      setCharacter(response.data);
    } catch (err) {
      console.error("Polling error:", err);
      // Evita setar erro se já tivermos dados, para não piscar a tela
      if (!character) {
        setError("Falha ao buscar dados do personagem.");
      }
    } finally {
      // Garante que o loading só seja desativado uma vez
      if (loading) setLoading(false);
    }
    // Removemos as dependências desnecessárias para estabilizar a função
  }, [id, character, loading]);

 useEffect(() => {
    document.documentElement.classList.add("portrait-html-active");
    document.body.classList.add("portrait-body-active");
    
    // Busca os dados imediatamente ao carregar a página
    fetchCharacterData();
    
    // Inicia o intervalo que chama a função a cada 2.5 segundos
    const intervalId = setInterval(fetchCharacterData, FETCH_INTERVAL);
    
    // Limpa o intervalo quando o componente é desmontado
    return () => {
      document.documentElement.classList.remove("portrait-html-active");
      document.body.classList.remove("portrait-body-active");
      clearInterval(intervalId);
    };
  }, [fetchCharacterData])

  // Lógica de animação de dados (sem alterações)
  useEffect(() => {
    const lastRoll = character?.lastRoll;
    if (lastRoll?.timestamp && lastRoll.timestamp !== lastSeenRollTimestamp) {
      // ... (código de animação de dados)
    }
  }, [character?.lastRoll, lastSeenRollTimestamp]);


  if (loading || !character) {
    return (
      <Box className="loading-container">
        <CircularProgress sx={{ color: "#FFF" }} />
      </Box>
    );
  }

  // ### LÓGICA DE SAÚDE ATUALIZADA ###
  const currentHealthLevel = character.currentHealthLevel || 6;
  const currentHealthInfo = healthLevelDetails[currentHealthLevel] || { name: "Desconhecido" };
  const currentHealthPoints = character.healthLevels ? character.healthLevels[6 - currentHealthLevel] : 0;
  const maxHealthPerLevel = 1 + (character.instincts?.potency || 0) + (character.instincts?.resolution || 0);

  // ### LÓGICA DO CABO DE GUERRA ATUALIZADA ###
  const { determinationLevel, determinationPoints, assimilationLevel, assimilationPoints } = character;
  const colorDet = "#a73c39";
  const colorAss = "#3b4766";
  const detTrackIcons = Array.from({ length: determinationLevel }, (_, i) => i + 1);
  const assTrackIcons = Array.from({ length: assimilationLevel }, (_, i) => i + 1);

  return (
    <Box className="live-portrait-wrapper">
      {/* ... (lógica de animação de dados - sem alterações) ... */}

      <Paper className="character-portrait-container-tlou" elevation={0}>
        <Box className="portrait-avatar-section-tlou">
          <img
            src={character.avatarUrl || "/default-avatar.png"}
            alt={`${character.name || "Sobrevivente"} avatar`}
            className="portrait-avatar-image-tlou"
          />
        </Box>
        <Box className="status-section-tlou">
          <Typography variant="h5" className="character-name-tlou">
            {character.name || "Sobrevivente Desconhecido"}
          </Typography>

          {/* ### SEÇÃO DE SAÚDE ATUALIZADA ### */}
          <Box className="status-item-tlou health-tlou">
            <Typography className="health-status-tlou">
              STATUS: {currentHealthInfo.name.toUpperCase()}
            </Typography>
            <Rating
  name="health-portrait"
  value={currentHealthPoints}
  max={maxHealthPerLevel}
  readOnly
  className="health-points-rating-tlou"
  icon={<HeartFullIcon width={28} height={28} />}
  emptyIcon={<HeartEmptyIcon width={28} height={28} style={{ opacity: 0.3 }} />}
/>
             <Typography className="health-points-text-tlou">{`${currentHealthPoints} / ${maxHealthPerLevel}`}</Typography>
          </Box>
          
          {/* ### SEÇÃO DO CABO DE GUERRA ATUALIZADA ### */}
          <Box className="status-item-tlou tug-of-war-tlou">
             <div className="tug-of-war-track-tlou">
                <div className="track-end-cap-tlou">
                    <DeterminationCircle level={determinationLevel} />
                </div>
                <div className="track-icons-container-tlou">
                    {detTrackIcons.map((i) => (
                        <TrackIcon key={`det-${i}`} color={colorDet} isFilled={i <= determinationPoints} />
                    ))}
                    {assTrackIcons.map((i) => (
                        <TrackIcon key={`ass-${i}`} color={colorAss} isFilled={i <= assimilationPoints} />
                    ))}
                </div>
                <div className="track-end-cap-tlou">
                    <AssimilationCircle level={assimilationLevel} />
                </div>
            </div>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CharacterPortraitPage;