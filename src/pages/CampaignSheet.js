/* src/pages/CampaignSheet.js */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

import {
  FaArrowLeft, FaDiceD20, FaExclamationTriangle, FaCheck,
  FaPlus, FaMinus, FaShieldAlt, FaExternalLinkAlt, FaUserSecret,
  FaChevronDown, FaChevronUp, FaBrain, FaSuitcase, FaTrash,
  FaLayerGroup, FaSyncAlt, FaCopy, FaRandom, FaSave,
} from "react-icons/fa";

import MasterDiceRoller from "../components/MasterDiceRoller";
import RecentRollsFeed from "../components/RecentRollsFeed";
import CharacterPortraitOverview from "../components/CharacterPortraitOverview";
import ConflictTracker from "../components/ConflictTracker";
import NPCGenerator from "../components/NPCGenerator";
import EventDeckModal from "../components/EventDeckModal";
import { dispatchToast } from "../components/notifications/ToastProvider";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";
import api from "../api";
import { API_BASE_URL } from "../config/apiConfig";

import styles from "./CampaignSheet.module.css";

const mergeRecentRolls = (currentRolls, incomingRolls) => {
  const incoming = Array.isArray(incomingRolls) ? incomingRolls : [incomingRolls];
  const byId = new Map();

  [...incoming, ...(currentRolls || [])].forEach((roll) => {
    if (!roll) return;
    const key = String(roll.id || roll._id || `${roll.timestamp || ""}:${roll.rollerId || ""}:${roll.formula || ""}`);
    if (!byId.has(key)) byId.set(key, roll);
  });

  return Array.from(byId.values())
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 50);
};

