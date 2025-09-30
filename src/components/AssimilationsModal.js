import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAssimilations } from "../redux/slices/assimilationsSlice";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";

const AssimilationsModal = ({
  open,
  handleClose,
  title,
  onItemSelect,
  onCreateNewAssimilation,
}) => {
  const dispatch = useDispatch();
  const { allAssimilations, userAssimilations, loading } = useSelector(
    (state) => state.assimilations
  );

  useEffect(() => {
    if (open) {
      dispatch(fetchAllAssimilations());
    }
  }, [dispatch, open]);

  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Combinar assimilações do sistema e do usuário
  const combinedAssimilations = [
    ...allAssimilations,
    ...userAssimilations
  ].filter((item, index, self) =>
    self.findIndex((t) => t._id === item._id) === index
  );

  // Extrair categorias da lista combinada
  const categories = [
    ...new Set(combinedAssimilations.map((item) => item.category)),
  ].filter(Boolean);

  const handleAccordionChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Filtrar a lista combinada
  const displayedAssimilations = combinedAssimilations
    .filter((item) => !selectedCategory || item.category === selectedCategory)
    .filter((item) =>
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
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              bgcolor: "#1e1e2f",
              pb: 2,
            }}
          >
            <FormControl
              fullWidth
              variant="outlined"
              margin="normal"
              sx={{
                "& .MuiInputLabel-root": { color: "#bbb" },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#38394a",
                  color: "white",
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#777" },
                  "&.Mui-focused fieldset": { borderColor: "#aaa" },
                },
                "& .MuiSelect-icon": { color: "white" },
              }}
            >
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Categoria"
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
          </Box>
          <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
            {loading ? (
              <Typography>Carregando...</Typography>
            ) : displayedAssimilations.length > 0 ? (
              displayedAssimilations.map((item, index) => (
                <Accordion
                  key={item._id}
                  expanded={expanded === index}
                  onChange={handleAccordionChange(index)}
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
                      <Typography variant="body1" fontWeight="bold">
                        {item.name}
                        <Typography variant="caption" sx={{ ml: 1, color: '#888' }}>
                          ({item.isCustom ? 'Personalizada' : 'Sistema'})
                        </Typography>
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemSelect(item);
                        }}
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
                      <strong>Custo de Sucesso:</strong> {item.successCost}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Custo de Adaptação:</strong> {item.adaptationCost}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Custo de Pressão:</strong> {item.pressureCost}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tipo de Evolução:</strong> {item.evolutionType}
                    </Typography>
                    <Divider sx={{ my: 1, bgcolor: "#444" }} />
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography>Nenhuma assimilação encontrada.</Typography>
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

export default AssimilationsModal;