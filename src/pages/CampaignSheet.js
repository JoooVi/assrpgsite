import React, { useState, useEffect, useCallback, useRef } from "react"; // useRef já estava
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  IconButton,
  Snackbar,
  Divider, // Removido 'component' que estava sobrando
  LinearProgress,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import styles from "./CampaignSheet.module.css";
import MasterDiceRoller from "../components/MasterDiceRoller";
import RecentRollsFeed from "../components/RecentRollsFeed";
// import TugOfWar from "../components/TugOfWar"; // Comentado se não estiver em uso aqui
import CharacterPortraitOverview from "../components/CharacterPortraitOverview";
import ConflictTracker from "../components/ConflictTracker";

const translateKey = (key) => {
  // ... (A tua função translateKey permanece a mesma) ...
  const translations = {
    // Campos Gerais
    health: "Saúde",
    Current: "Atual",
    current: "Atual",
    collapse: "Colapso",
    preCollapse: "pré-Colapso",
    postCollapse: "Pós-Colapso",
    Knowledge: "Conhecimento",
    knowledge: "Conhecimento",
    Practices: "Práticas",
    practices: "Práticas",
    Instincts: "Instintos",
    instincts: "Instintos",

    // Instintos
    Perception: "Percepção",
    perception: "Percepção",
    Potency: "Potência",
    potency: "Potência",
    Influence: "Influência",
    influence: "Influência",
    Resolution: "Resolução",
    resolution: "Resolução",
    Sagacity: "Sagacidade",
    sagacity: "Sagacidade",
    Reaction: "Reação",
    reaction: "Reação",

    // Novos Conhecimentos
    geography: "Geografia",
    Geography: "Geografia",
    medicine: "Medicina",
    Medicine: "Medicina",
    security: "Segurança",
    Security: "Segurança",
    biology: "Biologia",
    Biology: "Biologia",
    erudition: "Erudição",
    Erudition: "Erudição",
    engineering: "Engenharia",
    Engineering: "Engenharia",

    // Novas Práticas
    weapons: "Armas",
    Weapons: "Armas",
    athletics: "Atletismo",
    Athletics: "Atletismo",
    expression: "Expressão",
    Expression: "Expressão",
    stealth: "Furtividade",
    Stealth: "Furtividade",
    crafting: "Manufaturas",
    Crafting: "Manufaturas",
    survival: "Sobrevivência",
    Survival: "Sobrevivência",
  };

  return translations[key] || key;
};

