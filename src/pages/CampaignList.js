import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./CampaignList.css";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Fab,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { motion } from "framer-motion";

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  // Estados para o modal
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedChar, setSelectedChar] = useState("");
  const [availableChars, setAvailableChars] = useState([]);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          "http://localhost:5000/api/campaigns",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setCampaigns(response.data);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        setError("Erro ao carregar a lista de campanhas.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [user, token]);

  const handleOpenJoinModal = async () => {
    try {
      // --- CORREÇÃO AQUI: URL completa para a chamada da API ---
      const res = await axios.get(
        "http://localhost:5000/api/characters/available",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailableChars(res.data);
      setOpenJoinModal(true);
    } catch (err) {
      console.error("Erro ao buscar personagens:", err);
      alert(
        "Erro ao buscar seus personagens. Você precisa ter personagens disponíveis para entrar em uma campanha."
      );
    }
  };

  const handleJoinCampaign = async () => {
    if (!inviteCode || !selectedChar) {
      alert(
        "Por favor, preencha o código de convite e selecione um personagem."
      );
      return;
    }
    try {
      // --- CORREÇÃO AQUI: URL completa para a chamada da API ---
      await axios.post(
        "http://localhost:5000/api/campaigns/join",
        {
          inviteCode: inviteCode,
          characterId: selectedChar,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Erro ao tentar entrar na campanha."
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Você realmente deseja excluir esta campanha? Esta ação é irreversível."
      )
    ) {
      try {
        // --- CORREÇÃO AQUI: URL completa para a chamada da API ---
        await axios.delete(`http://localhost:5000/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        setError("Erro ao excluir a campanha.");
      }
    }
  };

  const actions = [
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
    return (
      <div className="loadingIndicator">
        <CircularProgress />
      </div>
    );
  }

  if (!loading && campaigns.length === 0) {
    return (
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
            Você pode criar uma nova campanha ou juntar-se a uma existente com
            um código de convite.
          </Typography>
          <Box
            sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}
          >
            <Button
              onClick={() => navigate("/create-campaign")}
              variant="contained"
              color="primary"
            >
              Criar Campanha
            </Button>
            <Button onClick={handleOpenJoinModal} variant="outlined">
              Entrar com Código
            </Button>
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="campaignList">
      <h2>Suas Campanhas</h2>

      <div className="campaignCards">
        {campaigns.map((campaign, index) => (
          <article
            key={campaign._id}
            className="campaignCard"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="contentPane">
              <div className="campaignInfo">
                <Typography
                  variant="h5"
                  component="h2"
                  className="campaignName"
                >
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

      <SpeedDial
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
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        fullWidth
        maxWidth="xs"
      >
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
              Escolha seu Personagem
            </InputLabel>
            <Select
              labelId="select-character-label"
              id="select-character"
              value={selectedChar}
              label="Escolha seu Personagem"
              onChange={(e) => setSelectedChar(e.target.value)}
            >
              {availableChars.length > 0 ? (
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
    </div>
  );
};

export default CampaignList;