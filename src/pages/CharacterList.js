import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import "./CharacterList.css"; 
import { Button, Typography, CircularProgress, Tooltip, IconButton, Fab } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import AddIcon from "@mui/icons-material/Add";
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";
import { motion } from "framer-motion";

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vamos pegar o estado de autenticação também
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- LOG DE DEPURAÇÃO ---
  // Este log vai rodar toda vez que o componente renderizar
  console.log("CharacterList renderizou. Autenticado:", isAuthenticated, "Token:", !!token);

  useEffect(() => {
    const fetchCharacters = async () => {
      // Garantimos que temos um token antes de tentar buscar
      if (!token) {
        setLoading(false); // Se não há token, paramos o carregamento
        return;
      }
      
      // --- LOG DE DEPURAÇÃO ---
      console.log("useEffect disparado! Buscando personagens com o token...");

      try {
        setLoading(true);
        setError(null);
        const response = await api.get("https://assrpgsite-be-production.up.railway.app/api/characters", { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        setCharacters(response.data || []);
      } catch (error) {
        // Se o erro for 404 (nenhum personagem), não tratamos como um erro de falha
        if (error.response && error.response.status === 404) {
          setCharacters([]);
        } else {
          setError("Erro ao carregar a lista de personagens");
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    // Chamamos a função para buscar os personagens
    fetchCharacters();

  // A MUDANÇA PRINCIPAL ESTÁ AQUI:
  // O array de dependências agora observa o 'token'.
  // Quando o token muda de 'null' para um valor real após o login, este efeito será executado novamente.
  }, [token]);

  // ... (O resto do seu componente continua exatamente igual)
  const generationTranslations = {
    preCollapse: "Pré-Colapso",
    postCollapse: "Pós-Colapso",
    collapse: "Colapso",
    current: "Atual",
  };

  const handleDelete = async (id) => {
    if (window.confirm("Você realmente deseja excluir este personagem?")) {
      try {
        await api.delete(`https://assrpgsite-be-production.up.railway.app/api/characters/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setCharacters((prev) => prev.filter((c) => c._id !== id));
      } catch (error) {
        setError("Erro ao excluir o personagem");
      }
    }
  };

  if (loading) {
    return (
      <div className="loadingIndicator">
        <CircularProgress />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="noCharacters">
        <div className="noCharactersBox">
            <Typography
              variant="h5"
              component="div"
              className="noCharactersText"
              style={{ color: '#fff', fontFamily: "'Orbitron', sans-serif" }}
            >
              Nenhum Personagem Encontrado
            </Typography>
            <Typography
              variant="body1"
              component="div"
              sx={{ marginBottom: "20px" }}
              className="noCharactersText"
            >
              Gostaria de criar seu primeiro personagem?
            </Typography>
            <Button
              component={Link}
              to="/create"
              variant="contained"
              color="primary"
            >
              Criar Novo Personagem
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="characterList">
      <h1>Lista de Personagens</h1>
      <div className="characterCards">
        {characters.map((character, index) => {
          const avatarSvg = createAvatar(adventurerNeutral, { seed: character._id }).toString();
          return (
            <article key={character._id} className="dossierCard" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="avatarPane">
                <img src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} alt={character.name} className="avatarImage" />
              </div>
              <div className="contentPane">
                <div className="characterInfo">
                  <Typography variant="h5" component="h2" className="characterName">
                    {character.name}
                  </Typography>
                  <Typography variant="body2" className="infoText">
                    Geração: {generationTranslations[character.generation]}
                  </Typography>
                  <Typography variant="body2" className="infoText">
                    Ocupação: {character.occupation}
                  </Typography>
                </div>
                <div className="cardActions">
                  <Button variant="outlined" className="actionButton" onClick={() => navigate(`/character-sheet/${character._id}`)}>
                    Abrir ficha
                  </Button>
                  <Tooltip title="Abrir Retrato para Stream">
                    <IconButton size="small" sx={{ color: '#ffffff' }} component={Link} to={`/character-portrait/${character._id}`} target="_blank" rel="noopener noreferrer">
                      <LiveTvIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" className="deleteButton" onClick={() => handleDelete(character._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <motion.div className="fabContainer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <Fab color="primary" aria-label="add" component={Link} to="/create">
          <AddIcon />
        </Fab>
      </motion.div>
    </div>
  );
};

export default CharacterList;