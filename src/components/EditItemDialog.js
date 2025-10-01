import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CharacteristicsMenu from "./CharacteristicsMenu";

const EditItemDialog = ({ editItem, setEditItem, handleItemEdit }) => {
  const handleCharacteristicChange = (updatedCharacteristics) => {
    setEditItem((prevEditItem) => ({
      ...prevEditItem,
      item: {
        ...prevEditItem.item,
        characteristics: updatedCharacteristics,
      },
    }));
  };

  const handleOpenCharacteristicsMenu = () => {
    setEditItem((prevEditItem) => ({
      ...prevEditItem,
      showCharacteristicsMenu: true,
    }));
  };

  return (
    <Dialog
      open={editItem !== null}
      onClose={() => setEditItem(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Editar Item</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="dense"
              label="Nome"
              type="text"
              fullWidth
              value={editItem?.item.name || ""}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, name: e.target.value },
                })
              }
            />
            <TextField
              margin="dense"
              label="Descrição"
              type="text"
              fullWidth
              value={editItem?.item.description || ""}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, description: e.target.value },
                })
              }
            />
            <TextField
              margin="dense"
              label="Peso"
              type="number"
              fullWidth
              value={editItem?.item.weight || 0}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  item: { ...editItem.item, weight: e.target.value },
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Características</Typography>
            <List>
              {editItem?.item.characteristics.details.map(
                (characteristic, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={characteristic.name}
                      secondary={characteristic.description}
                    />
                    <IconButton
                      edge="end"
                      onClick={() =>
                        handleCharacteristicChange(
                          editItem.item.characteristics.details.filter(
                            (_, i) => i !== index
                          )
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                )
              )}
            </List>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCharacteristicsMenu}
            >
              Adicionar Característica
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditItem(null)} color="primary">
          Cancelar
        </Button>
        <Button
          onClick={() => handleItemEdit(editItem.index, editItem.item)}
          color="primary"
        >
          Salvar
        </Button>
      </DialogActions>
      {editItem?.showCharacteristicsMenu && (
        <CharacteristicsMenu
          open={editItem.showCharacteristicsMenu}
          item={editItem.item}
          onClose={() =>
            setEditItem({ ...editItem, showCharacteristicsMenu: false })
          }
          onChange={handleCharacteristicChange}
        />
      )}
    </Dialog>
  );
};

export default EditItemDialog;