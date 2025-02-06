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

const ItemsList = ({ items, onShare, currentUserId }) => {
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
  const [newItem, setNewItem] = useState({
    name: "",
    type: "Items",
    category: "",
    weight: 0,
    description: "",
    durability: 4,
    currentUses: 0,
    characteristics: {
      points: 0,
      details: [],
    },
    isCustom: true,
  });

  useEffect(() => {
    if (token && user) {
      console.log("Token disponível:", { hasToken: !!token, userId: user._id });
      dispatch(fetchItems());
    } else {
      console.log("Sem token ou usuário:", {
        hasToken: !!token,
        hasUser: !!user,
      });
    }
  }, [dispatch, token, user]);

  // Funções de Manipulação de Modais
  const handleEditOpen = (item) => {
    setSelectedItem(item);
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
      const createdItem = await dispatch(
        createItem({
          ...newItem,
          createdBy: user._id,
          userId: user._id,
        })
      ).unwrap();

      console.log("Item criado:", createdItem);
      handleCreateClose();
      // Recarregar a lista após criar
      dispatch(fetchItems());
    } catch (error) {
      console.error("Erro ao criar item:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]:
        name === "weight" ||
        name === "durability" ||
        name === "currentUses" ||
        name === "pointsCost"
          ? Number(value)
          : value,
    }));
  };

  const handleCharacteristicsChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [name]:
          name === "points"
            ? Number(value)
            : value.split(",").map((d) => d.trim()),
      },
    }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    if (name in newItem.characteristics) {
      if (name === "points") {
        setNewItem((prev) => ({
          ...prev,
          characteristics: {
            ...prev.characteristics,
            points: Number(value),
          },
        }));
      } else if (name === "details") {
        setNewItem((prev) => ({
          ...prev,
          characteristics: {
            ...prev.characteristics,
            details: value.split(",").map((d) => d.trim()),
          },
        }));
      }
    } else {
      setNewItem((prev) => ({
        ...prev,
        [name]:
          name === "weight" || name === "durability" || name === "currentUses"
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

  // ItemsList.js (filtro existente)
  const userItems = storeItems.filter((item) => {
    return item?.isCustom === true && item?.createdBy === user?.id;
  });

  return (
    <Box>
      {/* Botão para Criar Novo Item */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateOpen}
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
      >
        Criar Novo Item
      </Button>

      {/* Exibir Estado de Carregamento */}
      {loading && <CircularProgress />}

      {/* Exibir Erro */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Lista de Itens Criados */}
      <Typography variant="h6" gutterBottom>
        Meus Itens
      </Typography>
      {userItems.length > 0 ? (
        userItems.map((item) => (
          <Accordion key={item._id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${item._id}-content`}
              id={`panel-${item._id}-header`}
            >
              <Typography>{item.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Descrição:</strong> {item.description}
              </Typography>
              <Typography>
                <strong>Categoria:</strong> {item.category}
              </Typography>
              <Typography>
                <strong>Custo:</strong> {item.cost}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
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
            label="Categoria"
            name="category"
            fullWidth
            margin="normal"
            value={newItem.category}
            onChange={handleNewChange}
            required
          />
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
            label="Durabilidade"
            name="durability"
            type="number"
            fullWidth
            margin="normal"
            value={newItem.durability}
            onChange={handleNewChange}
            required
          />
          <TextField
            label="Usos Atuais"
            name="currentUses"
            type="number"
            fullWidth
            margin="normal"
            value={newItem.currentUses}
            onChange={handleNewChange}
            required
          />
          <TextField
            label="Características (Pontos)"
            name="points"
            type="number"
            fullWidth
            margin="normal"
            value={newItem.characteristics.points}
            onChange={handleNewChange}
            required
          />
          <TextField
            label="Detalhes"
            name="details"
            fullWidth
            margin="normal"
            value={newItem.characteristics.details.join(", ")}
            onChange={handleNewChange}
            required
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
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Editar Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={selectedItem?.name || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Tipo"
            name="type"
            fullWidth
            margin="normal"
            value={selectedItem?.type || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Categoria"
            name="category"
            fullWidth
            margin="normal"
            value={selectedItem?.category || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Peso"
            name="weight"
            type="number"
            fullWidth
            margin="normal"
            value={selectedItem?.weight || 0}
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
            value={selectedItem?.description || ""}
            onChange={handleChange}
            required
          />
          <TextField
            label="Durabilidade"
            name="durability"
            type="number"
            fullWidth
            margin="normal"
            value={selectedItem?.durability || 0}
            onChange={handleChange}
            required
          />
          <TextField
            label="Usos Atuais"
            name="currentUses"
            type="number"
            fullWidth
            margin="normal"
            value={selectedItem?.currentUses || 0}
            onChange={handleChange}
            required
          />
          <TextField
            label="Características (Pontos)"
            name="points"
            type="number"
            fullWidth
            margin="normal"
            value={selectedItem?.characteristics.points || 0}
            onChange={handleChange}
            required
          />
          <TextField
            label="Detalhes"
            name="details"
            fullWidth
            margin="normal"
            value={selectedItem?.characteristics.details.join(", ") || ""}
            onChange={handleCharacteristicsChange}
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

export default ItemsList;