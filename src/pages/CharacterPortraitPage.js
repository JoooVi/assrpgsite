// src/pages/CharacterPortraitPage.js

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "./CharacterPortraitPage.css";

// SVG Components
import { ReactComponent as HeartFullIcon } from '../assets/icons/heart-full.svg';
import { ReactComponent as HeartEmptyIcon } from '../assets/icons/heart-empty.svg';

// Images Overlays
import bruisedOverlay from '../assets/damage_overlays/escoriado.png';
import laceratedOverlay from '../assets/damage_overlays/lacerado.png';
import injuredOverlay from '../assets/damage_overlays/ferido.png';
import brokenOverlay from '../assets/damage_overlays/arrebentado.png';
import incapacitatedOverlay from '../assets/damage_overlays/incapacitado.png';

// --- ADICIONEI AQUI: Import do fundo do dado ---
import diceBg from '../assets/tras.png'; 

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

const FETCH_INTERVAL = 2000;

const CharacterPortraitPage = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animação
  const [showDice, setShowDice] = useState(false);
  const lastRollTimeRef = useRef(0);

  // Poll de dados
  const fetchCharacterData = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(
        `https://assrpgsite-be-production.up.railway.app/api/public/characters/${id}/portrait?t=${new Date().getTime()}`
      );
      
      const charData = response.data;
      setCharacter(charData);

      // Verifica nova rolagem
      if (charData.lastRoll && charData.lastRoll.timestamp) {
        const rollTime = new Date(charData.lastRoll.timestamp).getTime();
        
        if (rollTime > lastRollTimeRef.current) {
            lastRollTimeRef.current = rollTime;
            setShowDice(false);
            setTimeout(() => setShowDice(true), 50);
            setTimeout(() => setShowDice(false), 8000);
        }
      }

    } catch (err) {
      console.error("Polling error:", err);
    } finally {
      if (loading) setLoading(false);
    }
  }, [id, loading]);

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
  const currentHealthPoints = character.healthLevels ? character.healthLevels[6 - currentHealthLevel] : 0; 
  const maxHealthPerLevel = 1 + (character.instincts?.potency || 0) + (character.instincts?.resolution || 0);
  const { determinationLevel, determinationPoints, assimilationLevel, assimilationPoints } = character;
  const currentDamageOverlay = damageOverlays[currentHealthLevel];

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
      
      {/* --- CAMADA DE DADOS COM FUNDO --- */}
      <div className={`dice-animation-container ${showDice ? 'visible entering' : 'leaving'}`}>
         {character.lastRoll && character.lastRoll.roll && character.lastRoll.roll.map((die, index) => (
             <div key={index} className="individual-die-result">
                 
                 {/* 1. FUNDO DO DADO (TRAS.PNG) */}
                 <img 
                    src={diceBg} 
                    alt="dado-bg" 
                    className="individual-die-image" 
                    // Se preferir ajustar tamanho no CSS, use a classe.
                    // Aqui garanto que preencha.
                    style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}
                 />

                 {/* 2. CONTEÚDO (Números ou Símbolos) */}
                 <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {/* Se tiver Símbolos */}
                     {die.result && die.result.length > 0 ? (
                         <div className="individual-die-symbols">
                             {die.result.map((imgSrc, i) => (
                                 <img key={i} src={imgSrc} alt="symbol" className="symbol-image" />
                             ))}
                         </div>
                     ) : (
                         /* Se for Número puro */
                         <span className="individual-die-number">{die.face}</span>
                     )}
                 </div>

             </div>
         ))}
         
         {/* Nome da Perícia */}
         {character.lastRoll && (
             <div style={{
                 position: 'absolute', bottom: '-40px', width: '100%', 
                 textAlign: 'center', color: '#fff', textShadow: '0 2px 4px #000',
                 fontFamily: 'Cinzel', fontSize: '1.2rem', fontWeight: 'bold'
             }}>
                 {character.lastRoll.skill ? character.lastRoll.skill.toUpperCase() : "ROLAGEM"}
             </div>
         )}
      </div>

      {/* --- CONTAINER PRINCIPAL DO RETRATO --- */}
      <div className="character-portrait-container-tlou">
        
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

        <div className="status-section-tlou">
          <h1 className="character-name-tlou">
            {character.name || "Sobrevivente"}
          </h1>

          <div className="status-item-tlou health-tlou">
            <span 
              className="health-status-tlou"
              style={{ color: healthLevelColors[currentHealthLevel] || '#FFF' }}
            >
              STATUS: {currentHealthInfo.name.toUpperCase()}
            </span>

            <div className="health-hearts-container">
               {renderHearts()}
            </div>
            
            <span className="health-points-text-tlou">
                {`${currentHealthPoints} / ${maxHealthPerLevel}`}
            </span>
          </div>
          
          <div className="status-item-tlou tug-of-war-tlou">
             <div className="tug-of-war-track-tlou">
                <div title="Determinação">
                    <DeterminationCircle level={determinationLevel} />
                </div>
                
                <div className="track-icons-container-tlou">
                    {Array.from({ length: determinationLevel }, (_, i) => (
                        <TrackIcon key={`det-${i}`} color="#a73c39" isFilled={i + 1 <= determinationPoints} />
                    ))}
                    <div style={{width:'2px', height:'20px', background:'rgba(255,255,255,0.2)'}}></div>
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