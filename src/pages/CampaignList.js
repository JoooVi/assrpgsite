import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./CampaignList.css"; // Mantém o teu CSS existente
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  // --- NOVO: Import CardMedia para a imagem ---
  CardMedia,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LoginIcon from "@mui/icons-material/Login";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedChar, setSelectedChar] = useState("");
  const [availableChars, setAvailableChars] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    // ... (fetchCampaigns permanece igual) ...
     if (!user || !token) {
      setLoading(false);
      return;
    }
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          "https://assrpgsite-be-production.up.railway.app/api/campaigns",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          // --- Mapeia para construir a URL completa da imagem ---
          const campaignsWithImages = response.data.map(campaign => {
             // Assumindo que o backend retorna o caminho relativo como 'uploads/covers/nome-arquivo.jpg'
             // E o teu servidor está configurado para servir a pasta 'uploads' estaticamente
             // ou que o caminho já é uma URL completa (ex: Cloudinary)
             let imageUrl = campaign.coverImage ? `https://assrpgsite-be-production.up.railway.app/${campaign.coverImage.replace(/\\/g, '/')}` : null; // Constrói URL completa

             // Se o caminho já for uma URL completa (começa com http), usa diretamente
             if (campaign.coverImage && campaign.coverImage.startsWith('http')) {
                 imageUrl = campaign.coverImage;
             }

             return { ...campaign, coverImageUrl: imageUrl };
          });
          setCampaigns(campaignsWithImages);
          // --- Fim do mapeamento ---
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        setError("Erro ao carregar a lista de campanhas.");
        console.error("Erro fetchCampaigns:", error); // Log do erro
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [user, token]);

  const fetchAvailableCharacters = async () => {
    // ... (fetchAvailableCharacters permanece igual) ...
      setModalLoading(true);
    try {
      const res = await axios.get(
        "https://assrpgsite-be-production.up.railway.app/api/characters/available",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailableChars(res.data);
    } catch (err) {
      console.error("Não foi possível buscar personagens (isso é normal se o usuário não tiver nenhum):", err);
      setAvailableChars([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenJoinModal = () => {
    // ... (handleOpenJoinModal permanece igual) ...
     setOpenJoinModal(true);
    fetchAvailableCharacters();
  };

  const handleJoinCampaign = async () => {
    // ... (handleJoinCampaign permanece igual) ...
     if (!inviteCode) {
      alert("Por favor, preencha o código de convite.");
      return;
    }

    const payload = {
      inviteCode: inviteCode,
    };

    if (selectedChar) {
      payload.characterId = selectedChar;
    }

    try {
      await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/campaigns/join",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Recarrega a página para atualizar a lista (pode ser melhorado com state update)
      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Erro ao tentar entrar na campanha."
      );
    }
  };

  const handleDelete = async (id) => {
    // ... (handleDelete permanece igual) ...
      if (
      window.confirm(
        "Você realmente deseja excluir esta campanha? Esta ação é irreversível."
      )
    ) {
      try {
        await axios.delete(`https://assrpgsite-be-production.up.railway.app/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        setError("Erro ao excluir a campanha.");
      }
    }
  };

  const actions = [
    // ... (actions permanece igual) ...
      {
      icon: <LoginIcon />,
      name: "Entrar em uma Campanha",
      handler: handleOpenJoinModal,
    },
    {
      icon: <NoteAddIcon />,
      name: "Criar Nova Campanha",
      handler: () => navigate("/create-campaign"),
    },
  ];

  if (loading) {
    // ... (loading JSX permanece igual) ...
      return (
      <div className="loadingIndicator">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      {campaigns.length === 0 ? (
        // ... (noCampaigns JSX permanece igual) ...
         <div className="noCampaigns">
          <div className="noCampaignsBox">
            <Typography
              variant="h5"
              component="div"
              className="noCampaignsText"
              style={{ color: "#fff", fontFamily: "'Orbitron', sans-serif" }}
            >
              Nenhuma Campanha Encontrada
            </Typography>
            <Typography
              variant="body1"
              component="div"
              sx={{ marginBottom: "20px" }}
              className="noCampaignsText"
            >
              Use o menu de ações para criar uma nova campanha ou juntar-se a uma existente.
            </Typography>
          </div>
        </div>
      ) : (
        // --- LISTA DE CAMPANHAS ATUALIZADA ---
        <div className="campaignList">
          <h2>Suas Campanhas</h2>
          <div className="campaignCards">
            {campaigns.map((campaign, index) => (
              <article
                key={campaign._id}
                className="campaignCard" // A classe CSS existente fará o estilo base
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* --- ADIÇÃO: Imagem da Capa --- */}
                {/* Usamos CardMedia para a imagem */}
                <CardMedia
                  component="img"
                  className="campaignCardImage" // Adiciona uma classe para estilizar
                  image={campaign.coverImageUrl || "/path/to/default-campaign-image.jpg"} // Usa a URL construída ou uma imagem padrão
                  alt={`Capa da campanha ${campaign.name}`}
                  // sx opcional para altura ou object-fit se necessário no CSS
                   sx={{ height: 140, objectFit: 'cover' }} // Exemplo de altura fixa
                />
                {/* --- FIM DA ADIÇÃO --- */}

                {/* O conteúdo original do card (informações e ações) */}
                <div className="contentPane">
                  <div className="campaignInfo">
                    <Typography variant="h5" component="h2" className="campaignName">
                      {campaign.name}
                    </Typography>
                    <Typography variant="body2" className="infoText">
                      Mestre: {campaign.masterName || "Desconhecido"}
                    </Typography>
                    <Typography variant="body2" className="infoText">
                      Jogadores: {campaign.playersCount || 0}
                    </Typography>
                    <Typography variant="body2" className="infoText">
                      Status: {campaign.status || "Ativa"}
                    </Typography>
                  </div>
                  <div className="cardActions">
                    <Button
                      variant="outlined"
                      className="actionButton"
                      onClick={() => navigate(`/campaign-lobby/${campaign._id}`)}
                    >
                      Abrir Campanha
                    </Button>
                    {user && campaign.isMaster && (
                      <Tooltip title="Excluir Campanha">
                        <IconButton
                          size="small"
                          className="deleteButton"
                          onClick={() => handleDelete(campaign._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        // --- FIM DA LISTA ATUALIZADA ---
      )}

      {/* SpeedDial e Modal permanecem iguais */}
      <SpeedDial
        // ... props ...
         ariaLabel="Menu de Ações da Campanha"
        sx={{ position: "fixed", bottom: 30, right: 30 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.handler}
          />
        ))}
      </SpeedDial>

      <Dialog
        // ... props ...
         open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        fullWidth
        maxWidth="xs"
      >
        {/* ... Conteúdo do Modal ... */}
         <DialogTitle>Juntar-se a uma Campanha</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="inviteCode"
            label="Código de Convite"
            type="text"
            fullWidth
            variant="standard"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth>
            <InputLabel id="select-character-label">
              Escolha seu Personagem (Opcional)
            </InputLabel>
            <Select
              labelId="select-character-label"
              id="select-character"
              value={selectedChar}
              label="Escolha seu Personagem (Opcional)"
              onChange={(e) => setSelectedChar(e.target.value)}
              disabled={modalLoading}
            >
              <MenuItem value="">
                <em>Nenhum - Entrar sem personagem</em>
              </MenuItem>
              {modalLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                  <span style={{ marginLeft: "10px" }}>Carregando...</span>
                </MenuItem>
              ) : availableChars.length > 0 ? (
                availableChars.map((char) => (
                  <MenuItem key={char._id} value={char._id}>
                    {char.name} ({char.occupation || "Sem ocupação"})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  Você não tem personagens disponíveis
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinModal(false)}>Cancelar</Button>
          <Button onClick={handleJoinCampaign} variant="contained">
            Entrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignList;