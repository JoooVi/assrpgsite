import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  TextField,
  Typography,
  Box,
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
  Collapse,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TriangleRatingIcon from "../components/TriangleRatingIcon";
import TriangleRatingIconDown from "../components/TriangleRatingIconDown";
import styles from "./CharacterSheet.module.css";
import ItemsModal from "../components/ItemModal";
import AssimilationsModal from "../components/AssimilationsModal";
import CharacteristicsModal from "../components/CharacteristicsModal";
import CharacteristicsMenu from "../components/CharacteristicsMenu";
import { ReactComponent as MeuIcone } from "../assets/d10.svg";
import { ReactComponent as MeuIcone2 } from "../assets/d12.svg";

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
    const [_, count, sides] = match;
    const countInt = parseInt(count); // Converte para inteiro uma vez
    const sidesInt = parseInt(sides); // Converte para inteiro uma vez

    // Valida se o dado existe
    if (!dados[`d${sidesInt}`]) {
      console.warn(`Dado d${sidesInt} não definido.`);
      continue;
    }

    // Lança os dados conforme o número de contagens
    for (let i = 0; i < countInt; i++) {
      const face = Math.floor(Math.random() * sidesInt) + 1; // Gera uma face aleatória
      const result = dados[`d${sidesInt}`][face] || []; // Obtém o resultado da face
      results.push({ face, result });
    }
  }

  return results;
};

