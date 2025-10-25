import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import AppTheme from "../theme/AppTheme";
import "./CampaignForm.css";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

// --- Input escondido para upload de imagem ---
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const steps = ["Informações Básicas", "Configurações Adicionais"];

function getStepContent(step, campaign, handleInputChange, handleFileChange, selectedFileName, errors) {
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
          />
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ mb: 1, color: '#ccc', borderColor: '#888' }}
          >
            Carregar Imagem da Capa (Opcional)
            <VisuallyHiddenInput type="file" name="coverImage" onChange={handleFileChange} accept="image/*" />
          </Button>
          {selectedFileName && (
            <Typography variant="caption" sx={{ color: '#aaa', display: 'block', textAlign: 'center' }}>
              Ficheiro selecionado: {selectedFileName}
            </Typography>
          )}
        </div>
      );

    case 1:
      return (
        <div className="step fade-in">
          <TextField
            label="Convite (opcional)"
            variant="outlined"
            fullWidth
            name="inviteCode"
            value={campaign.inviteCode}
            onChange={handleInputChange}
            helperText="Um código para jogadores entrarem na sua campanha."
            sx={{ mb: 2 }}
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
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState({
    name: "",
    description: "",
    inviteCode: "",
    houseRules: "",
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaign({ ...campaign, [name]: value });

    if (steps[activeStep] === "Informações Básicas") {
      const requiredFields = ["name", "description"];
      if (requiredFields.includes(name) && !value) {
        setErrors((prev) => ({ ...prev, [name]: "Este campo é obrigatório." }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0]);
      setSelectedFileName(e.target.files[0].name);
    } else {
      setCoverImageFile(null);
      setSelectedFileName("");
    }
  };

  const validateStep = () => {
    let isValid = true;
    let newErrors = {};

    if (activeStep === 0) {
      if (!campaign.name) { isValid = false; newErrors.name = "Nome é obrigatório."; }
      if (!campaign.description) { isValid = false; newErrors.description = "Descrição é obrigatória."; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
      setError("");
    } else {
      setError("Por favor, preencha todos os campos obrigatórios.");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Segurança extra — só permite envio no último passo
    if (activeStep !== steps.length - 1) {
      console.warn("Tentativa de submit fora do último passo. Ignorado.");
      return;
    }

    if (!validateStep()) {
      setError("Por favor, preencha todos os campos obrigatórios antes de criar.");
      return;
    }

    if (!token || !user || !user._id) {
      setError("Você precisa estar logado para criar uma campanha.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", campaign.name);
    formData.append("description", campaign.description);
    formData.append("inviteCode", campaign.inviteCode);
    formData.append("houseRules", campaign.houseRules);

    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }

    try {
      const response = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/campaigns",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(true);
      console.log("Campanha criada:", response.data);
      setTimeout(() => navigate(`/campaigns`), 1000);
    } catch (err) {
      setError("Erro ao criar campanha. Verifique os dados e tente novamente.");
      console.error("Erro completo:", err.response?.data || err.message);
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
          py: 4,
          bgcolor: "#161616",
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            maxWidth: 800,
            width: "90%",
            bgcolor: "#1e1e1e",
            color: "#e0e0e0",
            border: "1px solid #4a4a4a",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography component="h1" variant="h4" align="center" sx={{ color: "#ffffff", mb: 3 }}>
              Criar Nova Campanha
            </Typography>

            <Stepper activeStep={activeStep} sx={{ pt: 1, pb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: "#666",
                        "&.Mui-active": { color: "primary.main" },
                        "&.Mui-completed": { color: "primary.main" },
                      },
                    }}
                  >
                    <Typography sx={{ color: "#ccc" }}>{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* 🔒 NÃO usamos mais onSubmit — controle total via botão */}
            <div>
              {getStepContent(activeStep, campaign, handleInputChange, handleFileChange, selectedFileName, errors)}

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button onClick={handleBack} disabled={activeStep === 0 || loading} sx={{ color: "#ccc" }}>
                  <ChevronLeftRoundedIcon /> Voltar
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit} // ✅ Agora é manual, não por submit automático
                    disabled={loading}
                  >
                    {loading ? "Criando..." : "Criar Campanha"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    type="button" // evita qualquer submit implícito
                  >
                    Próximo <ChevronRightRoundedIcon />
                  </Button>
                )}
              </Box>
            </div>

            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" sx={{ mt: 2, textAlign: "center" }}>
                Campanha criada com sucesso! Redirecionando...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppTheme>
  );
}