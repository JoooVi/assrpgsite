// src/pages/CharacterPortraitPage.js

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./CharacterPortraitPage.css";

// SVG Components
import { ReactComponent as HeartFullIcon } from '../assets/icons/heart-full.svg';
import { ReactComponent as HeartEmptyIcon } from '../assets/icons/heart-empty.svg';

// Images
import bruisedOverlay from '../assets/damage_overlays/escoriado.png';
import laceratedOverlay from '../assets/damage_overlays/lacerado.png';
import injuredOverlay from '../assets/damage_overlays/ferido.png';
import brokenOverlay from '../assets/damage_overlays/arrebentado.png';
import incapacitatedOverlay from '../assets/damage_overlays/incapacitado.png';

// Helpers
const healthLevelDetails = {
    6: { name: "Saudável" },
    5: { name: "Escoriado" },
    4: { name: "Lacerado" },
    3: { name: "Ferido" },
    2: { name: "Arrebentado" },
    1: { name: "Incapacitado" },
};

const healthLevelColors = {
    6: "#4caf50", 5: "#fdd835", 4: "#fb8c00", 3: "#f44336", 2: "#d32f2f", 1: "#b71c1c",
};

const damageOverlays = {
    6: null,
    5: bruisedOverlay, 4: laceratedOverlay, 3: injuredOverlay, 
    2: brokenOverlay, 1: incapacitatedOverlay,
};

// Componentes Visuais (Tracks e Círculos)
const TrackIcon = ({ color, isFilled }) => (
  <svg width="24" height="14" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0L0 12L20 24L40 12Z" fill={isFilled ? color : 'none'} stroke={color} strokeWidth="3" />
  </svg>
);
  
const DeterminationCircle = ({ level }) => (
    <svg width="40" height="40" viewBox="0 0 44 44" style={{filter: 'drop-shadow(0 2px 4px #000)'}}>
        <circle cx="22" cy="22" r="20" stroke="#a73c39" strokeWidth="4" fill="#1a1a1a" /> 
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="Roboto">{level}</text>
    </svg>
);

const AssimilationCircle = ({ level }) => (
    <svg width="40" height="40" viewBox="0 0 44 44" style={{filter: 'drop-shadow(0 2px 4px #000)'}}>
        <circle cx="22" cy="22" r="20" stroke="#3b4766" strokeWidth="4" fill="#1a1a1a" />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="Roboto">{level}</text>
    </svg>
);

const FETCH_INTERVAL = 2500;

const CharacterPortraitPage = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll de dados
  const fetchCharacterData = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(
        `https://assrpgsite-be-production.up.railway.app/api/public/characters/${id}/portrait?t=${new Date().getTime()}`
      );
      setCharacter(response.data);
    } catch (err) {
      console.error("Polling error:", err);
    } finally {
      if (loading) setLoading(false);
    }
  }, [id, loading]);

  useEffect(() => {
    // Adiciona classes ao body para transparência
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

  if (loading || !character) {
    return (
      <div className="loading-container">
        <div className="custom-spinner"></div>
      </div>
    );
  }

  // Cálculos de Status
  const currentHealthLevel = character.currentHealthLevel || 6;
  const currentHealthInfo = healthLevelDetails[currentHealthLevel] || { name: "Desconhecido" };
  // Cálculo simplificado assumindo array ou lógica fixa. Se healthLevels for array de pontos:
  // (Nota: Ajuste aqui conforme sua lógica exata de index do backend. Se healthLevels[0] é o atual ou o max.)
  const currentHealthPoints = character.healthLevels ? character.healthLevels[6 - currentHealthLevel] : 0; 
  
  // Exemplo de Max: Soma instintos + base. Se já vem calculado, use direto.
  const maxHealthPerLevel = 1 + (character.instincts?.potency || 0) + (character.instincts?.resolution || 0);

  const { determinationLevel, determinationPoints, assimilationLevel, assimilationPoints } = character;
  
  const currentDamageOverlay = damageOverlays[currentHealthLevel];

  // Renderizar corações manualmente (Substitui Rating)
  const renderHearts = () => {
      const hearts = [];
      for (let i = 1; i <= maxHealthPerLevel; i++) {
          if (i <= currentHealthPoints) {
              hearts.push(<HeartFullIcon key={i} width={30} height={30} fill="#9e1818" className="health-heart-icon" />);
          } else {
              hearts.push(<HeartEmptyIcon key={i} width={30} height={30} fill="rgba(255,255,255,0.2)" className="health-heart-icon" />);
          }
      }
      return hearts;
  };

  return (
    <div className="live-portrait-wrapper">
      <div className="character-portrait-container-tlou">
        
        {/* --- Avatar & Dano --- */}
        <div className="portrait-avatar-section-tlou">
          <img
            src={character.avatar || "/default-avatar.png"}
            alt="Character Avatar"
            className="portrait-avatar-image-tlou"
          />
          {currentDamageOverlay && (
            <img 
              src={currentDamageOverlay} 
              alt="Overlay Dano" 
              className="portrait-damage-overlay-tlou"
            />
          )}
        </div>

        {/* --- Stats --- */}
        <div className="status-section-tlou">
          <h1 className="character-name-tlou">
            {character.name || "Sobrevivente"}
          </h1>

          {/* Saúde */}
          <div className="status-item-tlou health-tlou">
            <span 
              className="health-status-tlou"
              style={{ color: healthLevelColors[currentHealthLevel] || '#FFF' }}
            >
              STATUS: {currentHealthInfo.name.toUpperCase()}
            </span>

            {/* Corações Customizados */}
            <div className="health-hearts-container">
               {renderHearts()}
            </div>
            
            <span className="health-points-text-tlou">
                {`${currentHealthPoints} / ${maxHealthPerLevel}`}
            </span>
          </div>
          
          {/* Cabo de Guerra */}
          <div className="status-item-tlou tug-of-war-tlou">
             <div className="tug-of-war-track-tlou">
                <div title="Determinação">
                    <DeterminationCircle level={determinationLevel} />
                </div>
                
                <div className="track-icons-container-tlou">
                    {/* Tracks de Determinação */}
                    {Array.from({ length: determinationLevel }, (_, i) => (
                        <TrackIcon key={`det-${i}`} color="#a73c39" isFilled={i + 1 <= determinationPoints} />
                    ))}
                    {/* Divisor Visual (Opcional) */}
                    <div style={{width:'2px', height:'20px', background:'rgba(255,255,255,0.2)'}}></div>
                    {/* Tracks de Assimilação */}
                    {Array.from({ length: assimilationLevel }, (_, i) => (
                        <TrackIcon key={`ass-${i}`} color="#3b4766" isFilled={i + 1 <= assimilationPoints} />
                    ))}
                </div>

                <div title="Assimilação">
                    <AssimilationCircle level={assimilationLevel} />
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharacterPortraitPage;