import React from "react";
import { SvgIcon } from "@mui/material";

const TriangleRatingIconDown = ({ color }) => (
  <SvgIcon sx={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}> {/* Adiciona uma sombra */}
    <polygon
      points="12,22 22,2 2,2"
      style={{
        fill: color,
        stroke: '#333', // Adiciona um contorno escuro
        strokeWidth: 1, // Espessura do contorno
      }}
    />
  </SvgIcon>
);

export default TriangleRatingIconDown;