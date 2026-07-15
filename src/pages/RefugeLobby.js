import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPlus,
  FaSkull,
  FaTools,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Dialog from "../components/ui/Dialog";
import Breadcrumbs from "../components/navigation/Breadcrumbs";
import CampaignContextHeader from "../components/navigation/CampaignContextHeader";
import SkeletonState from "../components/ui/SkeletonState";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import api from "../api";
import "./RefugeLobby.css";

const DEFAULT_REFUGE_IMAGE =
  "https://images.unsplash.com/photo-1590625321528-724dc0f3689f?q=80&w=1000&auto=format&fit=crop";

const RefugeLobby = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  const [refuges, setRefuges] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRefuge, setNewRefuge] = useState({ name: "", location: "", description: "" });
  const [newRefugeImage, setNewRefugeImage] = useState(null);
  const [newRefugeImagePreview, setNewRefugeImagePreview] = useState("");
  const isMaster = Boolean(user && campaign?.master && (campaign.master._id || campaign.master) === user._id);

  const fetchRefugeList = useCallback(async () => {
    const res = await api.get(`/refuge/campaign/${campaignId}/refuges`);
    return res.data || [];
  }, [campaignId]);

  const loadRefuges = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setLoadError(false);
      let list = await fetchRefugeList();
      const campaignResponse = await api.get(`/campaigns/${campaignId}`);
      setCampaign(campaignResponse.data);

      if (!list.length) {
        await api.get(`/refuge/campaign/${campaignId}`);
        list = await fetchRefugeList();
      }

      setRefuges(list);
    } catch (error) {
      console.error(error);
      setLoadError(true);
      dispatchToast({ message: "Erro ao carregar refúgios.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [campaignId, fetchRefugeList, token]);

  useEffect(() => {
    loadRefuges();
  }, [loadRefuges]);

  useEffect(() => {
    if (!newRefugeImage) {
      setNewRefugeImagePreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(newRefugeImage);
    setNewRefugeImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [newRefugeImage]);

  const closeCreateModal = () => {
    setModalOpen(false);
    setNewRefuge({ name: "", location: "", description: "" });
    setNewRefugeImage(null);
  };

  const handleCreateRefuge = async () => {
    if (!newRefuge.name.trim()) {
      dispatchToast({ message: "Defina um nome para o novo refúgio.", type: "warning" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newRefuge.name);
      formData.append("location", newRefuge.location || "");
      formData.append("description", newRefuge.description || "");
      if (newRefugeImage) formData.append("image", newRefugeImage);

      const res = await api.post(`/refuge/campaign/${campaignId}/refuges`, formData);

      dispatchToast({ message: "Refúgio criado.", type: "success" });
      closeCreateModal();
      navigate(`/campaign/${campaignId}/refuge/${res.data._id}`);
    } catch (error) {
      dispatchToast({
        message: error?.response?.data?.message || "Erro ao criar refúgio.",
        type: "error",
      });
    }
  };

  const handleDeleteRefuge = async (event, refuge) => {
    event.stopPropagation();

    const confirmed = await confirm({
      title: "Deletar refúgio",
      message: `Deseja realmente deletar "${refuge.name}"?`,
      tone: "danger",
      confirmLabel: "Deletar",
    });
    if (!confirmed) return;

    try {
      await api.delete(`/refuge/${refuge._id}`);
      dispatchToast({ message: "Refúgio removido.", type: "success" });
      await loadRefuges();
    } catch (error) {
      dispatchToast({
        message: error?.response?.data?.message || "Erro ao remover refúgio.",
        type: "error",
      });
    }
  };

  if (loading) {
    return <SkeletonState variant="cards" count={3} label="Carregando refúgios" />;
  }

  if (loadError) {
    return (
      <div className="refuge-lobby-page">
        <ErrorState
          title="Não foi possível carregar os refúgios"
          description="A campanha continua segura. Tente buscar as bases novamente."
          onRetry={loadRefuges}
        />
      </div>
    );
  }

  return (
    <div className="refuge-lobby-page">
      <div className="refuge-lobby-shell">
        <Breadcrumbs items={[
          { label: "Campanhas", to: "/campaigns" },
          { label: "Lobby", to: `/campaign-lobby/${campaignId}` },
          { label: "Refúgios" },
        ]} />
        <CampaignContextHeader
          campaign={campaign}
          campaignId={campaignId}
          isMaster={isMaster}
        />
        <div className="refuge-lobby-hero">
          <div>
            <h1>Refúgios</h1>
          </div>
          <div className="refuge-lobby-header-actions">
            <Link to={`/campaign-lobby/${campaignId}`} className="refuge-lobby-back">
              <FaArrowLeft /> Voltar
            </Link>
            {isMaster && (
              <button className="refuge-lobby-primary" onClick={() => setModalOpen(true)}>
                <FaPlus /> Novo refúgio
              </button>
            )}
          </div>
        </div>

        {refuges.length === 0 ? (
          <div className="refuge-lobby-empty">
            <EmptyState
              title="Nenhum refúgio cadastrado"
              description="Crie a primeira base da campanha para organizar população, defesas, projetos e ameaças."
              action={isMaster ? (
                <button className="refuge-lobby-primary" onClick={() => setModalOpen(true)}>
                  <FaPlus /> Criar primeiro refúgio
                </button>
              ) : null}
            />
          </div>
        ) : (
          <div className="refuge-lobby-grid">
            {refuges.map((refuge) => {
              const population = refuge.stats?.population?.current ?? 0;
              const defense = refuge.stats?.defense ?? 0;
              const threats = refuge.activeThreats?.length ?? 0;

              return (
                <article
                  key={refuge._id}
                  className="refuge-lobby-card"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/campaign/${campaignId}/refuge/${refuge._id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/campaign/${campaignId}/refuge/${refuge._id}`);
                    }
                  }}
                >
                  <div
                    className="refuge-lobby-card-image"
                    style={{ backgroundImage: `url(${refuge.image || DEFAULT_REFUGE_IMAGE})` }}
                  >
                    <span>Ciclo {refuge.currentCycle || 1}</span>
                  </div>
                  <div className="refuge-lobby-card-body">
                    <div className="refuge-lobby-card-topline">
                      <span>Entrar na base</span>
                      {isMaster && <button
                        type="button"
                        className="refuge-lobby-delete"
                        onClick={(event) => handleDeleteRefuge(event, refuge)}
                        title="Deletar refúgio"
                      >
                        <FaTrash />
                      </button>}
                    </div>
                    <h2>{refuge.name}</h2>
                    <p>
                      <FaMapMarkerAlt /> {refuge.location || "Localização desconhecida"}
                    </p>
                    <div className="refuge-lobby-metrics">
                      <span><FaUsers /> {population}</span>
                      <span><FaTools /> {defense}</span>
                      <span className={threats ? "danger" : ""}><FaSkull /> {threats}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={closeCreateModal}
        title="Novo refúgio"
        description="Cadastre uma nova base para esta campanha."
        size="medium"
        actions={(
          <>
            <button type="button" className="confirm-button" onClick={closeCreateModal}>Cancelar</button>
            <button type="button" className="confirm-button primary" onClick={handleCreateRefuge}>Criar refúgio</button>
          </>
        )}
      >
            <div className="refuge-lobby-modal-body refuge-dialog-body">
              <label>Nome</label>
              <input
                value={newRefuge.name}
                onChange={(event) => setNewRefuge({ ...newRefuge, name: event.target.value })}
              />
              <label>Localização</label>
              <input
                value={newRefuge.location}
                onChange={(event) => setNewRefuge({ ...newRefuge, location: event.target.value })}
              />
              <label>Descrição</label>
              <textarea
                rows="4"
                value={newRefuge.description}
                onChange={(event) => setNewRefuge({ ...newRefuge, description: event.target.value })}
              />
              <label>Imagem de capa</label>
              {newRefugeImagePreview && (
                <div className="refuge-lobby-image-preview">
                  <img src={newRefugeImagePreview} alt="Prévia do refúgio" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setNewRefugeImage(event.target.files?.[0] || null)}
              />
            </div>
      </Dialog>
    </div>
  );
};

export default RefugeLobby;
