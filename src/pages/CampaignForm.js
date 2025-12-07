/* CampaignForm.js (Correção de Submit Antecipado) */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CampaignForm.css";

// Ícones (React Icons)
import { FaCheck, FaArrowLeft, FaArrowRight, FaUpload } from "react-icons/fa";

const steps = ["Informações Básicas", "Configurações Adicionais"];

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

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaign({ ...campaign, [name]: value });

    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ""}));
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

  // --- NAVEGAÇÃO ---
  const validateStep = () => {
    let isValid = true;
    let newErrors = {};

    if (activeStep === 0) {
      if (!campaign.name.trim()) { isValid = false; newErrors.name = "Nome da campanha é obrigatório."; }
      if (!campaign.description.trim()) { isValid = false; newErrors.description = "Uma descrição é necessária."; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = (e) => {
    // Garante que o clique não envie o form
    if(e) e.preventDefault(); 
    
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
      setError("");
    } else {
      setError("Preencha os campos obrigatórios.");
    }
  };

  const handleBack = (e) => {
    if(e) e.preventDefault();
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    // Previne comportamento padrão se vier de um evento
    if (e) e.preventDefault();

    // SEGURANÇA EXTRA: Impede envio se não estiver na última etapa
    if (activeStep !== steps.length - 1) {
        console.warn("Tentativa de envio fora da etapa final bloqueada.");
        return; 
    }

    if (!token || !user || !user._id) {
      setError("Sessão expirada. Faça login novamente.");
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
      await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/campaigns",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => navigate(`/campaigns`), 1500);
    } catch (err) {
      setError("Falha ao criar campanha. Verifique os dados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER DO CONTEÚDO ---
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="fade-in">
            <div className="form-group">
              <label>NOME DA OPERAÇÃO *</label>
              <input
                type="text"
                name="name"
                className="nero-input"
                value={campaign.name}
                onChange={handleInputChange}
                placeholder="Ex: A Queda de São Paulo"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO DA MISSÃO *</label>
              <textarea
                name="description"
                className="nero-textarea"
                rows="5"
                value={campaign.description}
                onChange={handleInputChange}
                placeholder="Contexto, objetivos e cenário..."
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group">
                <label>IMAGEM DE CAPA (OPCIONAL)</label>
                <div className="file-upload-wrapper">
                    <label className="btn-nero btn-secondary" style={{display: 'inline-flex', margin: '0 auto'}}>
                        <FaUpload /> SELECIONAR ARQUIVO
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </label>
                    {selectedFileName && <span className="file-name">{selectedFileName}</span>}
                </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="fade-in">
            <div className="form-group">
              <label>CÓDIGO DE ACESSO (CONVITE)</label>
              <input
                type="text"
                name="inviteCode"
                className="nero-input"
                value={campaign.inviteCode}
                onChange={handleInputChange}
                placeholder="Senha para jogadores entrarem..."
              />
              <span className="helper-text">Deixe em branco se quiser apenas usar os recursos</span>
            </div>

            <div className="form-group">
              <label>REGRAS DA CASA / DIRETRIZES</label>
              <textarea
                name="houseRules"
                className="nero-textarea"
                rows="8"
                value={campaign.houseRules}
                onChange={handleInputChange}
                placeholder="Modificações no sistema, proibições, etc..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="campaign-form-page">
        <div className="nero-form-card">
            <div className="form-title">INICIAR NOVA CAMPANHA</div>

            {/* Stepper */}
            <div className="nero-stepper">
                {steps.map((label, index) => (
                    <div 
                        key={label} 
                        className={`step-item ${activeStep === index ? 'active' : ''} ${activeStep > index ? 'completed' : ''}`}
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* --- CORREÇÃO AQUI --- */}
            {/* O onSubmit previne o default para nada acontecer ao apertar enter sem querer */}
            <form onSubmit={(e) => e.preventDefault()}>
                
                {renderStepContent(activeStep)}

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={handleBack} 
                        className="btn-nero btn-secondary"
                        disabled={activeStep === 0 || loading}
                    >
                        <FaArrowLeft /> VOLTAR
                    </button>

                    {activeStep === steps.length - 1 ? (
                        /* BOTÃO DE FINALIZAR AGORA É DO TIPO "BUTTON" E CHAMA O SUBMIT MANUALMENTE */
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            className="btn-nero btn-primary"
                            disabled={loading}
                        >
                            {loading ? "PROCESSANDO..." : "CRIAR CAMPANHA"} <FaCheck />
                        </button>
                    ) : (
                        /* BOTÃO DE PRÓXIMO É TIPO "BUTTON" */
                        <button 
                            type="button" 
                            onClick={handleNext} 
                            className="btn-nero btn-primary"
                        >
                            PRÓXIMO <FaArrowRight />
                        </button>
                    )}
                </div>

                {error && <div style={{color: '#bd2c2c', textAlign: 'center', marginTop: '20px', fontWeight:'bold'}}>ERRO: {error}</div>}
                {success && <div style={{color: '#4caf50', textAlign: 'center', marginTop: '20px', fontWeight:'bold'}}>SUCESSO! REDIRECIONANDO...</div>}

            </form>
        </div>
    </div>
  );
}