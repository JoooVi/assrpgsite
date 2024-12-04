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

const translateKey = (key) => {
  const translations = {
    health: "Saúde",
    Agility: "Agilidade",
    Perception: "Percepção",
    Strength: "Força",
    Intelligence: "Inteligência",
    Potency: "Potencia",
    Influence: "Influência",
    Resolution: "Resolução",
    Knowledge: "Conhecimento",
    Practices: "Práticas",
    Instincts: "Instintos",
    Sagacity: "Sagacidade",
    infiltration: "Infiltração",
    Reaction: "Reação",
    Agrarian: "Agrario",
    Biological: "Biologico",
    Exact: "Exato",
    Medicine: "Medicina",
    Social: "Social",
    Artistic: "Artistico",
    Sports: "Esportivas",
    Tools: "Ferramentas",
    Crafts: "Oficios",
    Weapons: "Armas",
    Vehicles: "Veiculos",
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
    3: ["coruja"],
    4: ["coruja", "cervo"],
    5: ["coruja", "cervo"],
    6: ["joaninha"],
  },
  d10: {
    1: [],
    2: [],
    3: ["coruja"],
    4: ["coruja", "cervo"],
    5: ["coruja", "cervo"],
    6: ["joaninha"],
    7: ["joaninha", "joaninha"],
    8: ["joaninha", "cervo"],
    9: ["joaninha", "cervo", "coruja"],
    10: ["joaninha", "joaninha", "coruja"],
  },
  d12: {
    1: [],
    2: [],
    3: ["coruja"],
    4: ["coruja", "cervo"],
    5: ["coruja", "cervo"],
    6: ["joaninha"],
    7: ["joaninha", "joaninha"],
    8: ["joaninha", "cervo"],
    9: ["joaninha", "cervo", "coruja"],
    10: ["joaninha", "joaninha", "coruja"],
    11: ["joaninha", "cervo", "cervo", "coruja"],
    12: ["coruja", "coruja"],
  },
};

const rollCustomDice = (formula) => {
  const regex = /(\d+)d(\d+)/g;
  let match;
  const results = [];

  while ((match = regex.exec(formula)) !== null) {
    const [_, count, sides] = match;
    for (let i = 0; i < parseInt(count); i++) {
      const face = Math.floor(Math.random() * parseInt(sides)) + 1;
      results.push({ face, result: dados[`d${sides}`][face] });
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
}) => (
  <Box>
    <Typography variant="h6">{title}:</Typography>
    {Object.entries(skills).map(([key, value]) => (
      <Box key={key} className={styles.skillItem}>
        <Typography>
          {translateKey(key.charAt(0).toUpperCase() + key.slice(1))}: {value}
        </Typography>
        <FormControl variant="outlined" margin="dense" size="small">
          <InputLabel>Instinto</InputLabel>
          <Select
            label="Instinto"
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => onRoll(key, selectedInstinct[key])}
        >
          Rolar
        </Button>
      </Box>
    ))}
  </Box>
);

const InstinctList = ({
  title,
  instincts,
  selectedInstinct,
  handleInstinctChange,
  onAssimilatedRoll,
}) => (
  <Box>
    <Typography variant="h6">{title}:</Typography>
    {Object.entries(instincts).map(([key, value]) => (
      <Box key={key} className={styles.skillItem}>
        <Typography>
          {translateKey(key.charAt(0).toUpperCase() + key.slice(1))}: {value}
        </Typography>
        <FormControl variant="outlined" margin="dense" size="small">
          <InputLabel>Instinto</InputLabel>
          <Select
            label="Instinto"
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => onAssimilatedRoll(key, selectedInstinct[key])}
        >
          Rolar
        </Button>
      </Box>
    ))}
  </Box>
);

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
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`, // URL do Railway com /api
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
      return;
    }

    const diceCountInstinct = character?.instincts[selectedInstinct] || 0;
    const diceCountSkill =
      (character?.knowledge[skill] || 0) + (character?.practices[skill] || 0);
    const rollInstinct = Array.from({ length: diceCountInstinct }, () => {
      const face = Math.floor(Math.random() * 6) + 1; // d6
      return { face, result: dados.d6[face] };
    });
    const rollSkill = Array.from({ length: diceCountSkill }, () => {
      const face = Math.floor(Math.random() * 10) + 1;
      return { face, result: dados.d10[face] };
    });
    setRollResult({ skill, roll: [...rollInstinct, ...rollSkill] });
    setSnackbarOpen(true);
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
    setCharacter({
      ...character,
      determination: newValue,
      assimilation: 10 - newValue,
    });
  };

  const handleAssimilationChange = (event, newValue) => {
    setCharacter({
      ...character,
      assimilation: newValue,
      determination: 10 - newValue,
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
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField
              label="Geração"
              value={character?.generation || ""}
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
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
          <Grid item xs={12} sm={6} md={4} lg={2}>
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
          />
          <Typography variant="h6">Saúde</Typography>
          {character?.healthLevels?.map((points, index) => (
            <Box key={index} className={styles.healthBar}>
              <Typography>Saúde {5 - index}:</Typography>
              <StyledRating
                name={`health-${index}`}
                value={points}
                max={
                  Math.max(
                    character?.instincts?.potency,
                    character?.instincts?.resolution
                  ) + 2
                }
                onChange={(e, newValue) => handleHealthChange(index, newValue)}
                getLabelText={(value) =>
                  `${value} Coração${value !== 1 ? "es" : ""}`
                }
                precision={0.5}
                icon={<FavoriteIcon fontSize="inherit" />}
                emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                sx={{ fontSize: { xs: "20px", sm: "24px" } }}
              />
              <Typography>{points} pontos</Typography>
            </Box>
          ))}
          <Typography variant="h6">Determinação & Assimilação</Typography>
          <Box className={styles.ratingContainer}>
            <Box>
              <Typography>Determinação</Typography>
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
            <Box>
              <Typography>Assimilação</Typography>
              <TriangleRating
                name="assimilation"
                value={character?.assimilation || 0}
                max={10}
                onChange={handleAssimilationChange}
                icon={<TriangleRatingIconDown color="#252d44" />}
                emptyIcon={<TriangleRatingIconDown color="gray" />}
                sx={{ fontSize: { xs: "20px", sm: "24px" } }}
              />
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} className={styles.centerColumn}>
          <SkillList
            title="Conhecimentos"
            skills={character?.knowledge || {}}
            instincts={character?.instincts || {}}
            selectedInstinct={selectedInstinct}
            handleInstinctChange={handleInstinctChange}
            onRoll={handleRoll}
          />
          <SkillList
            title="Práticas"
            skills={character?.practices || {}}
            instincts={character?.instincts || {}}
            selectedInstinct={selectedInstinct}
            handleInstinctChange={handleInstinctChange}
            onRoll={handleRoll}
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
          >
            <Tab label="Inventário" />
            <Tab label="Anotações" />
            <Tab label="Características" />
            <Tab label="Assimilações" />
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
                value={(calculateTotalWeight() / maxWeight) * 100}
                sx={{
                  height: 10,
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
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${invItem.item.name} (Usos: ${invItem.currentUses})`}
                      secondary={`Peso: ${
                        invItem.item.weight
                      } | Características: ${
                        Array.isArray(invItem.item.characteristics?.details)
                          ? invItem.item.characteristics.details
                              .map((char) => char.name)
                              .join(", ")
                          : ""
                      }`}
                    />
                    <Box display="flex" alignItems="center">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setEditItem({ index, item: invItem.item })
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <Box m={1} />
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
            width: "100%",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Resultado:
          </Typography>
          <Typography variant="subtitle1">
            Habilidade: {rollResult?.skill || customRollResult?.formula}
          </Typography>
          <Typography variant="body1">Dados Rolados:</Typography>
          {(rollResult?.roll || customRollResult?.roll)?.map(
            (result, index) => (
              <Typography key={index} variant="body2">
                Dado {index + 1}: {result.result.join(", ") || "Nada"}
              </Typography>
            )
          )}
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