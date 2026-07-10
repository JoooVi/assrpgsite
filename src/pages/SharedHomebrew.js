import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBoxOpen, FaBrain, FaCheck, FaDownload, FaExclamationTriangle, FaFire, FaLink } from "react-icons/fa";
import api from "../api";
import "./Homebrews.css";
import { dispatchToast } from "../components/notifications/ToastProvider";
import PageLoader from "../components/ui/PageLoader";

const typeMeta = {
  item: { label: "ITEM CUSTOMIZADO", icon: <FaBoxOpen /> },
  trait: { label: "CARACTERÍSTICA", icon: <FaBrain /> },
  assimilation: { label: "ASSIMILAÇÃO", icon: <FaFire /> },
};

const SharedHomebrew = () => {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);

  const [homebrewData, setHomebrewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/shared/${id}`);
        setHomebrewData(response.data);
      } catch (requestError) {
        console.error("Erro ao carregar homebrew:", requestError);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCopyLink = async () => {
    const shareUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      dispatchToast({ message: "Link copiado.", type: "success" });
    } catch {
      dispatchToast({ message: `Link da página: ${shareUrl}`, type: "info", duration: 9000 });
    }
  };

  const handleAddToProfile = async () => {
    if (!token) {
      dispatchToast({ message: "Faça login para adicionar este homebrew ao seu perfil.", type: "warning" });
      return;
    }

    try {
      setSaving(true);
      await api.post(`/shared/${id}/add-to-profile`);
      setAdded(true);
      dispatchToast({ message: "Homebrew adicionado ao seu perfil.", type: "success" });
    } catch (requestError) {
      console.error("Erro ao adicionar homebrew:", requestError);
      const message = requestError.response?.data?.message || "Erro ao adicionar homebrew. Tente novamente.";
      dispatchToast({ message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader title="Decodificando dados" subtitle="Verificando pacote de homebrew compartilhado..." />;
  }

  if (error || !homebrewData) {
    return (
      <div className="homebrews-container hb-centered-page">
        <div className="hb-panel hb-shared-panel hb-shared-error">
          <FaExclamationTriangle />
          <h1>Arquivo corrompido</h1>
          <p>Não foi possível recuperar os dados compartilhados.</p>
          <Link to="/homebrews" className="btn-nero btn-primary">Voltar para Homebrews</Link>
        </div>
      </div>
    );
  }

  const meta = typeMeta[homebrewData.type] || { label: "DADOS DESCONHECIDOS", icon: <FaBoxOpen /> };
  const data = homebrewData.data || {};

  return (
    <div className="homebrews-container">
      <div className="hb-panel hb-shared-panel">
        <div className="hb-shared-header">
          <div className="hb-shared-icon">{meta.icon}</div>
          <div>
            <span className="hb-eyebrow">Arquivo recebido: {meta.label}</span>
            <h1>{data.name || "Homebrew sem nome"}</h1>
          </div>
        </div>

        <div className="hb-shared-body">
          {homebrewData.type === "assimilation" && (
            <div className="hb-metric-grid">
              <div><span>Sucessos</span><strong>{data.successCost ?? 0}</strong></div>
              <div><span>Adaptação</span><strong>{data.adaptationCost ?? 0}</strong></div>
              <div><span>Pressão</span><strong>{data.pressureCost ?? 0}</strong></div>
              <div><span>Evolução</span><strong>{data.evolutionType || "-"}</strong></div>
            </div>
          )}

          {homebrewData.type === "item" && (
            <div className="hb-metric-grid">
              <div><span>Tipo</span><strong>{data.type || "-"}</strong></div>
              <div><span>Qualidade</span><strong>{data.quality ?? "-"}</strong></div>
              <div><span>Escassez</span><strong>{data.category ?? "-"}</strong></div>
              <div><span>Slots</span><strong>{data.slots ?? "-"}</strong></div>
            </div>
          )}

          {homebrewData.type === "trait" && (
            <div className="hb-metric-grid">
              <div><span>Custo</span><strong>{data.pointsCost ?? 0}</strong></div>
              <div><span>Categoria</span><strong>{data.category || "-"}</strong></div>
            </div>
          )}

          <div className="hb-shared-description">
            <span className="hb-label">Descrição do arquivo</span>
            <p>{data.description || "Sem descrição registrada."}</p>
          </div>
        </div>

        <div className="hb-shared-actions">
          <button
            className="btn-nero btn-primary hb-shared-action"
            onClick={handleAddToProfile}
            disabled={saving || added}
          >
            {added ? <FaCheck /> : <FaDownload />}
            {added ? "Adicionado ao perfil" : saving ? "Adicionando..." : "Adicionar ao meu perfil"}
          </button>
          <button className="btn-nero btn-secondary hb-shared-action" onClick={handleCopyLink}>
            <FaLink /> Copiar link
          </button>
        </div>

        {!token && (
          <p className="hb-shared-login-note">
            Você pode visualizar este arquivo agora, mas precisa entrar na conta para salvar no seu perfil.
          </p>
        )}
      </div>
    </div>
  );
};

export default SharedHomebrew;
