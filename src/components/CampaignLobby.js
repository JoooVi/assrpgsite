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
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import api from "../api";

import "./CampaignLobby.css";

const CampaignLobby = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaster, setIsMaster] = useState(false);

  const [openCharModal, setOpenCharModal] = useState(false);
  const [availableChars, setAvailableChars] = useState([]);
  const [selectedChar, setSelectedChar] = useState("");

  const fetchCampaignData = useCallback(async () => {
    if (!token) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Simplificado para uma única chamada de API que busca tudo
      const campaignResponse = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCampaign(campaignResponse.data);
      setIsMaster(
        (campaignResponse.data.master._id || campaignResponse.data.master) ===
          user._id
      );
    } catch (err) {
      setError("Falha ao carregar os dados da campanha.");
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  const handleOpenCharModal = async () => {
    try {
      const res = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/characters/available",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailableChars(res.data);
      setOpenCharModal(true);
    } catch (err) {
      console.error(
        "Erro ao buscar personagens:",
        err.response?.data || err.message
      );
      alert("Erro ao buscar seus personagens disponíveis.");
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
    } catch (err) {
      console.error(
        "Erro ao adicionar personagem:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Erro ao adicionar o personagem.");
    }
  };

  const handleInvite = () => {
    if (campaign && campaign.inviteCode) {
      navigator.clipboard.writeText(campaign.inviteCode).then(
        () => {
          alert(
            `Código de Convite copiado para a área de transferência:\n\n${campaign.inviteCode}`
          );
        },
        () => {
          alert(
            `Não foi possível copiar. O código de convite é: ${campaign.inviteCode}`
          );
        }
      );
    } else {
      alert("Esta campanha não possui um código de convite.");
    }
  };

  // --- NOVA FUNÇÃO PARA REMOVER PERSONAGEM ---
  const handleRemoveCharacter = async (characterId, characterName) => {
    if (
      window.confirm(
        `Você tem certeza que deseja remover "${characterName}" da campanha?`
      )
    ) {
      try {
        await axios.post(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/remove-character`,
          { characterId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCampaignData(); // Recarrega os dados para atualizar a lista
      } catch (err) {
        alert(err.response?.data?.message || "Erro ao remover o personagem.");
      }
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="lobbyPageContainer">
      <div className="mainContent">
        <Grid container spacing={2} className="actionsGrid">
          {isMaster && (
            <Grid item className="actionsGridItem">
              <Button
                component={Link}
                to={`/campaign-sheet/${campaignId}`}
                variant="outlined"
                className="actionButton"
                startIcon={<ShieldIcon />}
              >
                Escudo do Mestre
              </Button>
            </Grid>
          )}
          <Grid item className="actionsGridItem">
            <Button
              onClick={handleOpenCharModal}
              variant="outlined"
              className="actionButton"
              startIcon={<PersonAddIcon />}
            >
              Adicionar Personagem
            </Button>
          </Grid>
          <Grid item className="actionsGridItem">
            <Button
              onClick={handleInvite}
              variant="outlined"
              className="actionButton"
              startIcon={<GroupAddIcon />}
            >
              Convidar Jogadores
            </Button>
          </Grid>
        </Grid>

        <div className="lobbyHeader">
          <Typography variant="h3" className="campaignName">
            {campaign?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {campaign?.description}
          </Typography>
        </div>
        <div className="characterSection">
          <Typography variant="h5" className="characterSectionTitle">
            Personagens na Campanha
          </Typography>
          <List>
            {campaign?.players &&
              campaign.players
                .filter((p) => p.character)
                .map((playerEntry) => {
                  const character = playerEntry.character;
                  const ownerName = playerEntry.user?.name || "Desconhecido";
                  const characterOwnerId = character.userId; // Acesso direto ao ID do dono

                  return (
                    <ListItem key={character._id} className="characterListItem">
                      <ListItemText
                        primary={character.name}
                        secondary={`Jogador: ${ownerName}`}
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Button
                          component={Link}
                          to={`/character-sheet/${character._id}`}
                          target="_blank"
                          variant="outlined"
                          size="small"
                          className="actionButton"
                        >
                          Ver Ficha
                        </Button>

                        <Tooltip title="Abrir Retrato para Live">
                          <IconButton
                            component={Link}
                            to={`/character-portrait/${character._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            sx={{ color: "#87CEFA" }} // Cor Azul Céu para diferenciar
                          >
                            <LiveTvIcon />
                          </IconButton>
                        </Tooltip>

                        {(isMaster || user._id === characterOwnerId) && (
                          <Tooltip title="Remover da Campanha">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRemoveCharacter(
                                  character._id,
                                  character.name
                                )
                              }
                              sx={{
                                color: "#ff8a8a",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 138, 138, 0.1)",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
            {campaign?.players?.filter((p) => p.character).length === 0 && (
              <ListItem>
                <ListItemText primary="Nenhum personagem na campanha ainda." />
              </ListItem>
            )}
          </List>
        </div>
      </div>

      <Dialog
        open={openCharModal}
        onClose={() => setOpenCharModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Selecione um Personagem</DialogTitle>
        <DialogContent>
          <List>
            {availableChars.length > 0 ? (
              availableChars.map((char) => (
                <ListItem
                  key={char._id}
                  secondaryAction={
                    <Button
                      edge="end"
                      onClick={() => handleAddCharacter(char._id)}
                    >
                      Adicionar
                    </Button>
                  }
                >
                  <ListItemText
                    primary={char.name}
                    secondary={char.occupation}
                  />
                </ListItem>
              ))
            ) : (
              <Typography>Você não possui personagens disponíveis.</Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCharModal(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CampaignLobby;