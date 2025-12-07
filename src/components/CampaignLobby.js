/* CampaignLobby.js */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./CampaignLobby.css";

// Ícones
import { 
  FaShieldAlt, FaHome, FaUserPlus, FaUserFriends, FaEdit, 
  FaTv, FaTrash, FaEye, FaCheck, FaTimes, FaExclamationTriangle 
} from "react-icons/fa";

// Constantes
const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1626262846282-e36214878a1a?q=80&w=1000&auto=format&fit=crop";

const CampaignLobby = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  
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
  const [toast, setToast] = useState({ open: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ open: true, msg, type });
    setTimeout(() => setToast({ open: false, msg: "", type: "success" }), 4000);
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
      const res = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setCampaign(data);
      
      // Verifica Mestre
      setIsMaster(user && data.master && (data.master._id || data.master) === user._id);

      // URL da Imagem
      let img = data.coverImage;
      if (img && !img.startsWith("http")) {
        img = `https://assrpgsite-be-production.up.railway.app/${img.replace(/\\/g, "/")}`;
      }
      setCoverImageUrl(img || DEFAULT_COVER_IMAGE);

    } catch (err) {
      setError("Falha ao carregar dados da campanha.");
      console.error(err);
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
      const response = await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/cover`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let newUrl = response.data.coverImage;
      if (newUrl && !newUrl.startsWith("http")) {
        newUrl = `https://assrpgsite-be-production.up.railway.app/${newUrl.replace(/\\/g, "/")}`;
      }
      setCoverImageUrl(newUrl || DEFAULT_COVER_IMAGE);
      showToast("Capa atualizada com sucesso!", "success");

    } catch (err) {
      console.error(err);
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
      const res = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/characters/available",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableChars(res.data);
      setOpenCharModal(true);
    } catch (err) {
      showToast("Erro ao buscar personagens.", "error");
    }
  };

  const handleAddCharacter = async (characterId) => {
    try {
      await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/add-character`,
        { characterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenCharModal(false);
      fetchCampaignData();
      showToast("Agente adicionado à operação.");
    } catch (err) {
      showToast("Erro ao adicionar agente.", "error");
    }
  };

  const handleRemoveCharacter = async (characterId, characterName) => {
    if (window.confirm(`Remover "${characterName}" da campanha?`)) {
      try {
        await axios.post(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/remove-character`,
          { characterId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCampaignData();
        showToast("Agente removido.");
      } catch (err) {
        showToast("Erro ao remover agente.", "error");
      }
    }
  };

  const handleInvite = () => {
    if (campaign?.inviteCode) {
      navigator.clipboard.writeText(campaign.inviteCode).then(
        () => showToast(`Código copiado: ${campaign.inviteCode}`),
        () => alert(`Código: ${campaign.inviteCode}`)
      );
    } else {
      showToast("Sem código de convite.", "error");
    }
  };

  // --- RENDER ---

  if (loading) return (
    <div className="lobby-page" style={{ alignItems: 'center' }}>
      <h2 style={{color: '#fff', fontFamily: 'Orbitron'}}>CARREGANDO OPERAÇÃO...</h2>
    </div>
  );

  if (error || !campaign) return (
    <div className="lobby-page" style={{ alignItems: 'center' }}>
      <div className="lobby-panel" style={{textAlign: 'center', maxWidth: '500px'}}>
        <FaExclamationTriangle style={{fontSize: '3rem', color: '#ff3333', marginBottom: '20px'}}/>
        <h2>ACESSO NEGADO / ERRO</h2>
        <p>{error || "Campanha não encontrada."}</p>
        <Link to="/campaigns" className="btn-nero btn-secondary" style={{marginTop: '20px'}}>VOLTAR</Link>
      </div>
    </div>
  );

  return (
    <div className="lobby-page">
      <div className="lobby-panel">
        
        {/* BARRA DE AÇÕES */}
        <div className="lobby-actions">
          {isMaster && (
            <Link to={`/campaign-sheet/${campaignId}`} className="btn-nero btn-primary">
              <FaShieldAlt /> ESCUDO DO MESTRE
            </Link>
          )}
          <Link to={`/campaign/${campaignId}/refuge`} className="btn-nero btn-secondary">
            <FaHome /> REFÚGIO
          </Link>
          <button onClick={handleOpenCharModal} className="btn-nero btn-secondary">
            <FaUserPlus /> ADICIONAR AGENTE
          </button>
          <button onClick={handleInvite} className="btn-nero btn-secondary">
            <FaUserFriends /> CONVIDAR
          </button>
        </div>

        {/* HEADER DA CAMPANHA */}
        <div className="lobby-header">
          {/* Capa com Upload */}
          <div className="cover-container">
            <img src={coverImageUrl} alt="Capa" className="cover-image" />
            
            {isMaster && (
              <div className="edit-cover-overlay" onClick={handleEditCoverClick}>
                <div className="btn-edit-cover">
                  <FaEdit /> {isUploading ? "ENVIANDO..." : "ALTERAR CAPA"}
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCoverImageChange} 
              accept="image/*" 
              style={{display: 'none'}} 
            />
          </div>

          <h1 className="lobby-title">{campaign.name}</h1>
          <p className="lobby-desc">{campaign.description}</p>
        </div>

        {/* LISTA DE PERSONAGENS */}
        <div className="character-section">
          <h3 className="char-section-title">AGENTES ATIVOS</h3>
          
          <div className="char-list">
            {campaign.players && campaign.players.filter(p => p.character).length > 0 ? (
              campaign.players.filter(p => p.character).map((playerEntry) => {
                const char = playerEntry.character;
                const ownerName = playerEntry.user?.name || "Desconhecido";
                const isOwner = user && char.userId === user._id;

                if (!char?._id) return null;

                return (
                  <div key={char._id} className="char-row">
                    <div className="char-info">
                      <h4>{char.name}</h4>
                      <span>JOGADOR: {ownerName.toUpperCase()}</span>
                    </div>
                    
                    <div className="char-actions">
                      <Link 
                        to={`/character-sheet/${char._id}`} 
                        target="_blank" 
                        className="btn-icon-small view"
                        title="Ver Ficha"
                      >
                        <FaEye />
                      </Link>
                      
                      <Link 
                        to={`/character-portrait/${char._id}`} 
                        target="_blank" 
                        className="btn-icon-small view"
                        title=" Portrait Stream"
                      >
                        <FaTv />
                      </Link>

                      {(isMaster || isOwner) && (
                        <button 
                          className="btn-icon-small delete" 
                          onClick={() => handleRemoveCharacter(char._id, char.name)}
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
              <div className="empty-msg">NENHUM AGENTE REGISTRADO NESTA OPERAÇÃO.</div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE ADICIONAR PERSONAGEM */}
      {openCharModal && (
        <div className="nero-modal-overlay" onClick={(e) => { if(e.target.className==='nero-modal-overlay') setOpenCharModal(false) }}>
          <div className="nero-modal">
            <div className="nero-modal-header">SELECIONAR AGENTE PARA A MISSÃO</div>
            <div className="nero-modal-content">
              {availableChars.length > 0 ? (
                availableChars.map(char => (
                  <div key={char._id} className="char-select-item">
                    <div>
                      <strong style={{display:'block', color:'#fff', fontFamily:'Orbitron'}}>{char.name}</strong>
                      <span style={{color:'#888', fontSize:'0.8rem'}}>{char.occupation || "Sem ocupação"}</span>
                    </div>
                    <button className="btn-nero btn-primary" style={{padding:'5px 15px', fontSize:'0.8rem'}} onClick={() => handleAddCharacter(char._id)}>
                      ADICIONAR
                    </button>
                  </div>
                ))
              ) : (
                <p style={{padding:'20px', textAlign:'center', color:'#888'}}>Você não possui agentes disponíveis fora de missão.</p>
              )}
            </div>
            <div className="nero-modal-actions">
              <button className="btn-nero btn-secondary" onClick={() => setOpenCharModal(false)}>FECHAR</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION (Feedback Visual) */}
      {toast.open && (
        <div className={`nero-toast ${toast.type}`}>
          {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
          {toast.msg}
        </div>
      )}

    </div>
  );
};

export default CampaignLobby;