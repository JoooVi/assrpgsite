import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";

const theme = createTheme({
  palette: {
    mode: "dark", // Modo escuro
    primary: {
      main: "#67110e", // Cor primária
    },
    secondary: {
      main: "#ffffff", // Cor secundária
    },
    background: {
      default: "#000000", // Cor de fundo padrão
      paper: "#000000", // Cor de fundo dos componentes
    },
    text: {
      primary: "#ffffff", // Cor do texto primário
      secondary: "#ffffff", // Cor do texto secundário
    },
  },
});

export default function AppTheme({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}