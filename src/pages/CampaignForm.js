/* CampaignForm.js */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaUpload } from "react-icons/fa";
import InlineLoader from "../components/ui/InlineLoader";
import { dispatchToast } from "../components/notifications/ToastProvider";
import api from "../api";
import "./CampaignForm.css";

const steps = ["Informações Básicas", "Configurações Adicionais"];

export default function CampaignForm() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [campaign, setCampaign] = useState({
    name: "",
    description: "",
    inviteCode: "",
    houseRules: "",
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(coverImageFile);
    setCoverPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImageFile]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCampaign((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setCoverImageFile(file || null);
    setSelectedFileName(file?.name || "");
  };

  const validateStep = () => {
    const nextErrors = {};

    if (activeStep === 0) {
      if (!campaign.name.trim()) {
        nextErrors.name = "Nome da campanha é obrigatório.";
      }

      if (!campaign.description.trim()) {
        nextErrors.description = "Uma descrição é necessária.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = (event) => {
    event?.preventDefault();

    if (validateStep()) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }

    dispatchToast({ message: "Preencha os campos obrigatórios.", type: "warning" });
  };

  const handleBack = (event) => {
    event?.preventDefault();
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (activeStep !== steps.length - 1) {
      return;
    }

    if (!validateStep()) {
      dispatchToast({ message: "Revise os campos obrigatórios.", type: "warning" });
      return;
    }

    if (!token || !user?._id) {
      dispatchToast({ message: "Sessão expirada. Faça login novamente.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("name", campaign.name);
    formData.append("description", campaign.description);
    formData.append("inviteCode", campaign.inviteCode);
    formData.append("houseRules", campaign.houseRules);

    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }

    setLoading(true);

    try {
      const response = await api.post("/campaigns", formData);

      const createdCampaignId = response.data?._id || response.data?.campaign?._id;
      dispatchToast({ message: "Campanha criada. Abrindo lobby...", type: "success" });
      setTimeout(
        () => navigate(createdCampaignId ? `/campaign-lobby/${createdCampaignId}` : "/campaigns"),
        900
      );
    } catch (err) {
      dispatchToast({ message: "Falha ao criar campanha. Verifique os dados.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
                {coverPreviewUrl && (
                  <div className="campaign-cover-preview">
                    <img src={coverPreviewUrl} alt="Prévia da capa" />
                  </div>
                )}

                <label className="btn-nero btn-secondary campaign-upload-button">
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
                placeholder="Opcional, exemplo: NERO47"
              />
              <span className="helper-text">Se ficar em branco, um código único será gerado automaticamente.</span>
            </div>

            <div className="form-group">
              <label>REGRAS DA CASA / DIRETRIZES</label>
              <textarea
                name="houseRules"
                className="nero-textarea"
                rows="8"
                value={campaign.houseRules}
                onChange={handleInputChange}
                placeholder="Modificações no sistema, proibições, acordos da mesa..."
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

        <div className="nero-stepper">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`step-item ${activeStep === index ? "active" : ""} ${
                activeStep > index ? "completed" : ""
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <form onSubmit={(event) => event.preventDefault()}>
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
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-nero btn-primary"
                disabled={loading}
              >
                {loading ? <InlineLoader label="Processando" /> : <>CRIAR E ABRIR LOBBY <FaCheck /></>}
              </button>
            ) : (
              <button type="button" onClick={handleNext} className="btn-nero btn-primary">
                PRÓXIMO <FaArrowRight />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