const SkillList = ({
  title,
  skills,
  instincts,
  selectedInstinct,
  handleInstinctChange,
  onRoll,
  id,
}) => {
  const [localSkills, setLocalSkills] = useState(skills);
  const [open, setOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  const saveSkillsToBackend = async (updatedSkills) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/skills`,
        {
          knowledge: updatedSkills.knowledge,
          practices: updatedSkills.practices,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Dados salvos com sucesso:", response.data);
      setLocalSkills({
        ...localSkills,
        ...updatedSkills.knowledge,
        ...updatedSkills.practices,
      });
      setEditedValues({});
    } catch (error) {
      console.error("Erro ao salvar os dados:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      const updatedSkills = {
        knowledge: {},
        practices: {},
      };

      const knowledgeKeys = [
        "agrarian",
        "biological",
        "exact",
        "medicine",
        "social",
        "artistic",
      ];
      const practiceKeys = [
        "sports",
        "tools",
        "crafts",
        "weapons",
        "vehicles",
        "infiltration",
      ];

      Object.keys(editedValues).forEach((skillKey) => {
        if (localSkills[skillKey] !== undefined) {
          if (knowledgeKeys.includes(skillKey)) {
            updatedSkills.knowledge[skillKey] = editedValues[skillKey];
          } else if (practiceKeys.includes(skillKey)) {
            updatedSkills.practices[skillKey] = editedValues[skillKey];
          }
        }
      });

      if (id) {
        saveSkillsToBackend(updatedSkills);
      } else {
        console.error("ID do personagem está indefinido");
      }
    }
    setEditMode(!editMode);
  };

  const handleEditedValueChange = (skillKey, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [skillKey]: value,
    }));
  };

  const handleSkillClick = (skillKey) => {
    setSelectedSkill(skillKey);
    setOpen(true);
  };

  const getSkillDescription = (key) => {
    const descriptions = {
      agrarian: "Conhecimento relacionado à agricultura e manejo de plantações.",
      biological: "Estudos sobre ecossistemas, fauna e flora.",
      exact: "Compreensão matemática e cálculos avançados.",
      medicine: "Práticas médicas e tratamentos de saúde.",
      social: "Habilidades de interação e negociação.",
      artistic: "Capacidade de criação artística e expressão visual.",
      sports: "Habilidades atléticas e esportivas.",
      tools: "Capacidade de manuseio de ferramentas diversas.",
      crafts: "Conhecimento sobre vários tipos de ofícios.",
      weapons: "Habilidade no uso de armas de combate.",
      vehicles: "Conhecimento e manuseio de veículos diversos.",
      infiltration: "Habilidade em infiltração e furtividade.",
    };
    return descriptions[key] || "Descrição não disponível.";
  };

  const translateKey = (key) => {
    const translations = {
      agrarian: "Agrário",
      biological: "Biológico",
      exact: "Exato",
      medicine: "Medicina",
      social: "Social",
      artistic: "Artístico",
      sports: "Esportes",
      tools: "Ferramentas",
      crafts: "Ofícios",
      weapons: "Armas",
      vehicles: "Veículos",
      infiltration: "Infiltração",
    };
    return translations[key] || key;
  };

  const handleRoll = (key) => {
    onRoll(key, selectedInstinct[key], localSkills[key]);
  };

  const handleInstinctChangeUpdated = (skillKey, value) => {
    handleInstinctChange(skillKey, value);
    setLocalSkills((prev) => ({
      ...prev,
      [skillKey]: { ...prev[skillKey], instinct: value },
    }));
  };

  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Button
        variant="contained"
        color={editMode ? "secondary" : "primary"}
        onClick={toggleEditMode}
        sx={{ padding: "4px", minWidth: "unset" }}
      >
        <EditIcon />
      </Button>
      {Object.entries(localSkills).map(([key, value]) => (
        <Grid container key={key} spacing={3} alignItems="center">
          <Grid item xs={4} sm={3}>
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

          <Grid item xs={4} sm={2}>
            {editMode ? (
              <TextField
                value={editedValues[key] || value}
                onChange={(e) => handleEditedValueChange(key, e.target.value)}
                size="small"
                variant="outlined"
                fullWidth
                inputProps={{
                  style: { textAlign: "center" },
                }}
              />
            ) : (
              <Typography>{value}</Typography>
            )}
          </Grid>

          <Grid item xs={4} sm={3}>
            <FormControl
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
              sx={{ minWidth: 100 }}
            >
              <InputLabel>Instintos</InputLabel>
              <Select
                label="Instintos"
                value={selectedInstinct[key] || ""}
                onChange={(e) => handleInstinctChangeUpdated(key, e.target.value)}
              >
                {Object.keys(instincts).map((instinctKey) => (
                  <MenuItem key={instinctKey} value={instinctKey}>
                    {translateKey(instinctKey)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleRoll(key)}
              fullWidth
              sx={{ marginLeft: "28px" }}
            >
              <MeuIcone style={{ width: "24px", height: "24px" }} />
            </Button>
          </Grid>
        </Grid>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {selectedSkill &&
            selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Typography>{getSkillDescription(selectedSkill)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const InstinctList = ({
  title,
  instincts,
  selectedInstinct,
  handleInstinctChange,
  onAssimilatedRoll,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedInstinctKey, setSelectedInstinctKey] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInstinctClick = (instinctKey) => {
    setSelectedInstinctKey(instinctKey);
    setOpen(true);
  };

  const getInstinctDescription = (key) => {
    const descriptions = {
      reaction: "Habilidade de reagir rapidamente a mudanças no ambiente.",
      perception: "Sensibilidade aos detalhes e mudanças no ambiente.",
      sagacity: "Capacidade de tomar decisões rápidas e eficazes.",
      potency: "Força física e resistência para superar obstáculos.",
      influence: "Habilidade de convencer ou manipular outros.",
      resolution: "Capacidade de persistir diante de dificuldades.",
    };
    return descriptions[key] || "Descrição não disponível.";
  };

  const saveInstinctsToBackend = async (updatedInstincts) => {
    setLoading(true);

    // Atualização otimista
    const prevInstincts = { ...instincts };
    handleInstinctChange({ ...instincts, ...updatedInstincts });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
        { instincts: updatedInstincts },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(
        "Erro ao salvar os instintos:",
        error.response?.data || error.message
      );
      // Reverte atualização otimista em caso de erro
      handleInstinctChange(prevInstincts);
    } finally {
      setLoading(false);
      setEditedValues({});
      setEditMode(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      const updatedInstincts = {};

      Object.keys(editedValues).forEach((instinctKey) => {
        if (instincts[instinctKey] !== undefined) {
          updatedInstincts[instinctKey] = parseInt(
            editedValues[instinctKey],
            10
          );
        }
      });

      if (id) {
        saveInstinctsToBackend(updatedInstincts);
      } else {
        console.error("ID do personagem está indefinido");
      }
    } else {
      setEditMode(true);
    }
  };

  const handleEditedValueChange = (instinctKey, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [instinctKey]: value,
    }));
  };

  return (
    <Box>
      <Typography variant="h6">{translateKey(title)}</Typography>
      <Button
        variant="contained"
        color={editMode ? "secondary" : "primary"}
        onClick={toggleEditMode}
        sx={{ padding: "4px", minWidth: "unset" }}
      >
        <EditIcon />
      </Button>

      {Object.entries(instincts).map(([key, value]) => (
        <Grid container key={key} spacing={3} alignItems="center">
          <Grid item xs={4} sm={3}>
            <Typography
              onClick={() => handleInstinctClick(key)}
              sx={{
                cursor: "pointer",
                color: "text.primary",
                "&:hover": { color: "primary.main" },
              }}
            >
              {translateKey(key)} {/* Aplica a tradução usando translateKey */}
            </Typography>
          </Grid>

          <Grid item xs={4} sm={2}>
            {editMode ? (
              <TextField
                value={editedValues[key] || value}
                onChange={(e) => handleEditedValueChange(key, e.target.value)}
                size="small"
                variant="outlined"
                fullWidth
                inputProps={{
                  style: { textAlign: "center" },
                }}
              />
            ) : (
              <Typography>{value}</Typography>
            )}
          </Grid>

          <Grid item xs={4} sm={3}>
            <FormControl
              variant="outlined"
              margin="dense"
              size="small"
              fullWidth
              sx={{ minWidth: 100 }}
            >
              <InputLabel>{translateKey("Instincts")}</InputLabel>
              <Select
                label={translateKey("Instincts")}
                value={selectedInstinct[key] || ""}
                onChange={(e) => handleInstinctChange(key, e.target.value)}
              >
                {Object.keys(instincts).map((instinctKey) => (
                  <MenuItem key={instinctKey} value={instinctKey}>
                    {translateKey(instinctKey)} {/* Aplica a tradução */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onAssimilatedRoll(key, selectedInstinct[key])}
              fullWidth
              sx={{ marginLeft: "28px" }}
            >
              <MeuIcone style={{ width: "24px", height: "24px" }} />
            </Button>
          </Grid>
        </Grid>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {selectedInstinctKey &&
            selectedInstinctKey.charAt(0).toUpperCase() +
              selectedInstinctKey.slice(1)}
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
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [maxWeight, setMaxWeight] = useState(8); // 2 para o corpo e 6 para a mochila
  const [editItem, setEditItem] = useState(null);
  const [customDiceFormula, setCustomDiceFormula] = useState("");
  const [notes, setNotes] = useState(""); // Estado para armazenar as anotações

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar autenticado para acessar esta página");
      setLoading(false);
      return;
    }

    const fetchCharacter = async () => {
      try {
        const response = await axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCharacter(response.data);
        setNotes(response.data.notes || ""); // Carrega as anotações salvas
        setLoading(false);
      } catch (error) {
        setError("Erro ao carregar a ficha do personagem");
        setLoading(false);
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

    // Exemplo de modificador (buff ou debuff)
    const weightModifier = character?.buffs?.weightReduction || 0;
    return inventoryWeight - weightModifier;
  };

  const fetchCharacteristics = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/charactertraits", // URL do Railway com /api
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
        "https://assrpgsite-be-production.up.railway.app/api/assimilations", // URL do Railway com /api
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
        "https://assrpgsite-be-production.up.railway.app/api/items", // URL do Railway com /api
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

  const handleInputChange = (field, value) => {
    setCharacter({ ...character, [field]: value });
  };

  const handleHealthChange = (index, value) => {
    const updatedHealthLevels = [...character?.healthLevels];
    updatedHealthLevels[index] = value;
    setCharacter({ ...character, healthLevels: updatedHealthLevels });
  };

  const handleInstinctChange = (skill, instinct) => {
    setSelectedInstinct({ ...selectedInstinct, [skill]: instinct });
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
    setSnackbarOpen(true);
  };

  const getHealthColorGradient = (points) => {
    if (points >= 4) return "green, limegreen"; // Verde para saudável
    if (points === 3) return "yellow, orange"; // Amarelo para leve dano
    if (points === 2) return "orange, red"; // Laranja para mais dano
    if (points === 1) return "red, darkred"; // Vermelho para estado crítico
    return "black, gray"; // Preto para morte
  };

  const handleCustomRoll = () => {
    setRollResult(null);
    setCustomRollResult(null);

    const results = rollCustomDice(customDiceFormula);
    setCustomRollResult({ formula: customDiceFormula, roll: results });
    setSnackbarOpen(true);
  };

  const handleAssimilatedRoll = (instinct, selectedInstinct) => {
    if (!selectedInstinct) {
      return;
    }

    const diceCount =
      (character?.instincts[instinct] || 0) +
      (character?.instincts[selectedInstinct] || 0);
    const roll = Array.from({ length: diceCount }, () => {
      const face = Math.floor(Math.random() * 12) + 1;
      return { face, result: dados.d12[face] };
    });
    setRollResult({ skill: instinct, roll });
    setSnackbarOpen(true);
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
        currentUses: updatedItem.currentUses || 0, // Atualize currentUses com o valor correto
        durability: updatedItem.durability || 0, // Garanta que a durabilidade é salva corretamente
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

      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/inventory`, // URL do Railway com /api
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        inventory: updatedInventory,
      }));
      setEditItem(null); // Fecha o diálogo após salvar
    } catch (error) {
      console.error("Erro ao salvar o item:", error);
      console.log(error.response); // Verifique a resposta de erro do Axios
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

  const handleDeterminationChange = (event, newValue) => {
    setCharacter((prevCharacter) => {
      let updatedDetermination = newValue;
      let updatedAssimilation = prevCharacter?.assimilation || 0;
      let message = null;

      // Se Determinação atinge 0, redefine corretamente
      if (updatedDetermination <= 0 && updatedAssimilation < 9) {
        updatedAssimilation += 1;
        updatedDetermination = 10 - updatedAssimilation; // Corrige a Determinação
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

      return {
        ...prevCharacter,
        determination: updatedDetermination,
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
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        inventory: [
          ...(prevCharacter?.inventory || []),
          {
            item: {
              ...item,
              characteristics: item.characteristics || [],
              currentUses: item.currentUses || 0,
            },
          },
        ],
      }));
    } else if (selectedTab === 3) {
      // Assimilações
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        assimilations: [...(prevCharacter?.assimilations || []), item],
      }));
    } else if (selectedTab === 2) {
      // Características
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

  const saveCharacterInventory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/inventory`, // URL do Railway com /api
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

  const generationMap = {
    "Pre Collapse": "Pré colapso",
    Collapse: "Colapso",
    "Post Collapse": "Pós colapso",
    Current: "Atual",
  };

  useEffect(() => {
    if (character) {
      saveCharacterInventory();
    }
  }, [
    character?.inventory,
    character?.characteristics,
    character?.assimilations,
    notes,
  ]);

  if (loading) {
    return <div className={styles.loadingIndicator}>Carregando...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

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
              value={generationMap[character?.generation] || ""}
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
        <Paper elevation={3} className={styles.leftColumn}>
          <InstinctList
            title="Instintos"
            instincts={character?.instincts || {}}
            selectedInstinct={selectedInstinct}
            handleInstinctChange={handleInstinctChange}
            onAssimilatedRoll={handleAssimilatedRoll}
            id={character?._id}
          />

          <Typography variant="h6" mt={3}>
            Saúde
          </Typography>
          {character?.healthLevels?.map((points, index) => (
            <Box key={index} className={styles.healthBar} mb={3}>
              <Typography variant="body1">Saúde {5 - index}:</Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <StyledRating
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
                  getLabelText={(value) =>
                    `${value} Coração${value !== 1 ? "es" : ""}`
                  }
                  precision={1}
                  icon={<FavoriteIcon fontSize="inherit" />}
                  emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                  sx={{
                    fontSize: { xs: "40px", sm: "44px" },
                    display: "flex",
                    alignItems: "center",
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {points === 0 ? "0 pontos" : `${points} pontos`}
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
                onChange={handleDeterminationChange} // Chama a função para alterar a Determinação
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
                onChange={handleDeterminationChange} // Chama a mesma função para alterar Assimilação e Determinação
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
        <Paper elevation={3} className={styles.centerColumn}>
          {console.log("Character:", character)}{" "}
          <SkillList
            title="Conhecimentos & Práticas"
            skills={{ ...character?.knowledge, ...character?.practices }}
            instincts={character?.instincts || {}}
            selectedInstinct={selectedInstinct}
            handleInstinctChange={handleInstinctChange}
            onRoll={handleRoll}
            id={character?._id} // Certifique-se de que o ID está sendo passado corretamente
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

              {/* Exibição do Peso Total com Verificação */}
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

              {/* Barra de Progresso */}
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

              {/* Alerta de Peso Excedido */}
              {calculateTotalWeight() > maxWeight && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Peso máximo excedido! Você precisa reduzir o peso.
                </Typography>
              )}

              {/* Botão de Adicionar */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenItemsModal}
                sx={{
                  padding: { xs: "8px 16px", sm: "10px 20px" },
                  fontSize: { xs: "14px", sm: "16px" },
                  width: { xs: "100%", sm: "auto" },
                  mt: 2,
                }}
              >
                +
              </Button>

              {/* Lista de Itens */}
              <List>
                {(character?.inventory || []).map((invItem, index) => (
                  <ListItem
                    key={index}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <ListItemText
                      primary={`${invItem.item.name} (Usos: ${invItem.durability})`}
                      secondary={`Peso: ${
                        invItem.item.weight
                      } | Características: ${
                        Array.isArray(invItem.item.characteristics?.details)
                          ? invItem.item.characteristics.details
                              .map((char) => char.name)
                              .join(", ")
                          : ""
                      }`}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    />
                    {/* Botões de Editar e Excluir */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setEditItem({ index, item: invItem.item })
                        }
                        sx={{ mb: { xs: 1, sm: 0 }, mr: { sm: 1 } }}
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
                ))}
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
                    </Typography>
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
                  </div>
                )
              )
            : null}
        </Alert>
      </Snackbar>

      <ItemsModal
        open={openItemsModal}
        handleClose={handleCloseItemsModal}
        title="Inventário"
        items={inventoryItems}
        onItemSelect={handleItemSelect}
      />
      <AssimilationsModal
        open={openAssimilationsModal}
        handleClose={handleCloseAssimilationsModal}
        title="Assimilações"
        items={assimilations}
        onItemSelect={handleItemSelect}
      />
      <CharacteristicsModal
        open={openCharacteristicsModal}
        handleClose={handleCloseCharacteristicsModal}
        title="Características"
        items={characteristics}
        onItemSelect={handleItemSelect}
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
    </Box>
  );
};

export default CharacterSheet;
