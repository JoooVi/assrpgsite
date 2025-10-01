import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  ListItemText,
  IconButton,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "./CampaignSheet.module.css"; // Mantenha .module.css
import CharacterPortraitOverview from "../components/CharacterPortraitOverview";
import MasterDiceRoller from "../components/MasterDiceRoller";
import RecentRollsFeed from "../components/RecentRollsFeed";

// ... (o resto do seu código, como a função translateKey, permanece o mesmo) ...

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

  const fetchMasterShieldData = useCallback(async () => {
    if (!token || !user) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    try {
      const [campaignRes, playersRes, rollsRes] = await Promise.all([
        axios.get(`https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/players-data`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/recent-rolls`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const masterId = campaignRes.data.master._id || campaignRes.data.master;
      const currentUserIsMaster = user._id === masterId;
      setIsMaster(currentUserIsMaster);

      if (!currentUserIsMaster) {
        setCampaign(campaignRes.data);
        setLoading(false);
        return;
      }

      setCampaign(campaignRes.data);
      setMasterNotes(campaignRes.data.notes || "");
      setPlayersData(playersRes.data);
      setRecentRolls(rollsRes.data);
    } catch (err) {
      console.error(
        "Falha ao carregar dados do escudo do mestre:",
        err.response?.data || err.message
      );
      setError("Falha ao carregar dados. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => {
    fetchMasterShieldData();
    const interval = setInterval(fetchMasterShieldData, 5000);
    return () => clearInterval(interval);
  }, [fetchMasterShieldData]);

  const handleSaveNotes = async () => {
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
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading)
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2, color: "white" }}>
          Carregando campanha...
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="error" sx={{ m: 3 }}>
          {error}
        </Alert>
      </Box>
    );

  if (!campaign)
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="warning" sx={{ m: 3 }}>
          Campanha não encontrada ou você não tem permissão para acessá-la.
        </Alert>
      </Box>
    );

  return (
    <Box className={styles.campaignSheet}>
      <Paper
        elevation={5}
        className={styles.mainContent}
        sx={{ backgroundColor: "rgba(16, 12, 29, 0.8)" }}
      >
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
              <Grid item xs={12} md={4} className={styles.shieldColumn}>
                <Paper
                  elevation={2}
                  className={styles.columnPaper}
                  sx={{ backgroundColor: "transparent" }} // Adicione a cor desejada aqui
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
                            {/* ===== INÍCIO DA CORREÇÃO ===== */}
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
                              <CharacterPortraitOverview
                                character={character}
                              />
                            </Box>
                            {/* ===== FIM DA CORREÇÃO ===== */}
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

              {/* COLUNA 2: Rolagens na Campanha */}
              <Grid item xs={12} md={4} className={styles.shieldColumn}>
                <Paper
                  elevation={2}
                  className={styles.columnPaper}
                  sx={{ backgroundColor: "transparent" }} // Adicione a cor desejada aqui
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

              {/* COLUNA 3: Ferramentas do Mestre (Dados e Anotações) */}
              <Grid item xs={12} md={4} className={styles.shieldColumn}>
                <Paper elevation={2} className={styles.columnPaper}>
                  {/* --- Seção de Rolar Dados --- */}
                  <Box sx={{ mb: 3 }}>
                    {" "}
                    {/* Adicionamos um espaçamento inferior */}
                    <Typography
                      variant="h5"
                      gutterBottom
                      className={styles.columnTitle}
                    >
                      Rolar Dados
                    </Typography>
                    <MasterDiceRoller campaignId={campaignId} />
                  </Box>

                  <Divider
                    sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.2)" }}
                  />

                  {/* --- Seção de Anotações --- */}
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
                      fullWidth
                      variant="outlined"
                      value={masterNotes}
                      onChange={(e) => setMasterNotes(e.target.value)}
                      sx={{
                        mb: 2,
                        flexGrow: 1, // Faz o campo de texto crescer
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
                </Paper>
              </Grid>
            </Grid>
          ) : (
            // Player's View (Permanece igual)
            <Paper elevation={3} className={styles.playerViewPaper}>
              {/* ... seu código para a visão do jogador ... */}
            </Paper>
          )}
        </Box>
      </Paper>

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
    </Box>
  );
};

export default CampaignSheet;
