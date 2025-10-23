import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';

const InventoryGrid = ({
  title,
  items,
  totalSlots,
  onMove,
  onEdit,
  onDelete,
  onUse,
  location,
  styles,
  qualityLevels,
  placeholders = [],
}) => {
  const renderedSlots = [];
  let itemIndex = 0;

  for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    if (itemIndex < items.length) {
      const invItem = items[itemIndex];
      const itemDetails = invItem?.itemData || invItem?.item;

      if (!invItem || !itemDetails) {
        console.warn("Item de inventário inválido ou sem dados:", invItem);
        renderedSlots.push(
          <Box className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`invalid-${slotIndex}`} />
        );
        itemIndex++;
        continue;
      }

      let slotsNeeded = itemDetails.slots || 1;
      if (itemDetails.modifiers?.includes("Pequeno")) { slotsNeeded = 0; }
      else if (slotsNeeded < 1) { slotsNeeded = 1; }
      if (itemDetails.modifiers?.includes("Pesado")) { slotsNeeded += 1; }

       if (slotIndex + slotsNeeded > totalSlots) {
         for (let k = slotIndex; k < totalSlots; k++) {
             renderedSlots.push( <Box className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`final-empty-${k}`} /> );
         }
         break;
       }

      if (slotsNeeded === 0) {
           renderedSlots.push(
            <Tooltip
              title={`${itemDetails.name} (Qualidade: ${qualityLevels[invItem.quality] || 'N/A'}) - Pequeno (0 Slots)`}
              key={`inv-${itemDetails.originalItemId || itemDetails._id || itemDetails.name}-small-${itemIndex}`}
            >
              <Box className={`${styles.inventorySlot} ${styles.filledSlot}`} sx={{ position: 'relative' }}>
                 <img src={itemDetails.icon || '/icons/default_item.svg'} alt={itemDetails.name} className={styles.inventoryItemIcon} style={{ opacity: 0.8 }}/>
                 <Box className={styles.slotActions}>
                    <IconButton size="small" onClick={() => onEdit(invItem)}> <EditIcon fontSize="inherit"/> </IconButton>
                    <IconButton size="small" onClick={() => onDelete(invItem)}> <DeleteIcon fontSize="inherit"/> </IconButton>
                     { (itemDetails.isConsumable || itemDetails.resourceType) && invItem.quantity > 0 && (
                         <IconButton size="small" onClick={() => onUse(invItem)}> <PlayArrowIcon fontSize="inherit"/> </IconButton>
                     )}
                 </Box>
              </Box>
            </Tooltip>
          );
          itemIndex++;
          slotIndex--;
          continue;
      }

      renderedSlots.push(
        <Tooltip
          title={`${itemDetails.name} (Qualidade: ${qualityLevels[invItem.quality] || 'N/A'}${itemDetails.description ? ` | ${itemDetails.description}` : ''})`}
          key={`inv-${itemDetails.originalItemId || itemDetails._id || itemDetails.name}-${slotIndex}`}
        >
          <Box
            className={`${styles.inventorySlot} ${styles.filledSlot}`}
            sx={{ gridColumn: `span ${slotsNeeded}`, position: 'relative' }}
          >
            <img src={itemDetails.icon || '/icons/default_item.svg'} alt={itemDetails.name} className={styles.inventoryItemIcon} />
            {itemDetails.isArtefato && (<StarIcon sx={{ position: 'absolute', top: 4, left: 4, color: '#FFD700', fontSize: '1rem', filter: 'drop-shadow(0 0 2px black)' }} />)}
            {invItem.quantity > 1 && (<Typography sx={{ position: 'absolute', bottom: 2, right: 4, color: '#FFF', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '0 4px', }}> x{invItem.quantity} </Typography>)}
            <Box className={styles.slotActions}>
               <Tooltip title={location === 'corpo' ? 'Mover para Mochila' : 'Mover para Corpo'}><IconButton size="small" onClick={() => onMove(invItem, location === 'corpo' ? 'mochila' : 'corpo')}><ShareIcon fontSize="inherit" sx={{ transform: location === 'corpo' ? 'rotate(90deg)' : 'rotate(-90deg)' }} /></IconButton></Tooltip>
               <Tooltip title="Editar"><IconButton size="small" onClick={() => onEdit(invItem)}><EditIcon fontSize="inherit" /></IconButton></Tooltip>
               <Tooltip title="Excluir"><IconButton size="small" onClick={() => onDelete(invItem)}><DeleteIcon fontSize="inherit" /></IconButton></Tooltip>
               { (itemDetails.isConsumable || itemDetails.resourceType) && invItem.quantity > 0 && (<Tooltip title={`Usar ${itemDetails.name} (${invItem.quantity})`}><IconButton size="small" onClick={() => onUse(invItem)}><PlayArrowIcon fontSize="inherit" /></IconButton></Tooltip>)}
            </Box>
          </Box>
        </Tooltip>
      );

      slotIndex += slotsNeeded - 1;
      itemIndex++;
    } else {
      const placeholder = placeholders[slotIndex];
      if (location === 'corpo' && placeholder) {
          renderedSlots.push(
            <Tooltip title={`Slot Vazio: ${placeholder.type}`} key={`placeholder-${location}-${slotIndex}`}>
              <Box className={`${styles.inventorySlot} ${styles.emptySlot}`}> <img src={placeholder.icon} alt={placeholder.type} className={styles.placeholderIcon} /> </Box>
            </Tooltip>
          );
      } else {
        renderedSlots.push( <Box className={`${styles.inventorySlot} ${styles.emptySlot}`} key={`empty-${location}-${slotIndex}`} /> );
      }
    }
  }

  return (
    <Box>
      {title && <Typography variant="subtitle1" className={styles.gridTitle}>{title}</Typography>}
      <Box className={styles.inventoryGridContainer}>{renderedSlots}</Box>
    </Box>
  );
};

export default InventoryGrid;