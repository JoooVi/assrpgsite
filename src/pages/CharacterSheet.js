import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSkills,
  updateSkillValue,
  setSelectedInstinct,
} from "../redux/slices/skillsSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link as RouterLink } from "react-router-dom";
import { saveSkillsToBackend } from "../redux/actions/skillActions";
import { updateInstincts } from "../redux/slices/instinctsSlice";
import { fetchInstincts } from "../redux/actions/instinctsActions";
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
  0: 'Abundante',
  1: 'Pedra',
  2: 'Comum',
  3: 'Incomum',
  4: 'Atípico',
  5: 'Raro',
  6: 'Quase Extinto'
};

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
      results.push({ face, result });
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

  // SkillList.js

const handleRoll = useCallback(async (key, itemUsado = null) => { // 1. Aceita um item como parâmetro
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
    let totalDice = skillValue + instinctValue;

    // 2. Objeto para guardar os efeitos da qualidade
    const qualityEffect = {
        bonusDice: '',
        message: ''
    };

    if (itemUsado) {
        // 3. Verifica a qualidade do item e aplica as regras
        switch (itemUsado.quality) {
            case 0: // Quebrado
                alert(`O item "${itemUsado.item.name}" está quebrado e não pode ser usado.`);
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
                qualityEffect.bonusDice = '1d6'; // Adiciona um d6 à rolagem
                qualityEffect.message = `Qualidade (Superior): Adicionado 1d6 à sua rolagem.`;
                break;
            case 6: // Obra-Prima
                // A regra de "três vezes por sessão" exige um gerenciamento de estado mais complexo.
                // Por simplicidade, vamos tratar como um bônus de 1d10 por agora.
                qualityEffect.bonusDice = '1d10';
                qualityEffect.message = `Qualidade (Obra-Prima): Adicionado 1d10 à sua rolagem.`;
                break;
            default: // Padrão (3) ou outros níveis sem efeito mecânico direto
                break;
        }
    }

    const formula = `${totalDice}d10` + (qualityEffect.bonusDice ? `+${qualityEffect.bonusDice}` : '');
    const results = rollCustomDice(formula);

    // 4. Passa a mensagem do efeito para ser exibida no resultado
    setRollResult({ skill: key, roll: results, effectMessage: qualityEffect.message });
    setSnackbarKey((prevKey) => prevKey + 1);
    setSnackbarOpen(true);
    setTimeout(() => setIsRolling(false), 500);
    addRollToHistory({ skill: key, roll: results });

  } catch (error) {
    console.error("Erro ao rolar dados:", error);
    setIsRolling(false);
  }
}, [isRolling, globalSkills, selectedInstinct, instincts, addRollToHistory]);

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

  // ### SEÇÃO MODIFICADA: getSkillDescription ###
  // Criei descrições para as novas perícias. Você pode alterar se quiser.
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
      <Typography variant="h6">{translateKey(title)}</Typography>
      {Object.entries(globalSkills).map(([key, value]) => (
        <Grid container key={key} spacing={3} alignItems="center">
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              onClick={() => handleSkillClick(key)}
              sx={{
                cursor: "pointer",
                color: "text.primary",
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
              <InputLabel>{translateKey("Instinto")}</InputLabel>
              <Select
                label={translateKey("Instinto")}
                value={selectedInstinct[key] || ""}
                onChange={handleInstinctChangee(key)}
                disabled={loading}
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
          <Typography variant="body1">
            {translateKey("Dados Rolados")}:
          </Typography>
          {rollResult?.roll?.length > 0 &&
            rollResult.roll.map((result, index) => (
              <div key={index}>
                <Typography variant="body2">
                  {translateKey("Dado")} {index + 1}:{" "}
                  {result.result.length > 0 ? "" : translateKey("Nada")}
                </Typography>
                {result.result.length > 0 &&
                  result.result.map((imgSrc, i) => (
                    <img
                      key={i}
                      src={imgSrc}
                      alt={`${translateKey("Resultado")} ${i + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/path/to/default-image.png";
                      }}
                      style={{
                        width: "50px",
                        height: "50px",
                        margin: "5px",
                      }}
                    />
                  ))}
              </div>
            ))}
        </Alert>
      </Snackbar>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {selectedSkill &&
            translateKey(
              selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)
            )}
        </DialogTitle>
        <DialogContent>
          <Typography>{getSkillDescription(selectedSkill)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            {translateKey("Fechar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ... O restante do seu código continua aqui sem alterações ...
// ... The rest of your code continues here without changes ...
// (O código é muito longo, então o omiti para focar nas mudanças, mas você deve usar o seu arquivo completo)

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
        <Grid container key={key} spacing={3} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              onClick={() => handleInstinctClick(key)}
              sx={{
                cursor: "pointer",
                color: "text.primary",
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
            />
          </Grid>

          <Grid item xs={12} sm={5} md={3.8}>
            <FormControl
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
            >
              <InputLabel>{translateKey("Instinto")}</InputLabel>
              <Select
                label={translateKey("Instinto")}
                value={selectedInstinct[key] || ""}
                onChange={(e) => handleInstinctChange(key, e.target.value)}
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {selectedInstinctKey &&
            translateKey(
              selectedInstinctKey.charAt(0).toUpperCase() +
                selectedInstinctKey.slice(1)
            )}
        </DialogTitle>
        <DialogContent>
          <Typography>{getInstinctDescription(selectedInstinctKey)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
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

  const calculateTotalWeight = () => {
    const inventoryWeight = (character?.inventory || []).reduce(
      (total, invItem) => {
        if (invItem?.item?.weight) {
          return total + invItem.item.weight;
        }
        return total;
      },
      0
    );

    const weightModifier = character?.buffs?.weightReduction || 0;
    return inventoryWeight - weightModifier;
  };

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
      const response = await axios.get("https://assrpgsite-be-production.up.railway.app/api/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInventoryItems(response.data);
    } catch (error) {
      console.error("Erro ao buscar itens do inventário:", error);
    }
  };

  const saveHealthLevels = async (updatedHealthLevels) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/health`,
        { healthLevels: updatedHealthLevels },
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

  const handleHealthChange = (index, value) => {
    if (!character || !Array.isArray(character.healthLevels)) return;

    const updatedHealthLevels = [...character.healthLevels];

    if (index >= 0 && index < updatedHealthLevels.length) {
      updatedHealthLevels[index] = value || 0;
      setCharacter((prev) => ({
        ...prev,
        healthLevels: updatedHealthLevels,
        healthPoints: updatedHealthLevels.reduce((acc, cur) => acc + cur, 0),
      }));
      saveHealthLevels(updatedHealthLevels);
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

  const handleRoll = (skill, selectedInstinct) => {
    setRollResult(null);
    setCustomRollResult(null);

    if (!selectedInstinct) {
      console.warn("Instinto não selecionado!");
      return;
    }

    const diceCountInstinct = character?.instincts?.[selectedInstinct] || 0;
    const diceCountSkill =
      (character?.knowledge?.[skill] || 0) +
      (character?.practices?.[skill] || 0);

    if (diceCountInstinct === 0 && diceCountSkill === 0) {
      console.warn("Nenhum dado disponível para rolagem!");
      return;
    }

    const rollDice = (count, sides) =>
      Array.from({ length: count }, () => {
        const face = Math.floor(Math.random() * sides) + 1;
        return { face, result: dados[`d${sides}`][face] || [] };
      });

    const rollInstinct = rollDice(diceCountInstinct, 6);
    const rollSkill = rollDice(diceCountSkill, 10);

    setRollResult({ skill, roll: [...rollInstinct, ...rollSkill] });
    setSnackbarKey((prevKey) => prevKey + 1);
    setSnackbarOpen(true);
    addRollToHistory({ skill, roll: [...rollInstinct, ...rollSkill] }, true);
  };

  const handleCustomRoll = () => {
    const results = rollCustomDice(customDiceFormula);
    addRollToHistory({ formula: customDiceFormula, roll: results }, true);
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
      return { face, result: dados.d12[face] || [] };
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

  const handleCharacteristicDelete = (index) => {
    setCharacter((prevCharacter) => {
      const newCharacteristics = [...(prevCharacter?.characteristics || [])];
      newCharacteristics.splice(index, 1);
      return { ...prevCharacter, characteristics: newCharacteristics };
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

  const handleItemSelect = (item) => {
    setSelectedItem(item);

    if (selectedTab === 0) {
      const newInventoryItem = {
        item: item,
        quality: item.quality || 3,
        currentUses: item.currentUses || 0,
      };

      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        inventory: [...(prevCharacter?.inventory || []), newInventoryItem],
      }));
    } else if (selectedTab === 3) {
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        assimilations: [...(prevCharacter?.assimilations || []), item],
      }));
    } else if (selectedTab === 2) {
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        characteristics: [...(prevCharacter?.characteristics || []), item],
      }));
    }

    setOpenItemsModal(false);
    setOpenAssimilationsModal(false);
    setOpenCharacteristicsModal(false);
  };

  const handleItemDelete = (index) => {
    setCharacter((prevCharacter) => {
      const newInventory = [...(prevCharacter?.inventory || [])];
      newInventory.splice(index, 1);
      return { ...prevCharacter, inventory: newInventory };
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

  const handleQualityChange = (itemIndex, newQuality) => {
    if (newQuality < 0 || newQuality > 6) return;

    const updatedInventory = [...character.inventory];
    updatedInventory[itemIndex].quality = newQuality;

    setCharacter((prev) => ({ ...prev, inventory: updatedInventory }));
    // A função saveCharacterInventory será chamada automaticamente pelo useEffect
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

  const RollHistory = styled(Box)(({ theme }) => ({
    "& .roll-entry": {
      transition: "opacity 0.5s ease-out, background-color 0.3s ease-in-out",
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      "&.new": {
        backgroundColor: theme.palette.primary.light,
        opacity: 1,
      },
      "&.old": {
        backgroundColor: "transparent",
        opacity: 0.7,
      },
    },
    "& .roll-entry:last-child": {
      backgroundColor: theme.palette.primary.light,
      opacity: 1,
    },
  }));

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
    >
      <RollHistory sx={{ width: 350, padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Histórico de Rolagens
        </Typography>
        {rollHistory.length === 0 ? (
          <Typography>Nenhuma rolagem registrada.</Typography>
        ) : (
          rollHistory.map((entry, index) => (
            <Box
              key={index}
              className={`roll-entry ${
                index === rollHistory.length - 1 ? "new" : "old"
              }`}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight:
                    index === rollHistory.length - 1 ? "bold" : "normal",
                }}
              >
                {entry.skill
                  ? `Habilidade: ${translateKey(entry.skill)}`
                  : `Fórmula: ${entry.formula}`}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {entry.roll.map((result, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ marginRight: 1 }}>
                      Dado {i + 1}:
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
                      <Typography variant="body2">Nada</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}
      </RollHistory>
    </Popover>
  );

  return (
    <Box className={styles.characterSheet}>
      <Paper elevation={3} className={styles.characterHeader}>
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
              onChange={(e) => handleInputChange("generation", e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense"
              size="small"
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "14px", sm: "16px" },
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
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              label="Ocupação"
              value={character?.occupation || ""}
              onChange={(e) => handleInputChange("occupation", e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense"
              size="small"
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "14px", sm: "16px" },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              label="Propósito 1"
              value={character?.purpose1 || ""}
              onChange={(e) => handleInputChange("purpose1", e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense"
              size="small"
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "14px", sm: "16px" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              label="Propósito 2"
              value={character?.purpose2 || ""}
              onChange={(e) => handleInputChange("purpose2", e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense"
              size="small"
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "14px", sm: "16px" },
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
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      <Box className={styles.characterBody}>
        <Paper
          elevation={3}
          className={styles.leftColumn}
          sx={{ width: "100%", padding: { xs: "16px", sm: "18px" } }}
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
                          : "text.primary",
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
                          style={{ fill: "rgba(0, 0, 0, 0.26)" }}
                        />
                      }
                    />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ minWidth: "60px", textAlign: "right" }}
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
          sx={{ width: "100%", padding: { xs: "18px", sm: "26px" } }}
        >
          <SkillList
            title="Conhecimentos & Práticas"
            onRoll={handleRoll}
            id={character?._id}
            character={character}
            addRollToHistory={addRollToHistory}
          />
        </Paper>

        <Paper elevation={3} className={styles.rightColumn}>
          <Box sx={{ marginTop: "16px", marginBottom: "16px" }}>
            <Typography variant="h6">Rolar Dados</Typography>
            <TextField
              label="Fórmula dos Dados (ex: 1d6+2d10+3d12)"
              value={customDiceFormula}
              onChange={(e) => setCustomDiceFormula(e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense"
              size="small"
              sx={{ fontSize: { xs: "14px", sm: "16px" } }}
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
              Rolar Dados
            </Button>
          </Box>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
            }}
          >
            <Tab
              label="Inventário"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
              }}
            />
            <Tab
              label="Anotações"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
              }}
            />
            <Tab
              label="Características"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
              }}
            />
            <Tab
              label="Assimilações"
              sx={{
                fontSize: { xs: "10px", sm: "14px" },
                padding: { xs: "8px", sm: "12px" },
              }}
            />
          </Tabs>
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6">Inventário</Typography>

              <Typography
                variant="body2"
                color={
                  calculateTotalWeight() > maxWeight ? "error" : "textPrimary"
                }
                sx={{
                  fontWeight:
                    calculateTotalWeight() > maxWeight ? "bold" : "normal",
                }}
              >
                Peso Total: {calculateTotalWeight()} / {maxWeight}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={(calculateTotalWeight() / maxWeight) * 50}
                sx={{
                  height: 15,
                  borderRadius: 5,
                  mt: 1,
                  backgroundColor: "lightgrey",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      calculateTotalWeight() > maxWeight ? "red" : "green",
                  },
                }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenItemsModal}
                sx={{ mt: 2 }}
              >
                + Adicionar Item
              </Button>

              <List>
                {(character?.inventory || []).map((invItem, index) => {
                  const itemInstance = invItem;
                  const itemBase = invItem.item;
                  const characteristicsToDisplay =
                    itemInstance.characteristics || itemBase?.characteristics;

                  return (
                    <ListItem
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                        py: 2,
                      }}
                    >
                      <ListItemText
                        primary={itemBase?.name || "Item desconhecido"}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {`Peso: ${itemBase?.weight ?? "N/A"} | Escassez: ${scarcityLevels[itemBase?.category] || 'N/A'}`}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                mr={1}
                              >
                                Qualidade:{" "}
                                {qualityLevels[invItem.quality] || "Indefinida"}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ minWidth: "30px", p: 0, height: "30px" }}
                                onClick={() =>
                                  handleQualityChange(
                                    index,
                                    invItem.quality - 1
                                  )
                                }
                              >
                                -
                              </Button>
                              <Typography
                                component="span"
                                sx={{ p: "0 10px", fontWeight: "bold" }}
                              >
                                {invItem.quality}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ minWidth: "30px", p: 0, height: "30px" }}
                                onClick={() =>
                                  handleQualityChange(
                                    index,
                                    invItem.quality + 1
                                  )
                                }
                              >
                                +
                              </Button>
                            </Box>
                          </React.Fragment>
                        }
                        sx={{ flex: 1, minWidth: 0 }}
                      />
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setEditItem({
                              index,
                              item: { ...itemBase, quality: invItem.quality },
                            })
                          }
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleItemDelete(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6">Anotações</Typography>
              <TextField
                label="Anotações"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          )}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6">Características</Typography>
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
                    />
                    <Box display="flex" alignItems="center">
                      <IconButton
                        edge="end"
                        onClick={() => handleCharacteristicDelete(index)}
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
            <Box>
              <Typography variant="h6">Assimilações</Typography>
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
                    />
                    <Box display="flex" alignItems="center">
                      <IconButton
                        edge="end"
                        onClick={() => handleAssimilationDelete(index)}
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
            Habilidade:{" "}
            {translateKey(rollResult?.skill) ||
              rollResult?.skill ||
              customRollResult?.formula ||
              "Nenhuma"}
          </Typography>

          {rollResult?.effectMessage && (
            <Typography variant="body2" sx={{ color: '#66bb6a', fontStyle: 'italic' }}>
                {rollResult.effectMessage}
            </Typography>
        )}

          <Typography variant="body1">Dados Rolados:</Typography>
          {(rollResult?.roll || customRollResult?.roll)?.length > 0
            ? (rollResult?.roll || customRollResult?.roll)?.map(
                (result, index) => (
                  <div key={index}>
                    <Typography variant="body2">
                      Dado {index + 1}: {result.result.length > 0 ? "" : "Nada"}
                      {result.result.length > 0 &&
                        result.result.map((imgSrc, i) => (
                          <img
                            key={i}
                            src={imgSrc}
                            alt={`Resultado ${i + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/path/to/default-image.png";
                            }}
                            style={{
                              width: "50px",
                              height: "50px",
                              margin: "5px",
                            }}
                          />
                        ))}
                    </Typography>
                  </div>
                )
              )
            : null}
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
        onItemSelect={handleItemSelect}
        onCreateNewHomebrew={handleCreateNewHomebrew}
      />
      <AssimilationsModal
        open={openAssimilationsModal}
        handleClose={handleCloseAssimilationsModal}
        title="Assimilações"
        items={assimilations}
        homebrewItems={[]}
        onItemSelect={handleItemSelect}
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
      {editItem !== null && (
        <Dialog open={true} onClose={() => setEditItem(null)}>
          <DialogTitle color="black">Editar Item</DialogTitle>
          <DialogContent>
            <DialogContentText>Edite os detalhes do item.</DialogContentText>
            <TextField
              margin="dense"
              label="Nome"
              type="text"
              fullWidth
              value={editItem.item.name}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, name: e.target.value },
                })
              }
            />
            <TextField
              margin="dense"
              label="Descrição"
              type="text"
              fullWidth
              value={editItem.item.description}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, description: e.target.value },
                })
              }
            />
            <TextField
              margin="dense"
              label="Peso"
              type="number"
              fullWidth
              value={editItem.item.weight}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, weight: e.target.value },
                })
              }
            />
            <TextField
              margin="dense"
              label="Usos"
              type="number"
              fullWidth
              value={editItem.item.durability}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, durability: e.target.value },
                })
              }
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenCharacteristicsMenu()}
            >
              Características
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItem(null)} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={() => handleItemEdit(editItem.index, editItem.item)}
              color="primary"
            >
              Salvar
            </Button>
          </DialogActions>

          {editItem?.showCharacteristicsMenu && (
            <CharacteristicsMenu
              open={editItem.showCharacteristicsMenu}
              item={editItem.item}
              onClose={() =>
                setEditItem({ ...editItem, showCharacteristicsMenu: false })
              }
              onChange={handleCharacteristicsChange}
            />
          )}
        </Dialog>
      )}
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
      <Dialog open={openHealthModal} onClose={() => setOpenHealthModal(false)}>
        <DialogTitle>Saúde {selectedHealthLevel}</DialogTitle>
        <DialogContent>
          <Typography>{getHealthDescription(selectedHealthLevel)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHealthModal(false)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterSheet;
