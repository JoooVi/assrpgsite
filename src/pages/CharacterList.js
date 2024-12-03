import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import styles from "./CharacterList.module.css";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { createAvatar } from '@dicebear/core';
import { adventurerNeutral } from '@dicebear/collection';

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;

    const fetchCharacters = async () => {
      try {
        const response = await api.get("/characters", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCharacters(response.data);
        setLoading(false);
      } catch (error) {
        setError("Erro ao carregar a lista de personagens");
        setLoading(false);
        console.error(error);
      }
    };

    fetchCharacters();
  }, [user, token]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Você realmente deseja excluir este personagem?"
    );
    if (confirmDelete) {
      try {
        const response = await api.delete(`/characters/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setCharacters((prevCharacters) =>
            prevCharacters.filter((character) => character._id !== id)
          );
        } else {
          setError("Erro ao excluir o personagem");
        }
      } catch (error) {
        setError("Erro ao excluir o personagem");
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingIndicator}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.characterList}>
      <h1>Lista de Personagens</h1>
      <div className={styles.characterCards}>
        {characters.map((character) => {
          const avatarSvg = createAvatar(adventurerNeutral, {
            seed: character._id
          }).toString();

          return (
            <Card key={character._id} className={styles.characterCard}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`}
                  alt={character.name}
                />
                <CardContent className={styles.cardContent}>
                  <Typography variant="h6" component="div" className={styles.characterName}>
                    {character.name}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Geração: {character.generation}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Ocupação: {character.occupation}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions className={styles.cardActions}>
                <Button
                  size="small"
                  onClick={() => navigate(`/character-sheet/${character._id}`)}
                >
                  Abrir Ficha
                </Button>
                <Tooltip title="Excluir">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(character._id)}
                    className={styles.deleteButton}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          );
        })}
      </div>
      <div className={styles.createCharacter}>
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
};

export default CharacterList;