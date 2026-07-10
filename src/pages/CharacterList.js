import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./CharacterList.css"; 
import { Button, Typography, Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import AddIcon from '@mui/icons-material/Add'; // Importando ícone de +
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import { dispatchToast } from "../components/notifications/ToastProvider";
import PageLoader from "../components/ui/PageLoader";
import EmptyState from "../components/ui/EmptyState";

// Estilo padrão para botões vermelhos da Nero
const neroButtonStyle = {
  backgroundColor: '#8a1c18', 
  color: '#fff', 
  fontFamily: 'Orbitron, sans-serif',
  fontWeight: 'bold',
  letterSpacing: '1px',
  padding: '10px 24px',
  borderRadius: '2px', // Cantos mais quadrados
  border: '1px solid #8a1c18',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  '&:hover': { 
    backgroundColor: '#67110e', 
    boxShadow: '0 0 15px rgba(138, 28, 24, 0.6)',
    borderColor: '#ff3333'
  }
};

const CharacterList = () => {
  const [characters, setCharacters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/characters"); 
        setCharacters(response.data || []);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setCharacters([]);
        } else {
          console.error("Erro ao carregar personagens:", error);
          setError("Não foi possível carregar seus personagens.");
          dispatchToast({ message: "Erro ao carregar personagens.", type: "error" });
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchCharacters();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    const confirmed = await confirm({
      title: "Excluir agente",
      message: "Deseja eliminar permanentemente este registro?",
      tone: "danger",
      confirmLabel: "Excluir",
    });
    if (confirmed) {
      try {
        await api.delete(`/characters/${id}`);
        setCharacters((prev) => prev.filter((c) => c._id !== id));
        dispatchToast({ message: "Agente excluído.", type: "success" });
      } catch (error) {
        setError("Erro ao processar exclusão.");
        dispatchToast({ message: "Erro ao excluir agente.", type: "error" });
      }
    }
  };

  const handlePortraitClick = (e) => {
    e.stopPropagation();
  }

  if (loading) {
    return (
      <PageLoader title="Carregando agentes" subtitle="Sincronizando registros de personagens..." />
    );
  }

  if (error) {
    return <div className="noCharacters"><Typography variant="h5" color="error" sx={{fontFamily: 'Orbitron'}}>{error}</Typography></div>;
  }
  
  if (characters === null) {
      return (
          <div className="noCharacters">
              <Typography variant="h5" sx={{color: '#fff', fontFamily: 'Orbitron'}}>AGUARDANDO CREDENCIAIS...</Typography>
          </div>
      )
  }
  
  if (characters.length === 0) {
    return (
      <div className="noCharacters">
        <EmptyState
          title="Nenhum agente"
          description="Nao ha registros ativos neste terminal. Inicie um novo protocolo de recrutamento."
          action={(
            <Button
              component={Link}
              to="/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={neroButtonStyle}
            >
              RECRUTAR NOVO AGENTE
            </Button>
          )}
        />
      </div>
    );
  }

  return (
    <div className="characterListContainer">
      <div className="listHeader">
        <h1>AGENTES <span>ATIVOS</span></h1>
        <Button 
          component={Link} 
          to="/create" 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={neroButtonStyle}
        >
          RECRUTAR
        </Button>
      </div>
      
      <div className="characterGrid">
        {characters.map((character, index) => {
          
          const avatarSvg = createAvatar(adventurerNeutral, { seed: character._id }).toString();
          const avatarSrc = character.avatar || `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;

          return (
            <article 
              key={character._id} 
              className="characterCard" 
              style={{ animationDelay: `${index * 0.1}s` }} 
              onClick={() => navigate(`/character-sheet/${character._id}`)}
            >
              <div className="cardImageContainer">
                <img src={avatarSrc} alt={character.name} className="cardImage" />
              </div>
              
              <div className="cardInfo">
                <h2 className="characterName">{character.name}</h2>
                <p className="characterSubtitle">
                  {character.occupation || "CLASSE DESCONHECIDA"}
                </p>
              </div>

              <div className="cardHoverActions">
                 <Tooltip title="Portrait live" arrow placement="left">
                  <IconButton 
                      size="small" 
                      className="actionIcon" 
                      component={Link} 
                      to={`/character-portrait/${character._id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={handlePortraitClick}
                  >
                    <LiveTvIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Eliminar Registro" arrow placement="left">
                  <IconButton size="small" className="actionIcon" onClick={(e) => handleDelete(e, character._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterList;
