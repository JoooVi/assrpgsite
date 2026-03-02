/* src/pages/CampaignSheet.js */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

// Ícones (React Icons) - Adicionamos o FaSyncAlt
import {
  FaArrowLeft,
  FaDiceD20,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaPlus,
  FaMinus,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaUserSecret,
  FaChevronDown,
  FaChevronUp,
  FaBrain,
  FaSuitcase,
  FaTrash,
  FaSyncAlt,
} from "react-icons/fa";

// Componentes Internos
import MasterDiceRoller from "../components/MasterDiceRoller";
import RecentRollsFeed from "../components/RecentRollsFeed";
import CharacterPortraitOverview from "../components/CharacterPortraitOverview";
import ConflictTracker from "../components/ConflictTracker";
import NPCGenerator from "../components/NPCGenerator";

// Import CSS Module
import styles from "./CampaignSheet.module.css";

const CampaignSheet = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);

  // Estados de Dados
  const [campaign, setCampaign] = useState(null);
  const [playersData, setPlayersData] = useState([]);
  const [masterNotes, setMasterNotes] = useState("");
  const [recentRolls, setRecentRolls] = useState([]);
  const [activeConflict, setActiveConflict] = useState(null);

  // Estados de UI/Controle
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [openConflictModal, setOpenConflictModal] = useState(false);
  const [openNpcModal, setOpenNpcModal] = useState(false);
  const [isConflictLoading, setIsConflictLoading] = useState(false);

  // NOVO: Estado para a bolinha de carregamento do background
  const [isSyncing, setIsSyncing] = useState(false);

  // Controle da Gaveta de NPCs
  const [npcExpandido, setNpcExpandido] = useState(null);

  const [diceFormula, setDiceFormula] = useState("");

  // Toast Notification
  const [toast, setToast] = useState({ open: false, msg: "", type: "info" });

  const masterRollerRef = useRef(null);

  const showToast = (msg, type = "info") => {
    setToast({ open: true, msg, type });
    setTimeout(() => setToast({ open: false, msg: "", type: "info" }), 4000);
  };

  // --- FETCH DADOS ---
  const fetchDynamicData = useCallback(async () => {
    if (!token || !user || !isMaster) return;

    setIsSyncing(true); // COMEÇA A GIRAR

    try {
      const [playersRes, rollsRes, conflictRes] = await Promise.all([
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/players-data`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/recent-rolls`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);
      setPlayersData(playersRes.data);
      setRecentRolls(rollsRes.data);
      setActiveConflict(conflictRes.data);
    } catch (err) {
      console.warn("Sync error:", err);
    } finally {
      setIsSyncing(false); // PARA DE GIRAR
    }
  }, [campaignId, user, token, isMaster]);

  const fetchInitialData = useCallback(async () => {
    if (!token || !user) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const campaignRes = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const campaignData = campaignRes.data;
      const masterId = campaignData.master._id || campaignData.master;
      const currentUserIsMaster = user._id === masterId;

      setIsMaster(currentUserIsMaster);
      setCampaign(campaignData);
      setActiveConflict(campaignData.activeConflict || null);

      if (currentUserIsMaster) {
        setMasterNotes(campaignData.notes || "");
        const [playersRes, rollsRes] = await Promise.all([
          axios.get(
            `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/players-data`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get(
            `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/recent-rolls`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);
        setPlayersData(playersRes.data);
        setRecentRolls(rollsRes.data);
      }
    } catch (err) {
      setError("Erro ao carregar dados da campanha.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (isMaster) {
      const interval = setInterval(fetchDynamicData, 7000);
      return () => clearInterval(interval);
    }
  }, [isMaster, fetchDynamicData]);

  // --- ACTIONS ---
  const handleSaveNotes = async () => {
    try {
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/notes`,
        { notes: masterNotes },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Anotações salvas.", "success");
    } catch (err) {
      showToast("Erro ao salvar notas.", "error");
    }
  };

  const handleStartConflict = async (conflictData) => {
    setIsConflictLoading(true);
    try {
      const response = await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict`,
        conflictData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActiveConflict(response.data);
      setOpenConflictModal(false);
      showToast("Conflito iniciado!", "success");
    } catch (err) {
      showToast("Erro ao iniciar conflito.", "error");
    } finally {
      setIsConflictLoading(false);
    }
  };

  const handleProgressUpdate = async (
    type,
    index,
    amount,
    activationIndex = null,
  ) => {
    if (isConflictLoading) return;
    setIsConflictLoading(true);
    const payload = { type, index, amount };
    if (activationIndex !== null) payload.activationIndex = activationIndex;

    try {
      const response = await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict/progress`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setActiveConflict(response.data);
    } catch (err) {
      showToast("Erro ao atualizar.", "error");
    } finally {
      setIsConflictLoading(false);
    }
  };

  const handleEndConflict = async () => {
    if (window.confirm("Encerrar o conflito atual?")) {
      setIsConflictLoading(true);
      try {
        await axios.delete(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setActiveConflict(null);
        showToast("Conflito encerrado.", "info");
      } catch (err) {
        showToast("Erro ao encerrar.", "error");
      } finally {
        setIsConflictLoading(false);
      }
    }
  };

  const handleDeleteNpc = async (npcId, npcName) => {
    if (window.confirm(`Tem certeza que deseja apagar permanentemente o NPC "${npcName}"?`)) {
      try {
        await axios.delete(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/npc/${npcId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        showToast("NPC removido da campanha.", "info");
        setNpcExpandido(null); 
        
        fetchDynamicData(); 
        
      } catch (err) {
        console.error(err);
        showToast("Erro ao deletar NPC.", "error");
      }
    }
  };

  // --- FUNÇÕES UTILITÁRIAS ---
  const getTemperamentColor = (temp) => {
    if (["Hostil", "Agressivo", "Egoísta"].includes(temp)) return "#8a1c18";
    if (["Cooperativo", "Altruísta", "Líder Nato"].includes(temp))
      return "#2e7d32";
    if (["Em Choque", "Instável", "Covarde"].includes(temp)) return "#f9a825";
    return "#424242";
  };

  const toggleNpc = (id) => {
    setNpcExpandido((prev) => (prev === id ? null : id));
  };

  // --- SEPARAÇÃO DOS DADOS ---
  const jogadoresNaturais = playersData.filter((char) => !char.isNPC);
  const listaNpcs = playersData.filter((char) => char.isNPC);

  // --- RENDER ---
  if (loading)
    return (
      <div className={styles.loadingBox}>
        <h2 style={{ fontFamily: "Orbitron", color: "#fff" }}>
          CARREGANDO DADOS...
        </h2>
      </div>
    );

  if (error || !campaign)
    return (
      <div className={styles.errorBox}>
        <FaExclamationTriangle size={40} />
        <h2>ERRO DE ACESSO</h2>
        <p>{error || "Campanha não encontrada."}</p>
        <Link to="/campaigns" className={styles.btnNero}>
          VOLTAR
        </Link>
      </div>
    );

  return (
    <div className={styles.campaignSheet}>
      <div className={styles.mainContent}>
        {/* HEADER */}
        <div className={styles.campaignHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.campaignNameTitle}>{campaign.name}</h1>
            <span
              className={styles.masterInfo}
              style={{ display: "flex", alignItems: "center", gap: "15px" }}
            >
              <span>
                Mestre:{" "}
                <span className={styles.highlight}>
                  {campaign.master?.name || "Desconhecido"}
                </span>
              </span>

              {/* === NOVO: O INDICADOR DE SINCRONIZAÇÃO === */}
              {isSyncing && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color: "#3cdce7",
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                  }}
                >
                  <FaSyncAlt className={styles.spinAnimation} />{" "}
                  Sincronizando...
                </span>
              )}
            </span>
            <p className={styles.campaignDescription}>{campaign.description}</p>
            {campaign.inviteCode && (
              <span className={styles.inviteCode}>
                Código: {campaign.inviteCode}
              </span>
            )}
          </div>

          <Link
            to={`/campaign-lobby/${campaignId}`}
            className={`${styles.btnNero} ${styles.btnOutline}`}
          >
            <FaArrowLeft /> VOLTAR AO LOBBY
          </Link>
        </div>

        {/* BODY */}
        <div className={styles.campaignBody}>
          {isMaster ? (
            <div className={styles.masterShieldGrid}>
              {/* COLUNA 1: APENAS JOGADORES REAIS */}
              <div className={styles.shieldColumn}>
                <div className={styles.columnHeader}>
                  <span>STATUS INFECTADOS</span>
                </div>
                <div className={styles.scrollableContent}>
                  {jogadoresNaturais.length > 0 ? (
                    <div className={styles.characterList}>
                      {jogadoresNaturais.map((char) => (
                        <div key={char._id} className={styles.characterCard}>
                          <div className={styles.characterHeader}>
                            <strong className={styles.charName}>
                              {char.name}
                            </strong>
                            <a
                              href={`/character-sheet/${char._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.btnIconSmall}
                              title="Abrir Ficha"
                            >
                              <FaExternalLinkAlt color="#fff" size={12} />
                            </a>
                          </div>
                          <CharacterPortraitOverview character={char} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        color: "#666",
                        textAlign: "center",
                        marginTop: "20px",
                      }}
                    >
                      Nenhum agente conectado.
                    </p>
                  )}
                </div>
              </div>

              {/* COLUNA 2: ROLAGENS */}
              <div className={styles.shieldColumn}>
                <div className={styles.columnHeader}>
                  <span>HISTÓRICO DE ROLAGENS</span>
                </div>
                <div className={styles.scrollableContent}>
                  <RecentRollsFeed
                    campaignId={campaignId}
                    rolls={recentRolls}
                  />
                </div>
              </div>

              {/* --- COLUNA 3: COMANDO --- */}
              <div className={styles.shieldColumn}>
                <div className={styles.columnHeader}>
                  <span>COMANDO</span>
                </div>
                <div className={styles.scrollableContent}>
                  {/* ROLADOR DE DADOS */}
                  <div style={{ marginBottom: "20px" }}>
                    <span className={styles.commandLabel}>DADOS MESTRE</span>
                    <div style={{ display: "none" }}>
                      <MasterDiceRoller
                        ref={masterRollerRef}
                        campaignId={campaignId}
                      />
                    </div>
                    <input
                      type="text"
                      className={styles.diceInput}
                      placeholder="Fórmula dos Dados (ex: 1d6+2d10)"
                      value={diceFormula}
                      onChange={(e) => setDiceFormula(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          masterRollerRef.current?.triggerRoll(diceFormula);
                      }}
                    />
                    <button
                      className={styles.btnRoll}
                      onClick={() =>
                        masterRollerRef.current?.triggerRoll(diceFormula)
                      }
                    >
                      <FaDiceD20 /> ROLAR DADOS
                    </button>
                  </div>

                  {/* BOTOES DE FERRAMENTAS MESTRE */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "30px",
                    }}
                  >
                    {!activeConflict && (
                      <button
                        className={styles.btnCommand}
                        onClick={() => setOpenConflictModal(true)}
                      >
                        <FaShieldAlt /> CONFLITO
                      </button>
                    )}
                    <button
                      className={styles.btnCommand}
                      onClick={() => setOpenNpcModal(true)}
                      style={{ background: "#3b4766", color: "#fff" }}
                    >
                      <FaUserSecret /> GERAR NPC
                    </button>
                  </div>

                  {/* ARQUIVO DE NPCs (A GAVETA) */}
                  {listaNpcs.length > 0 && (
                    <div
                      style={{
                        marginBottom: "30px",
                        borderTop: "1px solid #222",
                        paddingTop: "15px",
                      }}
                    >
                      <span
                        className={styles.commandLabel}
                        style={{ color: "#a73c39" }}
                      >
                        <FaUserSecret /> ARQUIVO DE NPCs
                      </span>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginTop: "10px",
                        }}
                      >
                        {listaNpcs.map((npc) => (
                          <div
                            key={npc._id}
                            style={{
                              background: "#111",
                              border: "1px solid #333",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            {/* Clicável (Acordeão) */}
                            <div
                              onClick={() => toggleNpc(npc._id)}
                              style={{
                                padding: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                background:
                                  npcExpandido === npc._id
                                    ? "#1a1a1a"
                                    : "#0a0a0a",
                                borderLeft: "3px solid #a73c39",
                                transition: "background 0.2s",
                              }}
                            >
                              <strong
                                style={{
                                  color: "#fff",
                                  fontSize: "0.9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                {npc.name}
                                <span
                                  style={{
                                    color: "#666",
                                    fontSize: "0.75rem",
                                    fontWeight: "normal",
                                  }}
                                >
                                  ({npc.role || "NPC"})
                                </span>
                              </strong>
                              <span style={{ color: "#555" }}>
                                {npcExpandido === npc._id ? (
                                  <FaChevronUp size={12} />
                                ) : (
                                  <FaChevronDown size={12} />
                                )}
                              </span>
                            </div>

                            {/* Conteúdo Expandido */}
                            {npcExpandido === npc._id && (
                              <div
                                style={{
                                  padding: "15px",
                                  borderTop: "1px solid #222",
                                  background: "#0d0d0d",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "12px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#ff3333",
                                      fontSize: "0.8rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    HP:
                                  </span>
                                  <div
                                    style={{
                                      flex: 1,
                                      background: "#000",
                                      height: "6px",
                                      borderRadius: "3px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${(npc.currentHealth / npc.maxHealth) * 100}%`,
                                        background: "#ff3333",
                                        height: "100%",
                                      }}
                                    ></div>
                                  </div>
                                  <span
                                    style={{
                                      color: "#fff",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {npc.currentHealth}/{npc.maxHealth}
                                  </span>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNpc(npc._id, npc.name);
                                    }}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "#ff3333",
                                      cursor: "pointer",
                                      fontSize: "0.8rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      marginLeft: "auto",
                                      fontFamily: "Orbitron",
                                    }}
                                  >
                                    <FaTrash /> ELIMINAR NPC
                                  </button>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <FaBrain size={12} color="#888" />
                                  <span
                                    style={{
                                      backgroundColor: getTemperamentColor(
                                        npc.temperament,
                                      ),
                                      color: [
                                        "Em Choque",
                                        "Instável",
                                        "Covarde",
                                      ].includes(npc.temperament)
                                        ? "#000"
                                        : "#fff",
                                      padding: "2px 6px",
                                      fontSize: "0.7rem",
                                      borderRadius: "3px",
                                      textTransform: "uppercase",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {npc.temperament || "Neutro"}
                                  </span>
                                </div>

                                {npc.objective && (
                                  <div
                                    style={{
                                      color: "#ccc",
                                      fontSize: "0.8rem",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    <strong>Obj:</strong> {npc.objective}
                                  </div>
                                )}
                                {npc.quirk && (
                                  <div
                                    style={{
                                      color: "#aaa",
                                      fontSize: "0.8rem",
                                      fontStyle: "italic",
                                      borderLeft: "2px solid #444",
                                      paddingLeft: "8px",
                                      margin: "10px 0",
                                    }}
                                  >
                                    "{npc.quirk}"
                                  </div>
                                )}

                                {npc.loot && npc.loot.length > 0 && (
                                  <div style={{ marginTop: "12px" }}>
                                    <strong
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        color: "#666",
                                        fontSize: "0.7rem",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      <FaSuitcase size={10} /> LOOT
                                    </strong>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "4px",
                                      }}
                                    >
                                      {npc.loot.map((item, idx) => (
                                        <span
                                          key={idx}
                                          style={{
                                            background: "#222",
                                            padding: "3px 6px",
                                            fontSize: "0.7rem",
                                            color: "#ccc",
                                            borderRadius: "3px",
                                            border: "1px solid #333",
                                          }}
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
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
                        <span className={styles.conflictTitle}>
                          CONFLITO ATIVO
                        </span>
                        <button
                          className={styles.btnCommand}
                          onClick={handleEndConflict}
                          disabled={isConflictLoading}
                          style={{
                            width: "auto",
                            padding: "5px 10px",
                            fontSize: "0.8rem",
                            background: "#ccc",
                          }}
                        >
                          ENCERRAR
                        </button>
                      </div>

                      {activeConflict.objectives.map((obj, idx) => (
                        <div key={idx} className={styles.conflictItem}>
                          <div className={styles.conflictItemHeader}>
                            <span>{obj.name}</span>
                            <span>
                              {obj.progress}/{obj.cost}
                            </span>
                          </div>
                          <div className={styles.neroProgressContainer}>
                            <div
                              className={`${styles.neroProgressBar} blue`}
                              style={{
                                width: `${(obj.progress / obj.cost) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className={styles.conflictControls}>
                            <button
                              className={`${styles.btnControlMini} minus`}
                              onClick={() =>
                                handleProgressUpdate("objective", idx, -1)
                              }
                            >
                              <FaMinus size={10} />
                            </button>
                            <button
                              className={`${styles.btnControlMini} plus`}
                              onClick={() =>
                                handleProgressUpdate("objective", idx, 1)
                              }
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {activeConflict.threats.map((threat, tIdx) => (
                        <div
                          key={tIdx}
                          style={{
                            marginBottom: "15px",
                            border: "1px solid #444",
                            padding: "10px",
                            background: "#1a1a1a",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "5px",
                              color: "#eee",
                              fontWeight: "bold",
                            }}
                          >
                            <span>{threat.name}</span>
                            <button
                              className={styles.btnCommand}
                              style={{
                                padding: "2px 8px",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                width: "auto",
                              }}
                              onClick={() =>
                                masterRollerRef.current?.triggerRoll(
                                  threat.diceFormula,
                                )
                              }
                            >
                              <FaDiceD20 /> {threat.diceFormula}
                            </button>
                          </div>

                          {threat.activations.map((act, aIdx) => (
                            <div
                              key={aIdx}
                              style={{
                                marginTop: "10px",
                                paddingLeft: "10px",
                                borderLeft: "2px solid #333",
                              }}
                            >
                              <div className={styles.conflictItemHeader}>
                                <span>{act.name}</span>
                                <span>
                                  {act.progress}/{act.cost}
                                </span>
                              </div>
                              <div className={styles.neroProgressContainer}>
                                <div
                                  className={styles.neroProgressBar}
                                  style={{
                                    width: `${(act.progress / act.cost) * 100}%`,
                                    background:
                                      act.type === "C" ? "#ff3333" : "#8a1c18",
                                  }}
                                ></div>
                              </div>
                              <div className={styles.conflictControls}>
                                <button
                                  className={`${styles.btnControlMini} minus`}
                                  onClick={() =>
                                    handleProgressUpdate(
                                      "threat",
                                      tIdx,
                                      -1,
                                      aIdx,
                                    )
                                  }
                                  disabled={isConflictLoading}
                                >
                                  <FaMinus size={10} />
                                </button>
                                <button
                                  className={`${styles.btnControlMini} plus`}
                                  onClick={() =>
                                    handleProgressUpdate(
                                      "threat",
                                      tIdx,
                                      1,
                                      aIdx,
                                    )
                                  }
                                  disabled={isConflictLoading}
                                >
                                  <FaPlus size={10} />
                                </button>
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
                    <button
                      className={styles.btnSaveNotes}
                      onClick={handleSaveNotes}
                    >
                      SALVAR NOTAS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.errorBox}>
              <h2>VISÃO DO JOGADOR</h2>
              <p>Acesse o painel do seu personagem para jogar.</p>
            </div>
          )}
        </div>
      </div>

      {/* TOAST E MODAIS */}
      {toast.open && (
        <div
          className={`${styles.neroToast} ${toast.type === "error" ? "error" : ""}`}
        >
          {toast.type === "success" ? (
            <FaCheck />
          ) : toast.type === "error" ? (
            <FaTimes />
          ) : (
            <FaExclamationTriangle />
          )}
          {toast.msg}
        </div>
      )}

      <ConflictTracker
        open={openConflictModal}
        onClose={() => setOpenConflictModal(false)}
        onStartConflict={handleStartConflict}
      />

      {openNpcModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setOpenNpcModal(false)}
        >
          <div
            className={styles.modalPanel}
            style={{ maxWidth: "1000px", padding: "0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3
                style={{
                  margin: 0,
                  color: "#fff",
                  fontFamily: "Orbitron",
                  textTransform: "uppercase",
                }}
              >
                Ferramenta: Criar NPC
              </h3>
              <button
                onClick={() => setOpenNpcModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
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