import React from "react";
import { Box, Typography, LinearProgress, styled } from "@mui/material";
// Ele chama o componente de A&D
import TugOfWarOverview from "./TugOfWarOverview"; 

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 15,
  borderRadius: 5,
  backgroundColor: '#5c0000',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#9e1818',
  },
}));

const CharacterPortraitOverview = ({ character }) => {
  if (!character) {
    return <Typography variant="body2" color="textSecondary">Dados do personagem indisponíveis.</Typography>;
  }

  // ===== A LÓGICA DA VIDA ESTÁ AQUI, INTACTA =====
  const maxHealthBasePerLevel =
    Math.max(character.instincts?.potency || 0, character.instincts?.resolution || 0) + 2;
  const maxTotalHealth = maxHealthBasePerLevel * (character.healthLevels?.length || 5);
  const currentHealth = (character.healthLevels || []).reduce((sum, level) => sum + level, 0);
  const healthPercentage = maxTotalHealth > 0 ? (currentHealth / maxTotalHealth) * 100 : 0;

  return (
    <Box sx={{
        borderRadius: '8px',
        mt: 1,
        bgcolor: 'rgba(0, 0, 0, 0)'
    }}>
      {/* ===== E A VIDA É EXIBIDA AQUI PRIMEIRO ===== */}
      <Typography variant="subtitle2" sx={{ color: '#eee', mb: 1 }}>
        Vida: {currentHealth}/{maxTotalHealth} ❤️
      </Typography>
      <StyledLinearProgress variant="determinate" value={healthPercentage} />
      
      {/* ===== DEPOIS, ELE CHAMA O OUTRO COMPONENTE PARA MOSTRAR A&D ===== */}
      <TugOfWarOverview character={character} />

    </Box>
  );
};

export default CharacterPortraitOverview;