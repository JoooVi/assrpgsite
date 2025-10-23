// src/components/ItemsModal.js - ATUALIZADO COM TEMA ESCURO

import React, { useEffect, useState } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  Paper,
  Tooltip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star"; // Importar ícone de artefato
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../redux/slices/itemsSlice";

const ItemsModal = ({ open, handleClose, onItemSelect }) => {
  const dispatch = useDispatch();
  const { items: allItems, loading } = useSelector((state) => state.items);
  const user = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(fetchItems());
    }
  }, [open, dispatch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filtra itens ANTES de separar em sistema/custom
  const itemsFiltrados = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const systemItems = itemsFiltrados.filter((item) => !item.isCustom);
  const customItems = itemsFiltrados.filter(
    (item) => item.isCustom && item.createdBy === user?._id
  );

  const renderItemGrid = (items) => {
    if (items.length === 0) {
      return (
        <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", ml: 1, fontStyle: 'italic' }}> {/* Estilo adicionado */}
          Nenhum item encontrado.
        </Typography>
      );
    }
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: "12px",
        }}
      >
        {items.map((item) => (
          <Tooltip
            // Tooltip mais informativo
            title={
             <React.Fragment>
                <Typography color="inherit">{item.name}</Typography>
                <Typography variant="caption">Slots: {item.slots ?? 1}</Typography>
                {item.modifiers && item.modifiers.length > 0 && (
                   <Typography variant="caption"><br/>Mods: {item.modifiers.join(', ')}</Typography>
                )}
                 {item.description && (
                   <Typography variant="caption"><br/>{item.description}</Typography>
                )}
             </React.Fragment>
            }
            key={item._id}
          >
            <Paper
              onClick={() => onItemSelect(item)}
              sx={{
                position: "relative",
                aspectRatio: "1 / 1",
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                // --- ESTILO DO ITEM (TEMA ESCURO) ---
                bgcolor: "#2a2d30", // Fundo do slot
                border: "1px solid #4a4a4a", // Borda do slot
                borderRadius: "6px",
                transition: "background-color 0.2s, border-color 0.2s",
                "&:hover": {
                  borderColor: "#c79100", // Borda hover
                  backgroundColor: "#3f4347", // Fundo hover
                },
                overflow: 'hidden'
              }}
            >
              {/* Indicador de Artefato */}
              {item.isArtefato && (
                  <StarIcon sx={{ 
                    position: 'absolute', 
                    top: 4, 
                    left: 4, 
                    color: '#FFD700', 
                    fontSize: '1rem',
                    filter: 'drop-shadow(0 0 2px black)'
                  }} />
              )}
              
              <Box
                component="img"
                src={item.icon || "/icons/default_item.svg"}
                alt={item.name}
                sx={{
                  width: "65%",
                  height: "65%",
                  objectFit: "contain",
                  mb: 0.5, // Reduzido margin bottom
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "#e0e0e0", // Cor do texto do nome
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                  lineHeight: 1.2 // Ajuste para caber melhor
                }}
              >
                {item.name}
              </Typography>
            </Paper>
          </Tooltip>
        ))}
      </Box>
    );
  };

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
            width: "90%",
            maxWidth: 1000,
            height: "85%",
            bgcolor: "#1e1e1e", // Fundo principal já estava escuro
            border: "1px solid #4a4a4a",
            borderRadius: "8px",
            p: 3,
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.7)",
            color: "white", // Cor padrão do texto
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              borderBottom: '1px solid #4a4a4a', // Linha divisória
              pb: 2 // Espaçamento abaixo do título
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: '#fff' // Garante cor branca
              }}
            >
              Arsenal
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "#aaa", '&:hover': { color: '#fff'} }}> {/* Cor do botão fechar */}
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              mb: 3,
              // Estilos do TextField já estavam corretos
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#2a2d30",
                color: "white",
                "& fieldset": { borderColor: "#4a4a4a" },
                "&:hover fieldset": { borderColor: "#c79100" },
              },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "#ccc" }, // Cor do placeholder/label
              "& input::placeholder": { // Cor específica do placeholder
                  color: "#bbb",
                  opacity: 1, 
              }
            }}
          />
          <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}> {/* pr: 1 para espaço da scrollbar */}
            {loading ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
              >
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{
                    // --- ESTILO DOS TÍTULOS DE SEÇÃO ---
                    color: "#aaa",
                    borderBottom: "1px solid #444",
                    pb: 1,
                    mb: 2,
                    textTransform: "uppercase",
                    fontWeight: 'bold', // Deixa em negrito
                    letterSpacing: '1px' // Espaçamento
                  }}
                >
                  Itens do Sistema
                </Typography>
                {renderItemGrid(systemItems)}

                <Divider sx={{ my: 3, bgcolor: "#444" }} />

                <Typography
                  variant="subtitle1"
                  sx={{
                     // --- ESTILO DOS TÍTULOS DE SEÇÃO ---
                    color: "#aaa",
                    borderBottom: "1px solid #444",
                    pb: 1,
                    mb: 2,
                    textTransform: "uppercase",
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}
                >
                  Meus Itens Customizados
                </Typography>
                {renderItemGrid(customItems)}
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ItemsModal;