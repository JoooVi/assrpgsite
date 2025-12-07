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
  CardMedia,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LoginIcon from "@mui/icons-material/Login";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

// --- ESTILOS CUSTOMIZADOS PARA MUI (OVERRIDE DARK THEME) ---
const darkModalStyle = {
  "& .MuiDialog-paper": {
    backgroundColor: "#121212",
    border: "1px solid #333",
    borderTop: "3px solid #8a1c18",
    color: "#fff",
    borderRadius: "2px",
    fontFamily: "Rajdhani, sans-serif",
  },
  "& .MuiDialogTitle-root": {
    fontFamily: "Orbitron, sans-serif",
    borderBottom: "1px solid #333",
  },
  "& .MuiDialogContent-root": {
    paddingTop: "20px !important",
  },
  "& .MuiInputLabel-root": { color: "#888", fontFamily: "Rajdhani" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff3333" },
  "& .MuiInputBase-root": { color: "#fff", fontFamily: "Rajdhani" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#888" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ff3333" },
  "& .MuiInput-underline:before": { borderBottomColor: "#444" },
  "& .MuiInput-underline:after": { borderBottomColor: "#ff3333" },
  "& .MuiSelect-icon": { color: "#fff" },
};

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
          const campaignsWithImages = response.data.map(campaign => {
             let imageUrl = campaign.coverImage ? `https://assrpgsite-be-production.up.railway.app/${campaign.coverImage.replace(/\\/g, '/')}` : null;
             if (campaign.coverImage && campaign.coverImage.startsWith('http')) {
                 imageUrl = campaign.coverImage;
             }
             return { ...campaign, coverImageUrl: imageUrl };
          });
          setCampaigns(campaignsWithImages);
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

  const fetchAvailableCharacters = async () => {
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
      setAvailableChars([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenJoinModal = () => {
     setOpenJoinModal(true);
    fetchAvailableCharacters();
  };

  const handleJoinCampaign = async () => {
     if (!inviteCode) {
      alert("Código obrigatório.");
      return;
    }
    const payload = { inviteCode };
    if (selectedChar) payload.characterId = selectedChar;

    try {
      await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/campaigns/join",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao entrar.");
    }
  };

  const handleDelete = async (id) => {
      if (window.confirm("CONFIRMAÇÃO NECESSÁRIA: Excluir registro de campanha permanentemente?")) {
      try {
        await axios.delete(`https://assrpgsite-be-production.up.railway.app/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        setError("Erro na exclusão.");
      }
    }
  };

  const actions = [
    {
      icon: <LoginIcon sx={{color: '#fff'}}/>,
      name: "Entrar com Código",
      handler: handleOpenJoinModal,
    },
    {
      icon: <NoteAddIcon sx={{color: '#fff'}}/>,
      name: "Iniciar Nova Campanha",
      handler: () => navigate("/create-campaign"),
    },
  ];

  if (loading) {
      return (
      <div className="loadingIndicator">
        <CircularProgress sx={{color: '#ff3333'}}/>
      </div>
    );
  }

  return (
    <>
      <div className="campaignList">
      {campaigns.length === 0 ? (
         <div className="noCampaigns">
          <div className="noCampaignsBox">
            <Typography variant="h5" className="noCampaignsText" style={{ fontFamily: 'Orbitron', fontWeight: 'bold' }}>
              NENHUMA MISSÃO ATIVA
            </Typography>
            <Typography variant="body1" className="noCampaignsText" style={{ color: '#aaa' }}>
              Utilize o menu tático (canto inferior direito) para criar ou ingressar em uma operação.
            </Typography>
          </div>
        </div>
      ) : (
          <>
            <h2>CAMPANHAS</h2>
            <div className="campaignCards">
                {campaigns.map((campaign, index) => (
                <article
                    key={campaign._id}
                    className="campaignCard"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <CardMedia
                        component="img"
                        className="campaignCardImage"
                        image={campaign.coverImageUrl || "https://images.unsplash.com/photo-1626262846282-e36214878a1a?q=80&w=1000&auto=format&fit=crop"} 
                        alt={campaign.name}
                    />
                    
                    <div className="contentPane">
                        <div className="campaignInfo">
                            <Typography className="campaignName">{campaign.name}</Typography>
                            
                            <div className="infoRow">
                                <span className="infoLabel">Assimilador</span>
                                <span className="infoValue">{campaign.masterName || "N/A"}</span>
                            </div>
                            <div className="infoRow">
                                <span className="infoLabel">Infectados</span>
                                <span className="infoValue">{campaign.playersCount || 0}</span>
                            </div>
                            <div className="infoRow" style={{borderBottom: 'none'}}>
                                <span className="infoLabel">Status</span>
                                <span className={campaign.status === 'finished' ? 'status-inactive' : 'status-active'}>
                                    {campaign.status === 'finished' ? 'ENCERRADA' : 'EM ANDAMENTO'}
                                </span>
                            </div>
                        </div>

                        <div className="cardActions">
                            <button
                                className="btn-open"
                                onClick={() => navigate(`/campaign-lobby/${campaign._id}`)}
                            >
                                ACESSAR
                            </button>
                            
                            {user && campaign.isMaster && (
                            <Tooltip title="Arquivar/Excluir">
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(campaign._id)}
                                >
                                <DeleteIcon fontSize="small" />
                                </button>
                            </Tooltip>
                            )}
                        </div>
                    </div>
                </article>
                ))}
            </div>
          </>
      )}
      </div>

      {/* SpeedDial (Menu Flutuante) Customizado */}
      <SpeedDial
         ariaLabel="Menu Tático"
        sx={{ 
            position: "fixed", 
            bottom: 30, 
            right: 30,
            '& .MuiSpeedDial-fab': {
                bgcolor: '#8a1c18',
                '&:hover': { bgcolor: '#ff3333' }
            }
        }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.handler}
            sx={{
                bgcolor: '#222',
                color: '#fff',
                '&:hover': { bgcolor: '#444' }
            }}
          />
        ))}
      </SpeedDial>

      {/* Modal de Join (Customizado via sx) */}
      <Dialog
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
        fullWidth
        maxWidth="xs"
        sx={darkModalStyle}
      >
         <DialogTitle>INGRESSAR EM OPERAÇÃO</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="inviteCode"
            label="CÓDIGO DE ACESSO"
            type="text"
            fullWidth
            variant="standard"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            sx={{ mb: 3, mt: 1 }}
          />
          <FormControl fullWidth variant="standard">
            <InputLabel id="select-character-label">SELECIONAR AGENTE (OPCIONAL)</InputLabel>
            <Select
              labelId="select-character-label"
              id="select-character"
              value={selectedChar}
              onChange={(e) => setSelectedChar(e.target.value)}
              disabled={modalLoading}
              MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a1a', color: '#fff' } } }}
            >
              <MenuItem value="">
                <em>Espectador / Apenas Entrar</em>
              </MenuItem>
              {modalLoading ? (
                <MenuItem disabled>Buscando registros...</MenuItem>
              ) : availableChars.length > 0 ? (
                availableChars.map((char) => (
                  <MenuItem key={char._id} value={char._id}>
                    {char.name} ({char.occupation})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Sem agentes disponíveis</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ padding: '20px', borderTop: '1px solid #333' }}>
          <Button onClick={() => setOpenJoinModal(false)} sx={{ color: '#888', fontFamily: 'Orbitron' }}>CANCELAR</Button>
          <Button onClick={handleJoinCampaign} variant="contained" sx={{ bgcolor: '#8a1c18', fontFamily: 'Orbitron', fontWeight: 'bold', '&:hover': { bgcolor: '#ff3333' } }}>
            CONFIRMAR
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignList;