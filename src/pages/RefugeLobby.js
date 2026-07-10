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
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import api from "../api";
import "./RefugeLobby.css";

const DEFAULT_REFUGE_IMAGE =
  "https://images.unsplash.com/photo-1590625321528-724dc0f3689f?q=80&w=1000&auto=format&fit=crop";

const RefugeLobby = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  const [refuges, setRefuges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRefuge, setNewRefuge] = useState({ name: "", location: "", description: "" });
  const [newRefugeImage, setNewRefugeImage] = useState(null);
  const [newRefugeImagePreview, setNewRefugeImagePreview] = useState("");

  const fetchRefugeList = useCallback(async () => {
    const res = await api.get(`/refuge/campaign/${campaignId}/refuges`);
    return res.data || [];
  }, [campaignId]);

  const loadRefuges = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      let list = await fetchRefugeList();

      if (!list.length) {
        await api.get(`/refuge/campaign/${campaignId}`);
        list = await fetchRefugeList();
      }

      setRefuges(list);
    } catch (error) {
      console.error(error);
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
    return <PageLoader title="Carregando refúgios" subtitle="Localizando bases da campanha..." />;
  }

  return (
    <div className="refuge-lobby-page">
      <div className="refuge-lobby-shell">
        <div className="refuge-lobby-hero">
          <div>
            <h1>Refúgios</h1>
          </div>
          <div className="refuge-lobby-header-actions">
            <Link to={`/campaign-lobby/${campaignId}`} className="refuge-lobby-back">
              <FaArrowLeft /> Voltar
            </Link>
            <button className="refuge-lobby-primary" onClick={() => setModalOpen(true)}>
              <FaPlus /> Novo refúgio
            </button>
          </div>
        </div>

        {refuges.length === 0 ? (
          <div className="refuge-lobby-empty">
            <EmptyState
              title="Nenhum refúgio cadastrado"
              description="Crie a primeira base da campanha para organizar população, defesas, projetos e ameaças."
              action={(
                <button className="refuge-lobby-primary" onClick={() => setModalOpen(true)}>
                  <FaPlus /> Criar primeiro refúgio
                </button>
              )}
            />
          </div>
        ) : (
          <div className="refuge-lobby-grid">
            {refuges.map((refuge) => {
              const population = refuge.stats?.population?.current ?? 0;
              const defense = refuge.stats?.defense ?? 0;
              const threats = refuge.activeThreats?.length ?? 0;

              return (
                <button
                  key={refuge._id}
                  type="button"
                  className="refuge-lobby-card"
                  onClick={() => navigate(`/campaign/${campaignId}/refuge/${refuge._id}`)}
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
                      <button
                        type="button"
                        className="refuge-lobby-delete"
                        onClick={(event) => handleDeleteRefuge(event, refuge)}
                        title="Deletar refúgio"
                      >
                        <FaTrash />
                      </button>
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
                </button>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="refuge-lobby-modal-backdrop" onClick={closeCreateModal}>
          <div className="refuge-lobby-modal" onClick={(event) => event.stopPropagation()}>
            <div className="refuge-lobby-modal-header">
              <span>Novo refúgio</span>
              <button onClick={closeCreateModal}>x</button>
            </div>
            <div className="refuge-lobby-modal-body">
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
            <div className="refuge-lobby-modal-footer">
              <button onClick={closeCreateModal}>Cancelar</button>
              <button className="primary" onClick={handleCreateRefuge}>Criar refúgio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefugeLobby;
