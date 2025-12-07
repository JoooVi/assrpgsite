/* TugOfWar.js */
import React from 'react';
import axios from 'axios';
// Reutiliza estilos se possível, ou inline para simplicidade
// Ícones SVG Inline para não depender de arquivos externos

const TrackIcon = ({ color, isFilled, onClick, isClickable }) => (
  <svg 
    width="30" height="20" viewBox="0 0 40 24" 
    style={{ cursor: isClickable ? 'pointer' : 'default', opacity: isFilled ? 1 : 0.3, transition:'opacity 0.2s' }}
    onClick={onClick}
  >
    <path d="M20 0L0 12L20 24L40 12Z" fill={color} stroke={color} strokeWidth="1" />
  </svg>
);

const LevelCircle = ({ level, color }) => (
    <div style={{
        width:'40px', height:'40px', borderRadius:'50%', border:`3px solid ${color}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        color: color, fontWeight:'bold', fontSize:'1.2rem', fontFamily:'Orbitron'
    }}>
        {level}
    </div>
);

const TugOfWar = ({ character, setCharacter, isReadOnly = false }) => {
  const TOTAL = 10;

  const handleSliderChange = (e) => {
    if (isReadOnly || !character) return;
    const detLevel = parseInt(e.target.value, 10);
    const assLevel = TOTAL - detLevel;
    
    const updated = {
      ...character,
      determinationLevel: detLevel,
      assimilationLevel: assLevel,
      determinationPoints: detLevel, // Reseta pontos ao mudar nível
      assimilationPoints: assLevel,
    };
    
    setCharacter(updated);
    saveState(updated);
  };

  const saveState = async (updated) => {
    if (isReadOnly) return;
    try {
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${character._id}/tugofwar`,
        { 
            determinationLevel: updated.determinationLevel, determinationPoints: updated.determinationPoints,
            assimilationLevel: updated.assimilationLevel, assimilationPoints: updated.assimilationPoints
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (error) { console.error("Erro ao salvar", error); }
  };

  const handlePointClick = (type, index) => {
      if (isReadOnly) return;
      let updated = { ...character };
      
      if (type === 'det') {
          // Lógica de toggle: Se clicar no atual, diminui 1. Se clicar em outro, define aquele.
          updated.determinationPoints = index === character.determinationPoints ? index - 1 : index;
      } else {
          updated.assimilationPoints = index === character.assimilationPoints ? index - 1 : index;
      }
      
      setCharacter(updated);
      saveState(updated);
  };

  // Renderiza ícones
  const renderIcons = (count, currentPoints, color, type) => {
      let icons = [];
      for(let i=1; i<=count; i++) {
          icons.push(
              <TrackIcon key={i} color={color} isFilled={i <= currentPoints} onClick={() => handlePointClick(type, i)} isClickable={!isReadOnly} />
          );
      }
      return icons;
  };

  return (
    <div style={{background:'#111', padding:'20px', border:'1px solid #333', borderRadius:'4px'}}>
      <h3 style={{color:'#ccc', fontFamily:'Orbitron', textAlign:'center', marginTop:0}}>Cabo de Guerra</h3>
      
      {/* Visualizador de Trilhas */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', marginBottom:'20px'}}>
          <LevelCircle level={character.determinationLevel} color="#a73c39" />
          <div style={{flex:1, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'2px'}}>
             {renderIcons(character.determinationLevel, character.determinationPoints, "#a73c39", 'det')}
          </div>
          <div style={{width:'2px', height:'30px', background:'#333'}}></div>
          <div style={{flex:1, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'2px'}}>
             {renderIcons(character.assimilationLevel, character.assimilationPoints, "#3b4766", 'ass')}
          </div>
          <LevelCircle level={character.assimilationLevel} color="#3b4766" />
      </div>

      {/* Slider de Ajuste (Só se não for ReadOnly) */}
      {!isReadOnly && (
          <div style={{background:'#080808', padding:'10px', borderTop:'1px dashed #333'}}>
              <div style={{display:'flex', justifyContent:'space-between', color:'#888', fontSize:'0.8rem', marginBottom:'5px'}}>
                  <span>DETERMINAÇÃO</span>
                  <span>ASSIMILAÇÃO</span>
              </div>
              <input 
                type="range" 
                min="0" max="10" 
                value={character.determinationLevel} 
                onChange={handleSliderChange}
                style={{
                    width:'100%', appearance:'none', height:'6px', background:'linear-gradient(90deg, #a73c39, #3b4766)',
                    outline:'none', borderRadius:'3px'
                }}
              />
          </div>
      )}
    </div>
  );
};

export default TugOfWar;