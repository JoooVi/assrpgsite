import React, { useState } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";

const CharacteristicsModal = ({
  open,
  handleClose,
  title,
  items = [], // Características padrão
  homebrewItems = [], // Características personalizadas
  onItemSelect,
  onCreateNewHomebrew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);

  const { characterTraits, loading, error } = useSelector(
    (state) => state.characteristics
  );
  const user = useSelector((state) => state.auth.user);

  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Combinar características padrão e personalizadas
  const allCharacteristics = [
    ...items.map(item => ({ ...item, isCustom: false })), // Forçar flag isCustom
    ...homebrewItems.map(item => ({ ...item, isCustom: true })) // Garantir consistência
  ];

  // Combinar e filtrar características
  const filteredCharacteristics = allCharacteristics.filter(
    (char) => !char.isCustom || char.createdBy === user._id
  );

  // Aplicar filtro de busca
  const displayedCharacteristics = filteredCharacteristics.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 900,
            height: "80%",
            bgcolor: "#1e1e2f",
            borderRadius: "8px",
            p: 3,
            boxShadow: 24,
            color: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" mb={2}>
            {title}
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#292a3a",
                color: "white",
              },
            }}
          />

          <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
            {loading ? (
              <Typography>Carregando...</Typography>
            ) : displayedCharacteristics.length > 0 ? (
              displayedCharacteristics.map((item) => (
                <Accordion
                  key={item._id}
                  expanded={expanded === item._id}
                  onChange={handleAccordionChange(item._id)}
                  sx={{
                    bgcolor: "transparent",
                    color: "white",
                    mt: 1,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        color: "white",
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => onItemSelect(item)}
                      >
                        Adicionar
                      </Button>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      <strong>Descrição:</strong> {item.description}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Categoria:</strong> {item.category}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Pontos de Custo:</strong> {item.pointsCost}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Personalizado:</strong>{" "}
                      {item.isCustom ? "Sim" : "Não"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Criado por:</strong>{" "}
                      {item.createdBy?.name || "Sistema"}
                    </Typography>
                    <Divider sx={{ my: 1, bgcolor: "#444" }} />
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography>Nenhuma característica encontrada.</Typography>
            )}
          </Box>

          <Box sx={{ mt: "auto" }}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CharacteristicsModal;
