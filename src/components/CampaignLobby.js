import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Box,
  Typography,
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
  Tooltip,
  IconButton,
  Snackbar, // Adicionado
  Fade,     // Adicionad
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import { styled } from '@mui/material/styles'; // Adicionado

import "./CampaignLobby.css"; // Mantém o CSS

// Estilo para input escondido
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Define o caminho para uma imagem padrão (SUBSTITUA PELO SEU CAMINHO REAL)
const DEFAULT_COVER_IMAGE = "/images/default-campaign-cover.jpg";

const CampaignLobby = () => {
  const { id: campaignId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  const [openCharModal, setOpenCharModal] = useState(false);
  const [availableChars, setAvailableChars] = useState([]);

  // Estados e Ref para upload da capa
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [showEditButton, setShowEditButton] = useState(false);

  const fetchCampaignData = useCallback(async () => {
    if (!token) {
      setError("Autenticação necessária.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const campaignResponse = await axios.get(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const campaignData = campaignResponse.data;
      setCampaign(campaignData);
      // Verificação segura do ID do mestre
      setIsMaster(user && campaignData.master && (campaignData.master._id || campaignData.master) === user._id);

      // Construir a URL da imagem
      let imageUrl = null;
      if (campaignData.coverImage) {
        if (campaignData.coverImage.startsWith('http')) {
          imageUrl = campaignData.coverImage;
        } else {
          // Ajusta a base da URL se necessário
          imageUrl = `https://assrpgsite-be-production.up.railway.app/${campaignData.coverImage.replace(/\\/g, '/')}`;
        }
      }
      setCoverImageUrl(imageUrl || DEFAULT_COVER_IMAGE);

    } catch (err) {
      setError("Falha ao carregar os dados da campanha.");
      console.error("Erro fetchCampaignData:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [campaignId, user, token]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  // Função para lidar com a seleção e upload da nova imagem da capa
  const handleCoverImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = null; // Reset input
    setIsUploading(true);
    setSnackbarOpen(false);

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      const response = await axios.put(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/cover`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let newImageUrl = response.data.coverImage;
      if (newImageUrl && !newImageUrl.startsWith('http')) {
         newImageUrl = `https://assrpgsite-be-production.up.railway.app/${newImageUrl.replace(/\\/g, '/')}`;
      }
      setCoverImageUrl(newImageUrl || DEFAULT_COVER_IMAGE);

      setSnackbarMessage("Capa da campanha atualizada com sucesso!");
      setSnackbarSeverity("success");

    } catch (err) {
      console.error("Erro ao atualizar a capa:", err.response?.data || err.message);
      setSnackbarMessage(err.response?.data?.message || "Erro ao atualizar a capa.");
      setSnackbarSeverity("error");
    } finally {
      setIsUploading(false);
      setSnackbarOpen(true);
    }
  };

  // Aciona o clique no input escondido
  const handleEditCoverClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fecha o Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Abre modal para adicionar personagem
  const handleOpenCharModal = async () => {
     try {
      const res = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/characters/available",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableChars(res.data);
      setOpenCharModal(true);
    } catch (err) {
      console.error("Erro ao buscar personagens:", err.response?.data || err.message);
      alert("Erro ao buscar seus personagens disponíveis.");
    }
  };

  // Adiciona personagem à campanha
  const handleAddCharacter = async (characterId) => {
     try {
      await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/add-character`,
        { characterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenCharModal(false);
      fetchCampaignData(); // Recarrega dados
    } catch (err) {
      console.error("Erro ao adicionar personagem:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Erro ao adicionar o personagem.");
    }
  };

  // Copia código de convite
  const handleInvite = () => {
      if (campaign?.inviteCode) {
      navigator.clipboard.writeText(campaign.inviteCode).then(
        () => alert(`Código de Convite copiado:\n\n${campaign.inviteCode}`),
        () => alert(`Não foi possível copiar. O código é: ${campaign.inviteCode}`)
      );
    } else {
      alert("Esta campanha não possui um código de convite.");
    }
  };

  // Remove personagem da campanha
  const handleRemoveCharacter = async (characterId, characterName) => {
      if (window.confirm(`Remover "${characterName}" da campanha?`)) {
      try {
        await axios.post(
          `https://assrpgsite-be-production.up.railway.app/api/campaigns/${campaignId}/remove-character`,
          { characterId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCampaignData(); // Recarrega dados
      } catch (err) {
        alert(err.response?.data?.message || "Erro ao remover o personagem.");
      }
    }
  };

  // Renderização condicional para loading, erro e campanha não encontrada
  if (loading) return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <CircularProgress />
      </Box>
  );
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!campaign) return <Alert severity="warning" sx={{ m: 3 }}>Campanha não encontrada.</Alert>;

  // Renderização principal
  return (
    <div className="lobbyPageContainer">
      <div className="mainContent">
        {/* Grid de Ações */}
        <Grid container spacing={1} className="actionsGrid">
           {isMaster && (
            <Grid item className="actionsGridItem">
              <Button component={Link} to={`/campaign-sheet/${campaignId}`} variant="outlined" className="actionButton" startIcon={<ShieldIcon />}>
                Escudo do Mestre
              </Button>
            </Grid>
          )}
          <Grid item className="actionsGridItem">
            <Button onClick={handleOpenCharModal} variant="outlined" className="actionButton" startIcon={<PersonAddIcon />}>
              Adicionar Personagem
            </Button>
          </Grid>
          <Grid item className="actionsGridItem">
            <Button onClick={handleInvite} variant="outlined" className="actionButton" startIcon={<GroupAddIcon />}>
              Convidar Jogadores
            </Button>
          </Grid>
        </Grid>

        {/* Header com Imagem Editável */}
        <div className="lobbyHeader">
          {/* Container da Imagem */}
          {coverImageUrl && (
            <Box
              className="lobbyCoverImageContainer"
              onMouseEnter={() => setShowEditButton(true)}
              onMouseLeave={() => setShowEditButton(false)}
            >
              <Box component="img" src={coverImageUrl} alt={`Capa da campanha ${campaign.name}`} className="lobbyCoverImage" />
              <VisuallyHiddenInput type="file" ref={fileInputRef} onChange={handleCoverImageChange} accept="image/*" disabled={isUploading} />
              {isMaster && (
                  <Fade in={showEditButton || isUploading} timeout={300}>
                      <IconButton className="editCoverButton" onClick={handleEditCoverClick} disabled={isUploading} aria-label="Alterar imagem da capa">
                          {isUploading ? <CircularProgress size={24} color="inherit" /> : <EditIcon />}
                      </IconButton>
                  </Fade>
              )}
            </Box>
          )}
          {/* Nome e Descrição */}
          <Typography variant="h3" className="campaignName"> {campaign.name} </Typography>
          <Typography variant="subtitle1" sx={{ color: '#b0c4de !important' }}> {campaign.description} </Typography>
        </div>

        {/* Seção de Personagens */}
        <div className="characterSection">
          <Typography variant="h5" className="characterSectionTitle"> Personagens na Campanha </Typography>
          <List>
            {campaign.players && campaign.players.filter(p => p.character).length > 0 ? (
                campaign.players.filter(p => p.character).map((playerEntry) => {
                  const character = playerEntry.character;
                  const ownerName = playerEntry.user?.name || "Jogador Desconhecido";
                  const characterOwnerId = character?.userId;

                  if (!character?._id) return null; // Pula se personagem inválido

                  return (
                    <ListItem key={character._id} className="characterListItem">
                      <ListItemText primary={character.name || "Nome Indefinido"} secondary={`Jogador: ${ownerName}`} />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: 'wrap' }}> {/* Adicionado flexWrap */}
                         <Button component={Link} to={character._id ? `/character-sheet/${character._id}` : '#'} target="_blank" variant="outlined" size="small" className="actionButton" disabled={!character._id}>
                          Ver Ficha
                        </Button>
                        <Tooltip title="Abrir Retrato para Live">
                          <IconButton component={Link} to={character._id ? `/character-portrait/${character._id}` : '#'} target="_blank" rel="noopener noreferrer" size="small" sx={{ color: "#87CEFA" }} disabled={!character._id}>
                            <LiveTvIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                        {(isMaster || (user && characterOwnerId && user._id === characterOwnerId)) && (
                          <Tooltip title="Remover da Campanha">
                            <IconButton size="small" onClick={() => handleRemoveCharacter(character._id, character.name || "Personagem")} sx={{ color: "#ff8a8a", "&:hover": { backgroundColor: "rgba(255, 138, 138, 0.1)", }, }} disabled={!character._id}>
                              <DeleteIcon fontSize="small"/>
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>
                  );
                })
            ) : (
              <ListItem>
                <ListItemText primary="Nenhum personagem adicionado à campanha ainda." sx={{ color: '#a8b2d1', fontStyle: 'italic' }}/>
              </ListItem>
            )}
          </List>
        </div>
      </div> {/* Fim do mainContent */}

      {/* Modal Adicionar Personagem */}
      <Dialog open={openCharModal} onClose={() => setOpenCharModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>Selecione um Personagem</DialogTitle>
        <DialogContent>
          <List>
            {availableChars.length > 0 ? (
              availableChars.map((char) => (
                <ListItem key={char._id} secondaryAction={ <Button edge="end" onClick={() => handleAddCharacter(char._id)} variant="contained" size="small"> Adicionar </Button> } sx={{ paddingRight: '96px' }}>
                  <ListItemText primary={char.name} secondary={char.occupation || "Sem ocupação"} />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary', p: 2 }}> Você não possui personagens disponíveis fora de campanhas. </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCharModal(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div> // Fim do lobbyPageContainer
  );
};

export default CampaignLobby;