const CampaignSheet = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const [campaign, setCampaign] = useState(null);
  const [playersData, setPlayersData] = useState([]);
  const [masterNotes, setMasterNotes] = useState("");
  const [recentRolls, setRecentRolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const [openConflictModal, setOpenConflictModal] = useState(false);
  const [activeConflict, setActiveConflict] = useState(null);
  const [isConflictLoading, setIsConflictLoading] = useState(false); // Estado de loading para ações de conflito

  const masterRollerRef = useRef(null);

  // --- fetchDynamicData: Atualiza jogadores, rolagens E o estado do conflito ---
  const fetchDynamicData = useCallback(async () => {
    if (!token || !user || !isMaster) return;

    try {
      const [playersRes, rollsRes, conflictRes] = await Promise.all([
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/players-data`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/recent-rolls`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        // --- ADIÇÃO: Busca o estado atual do conflito ---
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
      setPlayersData(playersRes.data);
      setRecentRolls(rollsRes.data);
      // --- ADIÇÃO: Atualiza o estado do conflito local com o do backend ---
      setActiveConflict(conflictRes.data); // Pode ser null se não houver conflito ativo
    } catch (err) {
      // Evita spam de erros se o fetch falhar repetidamente
      console.warn("Falha ao atualizar dados dinâmicos:", err);
    }
  }, [campaignId, user, token, isMaster]);


  // --- fetchInitialData: Carrega dados iniciais E o conflito ativo ---
  const fetchInitialData = useCallback(async () => {
    if (!token || !user) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Uma única chamada que agora retorna a campanha E o activeConflict
      const campaignRes = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const campaignData = campaignRes.data;
      const masterId = campaignData.master._id || campaignData.master;
      const currentUserIsMaster = user._id === masterId;

      setIsMaster(currentUserIsMaster);
      setCampaign(campaignData);
      // --- ADIÇÃO: Define o estado inicial do conflito ---
      setActiveConflict(campaignData.activeConflict || null);

      if (!currentUserIsMaster) return; // Se não for mestre, para aqui

      // Busca dados específicos do mestre (jogadores, rolagens)
      const [playersRes, rollsRes] = await Promise.all([
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/players-data`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/recent-rolls`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      setMasterNotes(campaignData.notes || "");
      setPlayersData(playersRes.data);
      setRecentRolls(rollsRes.data);

    } catch (err) {
      console.error("Falha ao carregar dados do escudo do mestre:", err.response?.data || err.message);
      setError("Falha ao carregar dados. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Atualização periódica (agora inclui o conflito)
  useEffect(() => {
    if (isMaster) {
      const interval = setInterval(fetchDynamicData, 7000); // Aumentado para 7 segundos
      return () => clearInterval(interval);
    }
  }, [isMaster, fetchDynamicData]);


  const handleSaveNotes = async () => {
    // ... (Esta função permanece a mesma) ...
    try {
      await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/notes`,
        { notes: masterNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbarMessage("Notas salvas com sucesso!");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error(
        "Erro ao salvar as notas:",
        err.response?.data || err.message
      );
      setSnackbarMessage("Erro ao salvar as notas.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    // ... (Esta função permanece a mesma) ...
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // --- FUNÇÕES DE CONFLITO ATUALIZADAS COM API ---

  /**
   * Envia os dados do conflito preparado para o backend para iniciar/salvar.
   */
  const handleStartConflict = async (conflictData) => {
    setIsConflictLoading(true);
    try {
      const response = await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict`,
        conflictData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveConflict(response.data); // Atualiza o estado local com a resposta (que inclui progressos zerados)
      setOpenConflictModal(false); // Fecha o modal apenas se for bem-sucedido
      setSnackbarMessage("Conflito iniciado!");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("Erro ao iniciar conflito:", err.response?.data || err.message);
      setSnackbarMessage("Erro ao iniciar conflito.");
      setSnackbarSeverity("error");
    } finally {
      setIsConflictLoading(false);
      setSnackbarOpen(true);
    }
  };

  /**
   * Envia a atualização de progresso para o backend.
   */
  const handleProgressUpdate = async (type, index, amount, activationIndex = null) => {
     // Evita múltiplas chamadas rápidas
     if (isConflictLoading) return;
     
     setIsConflictLoading(true);
     const payload = { type, index, amount };
     if (activationIndex !== null) {
       payload.activationIndex = activationIndex;
     }

     try {
       const response = await axios.put(
         `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict/progress`,
         payload,
         { headers: { Authorization: `Bearer ${token}` } }
       );
       setActiveConflict(response.data); // Atualiza o estado local com a resposta do backend
     } catch (err) {
       console.error("Erro ao atualizar progresso:", err.response?.data || err.message);
       setSnackbarMessage("Erro ao atualizar progresso.");
       setSnackbarSeverity("error");
       setSnackbarOpen(true);
       // Opcional: Reverter a mudança visual se a API falhar (mais complexo)
     } finally {
       setIsConflictLoading(false);
     }
  };
  
  // Funções wrapper para os botões chamarem handleProgressUpdate
  const handleObjectiveProgress = (objectiveIndex, amount) => {
    handleProgressUpdate('objective', objectiveIndex, amount);
  };
  const handleThreatProgress = (threatIndex, activationIndex, amount) => {
    handleProgressUpdate('threat', threatIndex, amount, activationIndex);
  };

  /**
   * Envia o pedido para encerrar o conflito no backend.
   */
  const handleEndConflict = async () => {
    if (window.confirm("Tem certeza que deseja encerrar o conflito atual?")) {
      setIsConflictLoading(true);
      try {
        await axios.delete(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/conflict`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActiveConflict(null); // Limpa o estado local
        setSnackbarMessage("Conflito encerrado.");
        setSnackbarSeverity("info");
      } catch (err) {
        console.error("Erro ao encerrar conflito:", err.response?.data || err.message);
        setSnackbarMessage("Erro ao encerrar conflito.");
        setSnackbarSeverity("error");
      } finally {
        setIsConflictLoading(false);
        setSnackbarOpen(true);
      }
    }
  };

  // --- FIM DAS FUNÇÕES DE CONFLITO ATUALIZADAS ---


  if (loading) {
    // ... (JSX de Loading) ...
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2, color: "white" }}>
          Carregando campanha...
        </Typography>
      </Box>
    );
  }

  if (error) {
    // ... (JSX de Error) ...
     return (
      <Box className={styles.errorContainer}>
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!campaign) {
    // ... (JSX de Não Encontrado) ...
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="warning" sx={{ m: 3 }}>
          Campanha não encontrada ou você não tem permissão para acessá-la.
        </Alert>
      </Box>
    );
  }

  // --- JSX PRINCIPAL (Renderização) ---
  return (
    <Box className={styles.campaignSheet}>
      <Paper
        elevation={5}
        className={styles.mainContent}
        sx={{ backgroundColor: "rgba(16, 12, 29, 0.8)" }}
      >
        {/* --- Cabeçalho (Sem alterações visuais) --- */}
        <Box className={styles.campaignHeader}>
          <Typography
            variant="h4"
            gutterBottom
            className={styles.campaignNameTitle}
          >
            Escudo do Mestre: {campaign.name}
          </Typography>
          <Button
            component={Link}
            to="/campaigns"
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
              "&:hover": { borderColor: "#4c86ff", color: "#4c86ff" },
              position: "absolute",
              top: 20,
              right: 20,
              display: { xs: "none", sm: "flex" },
            }}
          >
            <ArrowBackIcon sx={{ mr: 0.5 }} /> Voltar ao Lobby
          </Button>
          <Typography variant="h6" className={styles.masterInfo}>
            Mestre:{" "}
            {campaign.master?.name || campaign.masterName || "Desconhecido"}
          </Typography>
          <Typography variant="body1" className={styles.campaignDescription}>
            {campaign.description}
          </Typography>
          {campaign.inviteCode && (
            <Typography variant="body2" className={styles.inviteCode}>
              Código de Convite: <strong>{campaign.inviteCode}</strong>
            </Typography>
          )}
        </Box>

        <Box className={styles.campaignBody}>
          {isMaster ? (
            <Grid container spacing={3} className={styles.masterShieldGrid}>

              {/* --- COLUNA 1: STATUS JOGADORES (Sem alterações visuais) --- */}
              <Grid item xs={12} md={4} className={styles.shieldColumn}>
                <Paper
                  elevation={2}
                  className={styles.columnPaper}
                  sx={{ backgroundColor: "transparent" }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    className={styles.columnTitle}
                  >
                    Status dos Jogadores
                  </Typography>
                  <Box className={styles.scrollableContent}>
                    {playersData.length > 0 ? (
                      <List>
                        {playersData.map((character) => (
                           <ListItem
                            key={character._id}
                            className={styles.characterListItem}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#8c1a1a",
                                    fontWeight: "bold",
                                    mb: 1,
                                  }}
                                >
                                  {character.name}
                                </Typography>
                                <IconButton
                                  component="a"
                                  href={`/character-sheet/${character._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  color="primary"
                                  size="small"
                                  sx={{ color: "#ffffff", p: 0.5 }}
                                >
                                  <Typography
                                    variant="button"
                                    sx={{ fontSize: "0.75rem" }}
                                  >
                                    Ficha
                                  </Typography>
                                </IconButton>
                              </Box>

                              <CharacterPortraitOverview character={character} />

                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        Nenhum jogador na campanha.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* --- COLUNA 2: ROLAGEM JOGADORES (Sem alterações visuais) --- */}
              <Grid item xs={12} md={4} className={styles.shieldColumn}>
                <Paper
                  elevation={2}
                  className={styles.columnPaper}
                  sx={{ backgroundColor: "transparent" }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    className={styles.columnTitle}
                  >
                    Rolagem dos jogadores
                  </Typography>
                  <Box className={styles.scrollableContent}>
                    <RecentRollsFeed
                      campaignId={campaignId}
                      rolls={recentRolls}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* --- COLUNA 3: PAINEL DE AÇÕES (Agora ligado ao backend) --- */}
              <Grid item xs={12} md={4} className={styles.shieldColumn}>
                <Paper elevation={2} className={styles.columnPaper}>
                 
                 {/* MasterDiceRoller continua aqui, sempre visível */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      className={styles.columnTitle}
                    >
                      Rolar Dados
                    </Typography>
                    <MasterDiceRoller
                      ref={masterRollerRef}
                      campaignId={campaignId}
                    />
                  </Box>

                  <Divider
                    sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.2)" }}
                  />

                  {/* Mostra o Painel de Conflito Ativo se existir */}
                  {activeConflict ? (
                    <Box className={styles.scrollableContent}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" className={styles.columnTitle}>
                          Conflito Ativo
                        </Typography>
                        {/* Botão Encerrar agora chama handleEndConflict com API */}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={handleEndConflict}
                          disabled={isConflictLoading} // Desativa enquanto processa
                        >
                          Encerrar Conflito
                        </Button>
                      </Box>

                      {activeConflict.conditions && (
                        <Alert severity="info" sx={{ mb: 2, bgcolor: '#2a2d30', color: '#e0e0e0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Condicionante:</Typography>
                          {activeConflict.conditions}
                        </Alert>
                      )}

                      <Typography variant="h6" sx={{ color: '#fff', mt: 2, fontSize: '1.1rem' }}>
                        Objetivos (Infectados)
                      </Typography>
                      {activeConflict.objectives.map((obj, index) => (
                        <Box key={index} sx={{ my: 1, p: 1.5, border: '1px solid #4a4a4a', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
                              {obj.name} ({obj.type})
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                              {obj.progress} / {obj.cost} (A)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(obj.progress / obj.cost) * 100}
                            sx={{ my: 0.5, height: 8, borderRadius: 2 }}
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            {/* Botões +/- agora chamam handleObjectiveProgress com API */}
                            <IconButton size="small" sx={{ color: 'green' }} onClick={() => handleObjectiveProgress(index, 1)} disabled={isConflictLoading}>
                              <AddIcon />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'red' }} onClick={() => handleObjectiveProgress(index, -1)} disabled={isConflictLoading}>
                              <RemoveIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}

                      <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.2)" }} />

                      <Typography variant="h6" sx={{ color: '#fff', mt: 2, fontSize: '1.1rem' }}>
                        Ameaças (Assimilador)
                      </Typography>
                      {activeConflict.threats.map((threat, tIndex) => (
                        <Box key={tIndex} sx={{ my: 1, p: 1.5, border: '1px solid #4a4a4a', borderRadius: 1, bgcolor: '#2a2d30' }}>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
                              {threat.name}
                            </Typography>
                            <Tooltip title={`Rolar ${threat.diceFormula} para esta Ameaça`}>
                              {/* Botão Rolar Ameaça continua usando a ref */}
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ color: '#ccc', borderColor: '#888' }}
                                onClick={() => {
                                  if (masterRollerRef.current) {
                                    masterRollerRef.current.triggerRoll(threat.diceFormula);
                                  }
                                }}
                                disabled={isConflictLoading}
                              >
                                {threat.diceFormula}
                              </Button>
                            </Tooltip>
                          </Box>
                          {threat.activations.map((act, aIndex) => (
                             <Box key={aIndex} sx={{ ml: 2, my: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ color: '#ccc', fontSize: '0.9rem' }}>
                                  {act.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#ccc' }}>
                                  {act.progress} / {act.cost} ({act.type})
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(act.progress / act.cost) * 100}
                                color={act.type === 'C' ? 'error' : 'primary'}
                                sx={{ my: 0.5, height: 6, borderRadius: 2 }}
                              />
                              <Box sx={{ textAlign: 'right' }}>
                                 {/* Botões +/- agora chamam handleThreatProgress com API */}
                                <IconButton size="small" color={act.type === 'C' ? 'error' : 'primary'} onClick={() => handleThreatProgress(tIndex, aIndex, 1)} disabled={isConflictLoading}>
                                  <AddIcon />
                                </IconButton>
                                <IconButton size="small" color={act.type === 'C' ? 'error' : 'primary'} onClick={() => handleThreatProgress(tIndex, aIndex, -1)} disabled={isConflictLoading}>
                                  <RemoveIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    /* Se NÃO houver conflito ativo, mostra a visão padrão */
                    <>
                      <Box sx={{ mb: 3 }}>
                         <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => setOpenConflictModal(true)}
                          fullWidth
                          sx={{ py: 1.5, fontSize: '1rem' }}
                          disabled={isConflictLoading} // Desativa se outra ação estiver em progresso
                        >
                          Preparar Conflito
                        </Button>
                      </Box>
                      
                      {/* MasterDiceRoller foi movido para cima */}

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          flexGrow: 1,
                        }}
                      >
                        <Typography
                          variant="h5"
                          gutterBottom
                          className={styles.columnTitle}
                        >
                          Anotações
                        </Typography>
                        <TextField
                          label="Minhas Anotações da Campanha"
                          multiline
                          rows={5}
                          // ... (resto das props do TextField)
                           fullWidth
                          variant="outlined"
                          value={masterNotes}
                          onChange={(e) => setMasterNotes(e.target.value)}
                          sx={{
                            mb: 2,
                            flexGrow: 1,
                            "& .MuiOutlinedInput-root": {
                              color: "white",
                              "& fieldset": {
                                borderColor: "rgba(255, 255, 255, 0.3)",
                              },
                              "&:hover fieldset": { borderColor: "#4c86ff" },
                            },
                          }}
                          InputProps={{ style: { color: "white" } }}
                          InputLabelProps={{ style: { color: "#a8b2d1" } }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveNotes}
                        >
                          Salvar Anotações
                        </Button>
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
             <Paper elevation={3} className={styles.playerViewPaper}>
              <Typography>Visão do Jogador - Em Construção</Typography>
            </Paper>
          )}
        </Box>
      </Paper>

      {/* Snackbar (Sem alterações) */}
       <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* ConflictTracker Modal (Agora chama handleStartConflict com API) */}
      <ConflictTracker
        open={openConflictModal}
        onClose={() => setOpenConflictModal(false)}
        onStartConflict={handleStartConflict} // Agora chama a função com API
      />
    </Box>
  );
};

export default CampaignSheet;