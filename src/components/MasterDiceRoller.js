import React, { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { ReactComponent as D20Icon } from "../assets/d12.svg"; // Reutilizando um ícone de dado existente

// --- Dice Assets (Replicar do CharacterSheet.js) ---
const dados = {
  d6: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png")],
    5: [require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    6: [require("../assets/Joaninha_1.png")],
  },
  d10: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png")],
    5: [require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
    ],
    8: [require("../assets/Cervo_1.png"), require("../assets/Joaninha_1.png")],
    9: [
      require("../assets/Cervo_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    10: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
  },
  d12: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png")],
    5: [require("../assets/Cervo_1.png"), require("../assets/Coruja_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
    ],
    8: [require("../assets/Cervo_1.png"), require("../assets/Joaninha_1.png")],
    9: [
      require("../assets/Cervo_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    10: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    11: [
      require("../assets/Cervo_1.png"),
      require("../assets/Cervo_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    12: [require("../assets/Coruja_1.png"), require("../assets/Coruja_1.png")],
  },
};
// --- END Dice Assets ---

const rollCustomDice = (formula) => {
  // ... (A tua função rollCustomDice permanece a mesma) ...
  const regex = /(\d+)d(\d+)/g;
  let match;
  const results = [];

  while ((match = regex.exec(formula)) !== null) {
    const [, count, sides] = match;
    const countInt = parseInt(count);
    const sidesInt = parseInt(sides);

    if (!dados[`d${sidesInt}`]) {
      console.warn(`Dado d${sidesInt} não definido.`);
      continue;
    }

    for (let i = 0; i < countInt; i++) {
      const face = Math.floor(Math.random() * sidesInt) + 1;
      const result = dados[`d${sidesInt}`][face] || [];
      results.push({ face, result, sides: sidesInt });
    }
  }
  return results;
};

// --- ALTERAÇÃO 1: Envolvemos o componente com forwardRef ---
const MasterDiceRoller = forwardRef(({ campaignId }, ref) => {
  const { user, token } = useSelector((state) => state.auth);
  // Estado interno para o TextField (rolagem manual)
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [rollResult, setRollResult] = useState(null); // Store roll result for display

  // --- ALTERAÇÃO 2: Criámos uma função 'executeRoll' que aceita a fórmula ---
  // Esta função contém a lógica de rolagem que estava no handleCustomRoll
  const executeRoll = useCallback(async (formulaToRoll) => {
    if (!formulaToRoll || !formulaToRoll.trim()) {
      setSnackbarMessage("Por favor, insira uma fórmula de dados.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      const results = rollCustomDice(formulaToRoll);
      // Atualiza o display local com o resultado da rolagem
      setRollResult({ formula: formulaToRoll, roll: results }); 

      // Envia a rolagem para o backend (para o RecentRollsFeed)
      await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/roll`, 
        {
          rollerId: user._id,
          rollerName: user.name || "Mestre", // Garante um nome
          formula: formulaToRoll,
          roll: results,
          timestamp: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbarMessage("Rolagem realizada com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error(
        "Erro ao rolar dados:",
        error.response?.data || error.message
      );
      setSnackbarMessage("Erro ao realizar rolagem.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  }, [campaignId, user, token]); // Dependências da lógica de execução

  // --- ALTERAÇÃO 3: O 'handleCustomRoll' (do botão interno) agora chama o 'executeRoll' ---
  const handleInternalRoll = () => {
    executeRoll(customDiceFormula);
  };
  
  // --- ALTERAÇÃO 4: Usamos 'useImperativeHandle' para expor uma função ao "pai" ---
  useImperativeHandle(ref, () => ({
    /**
     * Permite que o componente pai (CampaignSheet) dispare uma rolagem
     * com uma fórmula específica (ex: a fórmula da Ameaça).
     */
    triggerRoll: (formulaFromParent) => {
      executeRoll(formulaFromParent);
    }
  }));

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* O TextField ainda usa o estado interno 'customDiceFormula' */}
      <TextField
        label="Fórmula dos Dados (ex: 1d6+2d10)"
        value={customDiceFormula}
        onChange={(e) => setCustomDiceFormula(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        size="small"
        sx={{
          "& .MuiInputBase-root": { color: "white" },
          "& .MuiInputLabel-root": { color: "#aaa" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#fff",
          },
        }}
      />
      {/* O botão interno agora chama 'handleInternalRoll' */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleInternalRoll}
        startIcon={<D20Icon style={{ width: "24px", height: "24px" }} />}
        sx={{ mt: 1, mb: 2, width: "100%" }}
      >
        Rolar Dados
      </Button>

      {/* O display de resultado (exibido localmente) permanece igual */}
      {rollResult && (
        <Box
          sx={{
            mt: 2,
            p: 1,
            border: "1px dashed #666",
            borderRadius: "4px",
            bgcolor: "#1a1a1a",
          }}
        >
          <Typography variant="body2" sx={{ color: "#eee" }}>
            Rolagem: {rollResult.formula}
          </Typography>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {rollResult.roll.map((die, index) => (
              <Grid
                item
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" sx={{ color: "#ccc" }}>
                  D{die.sides}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {die.result.length > 0 ? (
                    die.result.map((imgSrc, i) => (
                      <img
                        key={i}
                        src={imgSrc}
                        alt="symbol"
                        style={{ width: "25px", height: "25px", margin: "2px" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/path/to/default-image.png";
                        }}
                      />
                    ))
                  ) : (
                    // Alterado: Mostrar a 'face' (número) se não houver símbolos
                    <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 'bold' }}>
                      {die.face}
                    </Typography> 
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* O Snackbar permanece igual */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}); // Fim do forwardRef

export default MasterDiceRoller;