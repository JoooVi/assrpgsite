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
} from "@mui/material";

const CharacteristicsMenu = ({ open, item, onClose, onChange }) => {
  const [characteristics, setCharacteristics] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (item && item.characteristics) {
      setCharacteristics(item.characteristics.details || []);
      setPoints(item.characteristics.points || 0);
    }
  }, [item]);

  const availableCharacteristics = {
    0: [
      {
        name: "Frágil",
        cost: 0,
        description:
          "O item está quebrando, enferrujado, muito gasto ou com pouco combustível, bateria ou munição. O item tem sua durabilidade reduzida em -1. Um item pode ter essa característica duas vezes, se tornando Muito Frágil.",
      },
      {
        name: "Improvisado",
        cost: 0,
        description:
          "Um item feito na hora, sem refinamento de criação ou com material reaproveitado. Testes com esse item precisam de 1 Sucesso(joaninha) adicional para considerar resultados de Sucesso(joaninha) e Adaptação(cervo).",
      },
    ],
    1: [
      {
        name: "Ágil",
        cost: 1,
        description:
          "Uma ferramenta ou arma balanceada e capaz de efeitos poderosos em mãos ágeis. Ao fazer um teste usando esse item você pode gastar um uso para usar Reação em vez de Potência.",
      },
      {
        name: "Iluminador",
        cost: 1,
        description:
          "Um item usado para iluminação. Você pode gastar um dos usos do item para fazer com que ele brilhe o suficiente para iluminar um ambiente escuro até o final da etapa.",
      },
      {
        name: "Letal",
        cost: 1,
        description:
          "Geralmente um armamento, esse item é capaz de causar ferimentos profundos. Ao usar o item para causar dano, você pode gastar um uso do item para receber um Sucesso(joaninha) adicional em uma das faces de um dado.",
      },
      {
        name: "Discreta",
        cost: 1,
        description:
          "Um item fino ou pequeno que pode ser facilmente escondido. Testes para esconder o item recebem 1 D10 adicional.",
      },
      {
        name: "Protetivo",
        cost: 1,
        description:
          "Pensado para a proteção, esse item pode ser usado para mitigar ferimentos. Ao sofrer dano, você pode gastar um dos usos desse item para absorver o dano como se fossem pontos de saúde.",
      },
      {
        name: "Nutritivo",
        cost: 1,
        description:
          "Um alimento ou bebida que ajuda na recuperação. Durante a etapa de recuperação você pode gastar um dos usos do item para se alimentar e recuperar um ponto de saúde.",
      },
    ],
    2: [
      {
        name: "Apto",
        cost: 2,
        description:
          "Um item focado para uso de uma aptidão, seja um livro, equipamento de sobrevivência ou ferramenta. Escolha um conhecimento ou Prática. Ao fazer um teste da aptidão escolhida você pode gastar um dos usos do item para jogar novamente um dado para cada Adaptação(cervo) que tiver no teste (antes de manter dados).",
      },
      {
        name: "Tática",
        cost: 2,
        description:
          "Itens reforçados ou com design pensado para serem ergonômicos e eficientes. Ao fazer um teste com esse item você pode gastar um de seus usos para trocar 1 D6 por 1 D10.",
      },
      {
        name: "Consumível",
        cost: 2,
        description:
          "Itens feitos para serem usados uma vez, seja por serem destruídos no uso ou literalmente consumidos. O item tem apenas um uso. Todos os consumíveis do mesmo tipo ocupam o mesmo espaço de inventário. Permite aplicar uma característica de Categoria IV por 1 ponto ou de Categoria I por 0 pontos.",
      },
      {
        name: "Durável",
        cost: 2,
        description:
          "Itens reforçados e pensados para sobreviver ao desgaste, com baterias grandes ou muita munição. Não pode ser aplicado em itens de uso único. Aumenta a durabilidade do item em +2. Um item pode ter essa característica duas vezes, recebendo um total de +5 de durabilidade e se tornando Muito Durável.",
      },
    ],
    3: [
      {
        name: "Malandro",
        cost: 3,
        description:
          "Itens com partes que dificultam a visualização de seu uso ou facilitem acessar as brechas de um inimigo. Ao ter sucesso usando esse item contra uma criatura você pode gastar um de seus usos para usar Adaptação(cervo) para derrubá-la ou empurrá-la.",
      },
      {
        name: "Espaçoso",
        cost: 3,
        description:
          "Equipamentos e vestimentas pensadas para carregar muitos itens. A quantidade de espaços de inventário aumenta em +2. Um item pode ter essa característica duas vezes, fornecendo um total de +5 de espaços de inventário e se tornando Muito Espaçoso.",
      },
      {
        name: "Espinhosa",
        cost: 3,
        description:
          "Itens afiados, pontiagudos, espinhentos, pontudos ou simplesmente perigosos. Ao ter sucesso em um teste com esse item contra uma ameaça, você pode gastar um dos usos dele para reduzir em aumentar em Pressão(coruja) o custo da próxima ativação do conflito.",
      },
      {
        name: "Estabilizado",
        cost: 3,
        description:
          "Um equipamento cuidadosamente balanceado. Ao fazer um teste com o item, você pode gastar um dos seus usos para jogar novamente quaisquer dados com Adaptação(cervo) nas faces.",
      },
    ],
    4: [
      {
        name: "Explosivo",
        cost: 4,
        description:
          "Um item pensado para ser detonado. Ao fazer um teste com esse item, você pode gastar um uso dele para detonar a área em torno dele, destruindo estruturas e ferindo quaisquer criaturas na área em torno dele.",
      },
      {
        name: "Inflamável",
        cost: 4,
        description:
          "Itens capazes de gerar fogo numa escala perigosa. Ao fazer um teste com esse item, você pode gastar um uso dele para deixar a área em torno dele em chamas.",
      },
      {
        name: "Médico",
        cost: 4,
        description:
          "Medicamentos, utensílios médicos ou kits de primeiros socorros geralmente têm essa característica. Durante a etapa de recuperação você pode gastar um dos usos do item para fazer com que um Infectado recupere todas as caixas de saúde de um nível.",
      },
    ],
  };

  const handleAddCharacteristic = (characteristic) => {
    if (points >= characteristic.cost) {
      const updatedCharacteristics = [...characteristics, characteristic];
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
                Remover
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
                      Adicionar
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