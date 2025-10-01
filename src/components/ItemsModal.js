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
}) => {
  const dispatch = useDispatch();
  const {
    items: allItems, // Renomeado para clareza
    loading,
  } = useSelector((state) => state.items);
  const user = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (open) {
      dispatch(fetchItems());
    }
  }, [open, dispatch]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
  };

  // Filtra os itens em duas listas separadas
  const itemsFiltrados = allItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const systemItems = itemsFiltrados.filter(item => !item.isCustom);
  const customItems = itemsFiltrados.filter(item => item.isCustom && item.createdBy === user?._id);

  // Componente auxiliar para renderizar a lista de itens
  const renderItemList = (items) => {
    if (items.length === 0) {
      return <Typography sx={{color: 'rgba(255, 255, 255, 0.7)', ml: 1}}>Nenhum item encontrado.</Typography>;
    }
    return items.map((item) => (
      <Accordion
        key={item._id}
        expanded={expanded === item._id}
        onChange={handleAccordionChange(item._id)}
        sx={{ bgcolor: "transparent", color: "white", mt: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: 'center' }}>
            <Typography fontWeight="bold">{item.name}</Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
              size="small"
            >
              Adicionar
            </Button>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Descrição:</strong> {item.description}</Typography>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
      <Fade in={open}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80%", maxWidth: 900, height: "80%", bgcolor: "#1e1e2f", borderRadius: "8px", p: 3, boxShadow: 24, color: "white", display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" mb={2}>{title}</Typography>
          <TextField fullWidth variant="outlined" placeholder="Buscar..." value={searchTerm} onChange={handleSearchChange} sx={{ mb: 3, "& .MuiOutlinedInput-root": { backgroundColor: "#292a3a", color: "white" } }} />
          <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
            {loading ? (
              <Typography>Carregando...</Typography>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{color: '#aaa', borderBottom: '1px solid #444', pb: 1}}>Itens do Sistema</Typography>
                {renderItemList(systemItems)}

                <Divider sx={{ my: 3, bgcolor: "#444" }} />

                <Typography variant="subtitle1" sx={{color: '#aaa', borderBottom: '1px solid #444', pb: 1}}>Meus Itens Customizados</Typography>
                {renderItemList(customItems)}
              </>
            )}
          </Box>
          <Button fullWidth variant="contained" color="secondary" onClick={handleClose}>Fechar</Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ItemsModal;