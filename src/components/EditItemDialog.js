import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Select,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import CharacteristicsMenu from "./CharacteristicsMenu";

const scarcityLevels = { 0: 'Abundante', 1: 'Pedra', 2: 'Comum', 3: 'Incomum', 4: 'Atípico', 5: 'Raro', 6: 'Quase Extinto' };
const resourceTypes = ['agua', 'comida', 'combustivel', 'pecas'];

// --- NOVO ---
// Adicionado mapa de qualidades para o <Select>
const qualityLevels = {
  0: "Quebrado",
  1: "Defeituoso",
  2: "Comprometido",
  3: "Padrão",
  4: "Reforçado",
  5: "Superior",
  6: "Obra-Prima",
};
// --- FIM NOVO ---


const EditItemDialog = ({ editItem, onClose, onSave }) => {
  const [editedData, setEditedData] = useState(null);
  const [showCharacteristicsMenu, setShowCharacteristicsMenu] = useState(false);

  useEffect(() => {
    if (editItem && editItem.invItemData) {
      const sourceItemData = editItem.invItemData.itemData || editItem.invItemData.item;
      if (sourceItemData) {
        const initialData = {
            originalItemId: sourceItemData.originalItemId || editItem.invItemData.item?._id || null,
            name: sourceItemData.name || 'Nome Desconhecido',
            type: sourceItemData.type || 'Desconhecido',
            category: sourceItemData.category ?? 3,
            slots: sourceItemData.slots ?? 1,
            // --- NOVO ---
            // Lê a qualidade da INSTÂNCIA (invItemData), não do sourceItemData
            quality: editItem.invItemData.quality ?? 3, 
            // --- FIM NOVO ---
            modifiers: sourceItemData.modifiers || [],
            isArtefato: sourceItemData.isArtefato || false,
            resourceType: sourceItemData.resourceType || null,
            isConsumable: sourceItemData.isConsumable || false,
            description: sourceItemData.description || "",
            characteristics: sourceItemData.characteristics ? JSON.parse(JSON.stringify(sourceItemData.characteristics)) : { points: 0, details: [] },
        };
        setEditedData(initialData);
      } else {
         console.error("Item de inventário não contém dados válidos ('itemData' ou 'item')", editItem.invItemData);
         setEditedData(null);
         onClose();
      }
    } else {
      setEditedData(null);
    }
  }, [editItem, onClose]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditedData((prev) => {
      let newValue;
      if (type === 'checkbox') { newValue = checked; }
      else if (name === 'modifiers') { newValue = value.split(',').map(m => m.trim()).filter(m => m); }
      else if (name === 'slots') { 
         const parsedValue = parseInt(value);
         newValue = isNaN(parsedValue) ? 0 : parsedValue;
      }
      // --- ALTERADO ---
      // Adicionado 'quality' à lista de campos numéricos
      else if (['quality', 'category'].includes(name)) { 
          newValue = parseInt(value) || 0;
      }
      // --- FIM ALTERADO ---
      else { newValue = value; }
      if (name === 'type' && !['Recurso', 'Consumivel'].includes(newValue)) { return { ...prev, type: newValue, resourceType: null, isConsumable: false }; }
      if (name === 'resourceType' && value === 'nenhum') { return { ...prev, resourceType: null }; }
      return { ...prev, [name]: newValue };
    });
  };

  const handleCharacteristicsChange = (updatedCharacteristicsData) => {
     setEditedData(prev => ({ ...prev, characteristics: updatedCharacteristicsData }));
     setShowCharacteristicsMenu(false);
  };

  const handleSaveChanges = () => {
    if (editedData && editItem && editItem.invItemData) {
      // Passa o 'editedData' completo, que agora inclui a 'quality'
      onSave(editItem.invItemData, editedData);
      onClose();
    } else {
      console.error("Dados inválidos para salvar:", editItem, editedData);
      alert("Erro: Não foi possível salvar as alterações.");
    }
  };

  if (!editItem || !editedData) {
    return null;
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1e1e1e', color: '#fff', border: '1px solid #4a4a4a' } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #4a4a4a' }}> Editar Item: {editedData.name} </DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField name="name" label="Nome" value={editedData.name} onChange={handleChange} fullWidth margin="dense" size="small" required sx={textFieldStyles} InputLabelProps={{ sx: inputLabelStyles }} InputProps={{ sx: inputBaseStyles }} />
            
            {/* --- NOVO: Campo de Qualidade --- */}
            <FormControl fullWidth margin="dense" size="small" required sx={selectStyles}>
              <InputLabel sx={inputLabelStyles}>Qualidade</InputLabel>
              <Select name="quality" label="Qualidade" value={editedData.quality} onChange={handleChange}>
                {Object.entries(qualityLevels).map(([value, name]) => (<MenuItem key={value} value={parseInt(value)}>{name}</MenuItem>))}
              </Select>
            </FormControl>
            {/* --- FIM NOVO --- */}
            
            <FormControl fullWidth margin="dense" size="small" required sx={selectStyles}>
              <InputLabel sx={inputLabelStyles}>Categoria (Escassez)</InputLabel>
              <Select name="category" label="Categoria (Escassez)" value={editedData.category} onChange={handleChange}>
                {Object.entries(scarcityLevels).map(([value, name]) => (<MenuItem key={value} value={parseInt(value)}>{name}</MenuItem>))}
              </Select>
            </FormControl>
            
            <TextField name="type" label="Tipo" value={editedData.type} onChange={handleChange} fullWidth margin="dense" size="small" required sx={textFieldStyles} InputLabelProps={{ sx: inputLabelStyles }} InputProps={{ sx: inputBaseStyles }} helperText="Ex: Equipamento, Arma, Vestimenta, Mochila, Recurso, Consumivel, Artefato" FormHelperTextProps={{ sx: helperTextStyles }} />
            <TextField name="slots" label="Slots Ocupados (Base)" type="number" value={editedData.slots} onChange={handleChange} fullWidth margin="dense" size="small" required sx={textFieldStyles} InputLabelProps={{ sx: inputLabelStyles }} InputProps={{ sx: inputBaseStyles }} helperText="Valor base. 'Pesado' adiciona +1. 'Pequeno' = 0." FormHelperTextProps={{ sx: helperTextStyles }} />
            <TextField name="modifiers" label="Modificadores (separados por vírgula)" value={editedData.modifiers?.join(', ') || ''} onChange={handleChange} fullWidth margin="dense" size="small" sx={textFieldStyles} InputLabelProps={{ sx: inputLabelStyles }} InputProps={{ sx: inputBaseStyles }} helperText="Ex: Espaçoso:2, Pesado, Isento, Pequeno" FormHelperTextProps={{ sx: helperTextStyles }} />
          </Grid>
          {/* O restante do Grid (lado direito) continua igual */}
          <Grid item xs={12} md={6}>
             <Box sx={{ border: '1px solid #444', borderRadius: '4px', p: 1.5, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>Flags:</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={4}> <FormControlLabel control={<Checkbox name="isArtefato" checked={editedData.isArtefato} onChange={handleChange} sx={checkboxStyles}/>} label="Artefato" sx={{ color: '#ccc' }}/> </Grid>
                    <Grid item xs={12} sm={4}> <FormControlLabel control={<Checkbox name="isConsumable" checked={editedData.isConsumable} onChange={handleChange} sx={checkboxStyles}/>} label="Consumível" sx={{ color: '#ccc' }} /> </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl size="small" fullWidth sx={selectStyles}>
                          <InputLabel sx={inputLabelStyles}>Tipo Recurso</InputLabel>
                          <Select name="resourceType" label="Tipo Recurso" value={editedData.resourceType || 'nenhum'} onChange={handleChange}>
                             <MenuItem value="nenhum">Nenhum</MenuItem>
                             {resourceTypes.map(type => <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>)}
                          </Select>
                        </FormControl>
                    </Grid>
                </Grid>
             </Box>
            <TextField name="description" label="Descrição" value={editedData.description} onChange={handleChange} fullWidth margin="dense" size="small" multiline rows={4} sx={textFieldStyles} InputLabelProps={{ sx: inputLabelStyles }} InputProps={{ sx: inputBaseStyles }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#ccc' }}> Características (Pontos: {editedData.characteristics?.points ?? 0}) </Typography>
              {(editedData.characteristics?.details?.length ?? 0) > 0 ? (
                <List dense sx={{ maxHeight: 150, overflow: 'auto', mb: 1 }}>
                  {editedData.characteristics.details.map((char, index) => (
                    <ListItem key={index} disablePadding> <ListItemText primary={char.name} secondary={`Custo: ${char.cost}`} primaryTypographyProps={{ sx: { color: '#fff' } }} secondaryTypographyProps={{ sx: { color: '#bbb' } }} /> </ListItem>
                  ))}
                </List>
              ) : ( <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic', mb: 1 }}>Nenhuma característica.</Typography> )}
              <Button variant="outlined" color="primary" size="small" onClick={() => setShowCharacteristicsMenu(true)} sx={{ color: '#90caf9', borderColor: '#90caf9' }}> Gerenciar </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #4a4a4a', padding: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: '#ccc' }}> Cancelar </Button>
        <Button onClick={handleSaveChanges} color="primary" variant="contained"> Salvar Alterações </Button>
      </DialogActions>
      {showCharacteristicsMenu && (
        <CharacteristicsMenu
          open={showCharacteristicsMenu}
          item={{ characteristics: editedData.characteristics }}
          onClose={() => setShowCharacteristicsMenu(false)}
          onChange={handleCharacteristicsChange}
        />
      )}
    </Dialog>
  );
};

// Constantes de estilo (permanecem iguais)
const textFieldStyles = { '& .MuiInputBase-input': { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#888' }, '&:hover fieldset': { borderColor: '#fff' }, '&.Mui-focused fieldset': { borderColor: '#90caf9' }, }, };
const inputLabelStyles = { color: '#ccc' };
const inputBaseStyles = { color: '#fff' };
const helperTextStyles = { color: '#aaa' };
const checkboxStyles = { color: '#90caf9', '&.Mui-checked': { color: '#90caf9' } };
const selectStyles = { '& .MuiSelect-select': { ...inputBaseStyles, paddingTop: '8.5px', paddingBottom: '8.5px' }, '& .MuiSvgIcon-root': { color: '#fff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#888' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' }, };

export default EditItemDialog;