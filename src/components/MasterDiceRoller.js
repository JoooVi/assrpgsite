import React, { useState, useCallback } from "react";
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

const MasterDiceRoller = ({ campaignId }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [rollResult, setRollResult] = useState(null); // Store roll result for display

  const handleCustomRoll = useCallback(async () => {
    if (!customDiceFormula.trim()) {
      setSnackbarMessage("Por favor, insira uma fórmula de dados.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      const results = rollCustomDice(customDiceFormula);
      setRollResult({ formula: customDiceFormula, roll: results }); // Set for local display

      // Send roll to backend for master's rolls feed (or general campaign rolls)
      // TODO: This assumes a new backend endpoint for master rolls in a campaign.
      // E.g., `PUT /api/campaigns/:id/master-roll` or `POST /api/campaigns/:id/rolls`
      await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/roll`, // Placeholder URL
        {
          rollerId: user._id,
          rollerName: user.name,
          formula: customDiceFormula,
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
  }, [customDiceFormula, campaignId, user, token]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleCustomRoll}
        startIcon={<D20Icon style={{ width: "24px", height: "24px" }} />}
        sx={{ mt: 1, mb: 2, width: "100%" }}
      >
        Rolar Dados
      </Button>

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
                    <Typography variant="body2" sx={{ color: "#f00" }}>
                      {die.face}
                    </Typography> // Show face number if no symbols
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

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
};

export default MasterDiceRoller;