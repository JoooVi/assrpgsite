import React, { useState } from "react"; // useState em vez de React.useState
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
// --- NOVO: Importações para o input de ficheiro ---
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
// --- FIM DAS NOVAS IMPORTAÇÕES ---

// --- NOVO: Estilização para o input de ficheiro escondido ---
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
// --- FIM DA ESTILIZAÇÃO ---


// Define os passos (mantido)
const steps = ["Informações Básicas", "Configurações Adicionais"];

// Função getStepContent atualizada
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
            sx={{ mb: 2 }} // Adiciona margem inferior
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
            sx={{ mb: 2 }} // Adiciona margem inferior
          />
          {/* --- NOVO: Campo de Upload de Imagem --- */}
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            fullWidth // Ocupa a largura toda
            sx={{ mb: 1, color: '#ccc', borderColor: '#888' }} // Estilo escuro
          >
            Carregar Imagem da Capa (Opcional)
            <VisuallyHiddenInput type="file" name="coverImage" onChange={handleFileChange} accept="image/*" />
          </Button>
          {selectedFileName && (
            <Typography variant="caption" sx={{ color: '#aaa', display: 'block', textAlign: 'center' }}>
              Ficheiro selecionado: {selectedFileName}
            </Typography>
          )}
          {/* --- FIM DO CAMPO DE UPLOAD --- */}
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
             sx={{ mb: 2 }} // Adiciona margem inferior
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
  // --- NOVO: Estado para guardar o ficheiro de imagem ---
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(""); // Para mostrar o nome do ficheiro
  // --- FIM DO NOVO ESTADO ---

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaign({
      ...campaign,
      [name]: value,
    });
    // Validação básica (mantida)
    if (steps[activeStep] === "Informações Básicas") {
      const requiredFields = ["name", "description"];
      if (requiredFields.includes(name) && !value) {
        setErrors((prev) => ({ ...prev, [name]: "Este campo é obrigatório." }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // --- NOVA: Função para lidar com a seleção do ficheiro ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0]);
      setSelectedFileName(e.target.files[0].name);
    } else {
      setCoverImageFile(null);
      setSelectedFileName("");
    }
  };
  // --- FIM DA NOVA FUNÇÃO ---


  const validateStep = () => {
    // Validação (mantida, mas só valida campos de texto)
     let isValid = true;
     let newErrors = {};

     // Verifica apenas os campos obrigatórios do passo atual
     if (activeStep === 0) {
       if (!campaign.name) { isValid = false; newErrors.name = "Nome é obrigatório."; }
       if (!campaign.description) { isValid = false; newErrors.description = "Descrição é obrigatória."; }
     }
     // Adicionar validações para outros passos se necessário

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

  // --- handleSubmit ATUALIZADO para usar FormData ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne recarregamento da página

    // Validação final antes de enviar
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

    // 1. Criar um objeto FormData
    const formData = new FormData();

    // 2. Adicionar os campos de texto ao FormData
    formData.append('name', campaign.name);
    formData.append('description', campaign.description);
    formData.append('inviteCode', campaign.inviteCode);
    formData.append('houseRules', campaign.houseRules);
    // O 'master' é adicionado pelo backend via 'protect' middleware, não precisa enviar

    // 3. Adicionar o ficheiro de imagem (se existir)
    if (coverImageFile) {
      // O nome 'coverImage' DEVE corresponder ao usado em upload.single('coverImage') no backend
      formData.append('coverImage', coverImageFile);
    }

    try {
      // 4. Enviar o FormData em vez do objeto JSON
      const response = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/campaigns",
        formData, // Envia FormData
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // IMPORTANTE: Não defina 'Content-Type' manualmente.
            // O navegador definirá 'multipart/form-data' automaticamente com o boundary correto.
          },
        }
      );
      setSuccess(true);
      console.log("Campanha criada:", response.data);
      // Navega para a lista após sucesso
       setTimeout(() => navigate(`/campaigns`), 1000); // Pequeno delay para mostrar msg de sucesso

    } catch (err) {
      setError("Erro ao criar campanha. Verifique os dados e tente novamente.");
      console.error("Erro completo:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  // --- FIM DO handleSubmit ATUALIZADO ---


  return (
    // --- ALTERADO: Aplicado estilo escuro ao Card e Fundo ---
    <AppTheme>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 4, // Padding vertical
          bgcolor: '#161616', // Fundo da página escuro
          minHeight: '100vh',
        }}
      >
        <Card sx={{
            maxWidth: 800,
            width: "90%", // Usar percentagem para responsividade
            bgcolor: '#1e1e1e', // Fundo do card escuro
            color: '#e0e0e0', // Texto claro
            border: '1px solid #4a4a4a' // Borda
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}> {/* Padding responsivo */}
            <Typography component="h1" variant="h4" align="center" sx={{ color: '#ffffff', mb: 3 }}>
              Criar Nova Campanha
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 1, pb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                   {/* Estilo escuro para o Stepper */}
                  <StepLabel StepIconProps={{ sx: { color: '#666', '&.Mui-active': { color: 'primary.main' }, '&.Mui-completed': { color: 'primary.main' } } }}>
                     <Typography sx={{ color: '#ccc' }}>{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* O formulário agora chama handleSubmit no submit, não no botão */}
            <form onSubmit={handleSubmit}>
              {/* Passa as novas props para getStepContent */}
              {getStepContent(activeStep, campaign, handleInputChange, handleFileChange, selectedFileName, errors)}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between", // Alterado para espaçar
                  mt: 3,
                }}
              >
                {/* Botão Voltar */}
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0 || loading} // Desativa se estiver no primeiro passo ou carregando
                    sx={{ color: '#ccc' }}
                >
                  <ChevronLeftRoundedIcon /> Voltar
                </Button>

                {/* Botão Próximo/Criar */}
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit" // Agora é do tipo submit
                    disabled={loading}
                  >
                    {loading ? "Criando..." : "Criar Campanha"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Próximo <ChevronRightRoundedIcon />
                  </Button>
                )}
              </Box>
            </form>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" sx={{ mt: 2, textAlign: 'center' }}>
                Campanha criada com sucesso! Redirecionando...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppTheme>
     // --- FIM DA ALTERAÇÃO ---
  );
}