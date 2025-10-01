/* CharacterForm.js */
import React, { useState, useEffect } from "react";
import {
  FormControl,
  CircularProgress,
  Typography,
  Tooltip,
  TextField,
  Stepper,
  StepLabel,
  Step,
  Grid,
  CssBaseline,
  Chip,
  CardContent,
  Card,
  Button,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useSelector } from "react-redux";
import axios from "axios";
import AppTheme from "../theme/AppTheme";
import "./CharacterForm.css";

// =============================================================================
// ### MUDANÇA ESTRUTURAL: Componentes para cada Passo ###
// Em vez de uma função gigante, cada passo agora é um componente separado.
// =============================================================================

const Step1_Informacoes = ({ character, handleInputChange, errors }) => (
  <div className="step fade-in">
    <TextField
      label="Nome"
      fullWidth
      required
      name="name"
      value={character.name}
      onChange={handleInputChange}
      error={!!errors.name}
      helperText={errors.name}
    />
    <TextField
      select
      label="Geração"
      fullWidth
      required
      name="generation"
      value={character.generation}
      onChange={handleInputChange}
      error={!!errors.generation}
      helperText={errors.generation}
      SelectProps={{ native: true }}
    >
      <option value=""></option>
      <option value="preCollapse">Pré-Colapso</option>
      <option value="collapse">Colapso</option>
      <option value="postCollapse">Pós-Colapso</option>
      <option value="current">Atual</option>
    </TextField>
  </div>
);

const Step2_Evento = ({ character, handleInputChange, errors }) => (
  <div className="step fade-in">
    <TextField
      label="Evento Marcante"
      fullWidth
      required
      name="event"
      value={character.event}
      onChange={handleInputChange}
      error={!!errors.event}
      helperText={errors.event}
    />
    <TextField
      label="Ocupação"
      fullWidth
      required
      name="occupation"
      value={character.occupation}
      onChange={handleInputChange}
      error={!!errors.occupation}
      helperText={errors.occupation}
    />
  </div>
);

const Step3_Propositos = ({ character, handleInputChange, errors }) => (
  <div className="step fade-in">
    <TextField
      label="Propósito Individual 1"
      fullWidth
      required
      name="purpose1"
      value={character.purpose1}
      onChange={handleInputChange}
      error={!!errors.purpose1}
      helperText={errors.purpose1}
    />
    <TextField
      label="Propósito Individual 2"
      fullWidth
      required
      name="purpose2"
      value={character.purpose2}
      onChange={handleInputChange}
      error={!!errors.purpose2}
      helperText={errors.purpose2}
    />
    <TextField
      label="Propósito Relacional 1"
      fullWidth
      required
      name="relationalPurpose1"
      value={character.relationalPurpose1}
      onChange={handleInputChange}
      error={!!errors.relationalPurpose1}
      helperText={errors.relationalPurpose1}
    />
    <TextField
      label="Propósito Relacional 2"
      fullWidth
      required
      name="relationalPurpose2"
      value={character.relationalPurpose2}
      onChange={handleInputChange}
      error={!!errors.relationalPurpose2}
      helperText={errors.relationalPurpose2}
    />
  </div>
);