const CampaignSheet = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  const [campaign, setCampaign] = useState(null);
  const [playersData, setPlayersData] = useState([]);
  const [masterNotes, setMasterNotes] = useState("");
  const [recentRolls, setRecentRolls] = useState([]);
  const [activeConflict, setActiveConflict] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [openConflictModal, setOpenConflictModal] = useState(false);
  const [openNpcModal, setOpenNpcModal] = useState(false);
  const [isConflictLoading, setIsConflictLoading] = useState(false);
  const [openEventDeckModal, setOpenEventDeckModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInFlightRef = useRef(false);
  const [inviteCodeDraft, setInviteCodeDraft] = useState("");
  const [isSavingInviteCode, setIsSavingInviteCode] = useState(false);

  const [npcExpandido, setNpcExpandido] = useState(null);
  const [diceFormula, setDiceFormula] = useState("");
  const masterRollerRef = useRef(null);

  const showToast = (msg, type = "info") => {
    dispatchToast({ message: msg, type });
  };

  const fetchDynamicData = useCallback(async () => {
    if (!token || !user || !isMaster || syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    setIsSyncing(true);
    try {
      const [playersResult, rollsResult, conflictResult] = await Promise.allSettled([
        api.get(`/campaigns/${campaignId}/players-data`, { timeout: 8000 }),
        api.get(`/campaigns/${campaignId}/recent-rolls`, { timeout: 8000 }),
        api.get(`/campaigns/${campaignId}/conflict`, { timeout: 8000 }),
      ]);

      if (playersResult.status === "fulfilled") setPlayersData(playersResult.value.data);
      if (rollsResult.status === "fulfilled") {
        setRecentRolls((current) => mergeRecentRolls(current, rollsResult.value.data || []));
      }
      if (conflictResult.status === "fulfilled") setActiveConflict(conflictResult.value.data);

      const failedRequests = [playersResult, rollsResult, conflictResult]
        .filter((result) => result.status === "rejected");
      if (failedRequests.length) console.warn("Sincronização parcial do Escudo:", failedRequests);
    } catch (err) {
      console.warn("Erro de sincronização do Escudo:", err);
    } finally {
      syncInFlightRef.current = false;
      setIsSyncing(false);
    }
  }, [campaignId, user, token, isMaster]);

  const handleRollCreated = useCallback((roll) => {
    if (!roll) return;
    setRecentRolls((current) => mergeRecentRolls(current, roll));
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!token || !user) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const campaignRes = await api.get(`/campaigns/${campaignId}`);
      const campaignData = campaignRes.data;
      const masterId = campaignData.master._id || campaignData.master;
      const currentUserIsMaster = user._id === masterId;

      setIsMaster(currentUserIsMaster);
      setCampaign(campaignData);
      setInviteCodeDraft(campaignData.inviteCode || "");
      setActiveConflict(campaignData.activeConflict || null);

      if (currentUserIsMaster) {
        setMasterNotes(campaignData.notes || "");
        const [playersResult, rollsResult] = await Promise.allSettled([
          api.get(`/campaigns/${campaignId}/players-data`, { timeout: 8000 }),
          api.get(`/campaigns/${campaignId}/recent-rolls`, { timeout: 8000 }),
        ]);
        if (playersResult.status === "fulfilled") setPlayersData(playersResult.value.data);
        if (rollsResult.status === "fulfilled") {
          setRecentRolls((current) => mergeRecentRolls(current, rollsResult.value.data || []));
        }
      }
    } catch (err) {
      setError("Erro ao carregar dados da campanha.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  useEffect(() => {
    if (isMaster) {
      // As rolagens chegam por Socket.IO. O polling é somente uma rede de
      // segurança para reconexões e não deve saturar a API durante a sessão.
      const interval = setInterval(fetchDynamicData, 20000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isMaster, fetchDynamicData]);

  useEffect(() => {
    if (!token || !user || !isMaster || !campaignId) return undefined;

    const campaignSocket = io(API_BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    campaignSocket.on("connect", () => {
      campaignSocket.emit("joinCampaign", campaignId);
      fetchDynamicData();
    });
    campaignSocket.on("rollCreated", ({ campaignId: incomingCampaignId, roll } = {}) => {
      if (String(incomingCampaignId) !== String(campaignId)) return;
      handleRollCreated(roll);
    });

    return () => campaignSocket.disconnect();
  }, [campaignId, fetchDynamicData, handleRollCreated, isMaster, token, user]);

  const handleSaveNotes = async () => {
    try {
      await api.put(`/campaigns/${campaignId}/notes`, { notes: masterNotes });
      showToast("Anotações salvas.", "success");
    } catch (err) {
      showToast("Erro ao salvar notas.", "error");
    }
  };

  const handleStartConflict = async (conflictData) => {
    setIsConflictLoading(true);
    try {
      const response = await api.post(`/campaigns/${campaignId}/conflict`, conflictData);
      setActiveConflict(response.data);
      setOpenConflictModal(false);
      showToast("Conflito iniciado!", "success");
    } catch (err) {
      showToast("Erro ao iniciar conflito.", "error");
    } finally {
      setIsConflictLoading(false);
    }
  };

  const handleProgressUpdate = async (type, index, amount, activationIndex = null) => {
    if (isConflictLoading) return;
    setIsConflictLoading(true);
    const payload = { type, index, amount };
    if (activationIndex !== null) payload.activationIndex = activationIndex;

    try {
      const response = await api.put(`/campaigns/${campaignId}/conflict/progress`, payload);
      setActiveConflict(response.data);
    } catch (err) {
      showToast("Erro ao atualizar.", "error");
    } finally {
      setIsConflictLoading(false);
    }
  };

  const handleEndConflict = async () => {
    const confirmed = await confirm({
      title: "Encerrar conflito",
      message: "Encerrar o conflito atual?",
      tone: "warning",
      confirmLabel: "Encerrar",
    });
    if (!confirmed) return;

    setIsConflictLoading(true);
    try {
      await api.delete(`/campaigns/${campaignId}/conflict`);
      setActiveConflict(null);
      showToast("Conflito encerrado.", "info");
    } catch (err) {
      showToast("Erro ao encerrar.", "error");
    } finally {
      setIsConflictLoading(false);
    }
  };

  const updateInviteCode = async ({ autoGenerate = false } = {}) => {
    const normalizedCode = inviteCodeDraft.replace(/\s+/g, "").toUpperCase();
    if (!autoGenerate && !normalizedCode) {
      showToast("Informe um código ou gere um automaticamente.", "warning");
      return;
    }
    if (!autoGenerate && !/^[A-Z0-9]{4,12}$/.test(normalizedCode)) {
      showToast("Código inválido. Use de 4 a 12 letras e números.", "warning");
      return;
    }
    setIsSavingInviteCode(true);
    try {
      const response = await api.patch(`/campaigns/${campaignId}/invite-code`, autoGenerate
        ? { autoGenerate: true }
        : { inviteCode: normalizedCode });
      const nextCode = response.data.inviteCode;
      setInviteCodeDraft(nextCode);
      setCampaign((current) => ({ ...current, inviteCode: nextCode }));
      showToast(autoGenerate ? "Novo código gerado." : "Código atualizado.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Não foi possível atualizar o código.", "error");
    } finally {
      setIsSavingInviteCode(false);
    }
  };

  const copyInviteCode = async () => {
    if (!campaign.inviteCode) return;
    try {
      await navigator.clipboard.writeText(campaign.inviteCode);
      showToast("Código copiado.", "success");
    } catch (err) {
      showToast("Não foi possível copiar o código.", "error");
    }
  };

  const handleDeleteNpc = async (npcId, npcName) => {
    const confirmed = await confirm({
      title: "Apagar NPC",
      message: `Tem certeza que deseja apagar permanentemente o NPC "${npcName}"?`,
      tone: "danger",
      confirmLabel: "Apagar",
    });
    if (!confirmed) return;

    try {
      await api.delete(`/campaigns/npc/${npcId}`);
      showToast("NPC removido da campanha.", "info");
      setNpcExpandido(null);
      fetchDynamicData();
    } catch (err) {
      showToast("Erro ao deletar NPC.", "error");
    }
  };

  const getTemperamentColor = (temp) => {
    if (["Hostil", "Agressivo", "Egoísta"].includes(temp)) return "#8a1c18";
    if (["Cooperativo", "Altruísta", "Líder Nato"].includes(temp)) return "#2e7d32";
    if (["Em Choque", "Instável", "Covarde"].includes(temp)) return "#f9a825";
    return "#424242";
  };

  const toggleNpc = (id) => { setNpcExpandido((prev) => (prev === id ? null : id)); };

  const jogadoresNaturais = playersData.filter((char) => !char.isNPC);
  const listaNpcs = playersData.filter((char) => char.isNPC);

  if (loading) return <PageLoader title="Carregando campanha" subtitle="Sincronizando ficha, NPCs e conflito..." />;
  if (error || !campaign) return <div className={styles.errorBox}><FaExclamationTriangle size={40} /><h2>ERRO DE ACESSO</h2><p>{error || "Campanha não encontrada."}</p><Link to="/campaigns" className={styles.btnNero}>VOLTAR</Link></div>;

  return (
    <div className={styles.campaignSheet}>
      <div className={styles.mainContent}>
        {/* HEADER */}
        <div className={styles.campaignHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.campaignNameTitle}>{campaign.name}</h1>
            <span className={styles.masterInfo} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span>Mestre: <span className={styles.highlight}>{campaign.master?.name || "Desconhecido"}</span></span>
              {isSyncing && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#ff5555", fontSize: "0.8rem", fontStyle: "italic" }}>
                  <FaSyncAlt className={styles.spinAnimation} /> Sincronizando...
                </span>
              )}
            </span>
            <p className={styles.campaignDescription}>{campaign.description}</p>
            {!isMaster && campaign.inviteCode && <span className={styles.inviteCode}>Código: {campaign.inviteCode}</span>}
            {isMaster && (
              <div className={styles.inviteCodeEditor}>
                <span className={styles.inviteCodeLabel}>Código de convite</span>
                <div className={styles.inviteCodeControls}>
                  <input
                    value={inviteCodeDraft}
                    onChange={(event) => setInviteCodeDraft(event.target.value.replace(/\s+/g, "").toUpperCase())}
                    onKeyDown={(event) => { if (event.key === "Enter" && !isSavingInviteCode) updateInviteCode(); }}
                    maxLength={12}
                    placeholder="Nenhum código criado"
                    aria-label="Código de convite da campanha"
                    className={styles.inviteCodeInput}
                  />
                  <button type="button" onClick={() => updateInviteCode()} disabled={isSavingInviteCode} className={styles.inviteCodeButton} title="Salvar código"><FaSave /><span>Salvar</span></button>
                  <button type="button" onClick={() => updateInviteCode({ autoGenerate: true })} disabled={isSavingInviteCode} className={styles.inviteCodeButton} title="Gerar código aleatório"><FaRandom /><span>Gerar</span></button>
                  <button type="button" onClick={copyInviteCode} disabled={!campaign.inviteCode} className={styles.inviteCodeButton} title="Copiar código"><FaCopy /><span>Copiar</span></button>
                </div>
              </div>
            )}
          </div>
          <Link to={`/campaign-lobby/${campaignId}`} className={`${styles.btnNero} ${styles.btnOutline}`}>
            <FaArrowLeft /> VOLTAR AO LOBBY
          </Link>
        </div>

        {/* BODY */}
        <div className={styles.campaignBody}>
          {isMaster ? (
            <div className={styles.masterShieldGrid}>
              
              {/* COLUNA 1 */}
              <div className={styles.shieldColumn}>
                <div className={styles.columnHeader}><span>STATUS INFECTADOS</span></div>
                <div className={styles.scrollableContent}>
                  {jogadoresNaturais.length > 0 ? (
                    <div className={styles.characterList}>
                      {jogadoresNaturais.map((char) => (
                        <div key={char._id} className={styles.characterCard}>
                          <div className={styles.characterHeader}>
                            <strong className={styles.charName}>{char.name}</strong>
                            <a href={`/character-sheet/${char._id}`} target="_blank" rel="noreferrer" className={styles.btnIconSmall} title="Abrir Ficha"><FaExternalLinkAlt color="#fff" size={12} /></a>
                          </div>
                          <CharacterPortraitOverview character={char} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      compact
                      title="Nenhum agente conectado"
                      description="Quando jogadores entrarem na campanha, eles aparecem aqui."
                    />
                  )}
                </div>
              </div>

              {/* COLUNA 2 */}
              <div className={styles.shieldColumn}>
                <div className={styles.columnHeader}><span>HISTÓRICO DE ROLAGENS</span></div>
                <div className={styles.scrollableContent}>
                  <RecentRollsFeed campaignId={campaignId} rolls={recentRolls} />
                </div>
              </div>

              {/* --- COLUNA 3: COMANDO --- */}
              <div className={styles.shieldColumn}>
                <div className={styles.columnHeader}><span>COMANDO</span></div>
                <div className={styles.scrollableContent}>
                  
                  {/* ROLADOR DE DADOS - Diagramação com Grid Fixo */}
                  <div style={{ marginBottom: "30px" }}>
                    <span className={styles.commandLabel}>DADOS MESTRE</span>
                    <div style={{ display: "none" }}>
                      <MasterDiceRoller
                        ref={masterRollerRef}
                        campaignId={campaignId}
                        onRollCreated={handleRollCreated}
                      />
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px" }}>
                      <input
                        type="text"
                        className={styles.diceInput}
                        placeholder="Fórmula (ex: 1d6+2d10)"
                        value={diceFormula}
                        onChange={(e) => setDiceFormula(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") masterRollerRef.current?.triggerRoll(diceFormula); }}
                        style={{ marginBottom: 0 }}
                      />
                      <button
                        className={`${styles.btnMasterTool} ${styles.blue}`}
                        onClick={() => masterRollerRef.current?.triggerRoll(diceFormula)}
                        style={{ width: "auto", padding: "0 20px" }}
                      >
                        <FaDiceD20 size={16} /> ROLAR
                      </button>
                    </div>
                  </div>

                  {/* FERRAMENTAS DO MESTRE - Grelha Perfeita */}
                  <div style={{ marginBottom: "30px" }}>
                    <span className={styles.commandLabel}>SISTEMAS DE JOGO</span>
                    
                    <div style={{ display: "grid", gridTemplateColumns: activeConflict ? "1fr" : "1fr 1fr", gap: "12px" }}>
                      {!activeConflict && (
                        <button className={`${styles.btnMasterTool} ${styles.cyan}`} onClick={() => setOpenConflictModal(true)}>
                          <FaShieldAlt size={16} /> CONFLITO
                        </button>
                      )}
                      <button className={`${styles.btnMasterTool} ${styles.purple}`} onClick={() => setOpenNpcModal(true)}>
                        <FaUserSecret size={16} /> GERAR NPC
                      </button>
                      <button
                        className={`${styles.btnMasterTool} ${styles.red}`}
                        onClick={() => setOpenEventDeckModal(true)}
                        style={{ gridColumn: activeConflict ? "1" : "1 / span 2" }}
                      >
                        <FaLayerGroup size={16} /> BARALHO DE EVENTOS
                      </button>
                    </div>
                  </div>

                  {/* ARQUIVO DE NPCs */}
                  {listaNpcs.length > 0 && (
                    <div style={{ marginBottom: "30px", borderTop: "1px solid #222", paddingTop: "20px" }}>
                      <span className={styles.commandLabel} style={{ color: "#a73c39" }}>
                        <FaUserSecret /> ARQUIVO DE NPCs
                      </span>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                        {listaNpcs.map((npc) => (
                          <div key={npc._id} style={{ background: "#111", border: "1px solid #333", borderRadius: "4px", overflow: "hidden" }}>
                            <div onClick={() => toggleNpc(npc._id)} style={{ padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: npcExpandido === npc._id ? "#1a1a1a" : "#0a0a0a", borderLeft: "3px solid #a73c39", transition: "background 0.2s" }}>
                              <strong style={{ color: "#fff", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "5px" }}>{npc.name} <span style={{ color: "#666", fontSize: "0.75rem", fontWeight: "normal" }}>({npc.role || "NPC"})</span></strong>
                              <span style={{ color: "#555" }}>{npcExpandido === npc._id ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}</span>
                            </div>

                            {npcExpandido === npc._id && (
                              <div style={{ padding: "15px", borderTop: "1px solid #222", background: "#0d0d0d" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                  <span style={{ color: "#ff3333", fontSize: "0.8rem", fontWeight: "bold" }}>HP:</span>
                                  <div style={{ flex: 1, background: "#000", height: "6px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${(npc.currentHealth / npc.maxHealth) * 100}%`, background: "#ff3333", height: "100%" }}></div></div>
                                  <span style={{ color: "#fff", fontSize: "0.8rem" }}>{npc.currentHealth}/{npc.maxHealth}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteNpc(npc._id, npc.name); }} style={{ background: "transparent", border: "none", color: "#ff3333", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px", marginLeft: "auto", fontFamily: "Orbitron" }}><FaTrash /> ELIMINAR NPC</button>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                  <FaBrain size={12} color="#888" />
                                  <span style={{ backgroundColor: getTemperamentColor(npc.temperament), color: ["Em Choque", "Instável", "Covarde"].includes(npc.temperament) ? "#000" : "#fff", padding: "2px 6px", fontSize: "0.7rem", borderRadius: "3px", textTransform: "uppercase", fontWeight: "bold" }}>{npc.temperament || "Neutro"}</span>
                                </div>
                                {npc.objective && <div style={{ color: "#ccc", fontSize: "0.8rem", marginBottom: "8px" }}><strong>Obj:</strong> {npc.objective}</div>}
                                {npc.quirk && <div style={{ color: "#aaa", fontSize: "0.8rem", fontStyle: "italic", borderLeft: "2px solid #444", paddingLeft: "8px", margin: "10px 0" }}>"{npc.quirk}"</div>}
                                {npc.loot && npc.loot.length > 0 && (
                                  <div style={{ marginTop: "12px" }}>
                                    <strong style={{ display: "flex", alignItems: "center", gap: "5px", color: "#666", fontSize: "0.7rem", marginBottom: "6px" }}><FaSuitcase size={10} /> LOOT</strong>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>{npc.loot.map((item, idx) => <span key={idx} style={{ background: "#222", padding: "3px 6px", fontSize: "0.7rem", color: "#ccc", borderRadius: "3px", border: "1px solid #333" }}>{item}</span>)}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CONFLITO ATIVO */}
                  {activeConflict && (
                    <div className={styles.conflictPanel}>
                      <div className={styles.conflictHeader}>
                        <span className={styles.conflictTitle}>CONFLITO ATIVO</span>
                        <button
                          className={`${styles.btnMasterTool} ${styles.red}`}
                          onClick={handleEndConflict}
                          disabled={isConflictLoading}
                          style={{ width: "auto", padding: "6px 12px", fontSize: "0.75rem", borderStyle: "solid" }}
                        >
                          ENCERRAR
                        </button>
                      </div>

                      {activeConflict.objectives.map((obj, idx) => (
                        <div key={idx} className={styles.conflictItem}>
                          <div className={styles.conflictItemHeader}><span>{obj.name}</span><span>{obj.progress}/{obj.cost}</span></div>
                          <div className={styles.neroProgressContainer}><div className={`${styles.neroProgressBar} blue`} style={{ width: `${(obj.progress / obj.cost) * 100}%` }}></div></div>
                          <div className={styles.conflictControls}>
                            <button className={`${styles.btnControlMini} minus`} onClick={() => handleProgressUpdate("objective", idx, -1)}><FaMinus size={10} /></button>
                            <button className={`${styles.btnControlMini} plus`} onClick={() => handleProgressUpdate("objective", idx, 1)}><FaPlus size={10} /></button>
                          </div>
                        </div>
                      ))}

                      {activeConflict.threats.map((threat, tIdx) => (
                        <div key={tIdx} style={{ marginBottom: "15px", border: "1px solid #444", padding: "10px", background: "#1a1a1a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "#eee", fontWeight: "bold" }}>
                            <span>{threat.name}</span>
                            <button
                              className={`${styles.btnMasterTool} ${styles.cyan}`}
                              style={{ padding: "4px 10px", fontSize: "0.75rem", width: "auto", borderStyle: "solid" }}
                              onClick={() => masterRollerRef.current?.triggerRoll(threat.diceFormula)}
                            >
                              <FaDiceD20 /> {threat.diceFormula}
                            </button>
                          </div>

                          {threat.activations.map((act, aIdx) => (
                            <div key={aIdx} style={{ marginTop: "10px", paddingLeft: "10px", borderLeft: "2px solid #333" }}>
                              <div className={styles.conflictItemHeader}><span>{act.name}</span><span>{act.progress}/{act.cost}</span></div>
                              <div className={styles.neroProgressContainer}><div className={styles.neroProgressBar} style={{ width: `${(act.progress / act.cost) * 100}%`, background: act.type === "C" ? "#ff3333" : "#8a1c18" }}></div></div>
                              <div className={styles.conflictControls}>
                                <button className={`${styles.btnControlMini} minus`} onClick={() => handleProgressUpdate("threat", tIdx, -1, aIdx)} disabled={isConflictLoading}><FaMinus size={10} /></button>
                                <button className={`${styles.btnControlMini} plus`} onClick={() => handleProgressUpdate("threat", tIdx, 1, aIdx)} disabled={isConflictLoading}><FaPlus size={10} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ANOTAÇÕES */}
                  <div>
                    <span className={styles.commandLabel}>NOTAS DE CAMPO</span>
                    <textarea
                      className={styles.notesArea}
                      rows="6"
                      value={masterNotes}
                      onChange={(e) => setMasterNotes(e.target.value)}
                      placeholder="Anotações privadas do mestre..."
                    ></textarea>
                    <button className={`${styles.btnMasterTool} ${styles.green}`} onClick={handleSaveNotes}>
                      <FaCheck size={14} /> SALVAR NOTAS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.errorBox}><h2>VISÃO DO JOGADOR</h2><p>Acesse o painel do seu personagem para jogar.</p></div>
          )}
        </div>
      </div>

      {/* MODAIS */}
      <ConflictTracker open={openConflictModal} onClose={() => setOpenConflictModal(false)} onStartConflict={handleStartConflict} />

      <EventDeckModal
        open={openEventDeckModal}
        onClose={() => setOpenEventDeckModal(false)}
        onSelectEvent={(card) => {
          setOpenEventDeckModal(false);
          setMasterNotes((prev) => prev + `\n\n[EVENTO: ${card.title}] - ${card.desc}`);
          showToast(`Evento "${card.title}" anotado nas Notas de Campo!`, "success");
        }}
      />

      {openNpcModal && (
        <div className={styles.modalBackdrop} onClick={() => setOpenNpcModal(false)}>
          <div className={styles.modalPanel} style={{ maxWidth: "1000px", padding: "0" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, color: "#fff", fontFamily: "Orbitron", textTransform: "uppercase" }}>Ferramenta: Criar NPC</h3>
              <button onClick={() => setOpenNpcModal(false)} style={{ background: "none", border: "none", color: "#888", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <NPCGenerator
                campaignId={campaignId}
                onNpcSaved={() => {
                  setOpenNpcModal(false);
                  fetchDynamicData();
                  showToast("NPC Injetado na Sessão!", "success");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSheet;
