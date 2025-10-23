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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../redux/slices/itemsSlice";

// --- NOVO: Estilos reutilizáveis para componentes escuros ---
const darkTextFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#ccc' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#888' },
    '&:hover fieldset': { borderColor: '#fff' },
  },
  '& .MuiFormHelperText-root': { color: '#aaa' } // Helper text
};

const darkSelectStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#ccc' }, // Label do FormControl
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#888' },
    '&:hover fieldset': { borderColor: '#fff' },
  },
  '& .MuiSvgIcon-root': { color: '#ccc' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' } // Label focado
};
// --- FIM DOS ESTILOS ---

const ItemsList = ({ onShare }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const {
    loading,
    error,
    items: storeItems,
  } = useSelector((state) => state.items);

  const [selectedItem, setSelectedItem] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);


  const scarcityLevels = {
    0: 'Abundante',
    1: 'Pedra',
    2: 'Comum',
    3: 'Incomum',
    4: 'Atípico',
    5: 'Raro',
    6: 'Quase Extinto'
  };

  const [newItem, setNewItem] = useState({
    name: "",
    type: "Equipamento",
    category: 1, // Escassez
    description: "",
    quality: 3,
    // --- ALTERADO: Adaptado para o novo modelo de item ---
    slots: 1,
    modifiers: [],
    // --- FIM DA ALTERAÇÃO ---
    characteristics: { points: 0, details: [] },
    isCustom: true,
  });

  useEffect(() => {
    if (token && user) {
      dispatch(fetchItems());
    }
  }, [dispatch, token, user]);

  const handleEditOpen = (item) => {
    setSelectedItem(JSON.parse(JSON.stringify(item)));
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedItem(null);
    setEditOpen(false);
  };

  const handleSaveEdit = () => {
    dispatch(
      updateItem({
        id: selectedItem._id,
        data: selectedItem,
      })
    );
    handleEditClose();
  };

  const handleCreateOpen = () => setCreateOpen(true);
  const handleCreateClose = () => setCreateOpen(false);

  const handleCreateItem = async () => {
    if (!token || !user) {
      console.error("Token ou usuário ausente");
      return;
    }
    try {
      await dispatch(
        createItem({
          ...newItem,
          createdBy: user._id,
        })
      ).unwrap();
      handleCreateClose();
    } catch (error) {
      console.error("Erro ao criar item:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "points") {
      setSelectedItem((prev) => ({
        ...prev,
        characteristics: { ...prev.characteristics, points: Number(value) },
      }));
    // --- NOVO: Lógica para lidar com o campo de modificadores ---
    } else if (name === "modifiers") {
      setSelectedItem((prev) => ({
        ...prev,
        modifiers: value.split(',').map(m => m.trim()),
      }));
    // --- FIM DA ALTERAÇÃO ---
    } else {
      setSelectedItem((prev) => ({
        ...prev,
        [name]:
          name === "slots" || // alterado de weight
          name === "quality" ||
          name === "currentUses" ||
          name === "category"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    if (name === "points") {
      setNewItem((prev) => ({
        ...prev,
        characteristics: { ...prev.characteristics, points: Number(value) },
      }));
    // --- NOVO: Lógica para lidar com o campo de modificadores ---
    } else if (name === "modifiers") {
      setNewItem((prev) => ({
        ...prev,
        modifiers: value.split(',').map(m => m.trim()),
      }));
    // --- FIM DA ALTERAÇÃO ---
    } else {
      setNewItem((prev) => ({
        ...prev,
        [name]:
          name === "slots" || // alterado de weight
          name === "quality" ||
          name === "currentUses" ||
          name === "category"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      dispatch(deleteItem(id));
    }
  };

  const userItems = storeItems.filter((item) => {
    return item?.isCustom === true && item?.createdBy === user?._id;
  });

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateOpen}
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
      >
        Criar Novo Item
      </Button>

      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error">{error.message || "Ocorreu um erro"}</Alert>
      )}

      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', mt: 2 }}> {/* Alterado */}
        Meus Itens Customizados
      </Typography>
      {userItems.length > 0 ? (
        userItems.map((item) => (
          // --- ALTERADO: Accordion Estilizado ---
          <Accordion 
            key={item._id}
            sx={{
              bgcolor: '#2a2d30', 
              color: '#e0e0e0',
              border: '1px solid #4a4a4a',
              '& .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
                color: '#ccc', // Cor do ícone
              }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{item.name}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid #4a4a4a' }}> {/* Alterado */}
              <Typography variant="body2"><strong>Tipo:</strong> {item.type}</Typography>
              <Typography variant="body2"><strong>Descrição:</strong> {item.description}</Typography>
              <Typography variant="body2"><strong>Escassez:</strong> {scarcityLevels[item.category] || item.category}</Typography>
              <Typography variant="body2"><strong>Qualidade:</strong> {item.quality}</Typography>
              {/* --- ALTERADO: Exibindo slots e modifiers --- */}
              <Typography variant="body2"><strong>Slots Ocupados:</strong> {item.slots}</Typography>
              <Typography variant="body2"><strong>Modificadores:</strong> {item.modifiers?.join(', ') || 'Nenhum'}</Typography>
              {/* --- FIM DA ALTERAÇÃO --- */}
              <Typography variant="body2"><strong>Pontos de Característica:</strong> {item.characteristics?.points || 0}</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleEditOpen(item)} sx={{ mr: 1 }}>Editar</Button>
                <Button variant="contained" color="secondary" startIcon={<ShareIcon />} onClick={() => onShare(item)} sx={{ mr: 1 }}>Compartilhar</Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(item._id)}>Excluir</Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Você ainda não criou nenhum item.</Typography>
      )}

      {/* --- ALTERADO: Modal de Criação Estilizado --- */}
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
          Criar Novo Item
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <TextField label="Nome" name="name" fullWidth margin="normal" value={newItem.name} onChange={handleNewChange} required sx={darkTextFieldStyles} />
          <TextField label="Tipo" name="type" fullWidth margin="normal" value={newItem.type} onChange={handleNewChange} required sx={darkTextFieldStyles} />
          
          <FormControl fullWidth margin="normal" required sx={darkSelectStyles}>
            <InputLabel id="category-select-label">Categoria (Escassez)</InputLabel>
            <Select 
              labelId="category-select-label" 
              id="category-select" 
              name="category" 
              value={newItem.category} 
              label="Categoria (Escassez)" 
              onChange={handleNewChange}
              MenuProps={{ // Estilo do dropdown
                PaperProps: {
                  sx: { bgcolor: '#2a2d30', color: '#e0e0e0' }
                }
              }}
            >
              {Object.entries(scarcityLevels).map(([value, name]) => (<MenuItem key={value} value={parseInt(value)}>{name}</MenuItem>))}
            </Select>
          </FormControl>

          <TextField label="Slots Ocupados" name="slots" type="number" fullWidth margin="normal" value={newItem.slots} onChange={handleNewChange} required helperText="1 para padrão, 2 para Pesado, 0 para pequeno" sx={darkTextFieldStyles} />
          <TextField label="Modificadores (separados por vírgula)" name="modifiers" fullWidth margin="normal" value={newItem.modifiers.join(', ')} onChange={handleNewChange} helperText="Ex: Espaçoso, Isento, Pesado" sx={darkTextFieldStyles} />
          <TextField label="Descrição" name="description" fullWidth multiline rows={4} margin="normal" value={newItem.description} onChange={handleNewChange} required sx={darkTextFieldStyles} />
          <TextField label="Qualidade" name="quality" type="number" fullWidth margin="normal" value={newItem.quality} onChange={handleNewChange} required helperText="Padrão = 3" sx={darkTextFieldStyles} />
          <TextField label="Pontos de Características" name="points" type="number" fullWidth margin="normal" value={newItem.characteristics.points} onChange={handleNewChange} sx={darkTextFieldStyles} />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #4a4a4a' }}>
          <Button onClick={handleCreateClose} sx={{ color: '#ccc' }}>Cancelar</Button>
          <Button onClick={handleCreateItem} color="primary">Criar</Button>
        </DialogActions>
      </Dialog>

      {/* --- ALTERADO: Modal de Edição Estilizado --- */}
      {selectedItem && (
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
            Editar Item
          </DialogTitle>
          <DialogContent sx={{ paddingTop: '20px !important' }}>
            <TextField label="Nome" name="name" fullWidth margin="normal" value={selectedItem.name} onChange={handleChange} required sx={darkTextFieldStyles} />
            <TextField label="Tipo" name="type" fullWidth margin="normal" value={selectedItem.type} onChange={handleChange} required sx={darkTextFieldStyles} />
            
            <FormControl fullWidth margin="normal" required sx={darkSelectStyles}>
              <InputLabel id="edit-category-select-label">Categoria (Escassez)</InputLabel>
              <Select 
                labelId="edit-category-select-label" 
                id="edit-category-select" 
                name="category" 
                value={selectedItem.category} 
                label="Categoria (Escassez)" 
                onChange={handleChange}
                MenuProps={{ // Estilo do dropdown
                  PaperProps: {
                    sx: { bgcolor: '#2a2d30', color: '#e0e0e0' }
                  }
                }}
              >
                {Object.entries(scarcityLevels).map(([value, name]) => (<MenuItem key={value} value={parseInt(value)}>{name}</MenuItem>))}
              </Select>
            </FormControl>

            <TextField label="Slots Ocupados" name="slots" type="number" fullWidth margin="normal" value={selectedItem.slots} onChange={handleChange} required helperText="1 para padrão, 2 para Pesado, 0 para pequeno" sx={darkTextFieldStyles} />
            <TextField label="Modificadores (separados por vírgula)" name="modifiers" fullWidth margin="normal" value={selectedItem.modifiers?.join(', ') || ''} onChange={handleChange} helperText="Ex: Espaçoso, Isento, Pesado" sx={darkTextFieldStyles} />
            <TextField label="Descrição" name="description" fullWidth multiline rows={4} margin="normal" value={selectedItem.description} onChange={handleChange} required sx={darkTextFieldStyles} />
            <TextField label="Qualidade" name="quality" type="number" fullWidth margin="normal" value={selectedItem.quality} onChange={handleChange} required sx={darkTextFieldStyles} />
            <TextField label="Pontos de Características" name="points" type="number" fullWidth margin="normal" value={selectedItem.characteristics.points} onChange={handleChange} sx={darkTextFieldStyles} />
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #4a4a4a' }}>
            <Button onClick={handleEditClose} sx={{ color: '#ccc' }}>Cancelar</Button>
            <Button onClick={handleSaveEdit} color="primary">Salvar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ItemsList;