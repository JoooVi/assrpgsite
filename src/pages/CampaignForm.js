import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CssBaseline from "@mui/material/CssBaseline";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TextField from "@mui/material/TextField";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import AppTheme from "../theme/AppTheme"; // Assuming AppTheme is used for consistent styling
import "./CampaignForm.css"; // New CSS file for CampaignForm

// Define os passos do formulário de criação de campanha
const steps = ["Informações Básicas", "Configurações Adicionais"];

function getStepContent(step, campaign, handleInputChange, errors) {
  switch (step) {
    case 0:
      return (
        <div className="step fade-in">
          <TextField
            label="Nome da Campanha"
            variant="outlined"
            fullWidth
            required
            name="name"
            value={campaign.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Descrição da Campanha"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            required
            name="description"
            value={campaign.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
          />
        </div>
      );
    case 1:
      return (
        <div className="step fade-in">
          <TextField
            label="Convite (opcional)"
            variant="outlined"
            fullWidth
            name="inviteCode" // Assuming you might implement invite codes
            value={campaign.inviteCode}
            onChange={handleInputChange}
            helperText="Um código para jogadores entrarem na sua campanha."
          />
          <TextField
            label="Regras da Casa (opcional)"
            variant="outlined"
            multiline
            rows={6}
            fullWidth
            name="houseRules"
            value={campaign.houseRules}
            onChange={handleInputChange}
            helperText="Quaisquer regras adicionais ou modificações."
          />
        </div>
      );
    default:
      throw new Error("Unknown step");
  }
}

export default function CampaignForm() {
  const navigate = useNavigate(); // Hook para navegação programática
  const [campaign, setCampaign] = React.useState({
    name: "",
    description: "",
    inviteCode: "",
    houseRules: "",
    // O master ID será preenchido no backend com base no usuário autenticado
    // Os players serão adicionados posteriormente, não na criação inicial
  });

  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user); // Get current user to set as master

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaign({
      ...campaign,
      [name]: value,
    });
    // Basic validation for required fields
    if (steps[activeStep] === "Informações Básicas") {
      // Check only for first step fields
      const requiredFields = ["name", "description"];
      if (requiredFields.includes(name) && !value) {
        setErrors((prev) => ({ ...prev, [name]: "Este campo é obrigatório." }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const validateStep = () => {
    const allRequiredFields = {
      // Combine required fields from all steps
      name: campaign.name,
      description: campaign.description,
      // Adicione outros campos obrigatórios de outros passos se existirem
    };

    let isValid = true;
    let newErrors = {};

    for (const field in allRequiredFields) {
      if (!allRequiredFields[field]) {
        isValid = false;
        newErrors[field] = "Este campo é obrigatório.";
      } else {
        newErrors[field] = ""; // Clear error if field is filled
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(activeStep + 1);
      setError("");
    } else {
      setError("Por favor, preencha todos os campos obrigatórios.");
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Final validation for the last step
    if (!validateStep()) {
      setLoading(false);
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      if (!token || !user || !user._id) {
        setError("Você precisa estar logado para criar uma campanha.");
        setLoading(false);
        return;
      }

      // Prepare data to send to backend, including master's ID
      const campaignDataToSend = {
        ...campaign,
        master: user._id,
      };

      const response = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/campaigns",
        campaignDataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
      console.log("Campanha criada:", response.data);
      // Navigate to the new campaign's detail page or campaign list
      navigate(`/campaigns`); // Navigate back to the campaign list
    } catch (err) {
      setError("Erro ao criar campanha. Por favor, tente novamente.");
      console.error(
        "Erro completo ao criar campanha:",
        err.response?.data || err.message
      );
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
              Criar Nova Campanha
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep, campaign, handleInputChange, errors)}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 3,
                  ml: 1,
                }}
              >
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    <ChevronLeftRoundedIcon /> Voltar
                  </Button>
                )}

                {activeStep === steps.length - 1 ? (
                  // Botão final para CRIAR a campanha
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit} // Aciona a submissão diretamente no clique
                    disabled={loading}
                  >
                    {loading ? "Criando..." : "Criar Campanha"}
                  </Button>
                ) : (
                  // Botão para ir para o PRÓXIMO passo
                  <Button variant="contained" onClick={handleNext}>
                    Próximo <ChevronRightRoundedIcon />
                  </Button>
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
                Campanha criada com sucesso!
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppTheme>
  );
}