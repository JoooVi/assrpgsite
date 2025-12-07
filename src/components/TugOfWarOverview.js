/* TugOfWarOverview.js */
import React from 'react';

// Ícone Simplificado
const MiniIcon = ({ color, filled }) => (
    <div style={{
        width:'8px', height:'12px', background: filled ? color : 'transparent',
        border: `1px solid ${color}`, transform: 'skewX(-10deg)', margin:'1px'
    }}></div>
);

const TugOfWarOverview = ({ character }) => {
  return (
    <div style={{marginTop:'10px'}}> 
      <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'#888', marginBottom:'2px'}}>
          <span>DET ({character.determinationPoints}/{character.determinationLevel})</span>
          <span>ASS ({character.assimilationPoints}/{character.assimilationLevel})</span>
      </div>
      
      <div style={{display:'flex', height:'16px', background:'#000', border:'1px solid #333', padding:'2px'}}>
          {/* Barra Determinação */}
          <div style={{flex: character.determinationLevel, display:'flex', borderRight:'1px solid #333', paddingRight:'2px', justifyContent:'flex-end'}}>
              {Array.from({length: character.determinationLevel}).map((_, i) => (
                  <MiniIcon key={i} color="#a73c39" filled={i < character.determinationPoints} />
              ))}
          </div>
          {/* Barra Assimilação */}
          <div style={{flex: character.assimilationLevel, display:'flex', paddingLeft:'2px'}}>
              {Array.from({length: character.assimilationLevel}).map((_, i) => (
                  <MiniIcon key={i} color="#3b4766" filled={i < character.assimilationPoints} />
              ))}
          </div>
      </div>
    </div>
  );
};

export default TugOfWarOverview;