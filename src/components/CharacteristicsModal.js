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

const CharacteristicsModal = ({
  open,
  handleClose,
  title,
  items,
  onItemSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);

  const handleAccordionChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredItems = items.filter((item) =>
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
                    <strong>Criado por:</strong> {item.createdBy}
                  </Typography>
                  <Divider sx={{ my: 1, bgcolor: "#444" }} />
                  <Typography variant="body2">
                    {item.details || "Mais informações sobre este item..."}
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

export default CharacteristicsModal;