// Exemplo para seu arquivo src/theme/AppTheme.js
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Ativa o modo escuro
    primary: {
      main: '#c62828', // Um vermelho mais forte para o tema
    },
    secondary: {
      main: '#4a6d8c', // Um azul para ações secundárias
    },
    background: {
      default: '#ffffff', // Fundo padrão do modo escuro
      paper: '#000000',   // Fundo para 'Paper' e 'Card'
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});

const AppTheme = ({ children }) => (
  <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>
);

export default AppTheme;