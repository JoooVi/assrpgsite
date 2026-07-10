import React, { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
} from "@mui/material";
import { useSelector } from "react-redux";
import { ReactComponent as D20Icon } from "../assets/d12.svg";
import { dispatchToast } from "./notifications/ToastProvider";
import DiceFace from "./DiceFace";
import api from "../api";

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
  // Mantem a rolagem customizada do sistema.
  const regex = /(\d+)d(\d+)/g;
  let match;
  const results = [];

  while ((match = regex.exec(formula)) !== null) {
    const [, count, sides] = match;
    const countInt = parseInt(count);
    const sidesInt = parseInt(sides);

    if (!dados[`d${sidesInt}`]) {
      console.warn(`Dado d${sidesInt} nao definido.`);
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

const MasterDiceRoller = forwardRef(({ campaignId }, ref) => {
  const { user } = useSelector((state) => state.auth);
  // Estado interno para o TextField (rolagem manual)
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [rollResult, setRollResult] = useState(null); // Store roll result for display

  // Executa a rolagem interna ou acionada pelo painel da campanha.
  const executeRoll = useCallback(async (formulaToRoll) => {
    if (!formulaToRoll || !formulaToRoll.trim()) {
      dispatchToast({ message: "Por favor, insira uma formula de dados.", type: "warning" });
      return;
    }

    try {
      const results = rollCustomDice(formulaToRoll);
      // Atualiza o display local com o resultado da rolagem
      setRollResult({ formula: formulaToRoll, roll: results }); 

      // Envia a rolagem para o backend (para o RecentRollsFeed)
      await api.post(
        `/campaigns/${campaignId}/roll`,
        {
          rollerId: user._id,
          rollerName: user.name || "Mestre", // Garante um nome
          formula: formulaToRoll,
          roll: results,
          timestamp: new Date(),
        }
      );

      dispatchToast({ message: "Rolagem realizada com sucesso!", type: "success" });
    } catch (error) {
      dispatchToast({ message: "Erro ao realizar rolagem.", type: "error" });
    }
  }, [campaignId, user]);

  const handleInternalRoll = () => {
    executeRoll(customDiceFormula);
  };
  
  useImperativeHandle(ref, () => ({
    /**
     * Permite que o componente pai (CampaignSheet) dispare uma rolagem
     * com uma formula especifica (ex: a formula da ameaca).
     */
    triggerRoll: (formulaFromParent) => {
      executeRoll(formulaFromParent);
    }
  }));


  return (
    <Box sx={{ mt: 1 }}>
      {/* O TextField ainda usa o estado interno 'customDiceFormula' */}
      <TextField
        label="Formula dos Dados (ex: 1d6+2d10)"
        value={customDiceFormula}
        onChange={(e) => setCustomDiceFormula(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
        size="small"
        sx={{
          "& .MuiInputBase-root": {
            color: "#fff",
            background: "#0b0b0b",
            borderRadius: "8px",
            fontFamily: "Rajdhani, sans-serif",
          },
          "& .MuiInputLabel-root": {
            color: "#8b8b8b",
            fontFamily: "Orbitron, sans-serif",
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#ffb3b3" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,51,51,0.45)" },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,51,51,0.65)",
          },
        }}
      />
      {/* O botao interno agora chama handleInternalRoll */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleInternalRoll}
        startIcon={<D20Icon style={{ width: "24px", height: "24px" }} />}
        sx={{
          mt: 1,
          mb: 2,
          width: "100%",
          minHeight: 40,
          borderRadius: "10px",
          border: "1px solid rgba(138,28,24,0.78)",
          background: "linear-gradient(180deg, #8a1c18, #4b100e)",
          color: "#fff",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "0.72rem",
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          boxShadow: "0 12px 28px rgba(0,0,0,0.34)",
          "&:hover": {
            background: "linear-gradient(180deg, #a0211c, #5d120f)",
            borderColor: "#ff3333",
          },
        }}
      >
        Rolar Dados
      </Button>

      {/* O display de resultado (exibido localmente) permanece igual */}
      {rollResult && (
        <Box
          sx={{
            mt: 2,
            p: 1.25,
            border: "1px solid rgba(255,255,255,0.08)",
            borderLeft: "3px solid rgba(138,28,24,0.85)",
            borderRadius: "10px",
            bgcolor: "#101010",
          }}
        >
          <Typography variant="body2" sx={{ color: "#ffb3b3", fontFamily: "Orbitron, sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
                <DiceFace die={die} size={44} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}); // Fim do forwardRef

export default MasterDiceRoller;

