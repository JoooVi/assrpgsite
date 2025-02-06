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
import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";

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
        setLoading(true);
        setError(null);

        const response = await api.get(
          "https://assrpgsite-be-production.up.railway.app/api/characters",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setCharacters(response.data);
        } else {
          setCharacters([]);
        }
      } catch (error) {
        setError("Erro ao carregar a lista de personagens");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [user, token]);

  const generationTranslations = {
    preCollapse: "Pré-Colapso",
    postCollapse: "Pós-Colapso",
    collapse: "Colapso",
    current: "Atual",
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Você realmente deseja excluir este personagem?"
    );
    if (confirmDelete) {
      try {
        const response = await api.delete(
          `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  // Exibe uma mensagem caso o usuário não tenha personagens
  if (characters.length === 0) {
    return (
      <div className={styles.noCharacters}>
        <Typography variant="h6" component="div" className={styles.noCharactersText}>
          Vejo que você não tem nenhum personagem.
        </Typography>
        <Typography variant="body1" component="div" sx={{ marginBottom: "20px" }} className={styles.noCharactersText}>
          Gostaria de criar um personagem novo?
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
    );
  }

  return (
    <div className={styles.characterList}>
      <h1>Lista de Personagens</h1>
      <div className={styles.characterCards}>
        {characters.map((character) => {
          const avatarSvg = createAvatar(adventurerNeutral, {
            seed: character._id,
          }).toString();

          return (
            <Card key={character._id} className={styles.characterCard}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={`data:image/svg+xml;utf8,${encodeURIComponent(
                    avatarSvg
                  )}`}
                  alt={character.name}
                />
                <CardContent className={styles.cardContent}>
                  <Typography
                    variant="h6"
                    component="div"
                    className={styles.characterName}
                  >
                    {character.name}
                  </Typography>
                  <Typography variant="body2" component="p">
                    Geração: {generationTranslations[character.generation]}
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