const Step4_Equipamento = ({
  character,
  handlePackSelect,
  handleAccordionToggle,
  expandedPack,
  areItemsLoading,
  initialEquipmentPacks,
}) => {
  if (areItemsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2, color: "white" }}>
          Carregando itens...
        </Typography>
      </Box>
    );
  }
  return (
    <div className="step fade-in">
      <h3>Equipamento Inicial</h3>
      <Typography variant="body1" sx={{ mb: 2, color: "white" }}>
        Escolha um pacote de equipamentos.
      </Typography>
      <Box>
        {initialEquipmentPacks.map((pack) => (
          <div
            key={pack.name}
            className={`pack-container ${
              character.initialPack === pack.name ? "selected" : ""
            }`}
          >
            <div
              className="pack-summary"
              onClick={() => handleAccordionToggle(pack.name)}
            >
              <Typography className="pack-summary-title">
                {pack.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {character.initialPack === pack.name && (
                  <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                )}
                <span
                  style={{
                    transform:
                      expandedPack === pack.name
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                >
                  ▼
                </span>
              </Box>
            </div>
            {expandedPack === pack.name && (
              <div className="pack-details">
                <Typography variant="body2" sx={{ fontStyle: "italic", mb: 2 }}>
                  Itens: {pack.items.join(", ")}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handlePackSelect(pack)}
                  disabled={character.initialPack === pack.name}
                >
                  {character.initialPack === pack.name
                    ? "Selecionado"
                    : "Selecionar Pacote"}
                </Button>
              </div>
            )}
          </div>
        ))}
      </Box>
    </div>
  );
};

const Step5_Distribuicao = ({
  character,
  handleInstinctChange,
  handleNestedChange,
  remainingInstinctPoints,
  remainingPoints,
  errors,
  translateKey,
}) => (
  <div className="step fade-in">
    <h3>Distribuição de Pontos</h3>
    <Typography variant="body2" sx={{ mb: 2, color: "white" }}>
      Distribua seus pontos de Instintos, Conhecimentos e Práticas.
    </Typography>
    <h4>Instintos</h4>
    <Typography
      variant="body1"
      sx={{ mb: 2, fontSize: "0.9rem", color: "white" }}
    >
      Você tem 3 pontos para distribuir (máximo de 3 por Instinto).
    </Typography>
    <Chip
      icon={<StarIcon />}
      label={`Pontos de Instinto restantes: ${remainingInstinctPoints}`}
      color={remainingInstinctPoints > 0 ? "success" : "default"}
      variant="outlined"
      sx={{ mb: 2, p: 2, fontSize: "1rem" }}
    />
    <Grid container spacing={2}>
      {Object.keys(character.instincts).map((instinct) => (
        <Grid item xs={6} sm={4} md={2} key={instinct}>
          <TextField
            label={translateKey(
              instinct.charAt(0).toUpperCase() + instinct.slice(1)
            )}
            fullWidth
            required
            name={instinct}
            value={character.instincts[instinct]}
            onChange={handleInstinctChange}
            error={!!errors[instinct]}
            helperText={errors[instinct]}
            type="number"
            inputProps={{ min: 1, max: 3 }}
          />
        </Grid>
      ))}
    </Grid>
    <h4 style={{ marginTop: "20px" }}>Conhecimentos e Práticas</h4>
    <Chip
      icon={<StarIcon />}
      label={`Pontos restantes: ${remainingPoints}`}
      color={remainingPoints > 0 ? "success" : "default"}
      variant="outlined"
      sx={{ mb: 2, p: 2, fontSize: "1rem" }}
    />
    <Grid container spacing={2}>
      {Object.keys(character.knowledge).map((knowledge) => (
        <Grid item xs={6} sm={4} md={2} key={knowledge}>
          <TextField
            label={translateKey(
              knowledge.charAt(0).toUpperCase() + knowledge.slice(1)
            )}
            fullWidth
            required
            name={knowledge}
            value={character.knowledge[knowledge]}
            onChange={(e) => handleNestedChange("knowledge", e)}
            error={!!errors[knowledge]}
            helperText={errors[knowledge]}
            type="number"
            inputProps={{ min: 0, max: 2 }}
          />
        </Grid>
      ))}
      {Object.keys(character.practices).map((practice) => (
        <Grid item xs={6} sm={4} md={2} key={practice}>
          <TextField
            label={translateKey(
              practice.charAt(0).toUpperCase() + practice.slice(1)
            )}
            fullWidth
            required
            name={practice}
            value={character.practices[practice]}
            onChange={(e) => handleNestedChange("practices", e)}
            error={!!errors[practice]}
            helperText={errors[practice]}
            type="number"
            inputProps={{ min: 0, max: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  </div>
);

const Step6_CaboDeGuerra = ({ character, handleTugOfWarChange }) => (
  <div className="step fade-in">
    <h3>O Cabo de Guerra</h3>
    <Typography variant="body1" sx={{ mt: 2, mb: 2, color: "white" }}>
      Escolha o Nível de Determinação inicial. O Nível de Assimilação será
      ajustado para que a soma seja sempre 10.
    </Typography>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nível de Determinação"
          fullWidth
          required
          name="determinationLevel"
          value={character.determinationLevel}
          onChange={handleTugOfWarChange}
          type="number"
          inputProps={{ min: 1, max: 9 }}
          helperText="Escolha um valor entre 1 e 9."
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography
          variant="h6"
          component="p"
          sx={{ textAlign: { sm: "center" }, color: "white" }}
        >
          Nível de Assimilação: <strong>{character.assimilationLevel}</strong>
        </Typography>
      </Grid>
    </Grid>
    <Typography variant="body2" sx={{ mt: 3, color: "white" }}>
      Seu personagem começará com os Pontos iguais aos Níveis escolhidos.
    </Typography>
  </div>
);

// =============================================================================
// Componente Principal do Formulário
// =============================================================================

const steps = [
  "Informações",
  "Evento",
  "Propósitos",
  "Equipamento Inicial",
  "Distribuição de Pontos",
  "Cabo de Guerra",
];
const initialEquipmentPacks = [
  {
    name: "Combatente",
    items: ["Bebida", "Corda (15 metros)", "Faca", "Lança", "Machado"],
  },
  {
    name: "Curandeiro",
    items: ["Álcool", "Curativos", "Faca", "Kit de costura", "Serrote"],
  },
  {
    name: "Desbravador",
    items: [
      "Bússola",
      "Facão",
      "Mapas úteis",
      "Saco de dormir",
      "Tenda desmontável",
    ],
  },
  {
    name: "Estudioso",
    items: [
      "Caderno de notas",
      "Caixa de velas",
      "Canivete",
      "Kit de escrita",
      "Três livros",
    ],
  },
  {
    name: "Mercador",
    items: [
      "Ábaco",
      "Balança",
      "Caderno de notas",
      "Kit de escrita",
      "Mapas úteis",
    ],
  },
  {
    name: "Nômade",
    items: [
      "Aljava com 10 flechas",
      "Arco",
      "Facão",
      "Manto camuflado",
      "Sinalizador",
    ],
  },
  {
    name: "infiltrador",
    items: [
      "Corda (15 metros)",
      "Faca",
      "Gazuas",
      "Manto camuflado", 
      "Pé de Cabra"
    ],
  },
  {
    name: "Selvagem",
    items: [
      "Faca de osso",
      "Lança",
      "Pintura ritualística",
      "Rede de dormir",
      "Rede de pesca",
    ],
  },
  {
    name: "Sobrevivente",
    items: [
      "Corda (15 metros)",
      "Machado",
      "Pederneira",
      "Saco de dormir",
    ],
  },
];
const translateKey = (key) => {
  const translations = {
    Reaction: "Reação",
    Perception: "Percepção",
    Sagacity: "Sagacidade",
    Potency: "Potência",
    Influence: "Influência",
    Resolution: "Resolução",
    Geography: "Geografia",
    Medicine: "Medicina",
    Security: "Segurança",
    Biology: "Biologia",
    Erudition: "Erudição",
    Engineering: "Engenharia",
    Weapons: "Armas",
    Athletics: "Atletismo",
    Expression: "Expressão",
    Stealth: "Furtividade",
    Crafting: "Manufaturas",
    Survival: "Sobrevivência",
  };
  return translations[key] || key;
};

function getStepContent(step, props) {
  switch (step) {
    case 0:
      return <Step1_Informacoes {...props} />;
    case 1:
      return <Step2_Evento {...props} />;
    case 2:
      return <Step3_Propositos {...props} />;
    case 3:
      return <Step4_Equipamento {...props} />;
    case 4:
      return <Step5_Distribuicao {...props} />;
    case 5:
      return <Step6_CaboDeGuerra {...props} />;
    default:
      throw new Error("Unknown step");
  }
}

export default function CharacterForm() {
  const [character, setCharacter] = useState({
    name: "",
    generation: "",
    event: "",
    occupation: "",
    purpose1: "",
    purpose2: "",
    relationalPurpose1: "",
    relationalPurpose2: "",
    inventory: [],
    initialPack: "",
    instincts: {
      reaction: 1,
      perception: 1,
      sagacity: 1,
      potency: 1,
      influence: 1,
      resolution: 1,
    },
    knowledge: {
      geography: 0,
      medicine: 0,
      security: 0,
      biology: 0,
      erudition: 0,
      engineering: 0,
    },
    practices: {
      weapons: 0,
      athletics: 0,
      expression: 0,
      stealth: 0,
      crafting: 0,
      survival: 0,
    },
    determinationLevel: 9,
    determinationPoints: 9,
    assimilationLevel: 1,
    assimilationPoints: 1,
  });
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingPoints, setRemainingPoints] = useState(7);
  const [expandedPack, setExpandedPack] = useState(null);
  const [areItemsLoading, setAreItemsLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);
  const [remainingInstinctPoints, setRemainingInstinctPoints] = useState(3);
  const [errors, setErrors] = useState({});
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchItems = async () => {
      if (token) {
        setAreItemsLoading(true);
        try {
          const response = await axios.get("https://assrpgsite-be-production.up.railway.app/api/items", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAllItems(response.data);
        } catch (err) {
          console.error("Erro ao buscar itens:", err);
          setError("Não foi possível carregar os itens do sistema.");
        } finally {
          setAreItemsLoading(false);
        }
      } else {
        setAreItemsLoading(false);
      }
    };
    fetchItems();
  }, [token]);

  const handlePackSelect = (pack) => {
    if (!pack || allItems.length === 0) {
      return;
    }
    const newInventory = [];
    for (const itemName of pack.items) {
      const itemFromDb = allItems.find((dbItem) => dbItem.name === itemName);
      if (itemFromDb) {
        newInventory.push({
          item: itemFromDb._id,
          quality: itemFromDb.quality || 3,
          currentUses: 0,
        });
      } else {
        console.warn(
          `Item "${itemName}" do pacote "${pack.name}" não foi encontrado no banco de dados.`
        );
      }
    }
    setCharacter((prev) => ({
      ...prev,
      initialPack: pack.name,
      inventory: newInventory,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCharacter({ ...character, [name]: value });
    if (!value) {
      setErrors((prev) => ({ ...prev, [name]: "Este campo é obrigatório" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNestedChange = (category, e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;
    const totalPoints =
      Object.values(character.knowledge).reduce((a, v) => a + v, 0) +
      Object.values(character.practices).reduce((a, v) => a + v, 0) -
      (character[category][name] || 0) +
      newValue;
    if (totalPoints <= 7) {
      setCharacter((prev) => ({
        ...prev,
        [category]: { ...prev[category], [name]: newValue },
      }));
      setRemainingPoints(7 - totalPoints);
    }
  };

  const handleTugOfWarChange = (e) => {
    let newDetLevel = parseInt(e.target.value, 10);
    if (isNaN(newDetLevel)) newDetLevel = 1;
    if (newDetLevel < 1) newDetLevel = 1;
    if (newDetLevel > 9) newDetLevel = 9;
    const newAssLevel = 10 - newDetLevel;
    setCharacter((prev) => ({
      ...prev,
      determinationLevel: newDetLevel,
      determinationPoints: newDetLevel,
      assimilationLevel: newAssLevel,
      assimilationPoints: newAssLevel,
    }));
  };

  const handleInstinctChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value, 10);
    const currentValue = character.instincts[name];
    if (isNaN(newValue) || newValue < 1 || newValue > 3) return;
    const diff = newValue - currentValue;
    if (diff > 0 && diff > remainingInstinctPoints) return;
    setRemainingInstinctPoints((prev) => prev - diff);
    setCharacter((prev) => ({
      ...prev,
      instincts: { ...prev.instincts, [name]: newValue },
    }));
  };

  const validateStep = () => {
    const stepRequiredFields = {
      0: ["name", "generation"],
      1: ["event", "occupation"],
      2: ["purpose1", "purpose2", "relationalPurpose1", "relationalPurpose2"],
    };
    if (activeStep === 3) {
      return !!character.initialPack;
    }
    if (activeStep === 4) {
      return remainingInstinctPoints === 0 && remainingPoints === 0;
    }
    if (activeStep >= 5) {
      return true;
    }
    if (stepRequiredFields[activeStep]) {
      return stepRequiredFields[activeStep].every(
        (field) => character[field] && character[field] !== ""
      );
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(activeStep + 1);
      setError("");
    } else {
      if (activeStep === 3) {
        setError("Você precisa escolher um pacote de equipamento inicial.");
      } else if (activeStep === 4) {
        setError(
          "Você precisa distribuir todos os seus pontos de Instinto e de Conhecimentos/Práticas para avançar."
        );
      } else {
        setError("Por favor, preencha todos os campos obrigatórios.");
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError("");
  };
  const handleAccordionToggle = (packName) => {
    setExpandedPack((prev) => (prev === packName ? null : packName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("https://assrpgsite-be-production.up.railway.app/api/characters", character, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
    } catch (err) {
      setError("Erro ao criar personagem");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const propsForStep = {
    character,
    errors,
    handleInputChange,
    handleNestedChange,
    handleInstinctChange,
    handlePackSelect,
    handleAccordionToggle,
    expandedPack,
    handleTugOfWarChange,
    remainingPoints,
    remainingInstinctPoints,
    areItemsLoading,
    initialEquipmentPacks,
    translateKey,
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Card sx={{ maxWidth: 800, width: "100%", mt: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h4" align="center">
              Criação de Personagem
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep, propsForStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    <ChevronLeftRoundedIcon /> Voltar
                  </Button>
                )}
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ mt: 3, ml: 1 }}
                    disabled={loading}
                  >
                    Criar Personagem
                  </Button>
                ) : (
                  <Tooltip
                    title={
                      activeStep === 4 &&
                      (remainingInstinctPoints !== 0 || remainingPoints !== 0)
                        ? "Distribua todos os pontos para avançar"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        type="button"
                        onClick={handleNext}
                        sx={{ mt: 3, ml: 1 }}
                        disabled={
                          loading ||
                          (activeStep === 4 &&
                            (remainingInstinctPoints !== 0 ||
                              remainingPoints !== 0))
                        }
                      >
                        Próximo <ChevronRightRoundedIcon />
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Box>
            </form>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success" sx={{ mt: 2 }}>
                Personagem criado com sucesso!
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppTheme>
  );
}
