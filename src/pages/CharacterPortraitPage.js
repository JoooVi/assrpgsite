// src/pages/CharacterPortraitPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
  Rating,
} from "@mui/material";
import TriangleRatingIcon from "../components/TriangleRatingIcon";
import TriangleRatingIconDown from "../components/TriangleRatingIconDown";
import "./CharacterPortraitPage.css";

const translateKey = (key) => {
  const translations = {
    health: "Vitalidade",
    determination: "Determinação",
    assimilation: "Assimilação",
    name: "Nome",
    generation: "Geração",
    occupation: "Ocupação",
    event: "Evento Marcante",
    reaction: "Reação",
    perception: "Percepção",
    sagacity: "Sagacidade",
    potency: "Potência",
    influence: "Influência",
    resolution: "Resolução",
  };
  const lowerKey = key ? key.toLowerCase() : "";
  return (
    translations[lowerKey] ||
    (key ? key.charAt(0).toUpperCase() + key.slice(1) : "")
  );
};

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
      const response = await api.get(
        `https://assrpgsite-be-production.up.railway.app/api/public/characters/${id}/portrait`
      );
      setCharacter(response.data);
    } catch (err) {
      console.error("Polling error:", err);
      if (!character) {
        setError("Falha ao buscar dados do personagem.");
      }
    } finally {
      if (loading) setLoading(false);
    }
  }, [id, loading, character]);

  useEffect(() => {
    document.documentElement.classList.add("portrait-html-active");
    document.body.classList.add("portrait-body-active");
    fetchCharacterData();
    const intervalId = setInterval(fetchCharacterData, FETCH_INTERVAL);
    return () => {
      document.documentElement.classList.remove("portrait-html-active");
      document.body.classList.remove("portrait-body-active");
      clearInterval(intervalId);
    };
  }, [fetchCharacterData]);

  useEffect(() => {
    const lastRoll = character?.lastRoll;
    if (lastRoll?.timestamp && lastRoll.timestamp !== lastSeenRollTimestamp) {
      try {
      const audio = new Audio('/dice.mp3'); 
            audio.volume = 0.5; // Ajuste o volume (0.0 a 1.0)
      audio.play().catch(error => console.error("Erro ao tocar áudio:", error));
    } catch (error) {
      console.error("Não foi possível carregar o arquivo de áudio.", error);
    }
      setAnimatedRoll(lastRoll);
      setLastSeenRollTimestamp(lastRoll.timestamp);
      setAnimationState("entering");

      const enterDuration = 1000;
      const visibleDuration = 5000;
      const leaveDuration = 1000;

      setTimeout(() => setAnimationState("visible"), enterDuration);
      setTimeout(
        () => setAnimationState("leaving"),
        enterDuration + visibleDuration
      );
      setTimeout(() => {
        setAnimationState("idle");
        setAnimatedRoll(null);
      }, enterDuration + visibleDuration + leaveDuration);
    }
  }, [character?.lastRoll, lastSeenRollTimestamp]);

  if (loading || !character) {
    // ... (lógica de loading/erro) ...
    return (
      <Box className="loading-container">
        <CircularProgress sx={{ color: "#FFF" }} />
      </Box>
    );
  }

  const currentHealth = character.healthLevels.reduce(
    (sum, level) => sum + level,
    0
  );
  const maxHealthBasePerLevel =
    Math.max(character.instincts.potency, character.instincts.resolution) + 2;
  const maxTotalHealth = maxHealthBasePerLevel * character.healthLevels.length;
  const healthPercentage =
    maxTotalHealth > 0 ? (currentHealth / maxTotalHealth) * 100 : 0;
  const determinationValue = character.determination || 0;
  const determinationPercentage = (determinationValue / 10) * 100;

  return (
    <Box className="live-portrait-wrapper">
      {animationState !== "idle" && animatedRoll && (
        <Box className={`dice-animation-container ${animationState}`}>
          {animatedRoll.roll.map((die, index) => (
            <Box
              key={index}
              className="individual-die-result"
              // Adicione a linha de estilo abaixo
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src="/dice.png"
                alt="Dado"
                className="individual-die-image"
              />
              <Box className="individual-die-symbols">
                {die.result.length > 0 ? (
                  die.result.map((symbolPath, i) => (
                    <img
                      key={i}
                      src={symbolPath}
                      alt="símbolo"
                      className="symbol-image"
                    />
                  ))
                ) : (
                  <Typography className="individual-die-number">
                    {die.face}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Layout do Portrait (sem alterações) */}
      <Paper className="character-portrait-container-tlou" elevation={0}>
        {/* ... (o resto do seu JSX para avatar e barras continua aqui) ... */}
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
          <Box className="status-item-tlou health-tlou">
            <Box className="health-bar-container-tlou">
              <LinearProgress
                variant="determinate"
                value={healthPercentage}
                className="health-progress-tlou"
              />
              <Typography className="health-text-tlou">{`${currentHealth}/${maxTotalHealth}`}</Typography>
            </Box>
          </Box>
          <Box className="status-item-tlou determination-tlou">
            <Rating
              name="determination-portrait"
              value={determinationValue}
              max={10}
              readOnly
              icon={<TriangleRatingIcon />}
              emptyIcon={<TriangleRatingIcon />}
              className="essence-rating-tlou determination-rating-tlou"
            />
            <Typography className="essence-value-tlou">
              {determinationValue}
            </Typography>
          </Box>
          <Box className="status-item-tlou assimilation-tlou">
            <Rating
              name="assimilation-portrait"
              value={character.assimilation || 0}
              max={10}
              readOnly
              icon={<TriangleRatingIconDown />}
              emptyIcon={<TriangleRatingIconDown />}
              className="essence-rating-tlou assimilation-rating-tlou"
            />
            <Typography className="essence-value-tlou">
              {character.assimilation || 0}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CharacterPortraitPage;