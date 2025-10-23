import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// --- Estilos Reutilizáveis para Tema Escuro ---
const darkTextFieldStyles = {
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiInputLabel-root': { color: '#ccc' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#888' },
    '&:hover fieldset': { borderColor: '#fff' },
  },
  '& .MuiFormHelperText-root': { color: '#aaa' }
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

// Estruturas de dados iniciais (para quando o Mestre adiciona um novo)
const newObjectiveTemplate = {
  name: '',
  type: 'principal',
  cost: 10,
  progress: 0, // Campo para o painel de ação
};

const newThreatTemplate = {
  name: '',
  diceFormula: '3d10',
  activations: [
    { name: '', type: 'C', cost: 3, progress: 0 },
  ],
};

const newActivationTemplate = {
  name: '',
  type: 'C',
  cost: 3,
  progress: 0,
};

// --- Componente Principal ---

const ConflictTracker = ({ open, onClose, onStartConflict }) => {
  const [objectives, setObjectives] = useState([
    { ...newObjectiveTemplate, name: 'Objetivo Principal' },
  ]);
  const [threats, setThreats] = useState([
    { ...newThreatTemplate, name: 'Ameaça Padrão' },
  ]);
  const [conditions, setConditions] = useState('');

  // --- Funções de Gestão dos Objetivos ---
  const handleObjectiveChange = (index, field, value) => {
    const updated = [...objectives];
    updated[index][field] = value;
    setObjectives(updated);
  };

  const addObjective = () => {
    setObjectives([...objectives, { ...newObjectiveTemplate }]);
  };

  const removeObjective = (index) => {
    const updated = objectives.filter((_, i) => i !== index);
    setObjectives(updated);
  };

  // --- Funções de Gestão das Ameaças ---
  const handleThreatChange = (tIndex, field, value) => {
    const updated = [...threats];
    updated[tIndex][field] = value;
    setThreats(updated);
  };

  const addThreat = () => {
    setThreats([...threats, { ...newThreatTemplate }]);
  };

  const removeThreat = (tIndex) => {
    const updated = threats.filter((_, i) => i !== tIndex);
    setThreats(updated);
  };

  // --- Funções de Gestão das Ativações (dentro das Ameaças) ---
  const handleActivationChange = (tIndex, aIndex, field, value) => {
    const updatedThreats = [...threats];
    updatedThreats[tIndex].activations[aIndex][field] = value;
    setThreats(updatedThreats);
  };

  const addActivation = (tIndex) => {
    const updatedThreats = [...threats];
    updatedThreats[tIndex].activations.push({ ...newActivationTemplate });
    setThreats(updatedThreats);
  };

  const removeActivation = (tIndex, aIndex) => {
    const updatedThreats = [...threats];
    updatedThreats[tIndex].activations = updatedThreats[
      tIndex
    ].activations.filter((_, i) => i !== aIndex);
    setThreats(updatedThreats);
  };
  
  // --- Função para Iniciar ---
  const handleStart = () => {
    // Passa os dados configurados de volta para o CampaignSheet
    onStartConflict({ objectives, threats, conditions }); 
    onClose(); // Fecha o modal
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: '#1e1e1e',
          color: '#e0e0e0',
          border: '1px solid #4a4a4a',
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #4a4a4a', color: '#ffffff' }}>
        Preparar Ficha de Conflito
      </DialogTitle>
      
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        
        {/* --- Secção de OBJETIVOS (Jogadores) --- */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            Objetivos (dos Infectados)
          </Typography>
          {objectives.map((obj, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center', 
                mb: 2, 
                p: 2, 
                border: '1px dashed #4a4a4a', 
                borderRadius: 1 
              }}
            >
              <TextField
                label="Nome do Objetivo"
                value={obj.name}
                onChange={(e) => handleObjectiveChange(index, 'name', e.target.value)}
                sx={darkTextFieldStyles}
                fullWidth
              />
              <FormControl sx={{ ...darkSelectStyles, minWidth: 150 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  label="Tipo"
                  value={obj.type}
                  onChange={(e) => handleObjectiveChange(index, 'type', e.target.value)}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#2a2d30', color: '#e0e0e0' }}}}
                >
                  <MenuItem value="principal">Principal</MenuItem>
                  <MenuItem value="secundario">Secundário</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Custo (A)"
                type="number"
                value={obj.cost}
                onChange={(e) => handleObjectiveChange(index, 'cost', parseInt(e.target.value) || 0)}
                sx={{ ...darkTextFieldStyles, width: 120 }}
              />
              <IconButton onClick={() => removeObjective(index)} sx={{ color: '#ff8a8a' }}>
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addObjective}
            variant="outlined"
            sx={{ color: '#ccc', borderColor: '#888' }}
          >
            Adicionar Objetivo
          </Button>
        </Box>

        <Divider sx={{ borderColor: '#4a4a4a', my: 3 }} />

        {/* --- Secção de AMEAÇAS (Mestre) --- */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            Ameaças (do Assimilador)
          </Typography>
          {threats.map((threat, tIndex) => (
            <Box 
              key={tIndex} 
              sx={{ 
                mb: 2, 
                p: 2, 
                border: '1px solid #4a4a4a', 
                borderRadius: 1, 
                bgcolor: '#2a2d30' 
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2}}>
                <TextField
                  label="Nome da Ameaça"
                  value={threat.name}
                  onChange={(e) => handleThreatChange(tIndex, 'name', e.target.value)}
                  sx={darkTextFieldStyles}
                  fullWidth
                />
                <TextField
                  label="Fórmula de Dados"
                  value={threat.diceFormula}
                  onChange={(e) => handleThreatChange(tIndex, 'diceFormula', e.target.value)}
                  sx={{ ...darkTextFieldStyles, width: 150 }}
                  helperText="Ex: 5d10"
                />
                <IconButton onClick={() => removeThreat(tIndex)} sx={{ color: '#ff8a8a' }}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>

              {/* --- Sub-secção de Ativações da Ameaça --- */}
              <Typography variant="body1" sx={{ color: '#ccc', mb: 1, ml: 1 }}>
                Ativações da Ameaça:
              </Typography>
              {threat.activations.map((act, aIndex) => (
                <Box 
                  key={aIndex} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center', 
                    mb: 1, 
                    ml: 2 
                  }}
                >
                  <TextField
                    label="Nome da Ativação"
                    value={act.name}
                    onChange={(e) => handleActivationChange(tIndex, aIndex, 'name', e.target.value)}
                    sx={darkTextFieldStyles}
                    fullWidth
                    size="small"
                  />
                  <FormControl sx={{ ...darkSelectStyles, minWidth: 150 }} size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      label="Tipo"
                      value={act.type}
                      onChange={(e) => handleActivationChange(tIndex, aIndex, 'type', e.target.value)}
                      MenuProps={{ PaperProps: { sx: { bgcolor: '#2a2d30', color: '#e0e0e0' }}}}
                    >
                      <MenuItem value="C">Desfavorável (C)</MenuItem>
                      <MenuItem value="A">Favorável (A)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Custo"
                    type="number"
                    value={act.cost}
                    onChange={(e) => handleActivationChange(tIndex, aIndex, 'cost', parseInt(e.target.value) || 0)}
                    sx={{ ...darkTextFieldStyles, width: 100 }}
                    size="small"
                  />
                  <IconButton onClick={() => removeActivation(tIndex, aIndex)} sx={{ color: '#ff8a8a' }} size="small">
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => addActivation(tIndex)}
                variant="outlined"
                size="small"
                sx={{ color: '#ccc', borderColor: '#888', ml: 2, mt: 1 }}
              >
                Adicionar Ativação
              </Button>
            </Box>
          ))}
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addThreat}
            variant="outlined"
            sx={{ color: '#ccc', borderColor: '#888' }}
          >
            Adicionar Ameaça
          </Button>
        </Box>
        
        <Divider sx={{ borderColor: '#4a4a4a', my: 3 }} />

        {/* --- Secção de Condicionantes --- */}
        <Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                Condicionantes
            </Typography>
            <TextField
                label="Regras Especiais da Cena"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                multiline
                rows={3}
                sx={darkTextFieldStyles}
                fullWidth
                helperText="Ex: O telhado desaba em 5 turnos. Ações de 'Furtividade' custam +1 Pressão (C)."
            />
        </Box>
        
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #4a4a4a', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#ccc' }}>
          Cancelar
        </Button>
        <Button onClick={handleStart} variant="contained" color="primary">
          Iniciar Conflito
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictTracker;