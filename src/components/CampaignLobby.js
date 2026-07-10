/* CampaignLobby.js */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./CampaignLobby.css";
import { dispatchToast } from "./notifications/ToastProvider";
import { useConfirm } from "./notifications/ConfirmProvider";
import PageLoader from "./ui/PageLoader";
import InlineLoader from "./ui/InlineLoader";
import EmptyState from "./ui/EmptyState";
import api from "../api";
import { API_BASE_URL } from "../config/apiConfig";

// Ícones
import {
  FaShieldAlt,
  FaHome,
  FaUserPlus,
  FaUserFriends,
  FaEdit,
  FaTv,
  FaTrash,
  FaEye,
  FaExclamationTriangle,
} from "react-icons/fa";

// Constantes
const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1626262846282-e36214878a1a?q=80&w=1000&auto=format&fit=crop";

const getCharacterAvatar = (character) => {
  if (character?.avatar) return character.avatar;

  const initial = encodeURIComponent((character?.name || "?").trim().charAt(0).toUpperCase() || "?");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1b1b1b"/>
          <stop offset="55%" stop-color="#0a0a0a"/>
          <stop offset="100%" stop-color="#2a0907"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#bg)"/>
      <rect x="14" y="14" width="292" height="192" fill="none" stroke="#8a1c18" stroke-width="3"/>
      <circle cx="160" cy="92" r="38" fill="#8a1c18" opacity="0.88"/>
      <path d="M92 184c10-43 42-66 68-66s58 23 68 66" fill="#141414" stroke="#333" stroke-width="3"/>
      <text x="160" y="105" fill="#fff" font-family="Arial, sans-serif" font-size="44" font-weight="700" text-anchor="middle">${initial}</text>
      <text x="160" y="197" fill="#777" font-family="Arial, sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="3">AGENTE</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CampaignLobby = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  // --- ESTADOS ---
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  const [openCharModal, setOpenCharModal] = useState(false);
  const [availableChars, setAvailableChars] = useState([]);

  // Upload e Feedback
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sistema de Notificação Customizado (Substitui Snackbar)
  const showToast = (msg, type = "success") => {
    dispatchToast({ message: msg, type });
  };

  // --- FETCH DATA ---
  const fetchCampaignData = useCallback(async () => {
    if (!token) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/campaigns/${campaignId}`);

      const data = res.data;
      setCampaign(data);

      // Verifica Mestre
      setIsMaster(
        user && data.master && (data.master._id || data.master) === user._id
      );

      // URL da Imagem
      let img = data.coverImage;
      if (img && !img.startsWith("http")) {
        img = `${API_BASE_URL}/${img.replace(
          /\\/g,
          "/"
        )}`;
      }
      setCoverImageUrl(img || DEFAULT_COVER_IMAGE);
    } catch (err) {
      setError("Falha ao carregar dados da campanha.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  // --- HANDLERS ---

  // Upload Capa
  const handleCoverImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = null;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const response = await api.put(`/campaigns/${campaignId}/cover`, formData);

      let newUrl = response.data.coverImage;
      if (newUrl && !newUrl.startsWith("http")) {
        newUrl = `${API_BASE_URL}/${newUrl.replace(
          /\\/g,
          "/"
        )}`;
      }
      setCoverImageUrl(newUrl || DEFAULT_COVER_IMAGE);
      showToast("Capa atualizada com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao atualizar capa.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditCoverClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Personagens
  const handleOpenCharModal = async () => {
    try {
      const res = await api.get("/characters/available");
      setAvailableChars(res.data);
      setOpenCharModal(true);
    } catch (err) {
      showToast("Erro ao buscar personagens.", "error");
    }
  };

  const handleAddCharacter = async (characterId) => {
    try {
      await api.post(`/campaigns/${campaignId}/add-character`, { characterId });
      setOpenCharModal(false);
      fetchCampaignData();
      showToast("Agente adicionado à operação.");
    } catch (err) {
      showToast("Erro ao adicionar agente.", "error");
    }
  };

  const handleRemoveCharacter = async (characterId, characterName) => {
    const confirmed = await confirm({
      title: "Remover agente",
      message: `Remover "${characterName}" da campanha?`,
      tone: "warning",
      confirmLabel: "Remover",
    });
    if (!confirmed) return;

    try {
      await api.post(`/campaigns/${campaignId}/remove-character`, { characterId });
      fetchCampaignData();
      showToast("Agente removido.");
    } catch (err) {
      showToast("Erro ao remover agente.", "error");
    }
  };

  const handleInvite = () => {
    if (campaign?.inviteCode) {
      navigator.clipboard.writeText(campaign.inviteCode).then(
        () => showToast(`Código copiado: ${campaign.inviteCode}`),
        () => showToast(`Codigo: ${campaign.inviteCode}`, "info")
      );
    } else {
      showToast("Sem código de convite.", "error");
    }
  };

  // --- RENDER ---

  if (loading)
    return (
      <PageLoader title="Carregando operacao" subtitle="Preparando lobby da campanha..." />
    );

  if (error || !campaign)
    return (
      <div className="lobby-page" style={{ alignItems: "center" }}>
        <div
          className="lobby-panel"
          style={{ textAlign: "center", maxWidth: "500px" }}
        >
          <FaExclamationTriangle
            style={{ fontSize: "3rem", color: "#ff3333", marginBottom: "20px" }}
          />
          <h2>ACESSO NEGADO / ERRO</h2>
          <p>{error || "Campanha não encontrada."}</p>
          <Link
            to="/campaigns"
            className="btn-nero btn-secondary"
            style={{ marginTop: "20px" }}
          >
            VOLTAR
          </Link>
        </div>
      </div>
    );

  return (
    <div className="lobby-page">
      <div className="lobby-panel">

        {/* HEADER DA CAMPANHA */}
        <div className="lobby-header">
          {/* Capa com Upload */}
          <div className="cover-container">
            <img src={coverImageUrl} alt="Capa" className="cover-image" />

            {isMaster && (
              <div
                className="edit-cover-overlay"
                onClick={handleEditCoverClick}
              >
                <div className="btn-edit-cover">
                  {isUploading ? <InlineLoader label="Enviando" /> : <><FaEdit /> ALTERAR CAPA</>}
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCoverImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <h1 className="lobby-title">{campaign.name}</h1>
          <p className="lobby-desc">{campaign.description}</p>
        </div>


        <div className="campaign-command-grid">
          <Link to={`/campanha/${campaignId}/vtt`} className="campaign-command-card primary">
            <FaTv />
            <span>Entrar no VTT</span>
            <small>Mesa virtual da campanha</small>
          </Link>

          <Link to={`/campaign/${campaignId}/refuges`} className="campaign-command-card">
            <FaHome />
            <span>Refúgios</span>
            <small>Bases, recursos e sala de guerra</small>
          </Link>

          {isMaster && (
            <Link to={`/campaign-sheet/${campaignId}`} className="campaign-command-card">
              <FaShieldAlt />
              <span>Escudo do Mestre</span>
              <small>Controle da sessão e conflitos</small>
            </Link>
          )}

          <button type="button" onClick={handleOpenCharModal} className="campaign-command-card">
            <FaUserPlus />
            <span>Adicionar agente</span>
            <small>Vincular personagem à campanha</small>
          </button>

          <button type="button" onClick={handleInvite} className="campaign-command-card">
            <FaUserFriends />
            <span>Convidar</span>
            <small>Copiar código de acesso</small>
          </button>
        </div>

        {campaign.inviteCode && (
          <div className="campaign-invite-panel">
            <div>
              <span className="campaign-invite-label">Código de convite</span>
              <strong>{campaign.inviteCode}</strong>
            </div>
            <button type="button" className="btn-nero btn-secondary" onClick={handleInvite}>
              <FaUserFriends /> Copiar código
            </button>
          </div>
        )}
        {/* LISTA DE PERSONAGENS */}
        <div className="character-section">
          <div className="char-section-header">
            <h3 className="char-section-title">AGENTES ATIVOS</h3>
            <button type="button" className="btn-nero btn-secondary" onClick={handleOpenCharModal}>
              <FaUserPlus /> Adicionar agente
            </button>
          </div>

          <div className="char-list">
            {campaign.players &&
            campaign.players.filter((p) => p.character).length > 0 ? (
              campaign.players
                .filter((p) => p.character)
                .map((playerEntry) => {
                  const char = playerEntry.character;
                  const ownerName = playerEntry.user?.name || "Desconhecido";
                  const isOwner = user && char.userId === user._id;
                  const canView = !char.isPrivate || isOwner || isMaster;

                  if (!char?._id) return null;

                  return (
                    <div key={char._id} className="char-row">
                      {/* EXIBIÇÃO DA IMAGEM */}
                      <div className="char-avatar-mini">
                        <img
                          src={getCharacterAvatar(char)}
                          alt={char.name}
                          onError={(event) => {
                            event.currentTarget.src = getCharacterAvatar({ ...char, avatar: "" });
                          }}
                        />
                      </div>
                      <div className="char-info">
                        <h4>{char.name}</h4>
                        <span>JOGADOR: {ownerName.toUpperCase()}</span>
                      </div>

                      <div className="char-actions">
                        {canView ? (
                          // Se puder ver, mostra o link normal
                          <Link
                            to={`/character-sheet/${char._id}`}
                            target="_blank"
                            className="btn-icon-small view"
                            title="Ver Ficha"
                          >
                            <FaEye />
                          </Link>
                        ) : (
                          // Se for privada, mostra um cadeado cinza e não deixa clicar
                          <span
                            className="btn-icon-small"
                            style={{ cursor: "not-allowed", opacity: 0.5 }}
                            title="Ficha Privada"
                          >
                            <FaShieldAlt />
                          </span>
                        )}

                        <Link
                          to={`/character-portrait/${char._id}`}
                          target="_blank"
                          className="btn-icon-small view"
                          title="Portrait Stream"
                        >
                          <FaTv />
                        </Link>

                        {(isMaster || isOwner) && (
                          <button
                            className="btn-icon-small delete"
                            onClick={() =>
                              handleRemoveCharacter(char._id, char.name)
                            }
                            title="Remover da Campanha"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <EmptyState
                compact
                title="Nenhum agente registrado"
                description="Adicione personagens para iniciar a operação."
                action={(
                  <button type="button" className="btn-nero btn-primary" onClick={handleOpenCharModal}>
                    <FaUserPlus /> Adicionar agente
                  </button>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE ADICIONAR PERSONAGEM */}
      {openCharModal && (
        <div
          className="nero-modal-overlay"
          onClick={(e) => {
            if (e.target.className === "nero-modal-overlay")
              setOpenCharModal(false);
          }}
        >
          <div className="nero-modal">
            <div className="nero-modal-header">
              SELECIONAR AGENTE PARA A MISSÃO
            </div>
            <div className="nero-modal-content">
              {availableChars.length > 0 ? (
                availableChars.map((char) => (
                  <div key={char._id} className="char-select-item">
                    <div>
                      <strong
                        style={{
                          display: "block",
                          color: "#fff",
                          fontFamily: "Orbitron",
                        }}
                      >
                        {char.name}
                      </strong>
                      <span style={{ color: "#888", fontSize: "0.8rem" }}>
                        {char.occupation || "Sem ocupação"}
                      </span>
                    </div>
                    <button
                      className="btn-nero btn-primary"
                      style={{ padding: "5px 15px", fontSize: "0.8rem" }}
                      onClick={() => handleAddCharacter(char._id)}
                    >
                      ADICIONAR
                    </button>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  Você não possui agentes disponíveis fora de missão.
                </p>
              )}
            </div>
            <div className="nero-modal-actions">
              <button
                className="btn-nero btn-secondary"
                onClick={() => setOpenCharModal(false)}
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignLobby;
