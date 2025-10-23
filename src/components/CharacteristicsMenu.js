// src/components/CharacteristicsMenu.js - ATUALIZADO COM TEMA ESCURO

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton, // Trocado Button por IconButton para o Delete
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const CharacteristicsMenu = ({ open, item, onClose, onChange }) => {
  const [characteristics, setCharacteristics] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (item && item.characteristics) {
      setCharacteristics(item.characteristics.details || []);
      setPoints(item.characteristics.points || 0);
    } else {
      // Reseta se o item não tiver características
      setCharacteristics([]);
      setPoints(0);
    }
  }, [item]);

  // Lista de características disponíveis (sem alterações)
  const availableCharacteristics = {
    "-1": [
      { name: "Frágil", cost: -1, description: "Precisa de uma [Sucesso] a menos para baixar um nível de qualidade..." },
      { name: "Improvisado", cost: -1, description: "Criado com partes... Testes com esse item têm um dado a menos..." },
    ],
    "1": [
      { name: "Ágil", cost: 1, description: "Uma arma balanceada. Em um teste de ataque armado, substitui Potência por Reação." },
      { name: "Discreto", cost: 1, description: "Um item menor... Não ocupa espaço de inventário..." },
    ],
    "2": [
      { name: "Eficiente", cost: 2, description: "Design ergonômico... Em um teste com este item, você pode trocar 1 dado por 1 dado..." },
      { name: "Durável", cost: 2, description: "Item reforçado... Precisa de uma [Sucesso] adicional para perder um nível de qualidade." },
    ],
    "3": [
      { name: "Espaçoso", cost: 3, description: "Vestes, bolsas ou mochilas que aumentam a quantidade de espaços de inventário em +2..." },
      { name: "Adrenalina", cost: 3, description: "Começa com seis usos. Cada uso aumenta 6 dados até o próximo repouso..." },
      { name: "Armadura", cost: 3, description: "Veste de proteção. Ao sofrer dano, você pode fazer até três usos por cena..." },
    ],
    "4": [
      { name: "Explosivo", cost: 4, description: "Item pensado para ser detonado... Todo item Explosivo também possui Uso Único." },
      { name: "Inflamável", cost: 4, description: "Gera fogo em escala perigosa... Alvos atingidos sofrem 3 de dano de queimadura..." },
      { name: "Medicinal", cost: 4, description: "Começam com seis usos e cada uso cancela um resultado negativo no teste de Tratamento Médico..." },
    ],
  };

  const handleAddCharacteristic = (characteristic) => {
    if (points >= characteristic.cost) {
      const newCharacteristic = { ...characteristic, marked: false };
      const updatedCharacteristics = [...characteristics, newCharacteristic];
      setCharacteristics(updatedCharacteristics);
      const newPoints = points - characteristic.cost;
      setPoints(newPoints);
      onChange({
        ...item,
        characteristics: {
          details: updatedCharacteristics,
          points: newPoints,
        },
      });
    }
  };

  const handleRemoveCharacteristic = (index) => {
    const removedCharacteristic = characteristics[index];
    const updatedCharacteristics = characteristics.filter((_, i) => i !== index);
    setCharacteristics(updatedCharacteristics);
    const newPoints = points + removedCharacteristic.cost;
    setPoints(newPoints);
    onChange({
      ...item,
      characteristics: {
        details: updatedCharacteristics,
        points: newPoints,
      },
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      // --- ESTILO DO DIALOG (TEMA ESCURO) ---
      PaperProps={{
        sx: {
          bgcolor: '#1e1e1e',
          color: '#fff',
          border: '1px solid #4a4a4a'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #4a4a4a' }}>
        Características do Item
      </DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}> {/* Adiciona padding top */}
        <Typography variant="h6" sx={{ color: '#ccc', mb: 1 }}>
          Pontos Disponíveis: {points}
        </Typography>
        
        {/* Lista de características adicionadas */}
        {characteristics.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ color: '#aaa', mt: 2, mb: 1 }}>
              Adicionadas:
            </Typography>
            <List dense> {/* dense para ocupar menos espaço */}
              {characteristics.map((characteristic, index) => (
                <ListItem 
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveCharacteristic(index)} sx={{ color: '#f44336' }}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ borderBottom: '1px dashed #444', paddingBottom: '8px', marginBottom: '8px' }}
                >
                  <ListItemText
                    primary={characteristic.name}
                    secondary={characteristic.description}
                    primaryTypographyProps={{ sx: { color: '#fff', fontWeight: 'bold' } }}
                    secondaryTypographyProps={{ sx: { color: '#bbb' } }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Typography variant="h6" sx={{ color: '#ccc', mt: 3, mb: 1 }}>
          Adicionar Características
        </Typography>
        {Object.keys(availableCharacteristics).map((category) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#aaa', borderBottom: '1px solid #444', pb: 0.5, mb: 1 }}>
              Custo {category}
            </Typography>
            <List dense>
              {availableCharacteristics[category].map(
                (characteristic, index) => (
                  <ListItem 
                    key={index} 
                    secondaryAction={
                      <Button
                        size="small" // Botão menor
                        variant="outlined" // Estilo mais sutil
                        onClick={() => handleAddCharacteristic(characteristic)}
                        disabled={points < characteristic.cost}
                        sx={{ 
                          color: points >= characteristic.cost ? '#66bb6a' : '#666', // Verde se pode, cinza se não
                          borderColor: points >= characteristic.cost ? '#66bb6a' : '#666',
                          '&:hover': {
                             borderColor: points >= characteristic.cost ? '#81c784' : '#666',
                             backgroundColor: points >= characteristic.cost ? 'rgba(102, 187, 106, 0.1)' : 'transparent'
                          },
                          minWidth: '30px', // Largura mínima
                          padding: '2px 6px' // Padding menor
                        }}
                      >
                        +
                      </Button>
                    }
                    sx={{ paddingBottom: '8px', marginBottom: '8px' }}
                  >
                    <ListItemText
                      primary={`${characteristic.name}`} // Removido custo do primário para limpar
                      secondary={characteristic.description}
                      primaryTypographyProps={{ sx: { color: '#fff' } }}
                      secondaryTypographyProps={{ sx: { color: '#bbb' } }}
                    />
                  </ListItem>
                )
              )}
            </List>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #4a4a4a', padding: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: '#ccc' }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacteristicsMenu;