import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./CharacterList.css"; 
import { Button, Typography, CircularProgress, Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import AddIcon from '@mui/icons-material/Add'; // Importando ícone de +
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";

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
          console.error("-> Token expirado, deslogar e logar novamente :b!! ", error);
          setError("Falha ao recuperar dados dos agentes.");
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
    if (window.confirm("CONFIRMAÇÃO NECESSÁRIA: Deseja eliminar permanentemente este registro?")) {
      try {
        await api.delete(`/characters/${id}`);
        setCharacters((prev) => prev.filter((c) => c._id !== id));
      } catch (error) {
        setError("Erro ao processar eliminação.");
      }
    }
  };

  const handlePortraitClick = (e) => {
    e.stopPropagation();
  }

  if (loading) {
    return (
      <div className="loadingIndicator" style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'100px', color:'white'}}>
        <CircularProgress sx={{color: '#ff3333'}} />
        <p style={{fontFamily: 'Rajdhani', marginTop: '20px'}}>CARREGANDO DADOS...</p>
      </div>
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
        <div className="noCharactersBox">
            <Typography variant="h4" component="div" sx={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 700, mb: 1 }}>
              NENHUM AGENTE
            </Typography>
            <Typography variant="body1" component="div" sx={{ color: '#aaa', fontFamily: 'Rajdhani', mb: 4, fontSize: '1.1rem' }}>
              Não há registros ativos neste terminal. Inicie um novo protocolo de recrutamento.
            </Typography>
            <Button 
              component={Link} 
              to="/create" 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={neroButtonStyle}
            >
              RECRUTAR NOVO AGENTE
            </Button>
        </div>
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