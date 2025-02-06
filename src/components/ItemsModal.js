import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../redux/slices/itemsSlice";

const ItemsModal = ({
  open,
  handleClose,
  title = "Itens",
  onItemSelect,
  onCreateNewHomebrew,
}) => {
  const dispatch = useDispatch();
  const {
    items: itemItems,
    loading,
    error,
  } = useSelector((state) => state.items);
  const user = useSelector((state) => state.auth.user);

  // Estados e funções de controle
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);

  // Função para buscar itens quando o modal é aberto
  // ItemsModal.js (dentro do useEffect)
  useEffect(() => {
    if (open) {
      dispatch(fetchItems()); // Altere para a nova ação que busca itens do sistema + custom
    }
  }, [open, dispatch]);

  // Função para controlar a busca
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Função para controlar a expansão do Accordion
  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
  };

  // Filtra itens do sistema + custom do usuário
  // ItemsModal.js (simplifique a lógica)
  const allItems = itemItems || []; // Confie nos dados do backend

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

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onCreateNewHomebrew}
            sx={{ mb: 3 }}
          >
            Criar Novo Item
          </Button>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange} // Função definida
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
            ) : allItems.length > 0 ? (
              allItems.map((item) => (
                <Accordion
                  key={item._id}
                  expanded={expanded === item._id}
                  onChange={handleAccordionChange(item._id)}
                  sx={{ bgcolor: "transparent", color: "white", mt: 1 }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography fontWeight="bold">{item.name}</Typography>
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
                    <Typography>
                      <strong>Descrição:</strong> {item.description}
                    </Typography>
                    <Divider sx={{ my: 1, bgcolor: "#444" }} />
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography>Nenhum item encontrado.</Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Fechar
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ItemsModal;