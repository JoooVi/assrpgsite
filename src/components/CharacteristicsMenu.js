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
  Icon,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const CharacteristicsMenu = ({ open, item, onClose, onChange }) => {
  const [characteristics, setCharacteristics] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (item && item.characteristics) {
      setCharacteristics(item.characteristics.details || []);
      setPoints(item.characteristics.points || 0);
    }
  }, [item]);

  // DENTRO DO ARQUIVO: CharacteristicsMenu.js

const availableCharacteristics = {
  "-1": [
    {
      name: "Frágil",
      cost: -1, // Custo pode ser ajustado conforme sua lógica de pontos
      description:
        "Precisa de uma [Sucesso] a menos para baixar um nível de qualidade. Se estiver no nível 1 (Defeituoso), ficará nível 0 (Quebrado) no próximo uso.",
    },
    {
      name: "Improvisado",
      cost: -1, // Custo pode ser ajustado conforme sua lógica de pontos
      description:
        "Criado com partes originalmente feitas com outros objetivos. Testes com esse item têm um dado a menos, mas esse efeito pode ser cancelado com o investimento de um [Sucesso].",
    },
  ],
  "1": [
    {
      name: "Ágil",
      cost: 1,
      description:
        "Uma arma balanceada. Em um teste de ataque armado, substitui Potência por Reação.",
    },
    {
      name: "Discreto",
      cost: 1,
      description:
        "Um item menor, fino ou retrátil. Não ocupa espaço de inventário e não será percebido pelos outros enquanto continuar guardado.",
    },
    // NOTA: Letal, Protetivo, etc. não são listados como características genéricas nas imagens,
    // mas sim como parte de itens. Mantive a estrutura caso você queira adaptá-los.
  ],
  "2": [
    {
      name: "Eficiente",
      cost: 2,
      description:
        "Design ergonômico e prático. Em um teste com este item, você pode trocar 1 dado por 1 dado uma vez por dia. Um uso adicional no mesmo dia faz o equipamento perder um nível de qualidade.",
    },
    {
      name: "Durável",
      cost: 2,
      description:
        "Item reforçado e pensado para sobreviver ao desgaste. Precisa de uma [Sucesso] adicional para perder um nível de qualidade.",
    },
  ],
  "3": [
    {
      name: "Espaçoso",
      cost: 3,
      description:
        "Vestes, bolsas ou mochilas que aumentam a quantidade de espaços de inventário em +2. Pode ser comprada mais de uma vez, acumulando seus efeitos.",
    },
    {
      name: "Adrenalina",
      cost: 3,
      description:
        "Começa com seis usos. Cada uso aumenta 6 dados até o próximo repouso. Cada uso adicional no mesmo dia exige um teste de Resolução + Atletismo. Após o repouso, o personagem perde um ponto de Determinação para cada uso realizado no dia.",
    },
    {
      name: "Armadura",
      cost: 3,
      description:
        "Veste de proteção. Ao sofrer dano, você pode fazer até três usos por cena para evitar a perda de 1 dado de dano. A cada três usos na mesma cena, a armadura baixa um nível de qualidade.",
    },
  ],
  "4": [
    {
      name: "Explosivo",
      cost: 4,
      description:
        "Item pensado para ser detonado. Ao fazer um teste, pode-se eliminá-lo para detonar uma área, ferindo criaturas com 4 de dano. Todo item Explosivo também possui Uso Único.",
    },
    {
      name: "Inflamável",
      cost: 4,
      description:
        "Gera fogo em escala perigosa. Pode-se baixar um nível de qualidade para incinerar uma área. Alvos atingidos sofrem 3 de dano de queimadura e precisam investir [símbolo] ou sofrerão 2 de dano no final do turno.",
    },
    {
      name: "Medicinal",
      cost: 4,
      description:
        "Começam com seis usos e cada uso cancela um resultado negativo no teste de Tratamento Médico. Itens de uso único podem cancelar até dois resultados negativos no mesmo teste.",
    },
  ],
};

  const handleAddCharacteristic = (characteristic) => {
    if (points >= characteristic.cost) {
      const newCharacteristic = { ...characteristic, marked: false }; // Adicionar propriedade 'marked'
      const updatedCharacteristics = [...characteristics, newCharacteristic];
      setCharacteristics(updatedCharacteristics);
      setPoints(points - characteristic.cost);
      onChange({
        ...item,
        characteristics: {
          details: updatedCharacteristics,
          points: points - characteristic.cost,
        },
      });
    }
  };

  const handleRemoveCharacteristic = (index) => {
    const removedCharacteristic = characteristics[index];
    const updatedCharacteristics = characteristics.filter((_, i) => i !== index);
    setCharacteristics(updatedCharacteristics);
    setPoints(points + removedCharacteristic.cost);
    onChange({
      ...item,
      characteristics: {
        details: updatedCharacteristics,
        points: points + removedCharacteristic.cost,
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Características do Item</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Pontos Disponíveis: {points}</Typography>
        <List>
          {characteristics.map((characteristic, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={characteristic.name}
                secondary={characteristic.description}
              />
              <Button onClick={() => handleRemoveCharacteristic(index)}>
                <DeleteIcon />
              </Button>
            </ListItem>
          ))}
        </List>
        <Typography variant="h6">Adicionar Características</Typography>
        {Object.keys(availableCharacteristics).map((category) => (
          <Box key={category}>
            <Typography variant="subtitle1">Categoria {category}</Typography>
            <List>
              {availableCharacteristics[category].map(
                (characteristic, index) => (
                  <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ListItemText
                      primary={`${characteristic.name} (Custo: ${characteristic.cost})`}
                      secondary={characteristic.description}
                    />
                    <Button
                      onClick={() => handleAddCharacteristic(characteristic)}
                      disabled={points < characteristic.cost}
                      sx={{ marginLeft: '10px' }}
                    >
                      +
                    </Button>
                  </ListItem>
                )
              )}
            </List>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacteristicsMenu;