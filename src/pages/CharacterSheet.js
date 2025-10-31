import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSkills,
  updateSkillValue,
  setSelectedInstinct,
} from "../redux/slices/skillsSlice";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link as RouterLink } from "react-router-dom";
import { saveSkillsToBackend } from "../redux/actions/skillActions";
import { updateInstincts } from "../redux/slices/instinctsSlice";
import { fetchInstincts } from "../redux/actions/instinctsActions";
import EditItemDialog from "../components/EditItemDialog";
import ArmaPlaceholder from "../assets/arma_placeholder.svg";
import UtilidadePlaceholder from "../assets/utilidade_placeholder.svg";
import ConsumivelPlaceholder from "../assets/consumivel_placeholder.svg";
import InventoryGrid from "../components/InventoryGrid";
import TugOfWar from "../components/TugOfWar";
import { useParams } from "react-router-dom";
import {
  TextField,
  Typography,
  Button,
  Grid,
  Paper,
  Rating,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  InputLabel,
  FormHelperText,
  Tab,
  Tabs,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  Fab,
  Popover,
  Box,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import TriangleRatingIcon from "../components/TriangleRatingIcon";
import TriangleRatingIconDown from "../components/TriangleRatingIconDown";
import styles from "./CharacterSheet.module.css";
import ItemsModal from "../components/ItemsModal";
import AssimilationsModal from "../components/AssimilationsModal";
import CharacteristicsModal from "../components/CharacteristicsModal";
import CharacteristicsMenu from "../components/CharacteristicsMenu";
import { ReactComponent as MeuIcone } from "../assets/d10.svg";
import { ReactComponent as MeuIcone2 } from "../assets/d12.svg";
import { ReactComponent as HeartFullIcon } from "../assets/icons/heart-full.svg";
import { ReactComponent as HeartEmptyIcon } from "../assets/icons/heart-empty.svg";

const translateKey = (key) => {
  const translations = {
    // Campos Gerais
    health: "Saúde",
    Current: "Atual",
    current: "Atual",
    collapse: "Colapso",
    preCollapse: "pré-Colapso",
    postCollapse: "Pós-Colapso",
    Knowledge: "Conhecimento",
    knowledge: "Conhecimento",
    Practices: "Práticas",
    practices: "Práticas",
    Instincts: "Instintos",
    instincts: "Instintos",

    // Instintos
    Perception: "Percepção",
    perception: "Percepção",
    Potency: "Potência",
    potency: "Potência",
    Influence: "Influência",
    influence: "Influência",
    Resolution: "Resolução",
    resolution: "Resolução",
    Sagacity: "Sagacidade",
    sagacity: "Sagacidade",
    Reaction: "Reação",
    reaction: "Reação",

    // Novos Conhecimentos
    geography: "Geografia",
    Geography: "Geografia",
    medicine: "Medicina",
    Medicine: "Medicina",
    security: "Segurança",
    Security: "Segurança",
    biology: "Biologia",
    Biology: "Biologia",
    erudition: "Erudição",
    Erudition: "Erudição",
    engineering: "Engenharia",
    Engineering: "Engenharia",

    // Novas Práticas
    weapons: "Armas",
    Weapons: "Armas",
    athletics: "Atletismo",
    Athletics: "Atletismo",
    expression: "Expressão",
    Expression: "Expressão",
    stealth: "Furtividade",
    Stealth: "Furtividade",
    crafting: "Manufaturas",
    Crafting: "Manufaturas",
    survival: "Sobrevivência",
    Survival: "Sobrevivência",
  };

  return translations[key] || key;
};

const healthLevelDetails = {
  6: {
    name: "Saudável",
    description: "Recuperação ativa após repouso completo.",
  },
  5: {
    name: "Escoriado",
    description: "Recuperação ativa após repouso completo.",
  },
  4: {
    name: "Lacerado",
    description:
      "Ativa Recuperação após uma semana. Menos 1 em todos os testes.",
  },
  3: {
    name: "Ferido",
    description:
      "Ativa Recuperação após uma semana. Menos 1 em todos os testes.",
  },
  2: {
    name: "Arrebentado",
    description:
      "Incapaz de agir, mas mantém a consciência. Menos 2 em todos os testes.",
  },
  1: {
    name: "Incapacitado",
    description:
      "Inconsciente. Qualquer Ação com teste exige 2 de Adaptação para ativar.",
  },
};

const qualityLevels = {
  0: "Quebrado",
  1: "Defeituoso",
  2: "Comprometido",
  3: "Padrão",
  4: "Reforçado",
  5: "Superior",
  6: "Obra-Prima",
};

const scarcityLevels = {
  0: "Abundante",
  1: "Pedra",
  2: "Comum",
  3: "Incomum",
  4: "Atípico",
  5: "Raro",
  6: "Quase Extinto",
};

const quickAccessPlaceholders = [
  { type: "Arma", icon: ArmaPlaceholder },
  { type: "Utilidade", icon: UtilidadePlaceholder },
  { type: "Consumível", icon: ConsumivelPlaceholder },
];

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
      results.push({ face, result, sides: sidesInt }); // Adiciona o 'sides'
    }
  }

  return results;
};

const SkillList = ({ title, id, addRollToHistory, character }) => {
  const dispatch = useDispatch();
  const globalSkills = useSelector((state) => state.skills?.skills || {});
  const selectedInstinct = useSelector(
    (state) => state.skills.selectedInstinct
  );
  const instincts = useSelector((state) => state.instincts.instincts);
  const loading = useSelector((state) => state.instincts?.loading);
  const error = useSelector((state) => state.instincts?.error);
  const [open, setOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [snackbarKey, setSnackbarKey] = useState(0);

  useEffect(() => {
    if (id) {
      const fetchInitialData = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const { knowledge = {}, practices = {} } = response.data;
          const combinedSkills = { ...knowledge, ...practices };
          dispatch(updateSkills(combinedSkills));

          console.log("Skills carregadas:", combinedSkills);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };
      fetchInitialData();
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchInstincts(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    console.log("Instintos atualizados:", instincts);
  }, [instincts]);

  const handleRoll = useCallback(
    async (key, itemUsado = null) => {
      // 1. Aceita um item como parâmetro
      if (isRolling) return;
      if (!selectedInstinct[key]) {
        alert("Selecione um instinto antes de rolar!");
        return;
      }
      setIsRolling(true);

      try {
        const skillValue = parseInt(globalSkills[key]) || 0;
        const instinctKey = selectedInstinct[key];
        const instinctValue = parseInt(instincts[instinctKey]) || 0;

        // 2. Objeto para guardar os efeitos da qualidade
        const qualityEffect = {
          bonusDice: "",
          message: "",
        };

        if (itemUsado) {
          // 3. Verifica a qualidade do item e aplica as regras
          switch (itemUsado.quality) {
            case 0: // Quebrado
              alert(
                `O item "${itemUsado.item.name}" está quebrado e não pode ser usado.`
              );
              setIsRolling(false);
              return; // Impede a rolagem
            case 1: // Defeituoso
              qualityEffect.message = `Qualidade (Defeituoso): Exige 1 [Adaptação] adicional para acionar efeitos.`;
              break;
            case 2: // Comprometido
              qualityEffect.message = `Qualidade (Comprometido): Exige 1 [Sucesso] adicional para ter êxito.`;
              break;
            case 4: // Reforçado
              // Esta regra é mais complexa de automatizar. Por enquanto, vamos exibir como mensagem.
              qualityEffect.message = `Qualidade (Reforçado): Você pode adicionar 1 [Adaptação] ao resultado final.`;
              break;
            case 5: // Superior
              qualityEffect.bonusDice = "1d6"; // Adiciona um d6 à rolagem
              qualityEffect.message = `Qualidade (Superior): Adicionado 1d6 à sua rolagem.`;
              break;
            case 6: // Obra-Prima
              qualityEffect.bonusDice = "1d10";
              qualityEffect.message = `Qualidade (Obra-Prima): Adicionado 1d10 à sua rolagem.`;
              break;
            default: // Padrão (3) ou outros níveis sem efeito mecânico direto
              break;
          }
        }

        const parts = [];
        if (skillValue > 0) {
          parts.push(`${skillValue}d6`);
        }
        if (instinctValue > 0) {
          parts.push(`${instinctValue}d10`);
        }

        if (qualityEffect.bonusDice) {
          parts.push(qualityEffect.bonusDice);
        }

        const formula = parts.length > 0 ? parts.join("+") : "0d10";

        const results = rollCustomDice(formula);

        // 4. Passa a mensagem do efeito para ser exibida no resultado
        setRollResult({
          skill: key,
          roll: results,
          effectMessage: qualityEffect.message,
        });
        setSnackbarKey((prevKey) => prevKey + 1);
        setSnackbarOpen(true);
        setTimeout(() => setIsRolling(false), 500);
        addRollToHistory({ skill: key, roll: results });
      } catch (error) {
        console.error("Erro ao rolar dados:", error);
        setIsRolling(false);
      }
    },
    [isRolling, globalSkills, selectedInstinct, instincts, addRollToHistory]
  );

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  }, []);

  const handleEditedValueChange = useCallback(
    async (key, value) => {
      try {
        const updatedSkills = { ...globalSkills, [key]: parseInt(value) || 0 };
        await dispatch(saveSkillsToBackend(id, updatedSkills));
      } catch (error) {
        console.error("Erro ao salvar skill:", error);
        setSnackbarOpen(true);
      }
    },
    [dispatch, id, globalSkills]
  );

  const handleSkillClick = useCallback((key) => {
    setSelectedSkill(key);
    setOpen(true);
  }, []);

  const handleInstinctChangee = useCallback(
    (skillKey) => (event) => {
      dispatch(setSelectedInstinct({ [skillKey]: event.target.value }));
    },
    [dispatch]
  );

  const getSkillDescription = useCallback((key) => {
    const descriptions = {
      // Conhecimentos
      geography:
        "Conhecimento sobre terrenos, mapas, rotas e ambientes naturais ou urbanos.",
      medicine:
        "Conhecimento sobre medicina, anatomia, tratamentos e primeiros socorros.",
      security:
        "Habilidade em sistemas de segurança, travas, vigilância e contra-inteligência.",
      biology: "Conhecimento sobre fauna, flora, ecologia e ciências naturais.",
      erudition:
        "Conhecimento sobre história, culturas, política e informações gerais do mundo pré e pós-colapso.",
      engineering:
        "Habilidade com mecânica, eletrônica, construção e reparo de estruturas e equipamentos.",

      // Práticas
      weapons: "Habilidade com armas de fogo e combate corpo a corpo.",
      athletics:
        "Habilidades envolvendo corrida, escalada, natação e outras proezas físicas.",
      expression:
        "Capacidade de se comunicar efetivamente, seja por persuasão, intimidação, performance ou arte.",
      stealth:
        "Habilidade de se mover silenciosamente, se esconder e passar despercebido.",
      crafting:
        "Habilidades manuais para criar, modificar ou consertar itens, desde vestimentas a pequenas ferramentas.",
      survival:
        "Habilidade de encontrar recursos, rastrear, caçar e se virar em ambientes hostis.",
    };
    return descriptions[key] || "Descrição não disponível.";
  }, []);

  return (
    <Box>
      <Typography variant="h6" color="#ccc">
        {translateKey(title)}
      </Typography>
      {Object.entries(globalSkills).map(([key, value]) => (
        <Grid container key={key} spacing={1} alignItems="center">
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              onClick={() => handleSkillClick(key)}
              sx={{
                cursor: "pointer",
                color: "#ccc",
                "&:hover": { color: "primary.main" },
              }}
            >
              {translateKey(key)}:
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              value={globalSkills[key] || 0}
              onChange={(e) => handleEditedValueChange(key, e.target.value)}
              size="small"
              variant="outlined"
              fullWidth
              inputProps={{ style: { textAlign: "center" } }}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" }, // Texto digitado
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#888" }, // Borda padrão
                  "&:hover fieldset": { borderColor: "#fff" }, // Borda no hover
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
              sx={{ minWidth: 100 }}
            >
              <InputLabel sx={{ color: "#ccc" }}>
                {translateKey("Instinto")}
              </InputLabel>

              <Select
                label={translateKey("Instinto")}
                value={selectedInstinct[key] || ""}
                onChange={handleInstinctChangee(key)}
                disabled={loading}
                sx={{
                  color: "#fff", // Cor do texto selecionado
                  "& .MuiSvgIcon-root": { color: "#fff" }, // Cor da setinha
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#888" }, // Borda
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  }, // Borda no hover
                }}
              >
                {loading ? (
                  <MenuItem disabled>{translateKey("Carregando...")}</MenuItem>
                ) : Object.entries(instincts).length > 0 ? (
                  Object.entries(instincts).map(
                    ([instinctKey, instinctValue]) => (
                      <MenuItem key={instinctKey} value={instinctKey}>
                        {translateKey(
                          instinctKey.charAt(0).toUpperCase() +
                            instinctKey.slice(1)
                        )}
                      </MenuItem>
                    )
                  )
                ) : (
                  <MenuItem disabled>
                    {translateKey("Nenhum instinto disponível")}
                  </MenuItem>
                )}
              </Select>

              {error && <FormHelperText error>{error}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleRoll(key)}
              fullWidth
              sx={{
                marginLeft: { xs: 0, sm: "28px" },
                marginTop: { xs: "8px", sm: 0 },
              }}
              disabled={!selectedInstinct[key]}
            >
              <MeuIcone style={{ width: "24px", height: "24px" }} />
            </Button>
          </Grid>
        </Grid>
      ))}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        key={snackbarKey}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{
            width: "400px",
            maxWidth: "100%",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {translateKey("Resultado")}:
          </Typography>
          <Typography variant="subtitle1">
            {translateKey("Habilidade")}:{" "}
            {translateKey(rollResult?.skill) ||
              rollResult?.skill ||
              translateKey("Nenhuma")}
          </Typography>


          {rollResult?.effectMessage && (
            <Typography
              variant="body2"
              sx={{ color: "#66bb6a", fontStyle: "italic", my: 1 }}
            >
              {rollResult.effectMessage}
            </Typography>
          )}

          <Typography variant="body1" sx={{ mt: 1 }}>
            {translateKey("Dados Individuais")}:
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {rollResult?.roll?.length > 0 ? (
              rollResult.roll.map((die, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 1,
                    bgcolor: "rgba(0,0,0,0.2)",
                    borderRadius: 1,
                    minWidth: "60px",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#ccc", fontWeight: "bold" }}
                  >
                    Dado {index + 1} (d{die.sides || "?"}){" "}
                    {/* Assumindo que rollCustomDice adicione 'sides' */}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      minHeight: "30px",
                      alignItems: "center",
                    }}
                  >
                    {die.result.length > 0 ? (
                      die.result.map((imgSrc, i) => (
                        <img
                          key={i}
                          src={imgSrc}
                          alt="symbol"
                          style={{
                            width: "25px",
                            height: "25px",
                            margin: "2px",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/path/to/default-image.png";
                          }}
                        />
                      ))
                    ) : (
                      // Mostra o número da face se não houver símbolos
                      <Typography
                        variant="h6"
                        sx={{ color: "#fff", fontWeight: "bold" }}
                      >
                        {die.face}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>Nenhum dado rolado.</Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        // 1. Adiciona os estilos do Paper (fundo, cor, borda)
        PaperProps={{
          sx: {
            bgcolor: "#1e1e1e",
            color: "#e0e0e0",
            border: "1px solid #4a4a4a",
          },
        }}
      >
        {/* 2. Adiciona estilo ao Título (borda e cor) */}
        <DialogTitle
          sx={{ borderBottom: "1px solid #4a4a4a", color: "#ffffff" }}
        >
          {selectedSkill &&
            translateKey(
              selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)
            )}
        </DialogTitle>

        {/* 3. Adiciona estilo ao Conteúdo (padding e cor do texto) */}
        <DialogContent sx={{ paddingTop: "20px !important" }}>
          <Typography sx={{ color: "#e0e0e0" }}>
            {getSkillDescription(selectedSkill)}
          </Typography>
        </DialogContent>

        {/* 4. Adiciona estilo às Ações (borda) */}
        <DialogActions sx={{ borderTop: "1px solid #4a4a4a" }}>
          {/* 5. Altera o botão para usar sx para cor */}
          <Button onClick={() => setOpen(false)} sx={{ color: "#ccc" }}>
            {translateKey("Fechar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const InstinctList = ({
  title,
  selectedInstinct,
  instincts,
  handleInstinctChange,
  onAssimilatedRoll,
  id,
}) => {
  const dispatch = useDispatch();
  console.log("InstinctList", {
    title,
    selectedInstinct,
    handleInstinctChange,
    onAssimilatedRoll,
    id,
  });
  const loading = useSelector((state) => state.instincts?.loading);
  const error = useSelector((state) => state.instincts?.error);
  const [open, setOpen] = useState(false);
  const [selectedInstinctKey, setSelectedInstinctKey] = useState(null);
  const [editedInstincts, setEditedInstincts] = useState({});

  const handleInstinctClick = (instinctKey) => {
    console.log("handleInstinctClick", instinctKey);
    setSelectedInstinctKey(instinctKey);
    setOpen(true);
  };

  const getInstinctDescription = (key) => {
    console.log("getInstinctDescription", key);
    const descriptions = {
      reaction:
        "Instinto básico que mede a velocidade de reação do indivíduo. Geralmente, é usado em situações em que o personagem está em risco e precisa agir rapidamente ou em testes reflexivos em geral.",
      perception:
        " Governa a capacidade sensorial do personagem, incluindo todos os sentidos e a atenção.",
      sagacity:
        " Facilidade para entender e interpretar dados, explicações ou situações; agudeza de espírito; perspicácia, argúcia, astúcia.",
      potency:
        "Capacidade de exercer pressão física do personagem, incluindo resistência a pressões físicas externas. Mede seu poder físico e elasticidade, relacionando seu sistema nervoso central com seu sistema muscular e ósseo.",
      influence:
        "Sua capacidade de influenciar outras pessoas, seu magnetismo pessoal, carisma, escolha e cuidado com palavras e liderança.",
      resolution:
        "Sua determinação física e mental, capacidade de resistir à pressão psicológica interna e externa.",
    };
    return descriptions[key] || "Descrição não disponível.";
  };

  const saveInstinctsToBackend = async (updatedInstincts) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { instincts: updatedInstincts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateInstincts(response.data.instincts));
    } catch (error) {
      console.error("Erro ao salvar os instintos:", error);
    }
  };

  const handleEditedInstinctChange = async (instinctKey, value) => {
    const updatedValue = Number(value);
    const updatedInstincts = { ...instincts, [instinctKey]: updatedValue };

    try {
      dispatch(updateInstincts(updatedInstincts));

      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { instincts: updatedInstincts },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const response = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateInstincts(response.data.instincts));
    } catch (error) {
      dispatch(updateInstincts(instincts));
      console.error("Erro ao salvar:", error);
    }
  };

  useEffect(() => {
    if (Object.keys(editedInstincts).length > 0) {
      saveInstinctsToBackend(editedInstincts);
    }
  }, [editedInstincts]);

  return (
    <Box>
      <Typography variant="h6">{translateKey(title)}</Typography>

      {Object.entries(instincts).map(([key, value]) => (
        <Grid container key={key} spacing={1} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              onClick={() => handleInstinctClick(key)}
              sx={{
                cursor: "pointer",
                color: "#ccc", // Cor do texto principal
                "&:hover": { color: "primary.main" },
              }}
            >
              {translateKey(key.charAt(0).toUpperCase() + key.slice(1))}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              value={instincts[key] || 0}
              onChange={(e) => handleEditedInstinctChange(key, e.target.value)}
              size="small"
              variant="outlined"
              fullWidth
              inputProps={{ style: { textAlign: "center" } }}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" }, // Texto digitado
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#888" }, // Borda padrão
                  "&:hover fieldset": { borderColor: "#fff" }, // Borda no hover
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={5} md={3.8}>
            <FormControl
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
            >
              <InputLabel sx={{ color: "#ccc" }}>
                {translateKey("Instinto")}
              </InputLabel>

              <Select
                label={translateKey("Instinto")}
                value={selectedInstinct[key] || ""}
                onChange={(e) => handleInstinctChange(key, e.target.value)}
                sx={{
                  color: "#fff", // Cor do texto selecionado
                  "& .MuiSvgIcon-root": { color: "#fff" }, // Cor da setinha
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#888" }, // Borda
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  }, // Borda no hover
                }}
              >
                {Object.keys(instincts).map((instinctKey) => (
                  <MenuItem key={instinctKey} value={instinctKey}>
                    {translateKey(
                      instinctKey.charAt(0).toUpperCase() + instinctKey.slice(1)
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onAssimilatedRoll(key, selectedInstinct[key])}
              fullWidth
              sx={{
                marginLeft: { xs: 0, sm: "3px" },
                marginTop: { xs: "8px", sm: 0 },
              }}
            >
              <MeuIcone2 style={{ width: "24px", height: "24px" }} />
            </Button>
          </Grid>
        </Grid>
      ))}

      {/* O Dialog não precisa de alteração de cor, 
     pois ele já tem seu próprio fundo branco por padrão */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        // Adiciona estilo escuro ao Paper do Dialog
        PaperProps={{
          sx: {
            bgcolor: "#1e1e1e", // Fundo escuro
            color: "#e0e0e0", // Texto claro
            border: "1px solid #4a4a4a", // Borda
          },
        }}
      >
        <DialogTitle
          sx={{ borderBottom: "1px solid #4a4a4a", color: "#ffffff" }}
        >
          {" "}
          {/* Título branco */}
          {selectedInstinctKey &&
            translateKey(
              selectedInstinctKey.charAt(0).toUpperCase() +
                selectedInstinctKey.slice(1)
            )}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: "20px !important" }}>
          {" "}
          {/* Padding e cor do texto */}
          <Typography sx={{ color: "#e0e0e0" }}>
            {getInstinctDescription(selectedInstinctKey)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid #4a4a4a" }}>
          {" "}
          {/* Borda superior */}
          <Button onClick={() => setOpen(false)} sx={{ color: "#ccc" }}>
            {" "}
            {/* Cor do botão fechar */}
            {translateKey("Fechar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CharacterSheet = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);
  const [selectedInstinct, setSelectedInstinct] = useState({});
  const [rollResult, setRollResult] = useState(null);
  const [customRollResult, setCustomRollResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openItemsModal, setOpenItemsModal] = useState(false);
  const [openAssimilationsModal, setOpenAssimilationsModal] = useState(false);
  const [openCharacteristicsModal, setOpenCharacteristicsModal] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [characteristics, setCharacteristics] = useState([]);
  const [assimilations, setAssimilations] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [maxWeight, setMaxWeight] = useState(8);
  const [editItem, setEditItem] = useState(null);
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [notes, setNotes] = useState("");
  const [snackbarKey, setSnackbarKey] = useState(0);
  const [rollHistory, setRollHistory] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [portraitMenuAnchorEl, setPortraitMenuAnchorEl] = useState(null);
  const [backpackCapacity, setBackpackCapacity] = useState(6);
  const [openHealthModal, setOpenHealthModal] = useState(false);
  const [selectedHealthLevel, setSelectedHealthLevel] = useState(null);
  const instincts = useSelector((state) => state.instincts.instincts);
  const saveLastRollToBackend = async (charId, rollData) => {
    if (!charId) {
      console.error("ID do personagem não encontrado.");
      console.log(rollData);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${charId}/last-roll`,
        { lastRoll: rollData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Última rolagem salva no backend:", rollData);
    } catch (err) {
      console.error(
        "Erro ao salvar última rolagem:",
        err.response ? err.response.data : err.message
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar autenticado para acessar esta página");
      return;
    }

    const fetchCharacter = async () => {
      try {
        const response = await axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}?t=${new Date().getTime()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCharacter(response.data);
        setNotes(response.data.notes || "");
      } catch (error) {
        setError("Erro ao carregar a ficha do personagem");
        console.error(error);
      }
    };

    fetchCharacter();
  }, [id]);

  useEffect(() => {
    if (character) {
      setInventoryItems(character.inventory || []);
    }
  }, [character]);

  const calculateSlots = useCallback(() => {
    // Se character não existe, retorna valores padrão
    if (!character)
      return {
        bodySlots: 3,
        backpackSlots: backpackCapacity,
        usedBody: 0,
        usedBackpack: 0,
      };

    const inventory = character.inventory || [];

    const baseBackpackSlots = backpackCapacity; // Usa o estado

    // Itens que não ocupam espaço (lendo de itemData ou item)
    const exemptItems = inventory.filter((inv) => {
      const itemDetails = inv?.itemData || inv?.item; // Compatibilidade
      return (
        itemDetails?.modifiers?.includes("Isento") ||
        false ||
        ["Vestimenta", "Cantil"].includes(itemDetails?.type)
      ); 
    });

    const itemsInBody = inventory.filter(
      (inv) => inv.slotLocation === "corpo" && !exemptItems.includes(inv)
    );
    const itemsInBackpack = inventory.filter(
      (inv) => inv.slotLocation === "mochila" && !exemptItems.includes(inv)
    );

    const backpackBonus = itemsInBody
      .concat(itemsInBackpack)
      .reduce((bonus, inv) => {
        // Lê os modificadores de inv.itemData (nova estrutura) ou inv.item (antiga)
        const itemDetails = inv?.itemData || inv?.item;
        // Usa optional chaining seguro em itemDetails.modifiers
        const espacoso = itemDetails?.modifiers?.find(
          (m) => m && typeof m === "string" && m.startsWith("Espaçoso") // Adiciona verificação extra
        );
        if (espacoso) {
          // Tenta pegar o número depois de ':', senão usa 2 como padrão
          const bonusValue = parseInt(espacoso.split(":")[1], 10);
          return bonus + (isNaN(bonusValue) ? 2 : bonusValue); // Usa 2 se não houver número ou for inválido
        }
        return bonus;
      }, 0);

    const totalBackpackSlots = baseBackpackSlots + backpackBonus; // Soma o bônus calculado
    const totalBodySlots = 3;

    const calculateUsedSlots = (items) => {
      return items.reduce((sum, inv) => {
        const itemDetails = inv?.itemData || inv?.item;
        if (!itemDetails) return sum; // Pula item inválido

        // 1. Pega o valor base. Usa '?? 1' (Nullish Coalescing)
        let slotsOcupados = itemDetails.slots ?? 1;

        // 2. Modificador "Pequeno" SOBRESCREVE tudo e força 0.
        if (itemDetails.modifiers?.includes("Pequeno")) {
          slotsOcupados = 0;
        } else {
          // 3. Se NÃO for "Pequeno", aplica "Pesado"
          if (itemDetails.modifiers?.includes("Pesado")) {
            slotsOcupados += 1;
          }
        }

        return sum + slotsOcupados;
      }, 0);
    };
    // ...

    const usedBodySlots = calculateUsedSlots(itemsInBody);
    const usedBackpackSlots = calculateUsedSlots(itemsInBackpack);

    return {
      totalBodySlots,
      totalBackpackSlots,
      usedBodySlots,
      usedBackpackSlots,
      itemsInBody, // Retorna os itens filtrados para o InventoryGrid usar
      itemsInBackpack, // Retorna os itens filtrados para o InventoryGrid usar
    };
  }, [character, backpackCapacity]); // Mantém dependências

  const {
    totalBodySlots,
    totalBackpackSlots,
    usedBodySlots,
    usedBackpackSlots,
    itemsInBody,
    itemsInBackpack,
  } = calculateSlots();

  const fetchCharacteristics = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/charactertraits",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCharacteristics(response.data);
    } catch (error) {
      console.error("Erro ao buscar características:", error);
    }
  };

  const fetchAssimilations = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/assimilations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssimilations(response.data);
    } catch (error) {
      console.error("Erro ao buscar assimilações:", error);
    }
  };

  const fetchInventoryItems = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/items",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInventoryItems(response.data);
    } catch (error) {
      console.error("Erro ao buscar itens do inventário:", error);
    }
  };

  const saveHealthLevels = async (updatedHealthLevels, newCurrentLevel) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/health`,
        {
          healthLevels: updatedHealthLevels,
          currentHealthLevel: newCurrentLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Erro ao salvar os níveis de saúde:", error);
    }
  };

  const handleUseConsumable = (invItemToUse) => {
    // Pega os detalhes do item a ser usado (novo 'itemData' ou antigo 'item')
    const itemToUseDetails = invItemToUse?.itemData || invItemToUse?.item;

    if (!itemToUseDetails) {
      console.error("Tentativa de usar um item inválido:", invItemToUse);
      alert("Erro: Não foi possível usar o item.");
      return;
    }
    // Pega o ID base para comparação
    const baseIdToUse = itemToUseDetails.originalItemId || itemToUseDetails._id;

    setCharacter((prev) => {
      let itemFoundAndUsed = false; // Flag para garantir que só um item seja decrementado

      const updatedInventory = prev.inventory
        .map((invItem) => {
          // Se já usamos o item, apenas retorna os restantes
          if (itemFoundAndUsed) {
            return invItem;
          }

          // Pega os detalhes do item atual no loop
          const currentItemDetails = invItem?.itemData || invItem?.item;

          // Se o item atual for inválido ou o ID base não bater, mantém o item
          if (
            !currentItemDetails ||
            (currentItemDetails.originalItemId || currentItemDetails._id) !==
              baseIdToUse
          ) {
            return invItem;
          }

          if (
            invItem.quality === invItemToUse.quality &&
            invItem.slotLocation === invItemToUse.slotLocation &&
            invItem.quantity === invItemToUse.quantity && // Compara quantidade original
            invItem.currentUses === invItemToUse.currentUses &&
            invItem.quantity > 0 // Garante que ainda há o que consumir
          ) {
            // Encontramos a instância exata! Decrementa a quantidade.
            itemFoundAndUsed = true;
            return { ...invItem, quantity: invItem.quantity - 1 };
          }

          // IDs base batem, mas instância diferente. Mantém este item.
          return invItem;
        })
        .filter((invItem) => invItem.quantity > 0); // Remove itens com quantidade 0 após o map

      // Se não encontramos o item exato para usar
      if (!itemFoundAndUsed) {
        console.warn(
          "handleUseConsumable: Não foi possível encontrar a instância exata do item para usar.",
          invItemToUse
        );
        return prev; // Retorna estado anterior
      }

      // Retorna o estado com o inventário atualizado
      return { ...prev, inventory: updatedInventory };
      // O useEffect que salva o inventário cuidará do backend
    });

    console.log("Usou item:", itemToUseDetails.name);
  };

  const handleHealthChange = (index, value) => {
    if (!character || !Array.isArray(character.healthLevels)) return;

    const updatedHealthLevels = [...character.healthLevels];

    if (index >= 0 && index < updatedHealthLevels.length) {
      updatedHealthLevels[index] = value || 0;

      const newCurrentLevel = 6 - index;

      setCharacter((prev) => ({
        ...prev,
        healthLevels: updatedHealthLevels,
        healthPoints: updatedHealthLevels.reduce((acc, cur) => acc + cur, 0),
        currentHealthLevel: newCurrentLevel,
      }));

      saveHealthLevels(updatedHealthLevels, newCurrentLevel);
    }
  };

  const handleHealthClick = (level) => {
    setSelectedHealthLevel(level);
    setOpenHealthModal(true);
  };

  const getHealthDescription = (level) => {
    return (
      healthLevelDetails[level]?.description || "Descrição não disponível."
    );
  };

  const handleCustomRoll = () => {
    const results = rollCustomDice(customDiceFormula);
    addRollToHistory({ formula: customDiceFormula, roll: results }, true);
  };

  const handleQualityChange = (itemToChange, newQuality) => {
    // Validação básica da qualidade
    if (newQuality < 0 || newQuality > 6) return;

    setCharacter((prevCharacter) => {
      const itemIndex = prevCharacter.inventory.findIndex((invItem) => {
        const currentItemDetails = invItem?.itemData || invItem?.item;
        const itemToChangeDetails =
          itemToChange?.itemData || itemToChange?.item;
        if (!currentItemDetails || !itemToChangeDetails) return false;

        return (
          (currentItemDetails.originalItemId || currentItemDetails._id) ===
            (itemToChangeDetails.originalItemId || itemToChangeDetails._id) &&
          invItem.quality === itemToChange.quality &&
          invItem.slotLocation === itemToChange.slotLocation &&
          invItem.quantity === itemToChange.quantity &&
          invItem.currentUses === itemToChange.currentUses
        );
      });

      if (itemIndex === -1) {
        console.warn(
          "handleQualityChange: Item não encontrado para alterar qualidade.",
          itemToChange
        );
        return prevCharacter; // Retorna estado anterior
      }

      // Cria o novo array de inventário com a qualidade atualizada
      const updatedInventory = [
        ...prevCharacter.inventory.slice(0, itemIndex),
        { ...prevCharacter.inventory[itemIndex], quality: newQuality }, // Atualiza a qualidade
        ...prevCharacter.inventory.slice(itemIndex + 1),
      ];

      return { ...prevCharacter, inventory: updatedInventory };
    });
  };

  const generationTranslations = {
    preCollapse: "Pré-Colapso",
    postCollapse: "Pós-Colapso",
    collapse: "Colapso",
    current: "Atual",
  };

  const handleAssimilatedRoll = (instinct, selectedInstinctKey) => {
    if (!selectedInstinctKey) {
      alert("Selecione um instinto para combinar.");
      return;
    }

    const diceCount =
      (instincts[instinct] || 0) + (instincts[selectedInstinctKey] || 0);
    const roll = Array.from({ length: diceCount }, () => {
      const face = Math.floor(Math.random() * 12) + 1;
      return { face, result: dados.d12[face] || [], sides: 12 };
    });

    addRollToHistory(
      {
        skill: `Assimilado: ${translateKey(instinct)} + ${translateKey(
          selectedInstinctKey
        )}`,
        roll: roll,
      },
      true
    );
  };

  const handleOpenCharacteristicsMenu = () => {
    setEditItem((prevEditItem) => ({
      ...prevEditItem,
      showCharacteristicsMenu: true,
    }));
  };

  const handleCharacteristicsChange = (updatedItem) => {
    setEditItem((prevEditItem) => ({
      ...prevEditItem,
      item: updatedItem,
    }));
  };

  const handleItemEdit = async (index, updatedItem) => {
    const token = localStorage.getItem("token");
    try {
      const updatedInventory = [...character.inventory];
      updatedInventory[index] = {
        ...updatedInventory[index],
        item: updatedItem,
        quality: updatedItem.quality || 0,
      };

      const payload = {
        inventory: updatedInventory.map((invItem) => ({
          item: invItem.item._id || invItem.item,
          quality: invItem.quality,
          characteristics: {
            points: invItem.item.characteristics.points,
            details: invItem.item.characteristics.details.map((detail) => ({
              name: detail.name,
              description: detail.description,
              cost: detail.cost,
            })),
          },
        })),
      };

      console.log("Payload enviado ao backend:", payload);

      try {
        console.log("Enviando dados para o backend:", payload);
        const response = await axios.put(
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/inventory`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Resposta do backend:", response.data);
      } catch (error) {
        console.error("Erro ao fazer requisição:", error);
      }

      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        inventory: updatedInventory,
      }));

      setEditItem(null);
    } catch (error) {
      console.error("Erro ao salvar o item:", error);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleEditItem = (invItem) => {
    if (!invItem || (!invItem.item && !invItem.itemData)) {
      console.error(
        "Tentativa de editar um item de inventário inválido:",
        invItem
      );
      alert("Não é possível editar este item. Dados inválidos.");
      return;
    }
    setEditItem({ invItemData: invItem }); // Passa o invItem inteiro
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    
    // Verifica se um ficheiro foi selecionado
    if (file) {
      // 1. Cria o FormData
      const formData = new FormData();
      formData.append("avatar", file); // Anexa o ficheiro com a chave 'avatar'

      try {
        const token = localStorage.getItem("token");
        
        // 2. Envia o FormData para a NOVA rota
        const response = await axios.put(
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.character) {
          setCharacter(response.data.character);
        }

      } catch (error) {
        console.error("Erro ao fazer upload do avatar:", error);
        alert("Falha ao atualizar o avatar.");
      }
    }
  };

  const handleCharacteristicDelete = (index) => {
    setCharacter((prevCharacter) => {
      const newCharacteristics = [...(prevCharacter?.characteristics || [])];
      newCharacteristics.splice(index, 1);
      return { ...prevCharacter, characteristics: newCharacteristics };
    });
  };

  // Função para salvar as edições do item (Frontend + Backend)
  const handleSaveItemEdit = (
    originalInvItemData,
    updatedItemDataFromDialog
  ) => {
    setCharacter((prevCharacter) => {
      // Tenta encontrar o item de forma mais robusta
      const itemIndex = prevCharacter.inventory.findIndex((invItem) => {
        // Se ambos têm itemData, compara IDs originais
        if (invItem.itemData && originalInvItemData.itemData) {
          return (
            invItem.itemData.originalItemId ===
              originalInvItemData.itemData.originalItemId &&
            invItem.quality === originalInvItemData.quality && // Compara campos da instância
            invItem.slotLocation === originalInvItemData.slotLocation &&
            invItem.quantity === originalInvItemData.quantity
          );
        }
        // Se ambos têm item (estrutura antiga), compara IDs
        else if (invItem.item && originalInvItemData.item) {
          // Verifica se item é objeto com _id ou apenas string ObjectId
          const originalId =
            typeof originalInvItemData.item === "string"
              ? originalInvItemData.item
              : originalInvItemData.item._id;
          const currentId =
            typeof invItem.item === "string" ? invItem.item : invItem.item._id;
          return (
            currentId === originalId &&
            invItem.quality === originalInvItemData.quality &&
            invItem.slotLocation === originalInvItemData.slotLocation &&
            invItem.quantity === originalInvItemData.quantity
          );
        }
        // Se as estruturas forem mistas ou inválidas, não encontra
        return false;
      });

      if (itemIndex === -1) {
        console.error(
          "Não foi possível encontrar o item original no inventário para salvar as edições."
        );
        alert("Erro ao salvar: Item não encontrado no inventário.");
        return prevCharacter; // Retorna estado anterior se não encontrar
      }

      // Cria a nova versão do item de inventário SEMPRE com a estrutura itemData
      const updatedInvItem = {
        ...prevCharacter.inventory[itemIndex],
        itemData: updatedItemDataFromDialog,
      };
      // Remove o campo 'item' obsoleto, caso exista
      delete updatedInvItem.item;

      // Cria o novo array de inventário
      const updatedInventory = [
        ...prevCharacter.inventory.slice(0, itemIndex),
        updatedInvItem, // Insere o item atualizado (já com itemData)
        ...prevCharacter.inventory.slice(itemIndex + 1),
      ];

      console.log(
        "Inventário atualizado localmente (item editado):",
        updatedInventory
      );
      return { ...prevCharacter, inventory: updatedInventory };
      // O useEffect que salva o inventário cuidará do backend
    });
  };

  const handleAssimilationDelete = (index) => {
    setCharacter((prevCharacter) => {
      const newAssimilations = [...(prevCharacter?.assimilations || [])];
      newAssimilations.splice(index, 1);
      return { ...prevCharacter, assimilations: newAssimilations };
    });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenItemsModal = () => {
    fetchInventoryItems();
    setOpenItemsModal(true);
  };

  const handleOpenAssimilationsModal = () => {
    fetchAssimilations();
    setOpenAssimilationsModal(true);
  };

  const handleOpenCharacteristicsModal = () => {
    fetchCharacteristics();
    setOpenCharacteristicsModal(true);
  };

  const handleCloseItemsModal = () => setOpenItemsModal(false);
  const handleCloseAssimilationsModal = () => setOpenAssimilationsModal(false);
  const handleCloseCharacteristicsModal = () =>
    setOpenCharacteristicsModal(false);

  const handleItemSelect = (itemFromModal) => {
    // Renomeado para clareza
    // Calcula os slots necessários JÁ considerando modificador "Pesado"
    let slotsNeeded = itemFromModal.slots || 1;
    if (itemFromModal.modifiers?.includes("Pesado")) {
      slotsNeeded += 1;
    }

    const { usedBackpackSlots, totalBackpackSlots } = calculateSlots();

    // Regra: Impede adicionar se não houver espaço na mochila
    if (usedBackpackSlots + slotsNeeded > totalBackpackSlots) {
      alert("Espaço insuficiente na mochila!");
      return;
    }

    const newItemInstance = {
      // Campos específicos da instância
      quantity: 1, // Começa com 1
      quality: itemFromModal.quality || 3, // Pega a qualidade base do item
      slotLocation: "mochila",
      currentUses: 0,
      // Copia os dados do item original para itemData
      itemData: {
        originalItemId: itemFromModal._id, // Guarda a referência ao original
        name: itemFromModal.name,
        type: itemFromModal.type,
        category: itemFromModal.category,
        slots: itemFromModal.slots,
        modifiers: itemFromModal.modifiers || [],
        isArtefato: itemFromModal.isArtefato || false,
        resourceType: itemFromModal.resourceType || null,
        isConsumable: itemFromModal.isConsumable || false,
        description: itemFromModal.description || "",
        characteristics: itemFromModal.characteristics || {
          points: 0,
          details: [],
        },
        // Não copiamos quality aqui, pois usamos o campo quality de cima
      },
    };

    setCharacter((prev) => ({
      ...prev,
      // Adiciona a nova instância (com itemData) ao inventário
      inventory: [...(prev?.inventory || []), newItemInstance],
    }));
    // O useEffect que salva o inventário cuidará do backend

    handleCloseItemsModal();
  };

  const handleAssimilationSelect = (assimilation) => {
    // Adiciona a assimilação ao array 'assimilations' do personagem
    setCharacter((prev) => ({
      ...prev,
      assimilations: [...(prev?.assimilations || []), assimilation],
    }));

    // Fecha o modal correto
    handleCloseAssimilationsModal();
  };

  const handleCharacteristicSelect = (characteristic) => {
    // Adiciona a característica ao array 'characteristics' do personagem
    setCharacter((prev) => ({
      ...prev,
      characteristics: [...(prev?.characteristics || []), characteristic],
    }));

    // Fecha o modal correto
    handleCloseCharacteristicsModal();
  };

  const handleMoveItem = (itemToMove, targetLocation) => {
    const itemDetails = itemToMove?.itemData || itemToMove?.item;

    if (!itemDetails) {
      console.error("Tentativa de mover um item inválido:", itemToMove);
      alert("Erro: Não foi possível mover o item.");
      return;
    }

    // Calcula os slots necessários LENDO DE itemDetails
    let slotsNeeded = itemDetails.slots || 1;
    if (itemDetails.modifiers?.includes("Pequeno")) {
      slotsNeeded = 0;
    } else if (slotsNeeded < 1) {
      slotsNeeded = 1;
    }
    if (itemDetails.modifiers?.includes("Pesado")) {
      slotsNeeded += 1;
    }
   

    // Pega os slots usados/totais (função calculateSlots já está correta)
    const {
      usedBodySlots,
      totalBodySlots,
      usedBackpackSlots,
      totalBackpackSlots,
    } = calculateSlots(); //

    // Verifica espaço no destino
    if (
      targetLocation === "corpo" &&
      usedBodySlots + slotsNeeded > totalBodySlots
    ) {
      alert("Espaço insuficiente no corpo!");
      return;
    }

    if (
      targetLocation === "mochila" &&
      usedBackpackSlots + slotsNeeded > totalBackpackSlots
    ) {
      alert("Espaço insuficiente na mochila!");
      return;
    }

    // Atualiza o inventário localmente (lógica de encontrar o item melhorada)
    setCharacter((prev) => {
      let itemFound = false;
      const updatedInventory = prev.inventory.map((invItem) => {
        const currentItemDetails = invItem?.itemData || invItem?.item;
        // Compara IDs base e propriedades da instância para encontrar o item correto
        if (
          !itemFound &&
          currentItemDetails &&
          (currentItemDetails.originalItemId || currentItemDetails._id) ===
            (itemDetails.originalItemId || itemDetails._id) &&
          invItem.quality === itemToMove.quality &&
          invItem.quantity === itemToMove.quantity &&
          invItem.slotLocation === itemToMove.slotLocation // Compara localização original
          /* Adicione mais comparações se necessário */
        ) {
          itemFound = true;
          return { ...invItem, slotLocation: targetLocation }; // Atualiza a localização
        }
        return invItem;
      });

      if (!itemFound) {
        console.warn(
          "handleMoveItem: Não foi possível encontrar a instância exata do item para mover.",
          itemToMove
        );
        return prev; // Retorna estado anterior se não encontrar
      }

      return { ...prev, inventory: updatedInventory };
      // O useEffect que salva o inventário cuidará do backend
    });
  };

  // Função para deletar um item específico do inventário
  const handleItemDelete = (itemToDelete) => {
    // Pega os detalhes do item a ser deletado (funciona com itemData ou item)
    const itemToDeleteDetails = itemToDelete?.itemData || itemToDelete?.item;

    // Se o item a deletar for inválido, interrompe
    if (!itemToDeleteDetails) {
      console.error("Tentativa de deletar um item inválido:", itemToDelete);
      alert("Erro: Não foi possível identificar o item para exclusão.");
      return;
    }

    // Pega o ID base (originalItemId da nova estrutura ou _id da antiga)
    const baseIdToDelete =
      itemToDeleteDetails.originalItemId || itemToDeleteDetails._id;

    setCharacter((prev) => {
      let itemFoundAndDeleted = false; // Flag para garantir que só um item seja removido

      const newInventory = prev.inventory.filter((invItem) => {
        // Se já encontramos e removemos o item, mantemos todos os restantes
        if (itemFoundAndDeleted) {
          return true;
        }

        // Pega os detalhes do item atual no loop do filtro
        const currentItemDetails = invItem?.itemData || invItem?.item;

        // Se o item atual for inválido ou o ID base não bater, mantém o item
        if (
          !currentItemDetails ||
          (currentItemDetails.originalItemId || currentItemDetails._id) !==
            baseIdToDelete
        ) {
          return true; // Mantém este item
        }

        if (
          invItem.quality === itemToDelete.quality &&
          invItem.slotLocation === itemToDelete.slotLocation &&
          invItem.quantity === itemToDelete.quantity && // Compara quantidade
          // Adicione mais comparações se necessário (ex: currentUses)
          invItem.currentUses === itemToDelete.currentUses
        ) {
          // Encontramos a instância EXATA que queremos remover
          itemFoundAndDeleted = true; // Marca que encontramos
          return false; // Remove este item do inventário
        }

        // IDs base batem, mas as propriedades da instância são diferentes. Mantém este item.
        return true;
      });

      // Se após o filtro, a flag não foi ativada, algo deu errado (o item não foi encontrado)
      if (!itemFoundAndDeleted) {
        console.warn(
          "handleItemDelete: Não foi possível encontrar a instância exata do item para deletar.",
          itemToDelete
        );
        // Retorna o estado anterior para evitar exclusões acidentais
        return prev;
      }

      // Retorna o estado com o inventário atualizado (item removido)
      return { ...prev, inventory: newInventory };
      // O useEffect que salva o inventário cuidará do backend
    });
  };

  const saveCharacterDetails = async (updatedDetails) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/details`,
        updatedDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Erro ao salvar os detalhes do personagem:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setCharacter((prevCharacter) => {
      const updatedCharacter = { ...prevCharacter, [field]: value };
      saveCharacterDetails({ [field]: value });
      return updatedCharacter;
    });
  };

  const saveCharacterInventory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/inventory`,
        {
          inventory: character?.inventory,
          characteristics: character?.characteristics,
          assimilations: character?.assimilations,
          notes: notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Erro ao salvar o inventário do personagem:", error);
    }
  };

  useEffect(() => {
    if (character?.inventory) {
      saveCharacterInventory();
    }
  }, [
    character?.inventory,
    character?.characteristics,
    character?.assimilations,
    notes,
  ]);

  const handleCreateNewHomebrew = () => {
    console.log("Criar nova Homebrew");
  };

  const sendRollToCampaignBackend = useCallback(
    async (rollData) => {
      const token = localStorage.getItem("token");
      if (!character?.campaign || !token || !user) {
        console.log(
          "Não é possível enviar para a campanha: Personagem não está em uma campanha, token ausente ou usuário não definido."
        );
        return;
      }

      const rollDataToSend = {
        rollerId: user._id,
        rollerName: user.name || character.name,
        characterId: id,
        formula: rollData.formula || rollData.skill,
        roll: rollData.roll,
        timestamp: Date.now(),
      };

      try {
        await axios.post(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${character.campaign}/roll`,
          rollDataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          "Rolagem enviada com sucesso para a campanha!",
          rollDataToSend
        );
      } catch (err) {
        console.error(
          "Falha ao enviar rolagem para a campanha:",
          err.response?.data || err.message
        );
      }
    },
    [character?.campaign, id, user, character?.name]
  );

  const addRollToHistory = useCallback(
    async (rollData, displayInSnackbar = false) => {
      const token = localStorage.getItem("token");
      const rollDataWithTimestamp = {
        rollerName: character?.name || user?.name || "Jogador",
        timestamp: Date.now(),
        ...rollData,
      };

      await saveLastRollToBackend(id, rollDataWithTimestamp);

      setRollHistory((prevHistory) => {
        const newHistory = [...prevHistory, rollDataWithTimestamp].slice(-5);
        return newHistory;
      });

      sendRollToCampaignBackend(rollDataWithTimestamp);

      if (displayInSnackbar) {
        if (rollData.skill) {
          setRollResult({ skill: rollData.skill, roll: rollData.roll });
          setCustomRollResult(null);
        } else if (rollData.formula) {
          setCustomRollResult({
            formula: rollData.formula,
            roll: rollData.roll,
          });
          setRollResult(null);
        }
        setSnackbarKey((prevKey) => prevKey + 1);
        setSnackbarOpen(true);
      }
    },
    [id, character?.name, user?.name, sendRollToCampaignBackend]
  );

  const handleInstinctChange = useCallback((instinctKey, value) => {
    setSelectedInstinct((prev) => ({ ...prev, [instinctKey]: value }));
  }, []);

  const handleFabClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const popoverId = openPopover ? "history-popover" : undefined;

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  const RollHistoryPopover = ({ open, anchorEl, onClose, rollHistory }) => (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          bgcolor: "#1e1e1e", // Fundo escuro
          color: "#e0e0e0", // Texto claro
          border: "1px solid #4a4a4a", // Borda
          borderRadius: "8px", // Bordas arredondadas
        },
      }}
    >
      <Box sx={{ width: 350, padding: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#ffffff", borderBottom: "1px solid #4a4a4a", pb: 1 }} // <-- Cor e borda
        >
          Histórico de Rolagens
        </Typography>
        {rollHistory.length === 0 ? (
          <Typography sx={{ color: "#aaa", fontStyle: "italic" }}>
            {" "}
            {/* <-- Cor */}
            Nenhuma rolagem registrada.
          </Typography>
        ) : (
          rollHistory.map((entry, index) => (
            <Box
              key={index}
              sx={{
                transition:
                  "background-color 0.3s ease-in-out, opacity 0.5s ease-out",
                padding: 1,
                marginBottom: 1,
                borderRadius: 1,
                // Destaque para a entrada mais recente (última do array)
                backgroundColor:
                  index === rollHistory.length - 1 ? "#2a2d30" : "transparent",
                opacity: index === rollHistory.length - 1 ? 1 : 0.7,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight:
                    index === rollHistory.length - 1 ? "bold" : "normal",
                  color: "#e0e0e0", // <-- Cor
                }}
              >
                {entry.skill
                  ? `Habilidade: ${translateKey(entry.skill)}`
                  : `Fórmula: ${entry.formula}`}
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
              >
                {entry.roll.map((result, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ marginRight: 1, color: "#ccc" }}
                    >
                      {" "}
                      Dado {i + 1} (d{result.sides || "?"})
                    </Typography>
                    {result.result.length > 0 ? (
                      result.result.map((imgSrc, j) => (
                        <img
                          key={j}
                          src={imgSrc}
                          alt={`Resultado ${j + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/path/to/default-image.png";
                          }}
                          style={{
                            width: "20px",
                            height: "20px",
                            margin: "2px",
                          }}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#aaa", fontWeight: "bold" }}
                      >
                        {result.face ? result.face : "Nada"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Popover>
  );

  if (!character) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#0c0c0c",
          color: "white",
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>
          Carregando ficha do personagem...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.characterSheet}>
      <Paper
        elevation={3}
        sx={{ bgcolor: "#1e1e1e" }}
        className={styles.characterHeader}
      >
        <Grid container spacing={-2} alignItems="center">
          <Grid
            item
            xs={12} // Em telas pequenas, o avatar fica em cima
            sm={4} // Em telas médias e grandes, ocupa 4/12
            md={3} // Em telas grandes, ocupa 3/12
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 2,
            }}
          >
            <Box
              sx={{
                width: { xs: 120, sm: 150 }, // Tamanho
                height: { xs: 120, sm: 150 },
                position: "relative", // Posição
                // O hover foi movido para este Box
                "&:hover .upload-avatar-button": {
                  opacity: 1,
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "3px solid #4a4a4a",
                  bgcolor: "#2a2d30",
                  overflow: "hidden", // Isto agora só corta a imagem
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* O seu código da imagem (mantido igual) */}
                {character.avatar ? (
                  <Box
                    component="img"
                    src={character.avatar}
                    alt="Avatar"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    Sem Avatar
                  </Typography>
                )}
              </Box>

              {/* 3. INPUT OCULTO (FILHO 2) 
                 Agora é irmão do Box da imagem
              */}
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload-input"
                type="file"
                onChange={handleAvatarChange}
              />

              {/* 4. O BOTÃO DE EDITAR (FILHO 3)
                 Agora é irmão do Box da imagem e não é cortado
              */}
              <label htmlFor="avatar-upload-input">
                <IconButton
                  className="upload-avatar-button"
                  component="span"
                  sx={{
                    // Os estilos do botão (mantidos iguais)
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    opacity: 0.3,
                    transition: "opacity 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      opacity: 1,
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </label>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Nome"
                  value={character?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Geração"
                  value={
                    generationTranslations[character?.generation] ||
                    character?.generation ||
                    ""
                  }
                  onChange={(e) =>
                    handleInputChange("generation", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Evento"
                  value={character?.event || ""}
                  onChange={(e) => handleInputChange("event", e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Ocupação"
                  value={character?.occupation || ""}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Propósito 1"
                  value={character?.purpose1 || ""}
                  onChange={(e) =>
                    handleInputChange("purpose1", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Propósito 2"
                  value={character?.purpose2 || ""}
                  onChange={(e) =>
                    handleInputChange("purpose2", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Propósito Relacional 1"
                  value={character?.relationalPurpose1 || ""}
                  onChange={(e) =>
                    handleInputChange("relationalPurpose1", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Propósito Relacional 2"
                  value={character?.relationalPurpose2 || ""}
                  onChange={(e) =>
                    handleInputChange("relationalPurpose2", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "14px", sm: "16px" },
                    },
                    "& .MuiInputBase-input": { color: "#fff" },
                    "& .MuiInputLabel-root": { color: "#ccc" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#888" },
                      "&:hover fieldset": { borderColor: "#fff" },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          {/* --- FIM: Coluna dos Campos de Texto --- */}
        </Grid>
      </Paper>
      <Box className={styles.characterBody}>
        <Paper
          elevation={3}
          className={styles.leftColumn}
          sx={{
            bgcolor: "#1e1e1e",
            color: "#ccc",
            width: "100%",
            padding: { xs: "16px", sm: "18px" },
          }}
        >
          <InstinctList
            title="Instintos"
            instincts={instincts}
            selectedInstinct={selectedInstinct}
            handleInstinctChange={handleInstinctChange}
            onAssimilatedRoll={handleAssimilatedRoll}
            id={character?._id}
          />
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Saúde
          </Typography>

          {character?.healthLevels?.map((points, index) => {
            const level = 6 - index; // Nível atual (de 6 a 1)
            const details = healthLevelDetails[level];
            const maxHealthForLevel =
              1 +
              (character?.instincts?.potency || 0) +
              (character?.instincts?.resolution || 0);

            return (
              <Tooltip
                title={details.description}
                placement="right"
                key={level}
              >
                <Box className={styles.healthBar} mb={2}>
                  <Typography
                    variant="body1"
                    onClick={() => handleHealthClick(level)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { color: "primary.main" },
                      minWidth: "120px", // Aumentado para caber o nome
                      fontWeight:
                        character.currentHealthLevel === level
                          ? "bold"
                          : "normal",
                      color:
                        character.currentHealthLevel === level
                          ? "primary.main"
                          : "#ccc",
                    }}
                  >
                    {details.name}:
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Rating
                      name={`health-${level}`}
                      value={points}
                      max={maxHealthForLevel}
                      onChange={(e, newValue) =>
                        handleHealthChange(index, newValue)
                      }
                      precision={1}
                      icon={
                        <HeartFullIcon
                          width={20}
                          height={30}
                          style={{ fill: "#f72c36ff" }}
                        />
                      }
                      emptyIcon={
                        <HeartEmptyIcon
                          width={20}
                          height={30}
                          style={{ fill: "rgba(206, 197, 197, 0.26)" }}
                        />
                      }
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        minWidth: "60px",
                        textAlign: "right",
                        color: "#ccc",
                      }}
                    >
                      {`${points} / ${maxHealthForLevel}`}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            );
          })}

          {character && (
            <TugOfWar character={character} setCharacter={setCharacter} />
          )}
        </Paper>
        <Paper
          elevation={3}
          className={styles.centerColumn}
          sx={{
            width: "100%",
            padding: { xs: "18px", sm: "26px" },
            bgcolor: "#1e1e1e",
          }}
        >
          <SkillList
            title="Conhecimentos & Práticas"
            id={character?._id}
            character={character}
            addRollToHistory={addRollToHistory}
          />
        </Paper>

        <Paper
          elevation={3}
          className={styles.rightColumn}
          sx={{
            width: "100%",
            padding: { xs: "16px", sm: "18px" },
            bgcolor: "#1e1e1e",
          }}
        >
          <Box sx={{ marginTop: "16px", marginBottom: "16px" }}>
            <Typography variant="h6" sx={{ color: "#ccc" }} mb={1}>
              Rolar Dados
            </Typography>

            <TextField
              label="Fórmula dos Dados (ex: 1d6+2d10+3d12)"
              value={customDiceFormula}
              onChange={(e) => setCustomDiceFormula(e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense"
              size="small"
              sx={{
                // <-- 'sx' COMPLETAMENTE ATUALIZADO
                fontSize: { xs: "14px", sm: "16px" },
                "& .MuiInputBase-input": { color: "#fff" }, // Texto digitado
                "& .MuiInputLabel-root": { color: "#ccc" }, // Label
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#888" }, // Borda padrão
                  "&:hover fieldset": { borderColor: "#fff" }, // Borda no hover
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCustomRoll}
              sx={{
                padding: { xs: "8px 16px", sm: "10px 20px" },
                fontSize: { xs: "14px", sm: "16px" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Rolar
            </Button>
          </Box>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="inherit" 
            variant="fullWidth"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              color: "#fff", 
            }}
          >
            <Tab
              label="Inventário"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
                color: "inherit", 
              }}
            />
            <Tab
              label="Anotações"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
                color: "inherit",
              }}
            />
            <Tab
              label="Características"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
                color: "inherit", 
              }}
            />
            <Tab
              label="Assimilações"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
                color: "inherit",
              }}
            />
          </Tabs>
          {selectedTab === 0 && (
            <Box className={styles.inventoryContainer}>
              {" "}
              {/* Trocado de Paper para Box */}
              {/* --- CABEÇALHO --- */}
              <Box className={styles.inventoryHeader}>
                <Typography variant="h5" className={styles.headerTitle}>
                  Inventário
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenItemsModal} //
                >
                  + Adicionar Item do Arsenal
                </Button>
              </Box>
              <InventoryGrid
                title={`Acesso Rápido (${usedBodySlots}/${totalBodySlots})`} //
                items={itemsInBody} //
                totalSlots={totalBodySlots} //
                onMove={(item) => handleMoveItem(item, "mochila")} //
                onDelete={handleItemDelete} //
                onEdit={handleEditItem}
                onUse={handleUseConsumable}
                location="corpo"
                styles={styles} //
                qualityLevels={qualityLevels} //
                placeholders={quickAccessPlaceholders} // Passa os placeholders (Arma, Utilidade, etc.)
              />
              <InventoryGrid
                title={`Mochila (${usedBackpackSlots}/${totalBackpackSlots})`} //
                items={itemsInBackpack} //
                totalSlots={totalBackpackSlots} //
                onMove={(item) => handleMoveItem(item, "corpo")} //
                onDelete={handleItemDelete}
                onUse={handleUseConsumable} //
                onEdit={handleEditItem} //
                location="mochila"
                styles={styles} //
                qualityLevels={qualityLevels} //
                // Não passa placeholders, então mostrará slots vazios genéricos
              />
            </Box>
          )}
          {selectedTab === 1 && (
            <Box sx={{ padding: 2 }}>
              {" "}
              {/* Adiciona padding para bater com o inventário */}
              <Typography variant="h6" sx={{ color: "#fff" }}>
                Anotações
              </Typography>
              <TextField
                label="Anotações"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  // <-- Adiciona estilos de tema escuro
                  "& .MuiInputBase-root": {
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#888",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#fff",
                    },
                  },
                  "& .MuiInputLabel-root": { color: "#ccc" },
                }}
              />
            </Box>
          )}
          {selectedTab === 2 && (
            <Box sx={{ padding: 2 }}>
              {" "}
              {/* Adiciona padding */}
              <Typography variant="h6" sx={{ color: "#fff" }}>
                Características
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenCharacteristicsModal}
                sx={{
                  padding: { xs: "8px 16px", sm: "10px 20px" },
                  fontSize: { xs: "14px", sm: "16px" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                +
              </Button>
              <List>
                {(character?.characteristics || []).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.name}
                      secondary={item.description}
                      primaryTypographyProps={{ sx: { color: "#fff" } }} // <-- Cor primária
                      secondaryTypographyProps={{ sx: { color: "#ccc" } }} // <-- Cor secundária
                    />
                    <Box display="flex" alignItems="center">
                      <IconButton
                        edge="end"
                        onClick={() => handleCharacteristicDelete(index)}
                        sx={{ color: "#fff" }} // <-- Cor do ícone
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {selectedTab === 3 && (
            <Box sx={{ padding: 2 }}>
              {" "}
              {/* Adiciona padding */}
              <Typography variant="h6" sx={{ color: "#fff" }}>
                Assimilações
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAssimilationsModal}
                sx={{
                  padding: { xs: "8px 16px", sm: "10px 20px" },
                  fontSize: { xs: "14px", sm: "16px" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                +
              </Button>
              <List>
                {(character?.assimilations || []).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.name}
                      secondary={item.description}
                      primaryTypographyProps={{ sx: { color: "#fff" } }} // <-- Cor primária
                      secondaryTypographyProps={{ sx: { color: "#ccc" } }} // <-- Cor secundária
                    />
                    <Box display="flex" alignItems="center">
                      <IconButton
                        edge="end"
                        onClick={() => handleAssimilationDelete(index)}
                        sx={{ color: "#fff" }} // <-- Cor do ícone
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        key={snackbarKey}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{
            width: "400px",
            maxWidth: "100%",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Resultado:
          </Typography>
          <Typography variant="subtitle1">
            {/* Habilidade ou Fórmula */}
            {rollResult?.skill
              ? `${translateKey("Habilidade")}: ${
                  translateKey(rollResult.skill) || rollResult.skill
                }`
              : `${translateKey("Fórmula")}: ${customRollResult?.formula}`}
          </Typography>

          {/* Mensagem de Efeito (para Qualidade de Item) */}
          {rollResult?.effectMessage && (
            <Typography
              variant="body2"
              sx={{ color: "#66bb6a", fontStyle: "italic", my: 1 }}
            >
              {rollResult.effectMessage}
            </Typography>
          )}

          <Typography variant="body1" sx={{ mt: 1 }}>
            {translateKey("Dados Individuais")}:
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {(rollResult?.roll || customRollResult?.roll)?.length > 0 ? (
              (rollResult?.roll || customRollResult?.roll).map((die, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 1,
                    bgcolor: "rgba(0,0,0,0.2)",
                    borderRadius: 1,
                    minWidth: "60px",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#ccc", fontWeight: "bold" }}
                  >
                    Dado {index + 1} (d{die.sides || "?"})
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      minHeight: "30px",
                      alignItems: "center",
                    }}
                  >
                    {die.result.length > 0 ? (
                      die.result.map((imgSrc, i) => (
                        <img
                          key={i}
                          src={imgSrc}
                          alt="symbol"
                          style={{
                            width: "25px",
                            height: "25px",
                            margin: "2px",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/path/to/default-image.png";
                          }}
                        />
                      ))
                    ) : (
                      // Mostra o número da face se não houver símbolos
                      <Typography
                        variant="h6"
                        sx={{ color: "#fff", fontWeight: "bold" }}
                      >
                        {die.face}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>Nenhum dado rolado.</Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>

      <Fab
        color="primary"
        aria-label="history"
        onClick={handleFabClick}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <HistoryIcon />
      </Fab>
      <RollHistoryPopover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        rollHistory={rollHistory}
      />
      <CharacteristicsModal
        open={openCharacteristicsModal}
        handleClose={handleCloseCharacteristicsModal}
        title="Características"
        items={characteristics}
        homebrewItems={[]}
        onItemSelect={handleCharacteristicSelect} // <-- CORRETO
        onCreateNewHomebrew={handleCreateNewHomebrew}
      />
      <AssimilationsModal
        open={openAssimilationsModal}
        handleClose={handleCloseAssimilationsModal}
        title="Assimilações"
        items={assimilations}
        homebrewItems={[]}
        onItemSelect={handleAssimilationSelect} // <-- CORRETO
        onCreateNewHomebrew={handleCreateNewHomebrew}
      />
      <ItemsModal
        open={openItemsModal}
        handleClose={handleCloseItemsModal}
        title="Inventário"
        items={inventoryItems}
        homebrewItems={[]}
        onItemSelect={handleItemSelect}
        onCreateNewHomebrew={handleCreateNewHomebrew}
      />
      <EditItemDialog
        editItem={editItem} // Passa o estado que controla a abertura/dados
        onClose={() => setEditItem(null)} // Função para fechar
        onSave={handleSaveItemEdit} // Função para salvar as alterações
      />
      <Fab
        color="primary"
        aria-label="history"
        onClick={handleFabClick}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <HistoryIcon />
      </Fab>
      <RollHistoryPopover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        rollHistory={rollHistory}
      />
      <Dialog
        open={openHealthModal}
        onClose={() => setOpenHealthModal(false)}
        // 1. Adiciona os estilos do Paper (fundo, cor, borda)
        PaperProps={{
          sx: {
            bgcolor: "#1e1e1e",
            color: "#e0e0e0",
            border: "1px solid #4a4a4a",
          },
        }}
      >
        {/* 2. Adiciona estilo ao Título (borda e cor) */}
        <DialogTitle
          sx={{ borderBottom: "1px solid #4a4a4a", color: "#ffffff" }}
        >
          Saúde {selectedHealthLevel}
        </DialogTitle>

        {/* 3. Adiciona estilo ao Conteúdo (padding e cor do texto) */}
        <DialogContent sx={{ paddingTop: "20px !important" }}>
          <Typography sx={{ color: "#e0e0e0" }}>
            {getHealthDescription(selectedHealthLevel)}
          </Typography>
        </DialogContent>

        {/* 4. Adiciona estilo às Ações (borda) */}
        <DialogActions sx={{ borderTop: "1px solid #4a4a4a" }}>
          {/* 5. Altera o botão para usar sx para cor */}
          <Button
            onClick={() => setOpenHealthModal(false)}
            sx={{ color: "#ccc" }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterSheet;