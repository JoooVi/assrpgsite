// src/components/HealthHearts.js
import React from 'react';
import { Box } from '@mui/material';
import { ReactComponent as HeartFullIcon } from '../assets/icons/heart-full.svg';
import { ReactComponent as HeartEmptyIcon } from '../assets/icons/heart-empty.svg';

const HealthHearts = ({ current, max }) => {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {/* Cria um array com 'max' posições e desenha um coração para cada */}
      {Array.from({ length: max }).map((_, index) => {
        // Se o 'index' for menor que os pontos de vida atuais, mostra um coração cheio
        if (index < current) {
          return <HeartFullIcon key={index} width={24} height={24} style={{ fill: "#B71C1C" }} />;
        }
        // Caso contrário, mostra um coração vazio
        return <HeartEmptyIcon key={index} width={24} height={24} style={{ fill: "#e0e0e0" }} />;
      })}
    </Box>
  );
};

export default HealthHearts;