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
    health: "Saúde",
    Agility: "Agilidade",
    agility: "Agilidade",
    Perception: "Percepção",
    perception: "Percepção",
    Strength: "Força",
    strength: "Força",
    Current: "Atual",
    current: "Atual",
    collapse: "Colapso",
    preCollapse: "pré-Colapso",
    postCollapse: "Pós-Colapso",
    Intelligence: "Inteligência",
    Potency: "Potencia",
    potency: "Potencia",
    Influence: "Influência",
    influence: "Influência",
    Resolution: "Resolução",
    resolution: "Resolução",
    Knowledge: "Conhecimento",
    knowledge: "Conhecimento",
    Practices: "Práticas",
    practices: "Práticas",
    Instincts: "Instintos",
    instincts: "Instintos",
    Sagacity: "Sagacidade",
    sagacity: "Sagacidade",
    infiltration: "Infiltração",
    Reaction: "Reação",
    reaction: "Reação",
    Agrarian: "Agrario",
    agrarian: "Agrario",
    Biological: "Biologico",
    biological: "Biologico",
    Exact: "Exato",
    exact: "Exato",
    Medicine: "Medicina",
    medicine: "Medicina",
    Social: "Social",
    social: "Social",
    Artistic: "Artistico",
    artistic: "Artistico",
    Sports: "Esportivas",
    sports: "Esportivas",
    Tools: "Ferramentas",
    tools: "Ferramentas",
    Crafts: "Oficios",
    crafts: "Oficios",
    Weapons: "Armas",
    weapons: "Armas",
    Vehicles: "Veiculos",
    vehicles: "Veiculos",
    Infiltration: "infiltração",
  };

  return translations[key] || key;
};

const StyledRating = styled(Rating)({
  "& .MuiRating-iconFilled": {
    color: "#ff6d75",
  },
  "& .MuiRating-iconHover": {
    color: "#ff3d47",
  },
});

const TriangleRating = styled(Rating)({
  "& .MuiRating-iconFilled": {
    color: "#000",
  },
  "& .MuiRating-iconHover": {
    color: "#000",
  },
});

const dados = {
  d6: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    5: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    6: [require("../assets/Joaninha_1.png")],
  },
  d10: {
    1: [],
    2: [],
    3: [require("../assets/Coruja_1.png")],
    4: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    5: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
    ],
    8: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png")],
    9: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Cervo_1.png"),
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
    4: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    5: [require("../assets/Coruja_1.png"), require("../assets/Cervo_1.png")],
    6: [require("../assets/Joaninha_1.png")],
    7: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
    ],
    8: [require("../assets/Joaninha_1.png"), require("../assets/Cervo_1.png")],
    9: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Cervo_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    10: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Joaninha_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    11: [
      require("../assets/Joaninha_1.png"),
      require("../assets/Cervo_1.png"),
      require("../assets/Cervo_1.png"),
      require("../assets/Coruja_1.png"),
    ],
    12: [require("../assets/Coruja_1.png"), require("../assets/Coruja_1.png")],
  },
};

