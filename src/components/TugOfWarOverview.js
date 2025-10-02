import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from '../styles/TugOfWar.module.css';

// --- ÍCONES E CÍRCULOS ---

const TrackIcon = ({ color, isFilled }) => {
  const fillColor = isFilled ? color : 'none';

  
  const strokeColor = isFilled ? '#252525ff' : color;

  const strokeWidth = isFilled ? 2 : 2.5;

  return (
    <svg 
      width="27" 
      height="25" 
      viewBox="0 0 40 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M20 0L0 12L20 24L40 12Z"
        fill={fillColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

const DeterminationCircle = ({ level }) => (
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20" stroke="#a73c39" strokeWidth="4" fill="#490606ff" /> 
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#b36663ff" fontSize="20" fontWeight="bold">{level}</text>
    </svg>
);

const AssimilationCircle = ({ level }) => (
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="20" stroke="#7483a8ff" strokeWidth="4" fill="#1f244dff" />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#7483a8ff" fontSize="20" fontWeight="bold">{level}</text>
    </svg>
);


const TugOfWarOverview = ({ character }) => {
  const trackItems = [];
  const colorDet = "#a73c39";
  const colorAss = "#3b4766";

  for (let i = 1; i <= character.determinationLevel; i++) {
    const isFilled = i <= character.determinationPoints;
    trackItems.push(
      <TrackIcon 
        key={`det-${i}`} 
        color={colorDet}
        isFilled={isFilled}
      />
    );
  }

  for (let i = 1; i <= character.assimilationLevel; i++) {
    const isFilled = i <= character.assimilationPoints;
    trackItems.push(
      <TrackIcon 
        key={`ass-${i}`} 
        color={colorAss}
        isFilled={isFilled}
      />
    );
  }

  return (
    <Box sx={{ mt: 2 }}> 
      <Typography variant="subtitle2" sx={{ color: '#ffffffff', mb: 1, textAlign: 'center' }}>
        Assimilação & Determinação
      </Typography>
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
    </Box>
  );
};

export default TugOfWarOverview;