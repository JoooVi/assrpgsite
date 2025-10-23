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
  // --- ALTERAÇÃO 1: Importar 'fetchCharacterTraits' (para buscar TODOS) ---
  // Remover 'fetchUserCharacterTraits'
  fetchCharacterTraits, 
} from "../redux/slices/characteristicsSlice";

// (Estilos darkTextFieldStyles e darkSelectStyles permanecem os mesmos...)
// --- NOVO: Estilos reutilizáveis para componentes escuros ---
const darkTextFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#ccc' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#888' },
    '&:hover fieldset': { borderColor: '#fff' },
  },
};

const darkSelectStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#ccc' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#888' },
    '&:hover fieldset': { borderColor: '#fff' },
  },
  '& .MuiSvgIcon-root': { color: '#ccc' }
};
// --- FIM DOS ESTILOS ---

// --- ALTERAÇÃO 2: Remover 'characterTraits' das props ---
const CharacteristicsList = ({ onShare }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { token, isAuthenticated, user } = auth;

  // --- ALTERAÇÃO 3: Selecionar TODAS as características do Redux ---
  const { characterTraits: allTraits = [] } = useSelector((state) => state.characteristics);

  // --- ALTERAÇÃO 4: Filtrar localmente (como no ItemsList) ---
  const characterTraits = allTraits.filter(trait => trait.createdBy === user?._id);


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
      // --- ALTERAÇÃO 5: Chamar a ação para buscar TODAS as características ---
      dispatch(fetchCharacterTraits()); 
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

  // (O resto das funções de manipulação permanecem as mesmas...)
  // ... (handleEditOpen, handleEditClose, handleSaveEdit, etc.) ...
  
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

      {/* Modal de Criação (Estilizado) */}
      <Dialog 
        open={createOpen} 
        onClose={handleCreateClose}
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e', 
            color: '#e0e0e0', 
            border: '1px solid #4a4a4a' 
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #4a4a4a', color: '#ffffff' }}>
          Criar Nova Característica
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={newTrait.name}
            onChange={handleNewChange}
            required
            sx={darkTextFieldStyles} // Aplicado
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
            sx={darkTextFieldStyles} // Aplicado
          />

          <FormControl fullWidth margin="normal" required sx={darkSelectStyles}>
            <InputLabel id="category-label-create">Categoria</InputLabel>
            <Select
              labelId="category-label-create"
              name="category"
              value={newTrait.category}
              label="Categoria"
              onChange={handleNewChange}
              MenuProps={{ // Estilo do dropdown
                PaperProps: {
                  sx: { bgcolor: '#2a2d30', color: '#e0e0e0' }
                }
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
            sx={darkTextFieldStyles} // Aplicado
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #4a4a4a' }}>
          <Button onClick={handleCreateClose} sx={{ color: '#ccc' }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateTrait} color="primary">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista de Características Criadas */}
      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', mt: 2 }}> 
        Características Criadas
      </Typography>
      
      {/* --- ALTERAÇÃO 6: A lista agora usa a variável filtrada 'characterTraits' --- */}
      {/* --- (O nome da variável é o mesmo, mas a sua origem mudou) --- */}
      {characterTraits.length > 0 ? ( 
        characterTraits.map((trait) => (
          // Accordion (Estilizado)
          <Accordion 
            key={trait._id}
            sx={{
              bgcolor: '#2a2d30', 
              color: '#e0e0e0',
              border: '1px solid #4a4a4a',
              '& .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
                color: '#ccc', // Cor do ícone
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${trait._id}-content`}
              id={`panel-${trait._id}-header`}
            >
              <Typography>{trait.name}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid #4a4a4a' }}>
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

      {/* Modal de Edição (Estilizado) */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose}
        PaperProps={{
          sx: {
            bgcolor: '#1e1e1e', 
            color: '#e0e0e0', 
            border: '1px solid #4a4a4a' 
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #4a4a4a', color: '#ffffff' }}>
          Editar Característica
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={selectedTrait?.name || ""}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
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
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Categoria"
            name="category"
            fullWidth
            margin="normal"
            value={selectedTrait?.category || ""}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
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
            sx={darkTextFieldStyles} // Aplicado
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #4a4a4a' }}>
          <Button onClick={handleEditClose} sx={{ color: '#ccc' }}> 
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