import React, { useEffect, useState } from "react";
// Remover useSelector para assimilationItems
import { useDispatch, useSelector } from "react-redux";
import { createAssimilation, updateAssimilation, fetchAssimilations, deleteAssimilation } from "../redux/slices/assimilationsSlice";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit"; // Corrigido aqui
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete"; // Importar DeleteIcon
import AssimilationsModal from "./AssimilationsModal"; // Importar AssimilationsModal

// --- NOVO: Estilos reutilizáveis para componentes escuros ---
const darkTextFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#ccc' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#888' },
    '&:hover fieldset': { borderColor: '#fff' },
  },
  // Para o <select native>
  '& .MuiNativeSelect-icon': { color: '#ccc' },
  '& option': {
    backgroundColor: '#1e1e1e',
    color: '#e0e0e0',
  }
};
// --- FIM DOS ESTILOS ---

const AssimilationsList = ({ assimilationItems, onShare, currentUserId }) => { // Receber props
  const { userAssimilations } = useSelector((state) => state.assimilations);
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [selectedAssimilation, setSelectedAssimilation] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false); // Adicionar este estado
  const [newAssimilation, setNewAssimilation] = useState({
    name: "",
    description: "",
    category: "",
    successCost: 0,
    adaptationCost: 0,
    pressureCost: 0,
    evolutionType: "",
    isCustom: true,
  });

  const handleEditOpen = (assimilation) => {
    setSelectedAssimilation(assimilation);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedAssimilation(null);
    setEditOpen(false);
  };

  const handleSaveEdit = () => {
    dispatch(
      updateAssimilation({
        id: selectedAssimilation._id,
        data: selectedAssimilation,
        createdBy: user._id,
      })
    );
    handleEditClose();
  };

  const handleCreateOpen = () => setCreateDialogOpen(true); // Usar dialog ao invés do modal
  const handleCreateClose = () => setCreateDialogOpen(false);

  const handleCreateAssimilation = () => {
    dispatch(createAssimilation({ 
      ...newAssimilation, 
      createdBy: currentUserId,
      userId: currentUserId
    }));
    setNewAssimilation({
      name: "",
      description: "",
      category: "",
      successCost: 0,
      adaptationCost: 0,
      pressureCost: 0,
      evolutionType: "",
      isCustom: true,
    });
    handleCreateClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAssimilation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewAssimilation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Adicionar a função handleDelete
  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta Assimilação?")) {
      dispatch(deleteAssimilation(id));
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateOpen}
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
      >
        Criar Nova Assimilação
      </Button>

      {/* --- ALTERADO: Dialog para criar nova assimilação estilizado --- */}
      <Dialog 
        open={createDialogOpen} 
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
          Criar Nova Assimilação
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={newAssimilation.name}
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
            value={newAssimilation.description}
            onChange={handleNewChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Categoria"
            name="category"
            fullWidth
            margin="normal"
            value={newAssimilation.category}
            onChange={handleNewChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Custo em Sucessos"
            name="successCost"
            type="number"
            fullWidth
            margin="normal"
            value={newAssimilation.successCost}
            onChange={handleNewChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Custo em Adaptações"
            name="adaptationCost"
            type="number"
            fullWidth
            margin="normal"
            value={newAssimilation.adaptationCost}
            onChange={handleNewChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Custo em Pressão"
            name="pressureCost"
            type="number"
            fullWidth
            margin="normal"
            value={newAssimilation.pressureCost}
            onChange={handleNewChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            select
            label="Tipo de Evolução"
            name="evolutionType"
            fullWidth
            margin="normal"
            value={newAssimilation.evolutionType}
            onChange={handleNewChange}
            SelectProps={{
              native: true,
            }}
            required
            sx={darkTextFieldStyles} // Aplicado
          >
            <option value="" disabled style={{ backgroundColor: '#1e1e1e' }}></option>
            <option value="copas" style={{ backgroundColor: '#1e1e1e' }}>Copas</option>
            <option value="ouros" style={{ backgroundColor: '#1e1e1e' }}>Ouros</option>
            <option value="espadas" style={{ backgroundColor: '#1e1e1e' }}>Espadas</option>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #4a4a4a' }}>
          <Button onClick={handleCreateClose} sx={{ color: '#ccc' }}> {/* Alterado */}
            Cancelar
          </Button>
          <Button onClick={handleCreateAssimilation} color="primary">
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para listar assimilações */}
      <AssimilationsModal
        open={isModalOpen}
        handleClose={handleCreateClose}
        title="Assimilações"
        assimilationItems={assimilationItems} // Passar todas as assimilações
        onItemSelect={handleEditOpen}
      />

      <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', mt: 2 }}> {/* Alterado */}
        Minhas Assimilações
      </Typography>
  {userAssimilations.length > 0 ? (
    userAssimilations.map((assimilation) => (
      // --- ALTERADO: Accordion Estilizado ---
      <Accordion 
        key={assimilation._id}
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
              aria-controls={`panel-${assimilation._id}-content`}
              id={`panel-${assimilation._id}-header`}
            >
              <Typography>{assimilation.name}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid #4a4a4a' }}> {/* Alterado */}
              <Typography>
                <strong>Descrição:</strong> {assimilation.description}
              </Typography>
              <Typography>
                <strong>Categoria:</strong> {assimilation.category}
              </Typography>
              <Typography>
                <strong>Custo em Sucessos:</strong> {assimilation.successCost}
              </Typography>
              <Typography>
                <strong>Custo em Adaptações:</strong> {assimilation.adaptationCost}
              </Typography>
              <Typography>
                <strong>Custo em Pressão:</strong> {assimilation.pressureCost}
              </Typography>
              <Typography>
                <strong>Tipo de Evolução:</strong> {assimilation.evolutionType}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditOpen(assimilation)}
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ShareIcon />}
                  onClick={() => onShare(assimilation)}
                  sx={{ mr: 1 }}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(assimilation._id)}
                >
                  Excluir
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Você ainda não criou nenhuma Assimilação.</Typography>
      )}

      {/* --- ALTERADO: Dialog de Edição Estilizado --- */}
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
          Editar Assimilação
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '20px !important' }}>
          <TextField
            label="Nome"
            name="name"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.name || ""}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Descrição"
            name="description"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.description || ""}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Categoria"
            name="category"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.category || ""}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Custo em Sucessos"
            name="successCost"
            type="number"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.successCost || 0}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Custo em Adaptações"
            name="adaptationCost"
            type="number"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.adaptationCost || 0}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            label="Custo em Pressão"
            name="pressureCost"
            type="number"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.pressureCost || 0}
            onChange={handleChange}
            required
            sx={darkTextFieldStyles} // Aplicado
          />
          <TextField
            select
            label="Tipo de Evolução"
            name="evolutionType"
            fullWidth
            margin="normal"
            value={selectedAssimilation?.evolutionType || ""}
            onChange={handleChange}
            SelectProps={{
              native: true,
            }}
            required
            sx={darkTextFieldStyles} // Aplicado
          >
            <option value="" disabled style={{ backgroundColor: '#1e1e1e' }}>
            </option>
            <option value="copas" style={{ backgroundColor: '#1e1e1e' }}>Copas</option>
            <option value="ouros" style={{ backgroundColor: '#1e1e1e' }}>Ouros</option>
            <option value="espadas" style={{ backgroundColor: '#1e1e1e' }}>Espadas</option>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #4a4a4a' }}>
          <Button onClick={handleEditClose} sx={{ color: '#ccc' }}> {/* Alterado */}
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

export default AssimilationsList;