const rollCustomDice = (formula) => {
  const regex = /(\d+)d(\d+)/g;
  let match;
  const results = [];

  // Processa cada lançamento de dados
  while ((match = regex.exec(formula)) !== null) {
    const [, count, sides] = match;
    const countInt = parseInt(count);
    const sidesInt = parseInt(sides);
    // Valida se o dado existe
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
            `httpss://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Extrair knowledge e practices do personagem
          const { knowledge = {}, practices = {} } = response.data;

          // Combinar knowledge e practices em um único objeto
          const combinedSkills = { ...knowledge, ...practices };

          // Atualizar o estado global com as skills combinadas
          dispatch(updateSkills(combinedSkills));

          console.log("Skills carregadas:", combinedSkills); // Debug
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
    console.log("Instintos atualizados:", instincts); // Debug
  }, [instincts]);

  const handleRoll = useCallback(
    async (key) => {
      console.log("Initiating roll for skill:", key);
      if (isRolling) return;
      if (!selectedInstinct[key]) {
        alert("Select an instinct before rolling!");
        return;
      }
      setIsRolling(true);
      try {
        const skillValue = parseInt(globalSkills[key]) || 0;
        const instinctKey = selectedInstinct[key];
        const instinctValue = parseInt(instincts[instinctKey]) || 0;
        const totalDice = skillValue + instinctValue;
        const results = rollCustomDice(`${totalDice}d10`);
        setRollResult({ skill: key, roll: results });
        setSnackbarKey((prevKey) => prevKey + 1);
        setSnackbarOpen(true);
        setTimeout(() => setIsRolling(false), 500);
        addRollToHistory({ skill: key, roll: results });
      } catch (error) {
        console.error("Error rolling dice:", error);
        setIsRolling(false);
      }
    },
    [isRolling, globalSkills, selectedInstinct, instincts, addRollToHistory]
  );

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  }, []);

  // CharacterSheet.js (SkillList component)
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

  // Dentro do componente SkillList, substitua:
  const handleInstinctChangee = useCallback(
    (skillKey) => (event) => {
      // Modificar para retornar uma função
      dispatch(setSelectedInstinct({ [skillKey]: event.target.value }));
    },
    [dispatch]
  );

  const getSkillDescription = useCallback((key) => {
    const descriptions = {
      agrarian: "Conhecimento sobre agricultura, pecuária e gestão rural",
      biological: "Conhecimento sobre biologia , ecologia e ciências naturais",
      exact: "Conhecimento sobre matemática, física e outras ciências exatas",
      medicine: "Conhecimento sobre medicina, anatomia e tratamentos",
      social: "Conhecimento sobre sociedade, política e relações humanas",
      artistic: "Conhecimento sobre arte, música e expressões culturais",
      sports: "Habilidades atléticas e esportivas",
      tools: "Habilidade com ferramentas e equipamentos",
      crafts: "Habilidades manuais e artesanais",
      weapons: "Habilidade com armas e combate",
      vehicles: "Habilidade com veículos e pilotagem",
      infiltration: "Habilidade de furtividade e infiltração",
    };
    return descriptions[key] || "Descrição não disponível.";
  }, []);

  return (
    <Box>
      <Typography variant="h6">{translateKey(title)}</Typography>
      {Object.entries(globalSkills).map(([key, value]) => (
        <Grid container key={key} spacing={3} alignItems="center">
          {/* Nome da Skill */}
          <Grid item xs={12} sm={4} md={3}>
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

          {/* Campo de edição da Skill - MODIFICADO */}
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

          {/* Select para escolher o Instinto */}
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
                onChange={handleInstinctChangee(key)} // Passa o skillKey
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

          {/* Botão para realizar o roll */}
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

      {/* Snackbar para exibir o resultado do roll */}
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

      {/* Dialog para exibir a descrição da Skill */}
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
      // Atualiza o estado global com TODOS os instintos retornados pelo backend
      dispatch(updateInstincts(response.data.instincts));
    } catch (error) {
      console.error("Erro ao salvar os instintos:", error);
    }
  };

  const handleEditedInstinctChange = async (instinctKey, value) => {
    const updatedValue = Number(value);
    const updatedInstincts = { ...instincts, [instinctKey]: updatedValue };

    try {
      // Atualização otimista
      dispatch(updateInstincts(updatedInstincts));

      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { instincts: updatedInstincts }, // Enviar todos os instintos
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Forçar atualização do Redux com a resposta do backend
      const response = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateInstincts(response.data.instincts));
    } catch (error) {
      // Reverter em caso de erro
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
              value={instincts[key] || 0} // Use diretamente do estado global
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
      const response = await axios.get(
        "assrpgsite-be-production.up.railway.app/api/items",
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

    // Garantir que o índice seja válido
    if (index >= 0 && index < updatedHealthLevels.length) {
      updatedHealthLevels[index] = value || 0; // Definir 0 se value for null ou undefined
      setCharacter((prev) => ({
        ...prev,
        healthLevels: updatedHealthLevels,
        healthPoints: updatedHealthLevels.reduce((acc, cur) => acc + cur, 0), // Recalcular pontos de saúde
      }));
      saveHealthLevels(updatedHealthLevels); // Salvar os níveis de saúde atualizados no backend
    }
  };

  const handleHealthClick = (level) => {
    setSelectedHealthLevel(level);
    setOpenHealthModal(true);
  };

  const getHealthDescription = (level) => {
    const descriptions = {
      5: " Você está Saudável ",
      4: " Você está Ferido ",
      3: " Precisa de 1 sucesso ou adaptação adicional para ter sucesso em testes. ",
      2: " Precisa de 2 sucessos ou adaptação adicional para ter sucesso em testes. ",
      1: " Precisa de 3 sucessos ou adaptação adicional para ter sucesso em testes. ",
      0: " Você está Morto",
    };
    return descriptions[level] || "Descrição não disponível.";
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
    setSnackbarKey((prevKey) => prevKey + 1); // Atualizar a chave única do Snackbar
    setSnackbarOpen(true);
    // Aqui, em vez de setRollHistory diretamente, chamamos addRollToHistory
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

    // Chama a função central que salva no backend e mostra no snackbar
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
        currentUses: updatedItem.currentUses || 0,
        durability: updatedItem.durability || 0,
      };

      const payload = {
        inventory: updatedInventory.map((invItem) => ({
          item: invItem.item._id || invItem.item,
          currentUses: invItem.currentUses,
          durability: invItem.durability,
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

  const saveDeterminationAndAssimilation = async (
    determination,
    assimilation
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/determination-assimilation`,
        { determination, assimilation },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(
        "Erro ao salvar os pontos de determinação e assimilação:",
        error
      );
    }
  };

  const handleDeterminationChange = (event, newValue) => {
    setCharacter((prevCharacter) => {
      let updatedDetermination = newValue;
      let updatedAssimilation = prevCharacter?.assimilation || 0;
      let message = null;

      if (updatedDetermination <= 0 && updatedAssimilation < 9) {
        updatedAssimilation += 1;
        updatedDetermination = 10 - updatedAssimilation;
        message =
          "Você perdeu pontos de Determinação suficientes para cair uma casa!";
      }

      // Previne atualização incorreta
      if (
        updatedDetermination > 10 - updatedAssimilation &&
        updatedAssimilation > 0
      ) {
        updatedAssimilation -= 1;
        updatedDetermination = newValue;
      }

      saveDeterminationAndAssimilation(
        updatedDetermination,
        updatedAssimilation
      ); // Salvar os pontos de determinação e assimilação atualizados no backend

      return {
        ...prevCharacter,
        determination: updatedDetermination,
        assimilation: updatedAssimilation,
        message: message,
      };
    });
  };

  const handleAssimilationChange = (event, newValue) => {
    setCharacter((prevCharacter) => {
      let updatedAssimilation = newValue;
      let maxAssimilation = 10 - (prevCharacter?.determination || 0);
      let message = null;

      if (updatedAssimilation > maxAssimilation) {
        message = `Você pode marcar até ${maxAssimilation} pontos de Assimilação!`;
        updatedAssimilation = prevCharacter.assimilation;
      }

      saveDeterminationAndAssimilation(
        prevCharacter.determination,
        updatedAssimilation
      ); // Salvar os pontos de determinação e assimilação atualizados no backend

      return {
        ...prevCharacter,
        assimilation: updatedAssimilation,
        message: message,
      };
    });
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
      // Inventário
      const newInventoryItem = {
        item: item, // Manter o objeto populado para exibição imediata
        durability: item.durability || 0, // Pega a durabilidade máxima do item base
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

  const handleInputChange = (field, value) => {
    setCharacter((prevCharacter) => {
      const updatedCharacter = { ...prevCharacter, [field]: value };
      saveCharacterDetails({ [field]: value }); // Salvar os detalhes atualizados no backend
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
    // Lógica para criar nova característica, assimilação ou item
    console.log("Criar nova Homebrew");
  };

  // NOVA FUNÇÃO: Enviar rolagem para o histórico central da campanha
  const sendRollToCampaignBackend = useCallback(
    async (rollData) => {
      const token = localStorage.getItem("token");
      // 'user' está disponível aqui no escopo do componente CharacterSheet
      if (!character?.campaign || !token || !user) {
        console.log(
          "Não é possível enviar para a campanha: Personagem não está em uma campanha, token ausente ou usuário não definido."
        );
        return;
      }

      const rollDataToSend = {
        rollerId: user._id, // ID do usuário que fez a rolagem (o player logado)
        rollerName: user.name || character.name, // Nome do usuário ou do personagem
        characterId: id, // ID do personagem que fez a rolagem
        formula: rollData.formula || rollData.skill, // A fórmula ou o skill usado
        roll: rollData.roll, // Os resultados dos dados
        timestamp: Date.now(),
      };

      try {
        await axios.post(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${character.campaign}/roll`, // Endpoint para registrar rolagem na campanha
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
  ); // Dependências do useCallback, 'user' adicionado

  const addRollToHistory = useCallback(
    async (rollData, displayInSnackbar = false) => {
      const token = localStorage.getItem("token");
      const rollDataWithTimestamp = {
        rollerName: character?.name || user?.name || "Jogador",
        timestamp: Date.now(),
        ...rollData,
      };

      // 1. Salva na ficha individual
      await saveLastRollToBackend(id, rollDataWithTimestamp);

      // 2. ATUALIZA O ESTADO LOCAL DO HISTÓRICO DE ROLAGENS
      setRollHistory((prevHistory) => {
        const newHistory = [...prevHistory, rollDataWithTimestamp].slice(-5);
        return newHistory;
      });

      // 3. CHAMA A NOVA FUNÇÃO PARA ENVIAR PARA O BACKEND DA CAMPANHA
      sendRollToCampaignBackend(rollDataWithTimestamp); // Chamando a nova função

      // 4. Mostra o snackbar
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
    [id, character?.name, user?.name, sendRollToCampaignBackend] // 'sendRollToCampaignBackend' também é uma dependência
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
          {/* Primeira Linha */}
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

          {/* Segunda Linha */}
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
          sx={{ width: "100%", padding: { xs: "16px", sm: "24px" } }}
        >
          <InstinctList
            title="Instintos"
            instincts={instincts} // Passar os instintos do Redux
            selectedInstinct={selectedInstinct}
            handleInstinctChange={handleInstinctChange}
            onAssimilatedRoll={handleAssimilatedRoll}
            id={character?._id}
          />
          <Typography variant="h6" mt={2} mb={1}>
            Saúde
          </Typography>

          {character?.healthLevels?.map((points, index) => (
            <Box key={index} className={styles.healthBar} mb={2}>
              <Typography
                variant="body1"
                onClick={() => handleHealthClick(5 - index)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                  minWidth: "80px",
                }}
              >
                Saúde {5 - index}:
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Rating
                  name={`health-${index}`}
                  value={points}
                  max={
                    Math.max(
                      character?.instincts?.potency,
                      character?.instincts?.resolution
                    ) + 2
                  }
                  onChange={(e, newValue) =>
                    handleHealthChange(index, newValue)
                  }
                  precision={1}
                  // A mágica acontece aqui!
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
                  {`${points} pts`}
                </Typography>
              </Box>
            </Box>
          ))}

          <Typography variant="h6" mt={4}>
            Determinação & Assimilação
          </Typography>
          <Box className={styles.ratingContainer}>
            {/* Determinação */}
            <Box mb={2}>
              <Typography variant="body1">Determinação</Typography>
              <TriangleRating
                name="determination"
                value={character?.determination || 0}
                max={10}
                onChange={handleDeterminationChange}
                icon={<TriangleRatingIcon color="#67110e" />}
                emptyIcon={<TriangleRatingIcon color="gray" />}
                sx={{ fontSize: { xs: "20px", sm: "24px" } }}
              />
            </Box>

            {/* Assimilação */}
            <Box>
              <Typography variant="body1">Assimilação</Typography>
              <TriangleRating
                name="assimilation"
                value={character?.assimilation || 0}
                max={10}
                onChange={handleAssimilationChange}
                icon={<TriangleRatingIconDown color="#252d44" />}
                emptyIcon={<TriangleRatingIconDown color="gray" />}
                sx={{ fontSize: { xs: "20px", sm: "24px" } }}
              />

              {/* Mensagem de aviso caso Determinação tenha caído para zero */}
              {character?.message && (
                <Typography variant="body2" color="error" mt={2}>
                  {character.message}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={3}
          className={styles.centerColumn}
          sx={{ width: "100%", padding: { xs: "16px", sm: "24px" } }}
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
              // Ajusta a largura das abas para telas menores
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }, // Coloca as abas em coluna em telas pequenas
              justifyContent: "center", // Centraliza o conteúdo das abas
            }}
          >
            <Tab
              label="Inventário"
              sx={{
                fontSize: { xs: "10px", sm: "14px" }, // Reduz texto em telas pequenas
                padding: { xs: "8px", sm: "12px" }, // Ajusta o padding em telas pequenas
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

              {/* Exibição do Peso Total */}
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

              {/* Barra de Progresso do Peso */}
              <LinearProgress
                variant="determinate"
                value={(calculateTotalWeight() / maxWeight) * 50} // Use 50 para a barra não ficar tão grande
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

              {/* Botão de Adicionar Item */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenItemsModal}
                sx={{ mt: 2 }}
              >
                + Adicionar Item
              </Button>

              {/* Lista de Itens do Inventário */}
              <List>
                {(character?.inventory || []).map((invItem, index) => {
                  // **DECLARAÇÃO CORRETA DAS VARIÁVEIS, DENTRO DO MAP**
                  const itemInstance = invItem;
                  const itemBase = invItem.item;
                  const characteristicsToDisplay =
                    itemInstance.characteristics || itemBase?.characteristics;

                  return (
                    <ListItem
                      key={index}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <ListItemText
                        primary={`${
                          itemBase?.name || "Item desconhecido"
                        } (Usos: ${itemInstance?.durability ?? "N/A"})`}
                        secondary={`Peso: ${
                          itemBase?.weight ?? "N/A"
                        } | Características: ${
                          Array.isArray(characteristicsToDisplay?.details)
                            ? characteristicsToDisplay.details
                                .map((char) => char?.name || "Desconhecida")
                                .join(", ")
                            : "Nenhuma"
                        }`}
                        sx={{ flex: 1, minWidth: 0 }}
                      />
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() =>
                            setEditItem({ index, item: itemBase || {} })
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
        key={snackbarKey} // Usar a chave única do Snackbar
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
