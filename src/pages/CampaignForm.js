/* CampaignForm.js */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaCopy, FaRandom, FaTv, FaUpload } from "react-icons/fa";
import InlineLoader from "../components/ui/InlineLoader";
import { dispatchToast } from "../components/notifications/ToastProvider";
import api from "../api";
import { getPublicErrorMessage } from "../utils/httpErrors";
import Breadcrumbs from "../components/navigation/Breadcrumbs";
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
  const [createdCampaign, setCreatedCampaign] = useState(null);

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
    setCampaign((prev) => ({
      ...prev,
      [name]: name === "inviteCode" ? value.replace(/\s+/g, "").toUpperCase() : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateInviteCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setCampaign((current) => ({ ...current, inviteCode: code }));
    setErrors((current) => ({ ...current, inviteCode: "" }));
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

      const created = response.data?.campaign || response.data;
      setCreatedCampaign(created);
      dispatchToast({ message: "Campanha criada com sucesso.", type: "success" });
    } catch (err) {
      const message = getPublicErrorMessage(err, "Falha ao criar campanha. Verifique os dados.");
      if (err.response?.status === 409) {
        setErrors((prev) => ({ ...prev, inviteCode: message }));
      }
      dispatchToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    const code = createdCampaign?.inviteCode || campaign.inviteCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      dispatchToast({ message: "Código de convite copiado.", type: "success" });
    } catch {
      dispatchToast({ message: `Código de convite: ${code}`, type: "info" });
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
              <span className="helper-text">Use de 4 a 12 letras e números. Espaços são removidos e letras ficam maiúsculas. Se ficar em branco, o sistema gera um código único.</span>
              {errors.inviteCode && <span className="error-text">{errors.inviteCode}</span>}
              <div className="campaign-code-actions">
                <button type="button" className="btn-nero btn-secondary" onClick={generateInviteCode}><FaRandom /> Gerar código</button>
                {campaign.inviteCode && <button type="button" className="btn-nero btn-secondary" onClick={() => setCampaign((current) => ({ ...current, inviteCode: "" }))}>Limpar</button>}
              </div>
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
        <Breadcrumbs items={[
          { label: "Campanhas", to: "/campaigns" },
          { label: "Nova campanha" },
        ]} />
        {createdCampaign ? (
          <section className="campaign-created-state" aria-labelledby="campaign-created-title">
            <FaCheck className="campaign-created-icon" aria-hidden="true" />
            <span>Campanha criada</span>
            <h1 id="campaign-created-title">{createdCampaign.name || campaign.name}</h1>
            <p>Sua campanha está pronta. Compartilhe o código ou abra uma das áreas abaixo.</p>
            {(createdCampaign.inviteCode || campaign.inviteCode) && (
              <div className="campaign-created-code">
                <span>Código de convite</span>
                <strong>{createdCampaign.inviteCode || campaign.inviteCode}</strong>
                <button type="button" onClick={copyInviteCode}><FaCopy /> Copiar</button>
              </div>
            )}
            <div className="campaign-created-actions">
              <button type="button" className="btn-nero btn-primary" onClick={() => navigate(`/campaign-lobby/${createdCampaign._id}`)}>Abrir campanha</button>
              <button type="button" className="btn-nero btn-secondary" onClick={() => navigate(`/campanha/${createdCampaign._id}/vtt`)}><FaTv /> Abrir VTT</button>
              <button type="button" className="btn-nero btn-secondary" onClick={() => navigate("/campaigns")}>Ver campanhas</button>
            </div>
          </section>
        ) : <>
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
        </>}
      </div>
    </div>
  );
}
