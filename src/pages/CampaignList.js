import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./CampaignList.css";
import {
  Typography,
  Tooltip,
  CardMedia,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import { dispatchToast } from "../components/notifications/ToastProvider";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import api from "../api";
import { API_BASE_URL } from "../config/apiConfig";

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedChar, setSelectedChar] = useState("");
  const [availableChars, setAvailableChars] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const fetchCampaigns = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/campaigns");
      if (response.data && Array.isArray(response.data)) {
        const campaignsWithImages = response.data.map(campaign => {
           let imageUrl = campaign.coverImage ? `${API_BASE_URL}/${campaign.coverImage.replace(/\\/g, '/')}` : null;
           if (campaign.coverImage && campaign.coverImage.startsWith('http')) {
               imageUrl = campaign.coverImage;
           }
           return { ...campaign, coverImageUrl: imageUrl };
        });
        setCampaigns(campaignsWithImages);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      setError("Erro ao carregar a lista de campanhas.");
      dispatchToast({ message: "Erro ao carregar campanhas.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const fetchAvailableCharacters = async () => {
      setModalLoading(true);
    try {
      const res = await api.get("/characters/available");
      setAvailableChars(res.data);
    } catch (err) {
      setAvailableChars([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenJoinModal = () => {
     setOpenJoinModal(true);
    fetchAvailableCharacters();
  };

  const handleJoinCampaign = async () => {
     if (!inviteCode) {
      dispatchToast({ message: "Código obrigatório.", type: "warning" });
      return;
    }
    const payload = { inviteCode };
    if (selectedChar) payload.characterId = selectedChar;

    try {
      await api.post("/campaigns/join", payload);
      setOpenJoinModal(false);
      setInviteCode("");
      setSelectedChar("");
      dispatchToast({ message: "Você entrou na campanha.", type: "success" });
      fetchCampaigns();
    } catch (err) {
      dispatchToast({ message: err.response?.data?.message || "Erro ao entrar.", type: "error" });
    }
  };

  const handleDelete = async (id) => {
      const confirmed = await confirm({
        title: "Excluir campanha",
        message: "Excluir registro de campanha permanentemente?",
        tone: "danger",
        confirmLabel: "Excluir",
      });
      if (confirmed) {
      try {
        await api.delete(`/campaigns/${id}`);
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
        dispatchToast({ message: "Campanha excluída.", type: "success" });
      } catch (err) {
        setError("Erro na exclusão.");
        dispatchToast({ message: "Erro ao excluir campanha.", type: "error" });
      }
    }
  };

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesSearch = !normalizedSearch
        || campaign.name?.toLowerCase().includes(normalizedSearch)
        || campaign.masterName?.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        campaignFilter === "all"
        || (campaignFilter === "master" && campaign.isMaster)
        || (campaignFilter === "player" && !campaign.isMaster);

      return matchesSearch && matchesFilter;
    });
  }, [campaignFilter, campaigns, searchTerm]);
  if (loading) {
      return (
      <PageLoader title="Carregando campanhas" subtitle="Buscando operações ativas..." />
    );
  }

  return (
    <>
      <div className="campaignList">
        <div className="campaign-list-header">
          <div>
            <h2>CAMPANHAS</h2>
            <p>Gerencie suas operações, entre em mesas existentes ou inicie uma nova campanha.</p>
          </div>
          <div className="campaign-list-actions">
            <button type="button" className="btn-open secondary" onClick={handleOpenJoinModal}>
              Entrar com código
            </button>
            <button type="button" className="btn-open primary-action" onClick={() => navigate("/create-campaign")}>
              Nova campanha
            </button>
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="campaign-toolbar">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar campanha ou mestre..."
              className="campaign-search"
            />
            <div className="campaign-filter-group">
              <button type="button" className={campaignFilter === "all" ? "active" : ""} onClick={() => setCampaignFilter("all")}>Todas</button>
              <button type="button" className={campaignFilter === "master" ? "active" : ""} onClick={() => setCampaignFilter("master")}>Sou mestre</button>
              <button type="button" className={campaignFilter === "player" ? "active" : ""} onClick={() => setCampaignFilter("player")}>Jogando</button>
            </div>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="noCampaigns">
            <EmptyState
              title="Nenhuma missão ativa"
              description="Crie uma campanha nova ou entre em uma operação existente com um código de convite."
              action={(
                <div className="campaign-empty-actions">
                  <button type="button" className="btn-open" onClick={() => navigate("/create-campaign")}>
                    Iniciar campanha
                  </button>
                  <button type="button" className="btn-open secondary" onClick={handleOpenJoinModal}>
                    Entrar com código
                  </button>
                </div>
              )}
            />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="noCampaigns">
            <EmptyState
              title="Nenhuma campanha encontrada"
              description="Ajuste a busca ou limpe os filtros para ver outras campanhas."
            />
          </div>
        ) : (
          <div className="campaignCards">
            {filteredCampaigns.map((campaign, index) => (
              <article
                key={campaign._id}
                className="campaignCard"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardMedia
                  component="img"
                  className="campaignCardImage"
                  image={campaign.coverImageUrl || "https://images.unsplash.com/photo-1626262846282-e36214878a1a?q=80&w=1000&auto=format&fit=crop"}
                  alt={campaign.name}
                />

                <div className="contentPane">
                  <div className="campaignInfo">
                    <Typography className="campaignName">{campaign.name}</Typography>

                    <div className="infoRow">
                      <span className="infoLabel">Assimilador</span>
                      <span className="infoValue">{campaign.masterName || "N/A"}</span>
                    </div>
                    <div className="infoRow">
                      <span className="infoLabel">Infectados</span>
                      <span className="infoValue">{campaign.playersCount || 0}</span>
                    </div>
                    <div className="infoRow" style={{borderBottom: 'none'}}>
                      <span className="infoLabel">Status</span>
                      <span className={campaign.status === 'finished' ? 'status-inactive' : 'status-active'}>
                        {campaign.status === 'finished' ? 'ENCERRADA' : 'EM ANDAMENTO'}
                      </span>
                    </div>
                  </div>

                  <div className="cardActions">
                    <button
                      className="btn-open"
                      onClick={() => navigate(`/campaign-lobby/${campaign._id}`)}
                    >
                      ACESSAR
                    </button>

                    {user && campaign.isMaster && (
                      <Tooltip title="Arquivar/Excluir">
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(campaign._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {openJoinModal && (
        <div className="campaign-modal-backdrop" onClick={() => setOpenJoinModal(false)}>
          <div className="campaign-modal" onClick={(event) => event.stopPropagation()}>
            <div className="campaign-modal-header">
              <span>Ingressar em operação</span>
              <button type="button" onClick={() => setOpenJoinModal(false)}>x</button>
            </div>

            <div className="campaign-modal-body">
              <label htmlFor="inviteCode">Código de acesso</label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="Cole o código de convite"
                autoFocus
              />

              <label htmlFor="select-character">Selecionar agente (opcional)</label>
              <select
                id="select-character"
                value={selectedChar}
                onChange={(event) => setSelectedChar(event.target.value)}
                disabled={modalLoading}
              >
                <option value="">Espectador / Apenas entrar</option>
                {modalLoading ? (
                  <option disabled>Buscando registros...</option>
                ) : availableChars.length > 0 ? (
                  availableChars.map((char) => (
                    <option key={char._id} value={char._id}>
                      {char.name} ({char.occupation})
                    </option>
                  ))
                ) : (
                  <option disabled>Sem agentes disponíveis</option>
                )}
              </select>
            </div>

            <div className="campaign-modal-footer">
              <button type="button" onClick={() => setOpenJoinModal(false)}>Cancelar</button>
              <button type="button" className="primary" onClick={handleJoinCampaign}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CampaignList;
