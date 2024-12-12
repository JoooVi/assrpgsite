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
  items,
  onItemSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleAccordionChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredItems = items
    .filter((item) =>
      selectedCategory ? item.category === selectedCategory : true
    )
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categories = [...new Set(items.map((item) => item.category))].filter(
    Boolean
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
                "& .MuiInputLabel-root": {
                  color: "#bbb", // Cor do rótulo
                },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#38394a", // Fundo mais claro
                  color: "white", // Texto principal
                  "& fieldset": {
                    borderColor: "#555", // Borda padrão
                  },
                  "&:hover fieldset": {
                    borderColor: "#777", // Borda ao passar o mouse
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#aaa", // Borda ao focar
                  },
                },
                "& .MuiSelect-icon": {
                  color: "white", // Cor do ícone de seta
                },
                "& .MuiMenuItem-root": {
                  color: "white", // Texto dos itens de menu
                  backgroundColor: "#292a3a", // Fundo dos itens
                  "&:hover": {
                    backgroundColor: "#444", // Fundo ao passar o mouse
                  },
                },
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
                    {typeof category === "string"
                      ? category.charAt(0).toUpperCase() + category.slice(1)
                      : category}
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
            {filteredItems.map((item, index) => (
              <Accordion
                key={index}
                expanded={expanded === index}
                onChange={handleAccordionChange(index)}
                sx={{
                  bgcolor: "transparent",
                  color: "white",
                  mt: 1,
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: "white", // Define a cor do ícone como branca
                      }}
                    />
                  }
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
                  <Typography variant="body2">
                    <strong>Personalizado:</strong>{" "}
                    {item.isCustom ? "Sim" : "Não"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Criado por:</strong> {item.createdBy}
                  </Typography>
                  <Divider sx={{ my: 1, bgcolor: "#444" }} />
                  <Typography variant="body2">
                    {item.details ||
                      "Mais informações sobre esta assimilação..."}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
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

export default AssimilationsModal;