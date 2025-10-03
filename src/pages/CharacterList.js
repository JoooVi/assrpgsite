// Arquivo: CharacterList.js (Atualizado para remover o "Nível 1")

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./CharacterList.css"; 
import { Button, Typography, CircularProgress, Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";

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
          console.error("-> ERRO na busca de personagens:", error);
          setError("Erro ao carregar a lista de personagens");
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
    if (window.confirm("Você realmente deseja excluir este personagem?")) {
      try {
        await api.delete(`/characters/${id}`);
        setCharacters((prev) => prev.filter((c) => c._id !== id));
      } catch (error) {
        setError("Erro ao excluir o personagem");
      }
    }
  };

  const handlePortraitClick = (e) => {
    e.stopPropagation();
  }

  if (loading) {
    return <div className="loadingIndicator"><CircularProgress /></div>;
  }

  if (error) {
    return <div className="noCharacters"><Typography variant="h5" color="error">{error}</Typography></div>;
  }
  
  if (characters === null) {
      return (
          <div className="noCharacters">
              <Typography variant="h5">Aguardando autenticação...</Typography>
          </div>
      )
  }
  
  if (characters.length === 0) {
    return (
      <div className="noCharacters">
        <div className="noCharactersBox">
            <Typography variant="h5" component="div" className="noCharactersText">
              Nenhum Personagem Encontrado
            </Typography>
            <Typography variant="body1" component="div" sx={{ marginBottom: "20px" }} className="noCharactersText">
              Gostaria de criar seu primeiro personagem?
            </Typography>
            <Button component={Link} to="/create" variant="contained" color="primary">
              Criar Novo Personagem
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="characterListContainer">
      <div className="listHeader">
        <h1>Meus Personagens</h1>
        <Button component={Link} to="/create" variant="contained" color="primary">
          + Criar Novo Personagem
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
              style={{ animationDelay: `${index * 0.07}s` }} 
              onClick={() => navigate(`/character-sheet/${character._id}`)}
            >
              <div className="cardImageContainer">
                <img src={avatarSrc} alt={character.name} className="cardImage" />
              </div>
              <div className="cardInfo">
                <h2 className="characterName">{character.name}</h2>
                {/* LINHA ALTERADA ABAIXO */}
                <p className="characterSubtitle">{character.occupation}</p>
              </div>
              <div className="cardHoverActions">
                <Tooltip title="Excluir">
                  <IconButton size="small" className="actionIcon" onClick={(e) => handleDelete(e, character._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                 <Tooltip title="Abrir Retrato para Stream">
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
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterList;