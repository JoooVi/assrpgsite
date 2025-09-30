/* CharacterForm.js */

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Chip } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useSelector } from "react-redux";
import axios from "axios";
import AppTheme from "../theme/AppTheme";
import "./CharacterForm.css";

const steps = [
  "Informações",
  "Evento",
  "Propósitos",
  "Caracteristicas",
  "Assimilação e Determinação",
];

const translateKey = (key) => {
  const translations = {
    Reaction: "Reação",
    Perception: "Percepção",
    Sagacity: "Sagacidade",
    Potency: "Potência",
    Influence: "Influência",
    Resolution: "Resolução",
    Agrarian: "Agrária",
    Biological: "Biológica",
    Exact: "Exata",
    Medicine: "Medicina",
    Social: "Social",
    Artistic: "Artística",
    Sports: "Esportes",
    Tools: "Ferramentas",
    Crafts: "Oficio",
    Weapons: "Armas",
    Vehicles: "Veículos",
    Infiltration: "Infiltração",

    // Adicione outras traduções conforme necessário
  };
  return translations[key] || key;
};

function getStepContent(
  step,
  character,
  handleInputChange,
  handleNestedChange,
  handleInstinctChoice,
  handleInstinctChange,
  handleAssimilationChange,
  handleDeterminationChange,
  remainingPoints,
  instinctPoints,
  errors
) {
  console.log("Renderizando conteúdo do passo:", step);
  switch (step) {
    case 0:
      return (
        <div className="step fade-in"> {/* Added fade-in class */}
          <TextField
            label="Nome"
            variant="outlined"
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
            variant="outlined"
            fullWidth
            required
            name="generation"
            value={character.generation}
            onChange={handleInputChange}
            error={!!errors.generation}
            helperText={errors.generation}
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            <option value="preCollapse">Pré-Colapso</option>
            <option value="collapse">Colapso</option>
            <option value="postCollapse">Pós-Colapso</option>
            <option value="current">Atual</option>
          </TextField>
        </div>
      );
    case 1:
      return (
        <div className="step fade-in"> {/* Added fade-in class */}
          <TextField
            label="Evento Marcante"
            variant="outlined"
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
            variant="outlined"
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
    case 2:
      return (
        <div className="step fade-in"> {/* Added fade-in class */}
          <TextField
            label="Propósito Individual 1"
            variant="outlined"
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
            variant="outlined"
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
            variant="outlined"
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
            variant="outlined"
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
    case 3:
      return (
        <div className="step fade-in"> {/* Added fade-in class */}
          <h3>Instintos</h3>
          <RadioGroup
            name="instinctChoice"
            value={character.instinctChoice}
            onChange={handleInstinctChoice}
          >
            <FormControlLabel
              value="generalist"
              control={<Radio />}
              label="Generalista (2, 2, 2, 1, 1, 1)"
            />
            <FormControlLabel
              value="specialist"
              control={<Radio />}
              label="Especialista (3, 2, 1, 1, 1, 1)"
            />
          </RadioGroup>
          <Grid container spacing={2}>
            {Object.keys(character.instincts).map((instinct) => (
              <Grid item xs={6} sm={4} md={2} key={instinct.toString()}>
                <TextField
                  label={translateKey(
                    instinct.charAt(0).toUpperCase() + instinct.slice(1)
                  )}
                  variant="outlined"
                  fullWidth
                  required
                  name={instinct}
                  value={character.instincts[instinct]}
                  onChange={(e) => handleInstinctChange(e)}
                  error={!!errors[instinct]}
                  helperText={errors[instinct]}
                  type="number"
                  inputProps={{ min: 0, max: 3 }}
                />
              </Grid>
            ))}
          </Grid>
          <h3>Conhecimentos e Práticas</h3>
          <Chip
            icon={<StarIcon />}
            label={`Pontos restantes: ${remainingPoints}`}
            color={remainingPoints > 0 ? "success" : "default"}
            variant="outlined"
            sx={{ mb: 2, p: 2, fontSize: "1rem" }}
          >
            Pontos restantes: {remainingPoints}
          </Chip>
          <Grid container spacing={2}>
            {Object.keys(character.knowledge).map((knowledge) => (
              <Grid item xs={6} sm={4} md={2} key={knowledge.toString()}>
                <TextField
                  label={translateKey(
                    knowledge.charAt(0).toUpperCase() + knowledge.slice(1)
                  )}
                  variant="outlined"
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
              <Grid item xs={6} sm={4} md={2} key={practice.toString()}>
                <TextField
                  label={translateKey(
                    practice.charAt(0).toUpperCase() + practice.slice(1)
                  )}
                  variant="outlined"
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
    case 4:
      return (
        <div className="step fade-in"> {/* Added fade-in class */}
          <h3>Assimilação e Determinação</h3>
          <TextField
            label="Assimilação"
            variant="outlined"
            fullWidth
            required
            name="assimilation"
            value={character.assimilation}
            onChange={(e) => handleAssimilationChange(e)}
            error={!!errors.assimilation}
            helperText={errors.assimilation}
            type="number"
            inputProps={{ min: 1, max: 9 }}
          />
          <TextField
            label="Determinação"
            variant="outlined"
            fullWidth
            required
            name="determination"
            value={character.determination}
            onChange={(e) => handleDeterminationChange(e)}
            error={!!errors.determination}
            helperText={errors.determination}
            type="number"
            inputProps={{ min: 1, max: 9 }}
          />
        </div>
      );
    default:
      throw new Error("Unknown step");
  }
}

export default function CharacterForm(props) {
  const [character, setCharacter] = React.useState({
    name: "",
    generation: "",
    event: "",
    occupation: "",
    purpose1: "",
    purpose2: "",
    relationalPurpose1: "",
    relationalPurpose2: "",
    instincts: {
      reaction: 0,
      perception: 0,
      sagacity: 0,
      potency: 0,
      influence: 0,
      resolution: 0,
    },
    knowledge: {
      agrarian: 0,
      biological: 0,
      exact: 0,
      medicine: 0,
      social: 0,
      artistic: 0,
    },
    practices: {
      sports: 0,
      tools: 0,
      crafts: 0,
      weapons: 0,
      vehicles: 0,
      infiltration: 0,
    },
    assimilation: 0,
    determination: 0,
  });

  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [remainingPoints, setRemainingPoints] = React.useState(7);
  const [instinctPoints, setInstinctPoints] = React.useState([]);
  const [errors, setErrors] = React.useState({});

  const token = useSelector((state) => state.auth.token);

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setCharacter({
    ...character,
    [name]: value,
  });
  if (!value) {
    setErrors(prev => ({ ...prev, [name]: "Este campo é obrigatório" }));
  } else {
    setErrors(prev => ({ ...prev, [name]: "" }));
  }
};

  const handleNestedChange = (category, e) => {
    const { name, value } = e.target;
    console.log(`Nested Change - ${category} - ${name}:`, value);
    const newValue = parseInt(value) || 0;

    if (category === "instincts") {
      // This part of the logic seems to be a remnant or intended for a different instinct point distribution.
      // If you intend to limit instinct points based on instinctPoints array,
      // you'll need a more robust check that accounts for the distribution chosen.
      // For now, it will simply set the value if it's less than or equal to the "instinctPoints[name]"
      // which is likely not the desired behavior if "instinctPoints" is an array of allowed values.
      if (newValue <= instinctPoints[name]) {
        setCharacter({
          ...character,
          [category]: {
            ...character[category],
            [name]: newValue,
          },
        });
      }
    } else {
      const totalPoints =
        Object.values(character.knowledge).reduce((acc, val) => acc + val, 0) +
        Object.values(character.practices).reduce((acc, val) => acc + val, 0) -
        character[category][name] +
        newValue;

      if (totalPoints <= 7) {
        setCharacter({
          ...character,
          [category]: {
            ...character[category],
            [name]: newValue,
          },
        });
        setRemainingPoints(7 - totalPoints);
      }
    }
  };

  const handleAssimilationChange = (e) => {
    const value = Math.max(1, Math.min(9, parseInt(e.target.value) || 1));
    setCharacter({
      ...character,
      assimilation: value,
      determination: 10 - value,
    });
  };

  const handleDeterminationChange = (e) => {
    const value = Math.max(1, Math.min(9, parseInt(e.target.value) || 1));
    setCharacter({
      ...character,
      determination: value,
      assimilation: 10 - value,
    });
  };

  const handleInstinctChoice = (e) => {
    const choice = e.target.value;
    let points = [];
    if (choice === "generalist") {
      points = [2, 2, 2, 1, 1, 1];
    } else if (choice === "specialist") {
      points = [3, 2, 1, 1, 1, 1];
    }
    setInstinctPoints(points);
    setCharacter({
      ...character,
      instincts: {
        reaction: 0,
        perception: 0,
        sagacity: 0,
        potency: 0,
        influence: 0,
        resolution: 0,
      },
    });
  };

  const handleInstinctChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;

    const currentInstincts = { ...character.instincts, [name]: newValue };
    const totalPointsUsed = Object.values(currentInstincts).reduce(
      (acc, val) => acc + val,
      0
    );

    // This logic needs to be carefully reviewed based on the desired instinct point distribution.
    // The current implementation checks if the total points used are within the sum of instinctPoints,
    // and if the new value is present in the instinctPoints array, and if the count of that value
    // in currentInstincts does not exceed its count in instinctPoints.
    // This is a complex way to manage point distribution and might not be working as intended.
    if (totalPointsUsed <= instinctPoints.reduce((acc, val) => acc + val, 0)) {
      const validDistribution =
        instinctPoints.includes(newValue) &&
        Object.values(currentInstincts).filter((val) => val === newValue)
          .length <= instinctPoints.filter((val) => val === newValue).length;

      if (validDistribution) {
        setCharacter({
          ...character,
          instincts: currentInstincts,
        });
      }
    }
  };

  const validateStep = () => {
    const stepRequiredFields = {
      0: ["name", "generation"],
      1: ["event", "occupation"],
      2: ["purpose1", "purpose2", "relationalPurpose1", "relationalPurpose2"],
    };

    if (activeStep === 3 || activeStep === 4) return true;

    const isValid = stepRequiredFields[activeStep].every(
      (field) => character[field]
    );
    console.log(`Validate Step ${activeStep}:`, isValid);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(activeStep + 1);
      setError("");
      console.log("Next Step:", activeStep + 1);
    } else {
      setError("Por favor, preencha todos os campos obrigatórios.");
      console.log(
        "Validation Error:",
        "Por favor, preencha todos os campos obrigatórios."
      );
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError("");
    console.log("Previous Step:", activeStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "https://hystoriarpg-production.up.railway.app/api/characters",
        character,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
      console.log("Personagem salvo:", response.data);
    } catch (err) {
      setError("Erro ao criar personagem");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
              {getStepContent(
                activeStep,
                character,
                handleInputChange,
                handleNestedChange,
                handleInstinctChoice,
                handleInstinctChange,
                handleAssimilationChange,
                handleDeterminationChange,
                remainingPoints,
                instinctPoints,
                errors
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    <ChevronLeftRoundedIcon /> Voltar
                  </Button>
                )}
                <Button
                  variant="contained"
                  type={activeStep === steps.length - 1 ? "submit" : "button"}
                  onClick={
                    activeStep === steps.length - 1 ? undefined : handleNext
                  }
                  sx={{ mt: 3, ml: 1 }}
                  disabled={loading}
                >
                  {loading
                    ? "Carregando..."
                    : activeStep === steps.length - 1
                    ? "Criar Personagem"
                    : "Próximo"}
                  {activeStep !== steps.length - 1 && (
                    <ChevronRightRoundedIcon />
                  )}
                </Button>
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