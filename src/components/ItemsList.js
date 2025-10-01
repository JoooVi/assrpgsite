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
    quality: 3, // Padrão
    characteristics: { points: 0, details: [] },
    isCustom: true,
  });

  useEffect(() => {
    if (token && user) {
      dispatch(fetchItems());
    }
  }, [dispatch, token, user]);

  const handleEditOpen = (item) => {
    setSelectedItem(JSON.parse(JSON.stringify(item))); // Clona o item para evitar mutação do estado do Redux
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
      // Opcional: Re-fetch da lista de itens, ou o extraReducer já adiciona na lista
      // dispatch(fetchItems());
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
    } else {
      setSelectedItem((prev) => ({
        ...prev,
        [name]:
          name === "weight" ||
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
    } else {
      setNewItem((prev) => ({
        ...prev,
        [name]:
          name === "weight" ||
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

      <Typography variant="h6" gutterBottom>
        Meus Itens Customizados
      </Typography>
      {userItems.length > 0 ? (
        userItems.map((item) => (
          <Accordion key={item._id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{item.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                <strong>Tipo:</strong> {item.type}
              </Typography>
              <Typography variant="body2">
                <strong>Descrição:</strong> {item.description}
              </Typography>
              <Typography variant="body2">
                <strong>Escassez:</strong> {item.category}
              </Typography>
              <Typography variant="body2">
                <strong>Qualidade:</strong> {item.quality}
              </Typography>
              <Typography variant="body2">
                <strong>Peso:</strong> {item.weight}
              </Typography>
              <Typography variant="body2">
                <strong>Pontos de Característica:</strong>{" "}
                {item.characteristics?.points || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditOpen(item)}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ShareIcon />}
                  onClick={() => onShare(item)}
                  sx={{ mr: 1 }}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(item._id)}
                >
                  Excluir
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Você ainda não criou nenhum item.</Typography>
      )}

      {/* Modal de Criação */}
      <Dialog open={createOpen} onClose={handleCreateClose}>
        <DialogTitle>Criar Novo Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={newItem.name}
            onChange={handleNewChange}
            required
          />
          <TextField
            label="Tipo"
            name="type"
            fullWidth
            margin="normal"
            value={newItem.type}
            onChange={handleNewChange}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="category-select-label">
              Categoria (Escassez)
            </InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              name="category"
              value={newItem.category}
              label="Categoria (Escassez)"
              onChange={handleNewChange}
            >
              {Object.entries(scarcityLevels).map(([value, name]) => (
                <MenuItem key={value} value={parseInt(value)}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Peso"
            name="weight"
            type="number"
            fullWidth
            margin="normal"
            value={newItem.weight}
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
            value={newItem.description}
            onChange={handleNewChange}
            required
          />
          <TextField
            label="Qualidade"
            name="quality"
            type="number"
            fullWidth
            margin="normal"
            value={newItem.quality}
            onChange={handleNewChange}
            required
            helperText="Padrão = 3"
          />
          <TextField
            label="Pontos de Características"
            name="points"
            type="number"
            fullWidth
            margin="normal"
            value={newItem.characteristics.points}
            onChange={handleNewChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateItem} color="primary">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      {selectedItem && (
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogContent>
            <TextField
              label="Nome"
              name="name"
              fullWidth
              margin="normal"
              value={selectedItem.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Tipo"
              name="type"
              fullWidth
              margin="normal"
              value={selectedItem.type}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="normal" required>
  <InputLabel id="edit-category-select-label">Categoria (Escassez)</InputLabel>
  <Select
    labelId="edit-category-select-label"
    id="edit-category-select"
    name="category"
    value={selectedItem.category}
    label="Categoria (Escassez)"
    onChange={handleChange}
  >
    {Object.entries(scarcityLevels).map(([value, name]) => (
      <MenuItem key={value} value={parseInt(value)}>
        {name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
            <TextField
              label="Peso"
              name="weight"
              type="number"
              fullWidth
              margin="normal"
              value={selectedItem.weight}
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
              value={selectedItem.description}
              onChange={handleChange}
              required
            />
            <TextField
              label="Qualidade"
              name="quality"
              type="number"
              fullWidth
              margin="normal"
              value={selectedItem.quality}
              onChange={handleChange}
              required
            />
            <TextField
              label="Pontos de Características"
              name="points"
              type="number"
              fullWidth
              margin="normal"
              value={selectedItem.characteristics.points}
              onChange={handleChange}
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
      )}
    </Box>
  );
};

export default ItemsList;
