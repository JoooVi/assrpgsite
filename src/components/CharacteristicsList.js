import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import {
  createCharacteristic,
  updateCharacteristic,
  deleteCharacteristic,
  fetchUserCharacterTraits,
} from "../redux/slices/characteristicsSlice";

const CharacteristicsList = ({ characterTraits, onShare }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { token, isAuthenticated, user } = auth;

  useEffect(() => {
    console.log("Estado completo da autenticação:", {
      token: !!token,
      isAuthenticated,
      user,
      storageToken: localStorage.getItem("token"),
      storageUser: localStorage.getItem("user"),
    });
  }, [token, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchUserCharacterTraits());
    }
  }, [dispatch, isAuthenticated, token]);

  const [selectedTrait, setSelectedTrait] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTrait, setNewTrait] = useState({
    name: "",
    description: "",
    pointsCost: 0,
    category: "",
    isCustom: true,
  });

  // Funções de Manipulação de Modais
  const handleEditOpen = (trait) => {
    setSelectedTrait(trait);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedTrait(null);
    setEditOpen(false);
  };

  const handleSaveEdit = () => {
    dispatch(
      updateCharacteristic({
        id: selectedTrait._id,
        data: selectedTrait,
      })
    );
    handleEditClose();
  };

  const handleCreateOpen = () => setCreateOpen(true);
  const handleCreateClose = () => setCreateOpen(false);

  const handleCreateTrait = () => {
    dispatch(
      createCharacteristic({
        ...newTrait,
        createdBy: user._id,
      })
    );
    setNewTrait({
      name: "",
      description: "",
      pointsCost: 0,
      category: "",
      isCustom: true,
    });
    handleCreateClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedTrait((prev) => ({
      ...prev,
      [name]: name === "pointsCost" ? Number(value) : value,
    }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewTrait((prev) => ({
      ...prev,
      [name]: name === "pointsCost" ? Number(value) : value,
    }));
  };

  const handleDelete = async (traitId) => {
    if (!isAuthenticated || !token) {
      console.error("Usuário não está autenticado");
      // Você pode adicionar uma notificação ao usuário aqui
      return;
    }

    if (
      traitId &&
      window.confirm("Tem certeza que deseja excluir esta Característica?")
    ) {
      try {
        console.log("Token antes de deletar:", token); // Debug
        const result = await dispatch(deleteCharacteristic(traitId)).unwrap();
        console.log("Resultado da exclusão:", result);
      } catch (error) {
        console.error("Erro ao excluir característica:", error);
        // Você pode adicionar uma notificação de erro ao usuário aqui
      }
    }
  };

  // Modificar a verificação de autenticação
  if (!isAuthenticated || !token || !user) {
    console.log("Verificação de autenticação falhou:", {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
    });
    return (
      <Box>
        <Typography color="error">
          Você precisa estar autenticado para acessar esta página.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Botão para Criar Nova Característica */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateOpen}
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
      >
        Criar Nova Característica
      </Button>

      {/* Modal de Criação */}
      <Dialog open={createOpen} onClose={handleCreateClose}>
        <DialogTitle>Criar Nova Característica</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={newTrait.name}
            onChange={handleNewChange}
            required
          />
          <TextField
            label="Descrição"
            name="description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={newTrait.description}
            onChange={handleNewChange}
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Categoria</InputLabel>
            <Select
              name="category"
              value={newTrait.category}
              label="Categoria"
              onChange={handleNewChange}
              sx={{
                "& .MuiSelect-select": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <MenuItem value="Físico">Físico</MenuItem>
              <MenuItem value="Mental">Mental</MenuItem>
              <MenuItem value="Social">Social</MenuItem>
              <MenuItem value="Habilidade">Habilidade</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Pontos de Custo"
            name="pointsCost"
            type="number"
            fullWidth
            margin="normal"
            value={newTrait.pointsCost}
            onChange={handleNewChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateTrait} color="primary">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista de Características Criadas */}
      <Typography variant="h6" gutterBottom>
        Características Criadas
      </Typography>
      {characterTraits.length > 0 ? (
        characterTraits.map((trait) => (
          <Accordion key={trait._id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${trait._id}-content`}
              id={`panel-${trait._id}-header`}
            >
              <Typography>{trait.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Descrição:</strong> {trait.description}
              </Typography>
              <Typography>
                <strong>Categoria:</strong> {trait.category}
              </Typography>
              <Typography>
                <strong>Pontos de Custo:</strong> {trait.pointsCost}
              </Typography>
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                {" "}
                {/* Alterado */}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditOpen(trait)}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ShareIcon />}
                  onClick={() => onShare(trait)}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(trait._id)}
                >
                  Excluir
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Nenhuma Característica criada.</Typography>
      )}

      {/* Modal de Edição */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Editar Característica</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={selectedTrait?.name || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Descrição"
            name="description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={selectedTrait?.description || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Categoria"
            name="category"
            fullWidth
            margin="normal"
            value={selectedTrait?.category || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Pontos de Custo"
            name="pointsCost"
            type="number"
            fullWidth
            margin="normal"
            value={selectedTrait?.pointsCost || 0}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacteristicsList;