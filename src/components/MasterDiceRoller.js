import React, { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  TextField,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { ReactComponent as D20Icon } from "../assets/d12.svg";
import { dispatchToast } from "./notifications/ToastProvider";
import RollResultCard from "./RollResultCard";
import RollKeepSelector from "./RollKeepSelector";
import api from "../api";
import { applyRollSelectionFallback, isValidRollFormula, normalizeRollFormula, rollAssimilationDice } from "../utils/assimilationDice";

const MasterDiceRoller = forwardRef(({ campaignId, onRollCreated }, ref) => {
  const { user } = useSelector((state) => state.auth);
  // Estado interno para o TextField (rolagem manual)
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [rollResult, setRollResult] = useState(null); // Store roll result for display
  const [pendingRoll, setPendingRoll] = useState(null);

  // Executa a rolagem interna ou acionada pelo painel da campanha.
  const executeRoll = useCallback((formulaToRoll) => {
    const normalizedFormula = normalizeRollFormula(formulaToRoll);
    if (!isValidRollFormula(normalizedFormula)) {
      dispatchToast({ message: "Use uma fórmula válida, como 1d6+2d10.", type: "warning" });
      return;
    }

    const results = rollAssimilationDice(normalizedFormula);
    setPendingRoll({
      formula: normalizedFormula,
      roll: results,
      skill: "Rolagem do Mestre",
      rollMode: "manual",
      selectionRule: { label: "Escolha padrão", reason: "Mantenha um resultado desta pilha." },
    });
  }, []);

  const publishRoll = useCallback(async (selectedRoll) => {
    try {
      const confirmedAt = new Date().toISOString();
      const localRoll = { ...selectedRoll, timestamp: confirmedAt };
      setRollResult(localRoll);
      const response = await api.post(
        `/campaigns/${campaignId}/roll`,
        {
          rollerId: user._id,
          rollerName: user.name || "Mestre", // Garante um nome
          formula: selectedRoll.formula,
          skill: selectedRoll.skill,
          rollMode: selectedRoll.rollMode,
          selection: selectedRoll.selection,
          pileSources: selectedRoll.pileSources,
          roll: selectedRoll.roll,
          timestamp: confirmedAt,
        }
      );

      const createdRoll = applyRollSelectionFallback(
        response.data?.roll || (Array.isArray(response.data) ? response.data[0] : null),
        localRoll,
      );
      if (createdRoll) setRollResult(createdRoll);
      if (createdRoll) onRollCreated?.(createdRoll);

      dispatchToast({ message: "Rolagem realizada com sucesso!", type: "success" });
    } catch (error) {
      dispatchToast({ message: "Erro ao realizar rolagem.", type: "error" });
    }
  }, [campaignId, onRollCreated, user]);

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
        <Box sx={{ mt: 2 }}>
          <RollResultCard
            roll={rollResult.roll}
            actorName={user?.name || "Mestre"}
            actionLabel={rollResult.skill || "Rolagem livre"}
            formula={rollResult.formula}
            timestamp={rollResult.timestamp}
            selection={rollResult.selection}
            variant="latest"
            recent
          />
        </Box>
      )}
      <RollKeepSelector
        open={!!pendingRoll}
        rollData={pendingRoll}
        keepCount={1}
        onCancel={() => setPendingRoll(null)}
        onConfirm={(selectedRoll) => {
          setPendingRoll(null);
          publishRoll(selectedRoll);
        }}
      />
    </Box>
  );
}); // Fim do forwardRef

export default MasterDiceRoller;

