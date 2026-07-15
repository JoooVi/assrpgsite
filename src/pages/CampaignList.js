import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaPlus, FaSignInAlt } from "react-icons/fa";
import api from "../api";
import { API_BASE_URL } from "../config/apiConfig";
import CampaignCard from "../components/campaigns/CampaignCard";
import Dialog from "../components/ui/Dialog";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import SkeletonState from "../components/ui/SkeletonState";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import { getPublicErrorMessage } from "../utils/httpErrors";
import "./CampaignList.css";

const normalizeCampaign = (campaign) => {
  const rawCover = campaign.coverImage || "";
  const coverImageUrl = rawCover && !rawCover.startsWith("http") ? `${API_BASE_URL}/${rawCover.replace(/\\/g, "/")}` : rawCover;
  return { ...campaign, coverImageUrl };
};

const CampaignList = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedChar, setSelectedChar] = useState("");
  const [availableChars, setAvailableChars] = useState([]);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/campaigns");
      setCampaigns((Array.isArray(response.data) ? response.data : []).map(normalizeCampaign));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const openJoinDialog = async () => {
    setJoinOpen(true);
    setJoinError("");
    try {
      const response = await api.get("/characters/available");
      setAvailableChars(Array.isArray(response.data) ? response.data : []);
    } catch {
      setAvailableChars([]);
    }
  };

  const handleJoin = async () => {
    const normalizedCode = inviteCode.replace(/\s+/g, "").toUpperCase();
    if (!normalizedCode) {
      setJoinError("Informe o código de convite.");
      return;
    }
    setJoinLoading(true);
    setJoinError("");
    try {
      await api.post("/campaigns/join", { inviteCode: normalizedCode, ...(selectedChar ? { characterId: selectedChar } : {}) });
      setJoinOpen(false);
      setInviteCode("");
      setSelectedChar("");
      dispatchToast({ message: "Você entrou na campanha.", type: "success" });
      await fetchCampaigns();
    } catch (requestError) {
      setJoinError(getPublicErrorMessage(requestError, "Não foi possível entrar na campanha."));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDelete = async (campaign) => {
    if (deletingId) return;
    const confirmed = await confirm({
      title: "Excluir campanha?",
      message: `A campanha “${campaign.name}” e seus dados serão removidos permanentemente. Esta ação não poderá ser desfeita.`,
      tone: "danger",
      confirmLabel: "Excluir campanha",
    });
    if (!confirmed) return;
    setDeletingId(campaign._id);
    try {
      await api.delete(`/campaigns/${campaign._id}`);
      setCampaigns((current) => current.filter((item) => item._id !== campaign._id));
      dispatchToast({ message: "Campanha excluída.", type: "success" });
    } catch {
      dispatchToast({ message: "Não foi possível excluir a campanha.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SkeletonState variant="cards" count={3} label="Carregando campanhas" />;
  if (error) return <div className="campaignList"><ErrorState title="Não foi possível carregar as campanhas" description="Verifique sua conexão e tente novamente." onRetry={fetchCampaigns} /></div>;

  return (
    <div className="campaignList">
      <header className="campaign-list-header">
        <div><h1>Campanhas</h1><p>Abra uma mesa existente ou comece uma nova campanha.</p></div>
        <div className="campaign-list-actions">
          <button type="button" className="btn-open secondary" onClick={openJoinDialog}><FaSignInAlt /> Entrar com código</button>
          <Link className="btn-open primary-action" to="/create-campaign"><FaPlus /> Criar campanha</Link>
        </div>
      </header>

      {!campaigns.length ? (
        <EmptyState title="Você ainda não participa de nenhuma campanha" description="Crie sua própria mesa ou entre usando um código de convite." primaryAction={<Link className="btn-open" to="/create-campaign">Criar campanha</Link>} secondaryAction={<button type="button" className="btn-open secondary" onClick={openJoinDialog}>Entrar com código</button>} />
      ) : (
        <div className="campaignCards">
          {campaigns.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} onDelete={handleDelete} deleting={deletingId === campaign._id} />)}
        </div>
      )}

      <Dialog open={joinOpen} onClose={() => !joinLoading && setJoinOpen(false)} title="Entrar com código" description="Informe o código enviado pelo mestre e escolha um personagem, se desejar." size="small" actions={<><button type="button" className="confirm-button" onClick={() => setJoinOpen(false)} disabled={joinLoading}>Cancelar</button><button type="button" className="confirm-button primary" onClick={handleJoin} disabled={joinLoading}>{joinLoading ? "Entrando..." : "Entrar na campanha"}</button></>}>
        <div className="campaign-modal-body campaign-dialog-body">
          <label htmlFor="inviteCode">Código de convite</label>
          <input id="inviteCode" value={inviteCode} onChange={(event) => { setInviteCode(event.target.value.toUpperCase()); setJoinError(""); }} placeholder="Ex.: NERO47" autoComplete="off" />
          <label htmlFor="select-character">Personagem opcional</label>
          <select id="select-character" value={selectedChar} onChange={(event) => setSelectedChar(event.target.value)}><option value="">Entrar sem vincular personagem</option>{availableChars.map((character) => <option key={character._id} value={character._id}>{character.name} ({character.occupation || "Sem ocupação"})</option>)}</select>
          {joinError && <p className="campaign-field-error" role="alert">{joinError}</p>}
        </div>
      </Dialog>
    </div>
  );
};

export default CampaignList;
