import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import {
  Inventory as ItemIcon,
  Psychology as TraitIcon,
  Whatshot as AssimilationIcon,
} from "@mui/icons-material";

const SharedHomebrew = () => {
  const { id } = useParams();
  const [homebrewData, setHomebrewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/shared/${id}`
        );
        setHomebrewData(response.data);
      } catch (error) {
        console.error("Erro ao carregar homebrew:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddToProfile = async () => {
    try {
      await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/shared/${id}/add-to-profile`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Adicionado ao perfil com sucesso!");
    } catch (error) {
      alert("Erro ao adicionar. Tente novamente.");
    }
  };

  const renderIcon = () => {
    switch (homebrewData?.type) {
      case "item":
        return <ItemIcon sx={{ fontSize: 40, color: "#1976d2" }} />;
      case "trait":
        return <TraitIcon sx={{ fontSize: 40, color: "#1976d2" }} />;
      case "assimilation":
        return <AssimilationIcon sx={{ fontSize: 40, color: "#1976d2" }} />;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          Carregando...
        </Typography>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          border: "1px solid #252d44",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          {renderIcon()}
          <Typography variant="h4" sx={{ color: "#1565c0" }}>
            {homebrewData?.data?.name}
          </Typography>
        </Stack>

        <Box
          sx={{
            bgcolor: "#f5f5f5",
            p: 3,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#252d44" }}>
            Detalhes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {homebrewData?.type === "assimilation" && (
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                <Chip
                  label={`Custo de Sucesso: ${homebrewData.data.successCost}`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  label={`Custo de Adaptação: ${homebrewData.data.adaptationCost}`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  label={`Pressão: ${homebrewData.data.pressureCost}`}
                  color="info"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="body1">
                <strong>Tipo de Evolução:</strong>{" "}
                {homebrewData.data.evolutionType}
              </Typography>
              <Typography variant="body1">
                <strong>Descrição:</strong> {homebrewData.data.description}
              </Typography>
            </Stack>
          )}
          {homebrewData?.type === "item" && (
            <Stack spacing={1}>
              <Chip
                label={`Categoria: ${homebrewData.data.category}`}
                variant="outlined"
              />
              <Typography variant="body1">
                <strong>Descrição:</strong> {homebrewData.data.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Peso: {homebrewData.data.weight}kg | Durabilidade:{" "}
                {homebrewData.data.durability}
              </Typography>
            </Stack>
          )}
          {homebrewData?.type === "trait" && (
            <Stack spacing={1}>
              <Chip
                label={`Custo em Pontos: ${homebrewData.data.pointsCost}`}
                variant="outlined"
              />
              <Typography variant="body1">
                <strong>Efeito Principal:</strong>{" "}
                {homebrewData.data.description}
              </Typography>
            </Stack>
          )}
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleAddToProfile}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            fontSize: "1rem",
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Adicionar ao Meu Perfil
        </Button>
      </Paper>
    </Container>
  );
};

export default SharedHomebrew;