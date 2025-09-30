import React from "react";
import { Box, Typography, LinearProgress, Rating, styled } from "@mui/material";
import TriangleRatingIcon from "./TriangleRatingIcon";
import TriangleRatingIconDown from "./TriangleRatingIconDown";

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

  const determinationColor = "#67110e"; // Vermelho escuro para Determinação
  const assimilationColor = "#00519cff"; // Azul escuro para Assimilação
  const emptyColor = ""; // Cor para ícones vazios

  const maxHealthBasePerLevel =
    Math.max(character.instincts?.potency || 0, character.instincts?.resolution || 0) + 2;
  const maxTotalHealth = maxHealthBasePerLevel * (character.healthLevels?.length || 5);
  const currentHealth = (character.healthLevels || []).reduce((sum, level) => sum + level, 0);
  const healthPercentage = maxTotalHealth > 0 ? (currentHealth / maxTotalHealth) * 100 : 0;

  return (
    <Box sx={{
        p: 2, 
        borderRadius: '8px',
        mt: 1,
        bgcolor: 'rgba(0, 0, 0, 0)' // Fundo ligeiramente mais escuro que o painel principal
    }}>
      <Typography variant="subtitle2" sx={{ color: '#eee', mb: 1 }}> {/* Texto mais claro */}
      Vida: {currentHealth}/{maxTotalHealth} ❤️
      </Typography>
      <StyledLinearProgress variant="determinate" value={healthPercentage} sx={{ mb: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#eee' }}>Det: </Typography> {/* Texto mais claro */}
        <Rating
          name={`determination-${character._id}`}
          value={character.determination || 0}
          max={10}
          readOnly
          icon={<TriangleRatingIcon color={determinationColor} />}
          emptyIcon={<TriangleRatingIcon color={emptyColor} />}
          sx={{ fontSize: 18 }}
        />
        <Typography variant="body2" sx={{ color: '#eee', ml: 1 }}>{character.determination || 0}</Typography> {/* Texto mais claro */}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ color: '#eee' }}>Ass:</Typography> {/* Texto mais claro */}
        <Rating
          name={`assimilation-${character._id}`}
          value={character.assimilation || 0}
          max={10}
          readOnly
          icon={<TriangleRatingIconDown color={assimilationColor} />}
          emptyIcon={<TriangleRatingIconDown color={emptyColor} />}
          sx={{ fontSize: 18 }}
        />
        <Typography variant="body2" sx={{ color: '#eee', ml: 1 }}>{character.assimilation || 0}</Typography> {/* Texto mais claro */}
      </Box>
    </Box>
  );
};

export default CharacterPortraitOverview;